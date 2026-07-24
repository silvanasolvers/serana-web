import React, { useEffect, useMemo, useRef, useState } from 'react';
import { type CartItem, useCartStore } from '../store/useCartStore';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { motion, AnimatePresence } from 'motion/react';
import {
  CheckCircle, Truck, ArrowLeft, ArrowRight, AlertCircle, Loader2,
  Tag, X, Check, MapPin, User, CreditCard, LogIn,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  confirmOfflineCheckout, createOrUpdateCheckoutSession, getCheckoutStatus, validateCoupon,
  type PaymentMethod, type CouponValidation,
} from '../lib/api/orders';
import MercadoPagoBrick from '../components/MercadoPagoBrick';
import { useAuth } from '../components/AuthProvider';
import {
  buildComboCustomizationText,
  getComboSummaryLines,
  stripComboPayloadMarker,
} from '../data/comboCustomizations';
import { clearCheckoutSource, readCheckoutSource } from '../lib/checkoutSource';
import { getMinimumOrderMissing, meetsMinimumOrder, MINIMUM_ORDER_TOTAL_COP } from '../lib/purchaseRules';

const MP_PUBLIC_KEY = import.meta.env.VITE_MP_PUBLIC_KEY ?? '';

const COP = (n: number) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency', currency: 'COP',
    minimumFractionDigits: 0, maximumFractionDigits: 0,
  }).format(n);

type FormState = {
  fullName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  notes: string;
  paymentMethod: PaymentMethod;
};

const initialForm: FormState = {
  fullName: '',
  phone: '',
  email: '',
  address: '',
  city: 'Medellín',
  notes: '',
  paymentMethod: 'mercado_pago',
};

const STORAGE_KEY = 'serana:checkout:contact';
const CHECKOUT_KEY_STORAGE = 'serana:checkout:key:v2';

const DELIVERY_FEE_COP = 12500;

function newCheckoutKey() {
  if (typeof window === 'undefined') return crypto.randomUUID();
  const saved = sessionStorage.getItem(CHECKOUT_KEY_STORAGE);
  if (saved) return saved;
  const key = crypto.randomUUID();
  sessionStorage.setItem(CHECKOUT_KEY_STORAGE, key);
  return key;
}

function clearCheckoutKey() {
  if (typeof window !== 'undefined') sessionStorage.removeItem(CHECKOUT_KEY_STORAGE);
}

const STEPS = [
  { id: 1, label: 'Resumen', Icon: Tag },
  { id: 2, label: 'Entrega', Icon: MapPin },
  { id: 3, label: 'Pago', Icon: CreditCard },
] as const;

const PAYMENT_OPTIONS: Array<{ value: PaymentMethod; label: string; hint: string }> = [
  { value: 'mercado_pago', label: 'Mercado Pago', hint: 'Tarjeta · PSE · Nequi' },
  { value: 'transferencia', label: 'Transferencia', hint: 'Te enviamos los datos' },
  { value: 'efectivo', label: 'Efectivo', hint: 'Pagas al recibir' },
];

const COUPON_REASONS: Record<string, string> = {
  not_found: 'Ese código no existe.',
  inactive: 'Este cupón está pausado.',
  expired: 'Este cupón expiró.',
  not_yet_active: 'Este cupón aún no está activo.',
  usage_limit: 'Este cupón ya alcanzó su tope de usos.',
  min_subtotal: 'Faltan productos para alcanzar el mínimo de este cupón.',
};

export default function CheckoutPage() {
  const { items, total, clearCart } = useCartStore();
  const { user, account } = useAuth();
  const subtotal = total();
  const checkoutKeyRef = useRef<string>(newCheckoutKey());
  const mpPreparingRef = useRef(false);

  const [stepIndex, setStepIndex] = useState(0); // 0..2
  const [confirmation, setConfirmation] = useState<{
    orderNumber: number; subtotal: number; discount: number; total: number; coupon: string | null;
    kind: 'confirmed' | 'awaiting_transfer';
  } | null>(null);
  const [paymentPending, setPaymentPending] = useState<{
    checkoutToken: string; paymentId: string; total: number;
  } | null>(null);

  const [form, setForm] = useState<FormState>(() => {
    if (typeof window === 'undefined') return initialForm;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...initialForm, ...parsed };
      }
    } catch {/* ignore */}
    return initialForm;
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // MP Bricks mount from a non-operational checkout session. No sales order
  // exists until the server has reconciled an approved payment.
  const [mpReady, setMpReady] = useState<{
    checkout_id: string;
    checkout_token: string;
    preference_id: string;
    amount: number;
    discount: number;
    coupon: string | null;
    subtotal: number;
  } | null>(null);
  const [mpPreparing, setMpPreparing] = useState(false);
  const [mpRejection, setMpRejection] = useState<{ status_detail: string; message?: string } | null>(null);

  // Coupon state
  const [couponCode, setCouponCode] = useState('');
  const [couponBusy, setCouponBusy] = useState(false);
  const [couponApplied, setCouponApplied] = useState<CouponValidation | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponOpen, setCouponOpen] = useState(false);

  useEffect(() => {
    const profile = account?.profile;
    if (!profile) return;
    setForm((prev) => {
      const next = {
        ...prev,
        fullName: prev.fullName || profile.full_name || '',
        phone: prev.phone || profile.phone || '',
        email: prev.email || profile.email || user?.email || '',
        address: prev.address || profile.address || '',
      };
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {/* ignore */}
      return next;
    });
  }, [account?.profile, user?.email]);

  const update = (k: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const value = e.target.value;
      setForm((prev) => {
        const next = { ...prev, [k]: value };
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {/* ignore */}
        return next;
      });
    };

  const phoneDigits = form.phone.replace(/\D/g, '');
  const contactValid = form.fullName.trim().length >= 2 && phoneDigits.length >= 7;
  const addressValid = form.address.trim().length >= 5;
  const step2Valid = contactValid && addressValid;

  const discount = couponApplied?.valid ? couponApplied.discount_amount : 0;
  const deliveryFee = DELIVERY_FEE_COP; // TODO: change to conditional when pickup/mesa types are added
  const merchandiseTotal = Math.max(subtotal - discount, 0);
  const totalToPay = merchandiseTotal + deliveryFee;
  // The public terms define the minimum before delivery.
  const minimumOrderMet = meetsMinimumOrder(merchandiseTotal);
  const minimumOrderMissing = getMinimumOrderMissing(merchandiseTotal);

  // Re-validate the coupon if subtotal changes (cart edit) so a stale "applied"
  // doesn't survive a min_subtotal violation or an expiration mid-flow.
  useEffect(() => {
    if (!couponApplied?.valid || !couponApplied.code) return;
    if (subtotal === 0) {
      setCouponApplied(null);
      return;
    }
    let cancelled = false;
    void validateCoupon(couponApplied.code, subtotal).then((res) => {
      if (cancelled) return;
      if (!res.valid) {
        setCouponApplied(null);
        setCouponError(COUPON_REASONS[res.reason] ?? 'El cupón ya no aplica.');
      } else {
        setCouponApplied(res);
      }
    });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subtotal]);

  const handleApplyCoupon = async () => {
    const code = couponCode.trim();
    if (!code) return;
    setCouponBusy(true);
    setCouponError(null);
    try {
      const res = await validateCoupon(code, subtotal);
      if (!res.valid) {
        setCouponError(COUPON_REASONS[res.reason] ?? 'No pudimos aplicar ese cupón.');
        setCouponApplied(null);
      } else {
        setCouponApplied(res);
        setCouponCode(res.code ?? code);
      }
    } catch (err: any) {
      setCouponError(err?.message ?? 'No pudimos validar el cupón.');
    } finally {
      setCouponBusy(false);
    }
  };

  const removeCoupon = () => {
    setCouponApplied(null);
    setCouponCode('');
    setCouponError(null);
  };

  const buildCheckoutPayload = () => {
    const fullAddress = [form.address.trim(), form.city.trim()].filter(Boolean).join(', ');
    return {
      customer_phone: phoneDigits,
      customer_name: form.fullName.trim(),
      customer_email: form.email.trim() || undefined,
      delivery_address: fullAddress,
      notes: form.notes.trim() || undefined,
      type: 'domicilio' as const,
      payment_method: form.paymentMethod,
      source_code: readCheckoutSource(),
      coupon_code: couponApplied?.valid ? couponApplied.code ?? undefined : undefined,
      items: items.map((item) => {
        const customizations = item.comboSelections
          ? buildComboCustomizationText(item.comboSelections)
          : [item.variantLabel ? `Presentación: ${item.variantLabel}` : null, item.customizations]
              .filter(Boolean)
              .join('\n') || undefined;

        return {
          product_slug: item.productSlug ?? item.id,
          quantity: item.quantity,
          variant_label: item.variantLabel,
          customizations,
        };
      }),
    };
  };

  const prepareCheckoutSession = () => createOrUpdateCheckoutSession(
    checkoutKeyRef.current,
    buildCheckoutPayload(),
  );

  // Create/update a checkout session and one persisted Preference. This is
  // safe to retry because checkout_key is stable for this browser checkout.
  const prepareMpBrick = async () => {
    if (mpPreparingRef.current || mpReady) return;
    if (!minimumOrderMet) {
      setError(`La compra mínima es de ${COP(MINIMUM_ORDER_TOTAL_COP)}. Agrega ${COP(minimumOrderMissing)} más para finalizar tu pedido.`);
      return;
    }
    mpPreparingRef.current = true;
    setMpPreparing(true);
    setMpRejection(null);
    setError(null);
    try {
      const checkout = await prepareCheckoutSession();
      const mpResp = await fetch('/api/checkout/mp/preference', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ checkout_token: checkout.checkout_token }),
      });
      if (!mpResp.ok) {
        const data = await mpResp.json().catch(() => ({}));
        throw new Error(data?.error ?? `No pudimos preparar el pago (${mpResp.status}).`);
      }
      const mpData = (await mpResp.json()) as { preference_id?: string; amount?: number };
      if (!mpData.preference_id) throw new Error('Mercado Pago no devolvió la preferencia.');

      setMpReady({
        checkout_id: checkout.checkout_id,
        checkout_token: checkout.checkout_token,
        preference_id: mpData.preference_id,
        amount: Number(mpData.amount ?? checkout.total_amount),
        discount: Number(checkout.discount_amount ?? 0),
        coupon: checkout.coupon_code ?? null,
        subtotal: Number(checkout.subtotal ?? subtotal),
      });
    } catch (err: any) {
      setError(err?.message ?? 'No pudimos preparar Mercado Pago. Intenta nuevamente.');
    } finally {
      mpPreparingRef.current = false;
      setMpPreparing(false);
    }
  };

  // Confirm a non-MP order (cash / transfer).
  const handleSubmit = async () => {
    if (!step2Valid || submitting) return;
    if (!minimumOrderMet) {
      setError(`La compra mínima es de ${COP(MINIMUM_ORDER_TOTAL_COP)}. Agrega ${COP(minimumOrderMissing)} más para confirmar tu pedido.`);
      return;
    }
    if (form.paymentMethod === 'mercado_pago') return; // brick handles it
    setSubmitting(true);
    setError(null);
    try {
      const checkout = await prepareCheckoutSession();
      const result = await confirmOfflineCheckout(checkout.checkout_token);
      if (!result.order_number) throw new Error('No recibimos el número del pedido.');
      setConfirmation({
        orderNumber: result.order_number,
        subtotal: Number(result.subtotal),
        discount: Number(result.discount_amount),
        total: Number(result.total_amount),
        coupon: result.coupon_code ?? null,
        kind: result.status === 'awaiting_transfer' ? 'awaiting_transfer' : 'confirmed',
      });
      clearCheckoutKey();
      clearCheckoutSource();
      clearCart();
    } catch (err: any) {
      setError(err?.message || 'No pudimos confirmar tu pedido. Intenta nuevamente.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleBrickApproved = (result: { paymentId: string; orderNumber: number }) => {
    if (!mpReady) return;
    setConfirmation({
      orderNumber: result.orderNumber,
      subtotal: mpReady.subtotal,
      discount: mpReady.discount,
      total: mpReady.amount,
      coupon: mpReady.coupon,
      kind: 'confirmed',
    });
    clearCheckoutKey();
    clearCheckoutSource();
    clearCart();
    void result.paymentId;
  };

  const handleBrickPending = (result: { paymentId: string }) => {
    if (!mpReady) return;
    setPaymentPending({
      checkoutToken: mpReady.checkout_token,
      paymentId: result.paymentId,
      total: mpReady.amount,
    });
  };

  const handleBrickRejected = (info: { status: string; status_detail: string; message?: string }) => {
    setMpRejection({ status_detail: info.status_detail, message: info.message });
  };

  useEffect(() => {
    if (!paymentPending) return;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | null = null;
    const refresh = async () => {
      try {
        const status = await getCheckoutStatus(paymentPending.checkoutToken);
        if (cancelled) return;
        if (status.status === 'paid' && status.order_number) {
          setConfirmation({
            orderNumber: status.order_number,
            subtotal: Number(status.subtotal),
            discount: Number(status.discount_amount),
            total: Number(status.total_amount),
            coupon: status.coupon_code,
            kind: 'confirmed',
          });
          setPaymentPending(null);
          clearCheckoutKey();
          clearCheckoutSource();
          clearCart();
          return;
        }
      } catch {/* a later webhook/poll can still reconcile */}
      if (!cancelled) timer = setTimeout(refresh, 4000);
    };
    timer = setTimeout(refresh, 1500);
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [paymentPending, clearCart]);

  const checkoutFingerprint = useMemo(() => JSON.stringify({
    items: items.map((item) => ({
      id: item.productSlug ?? item.id,
      quantity: item.quantity,
      variant: item.variantLabel ?? null,
      customizations: item.customizations ?? null,
      comboSelections: item.comboSelections ?? null,
    })),
    coupon: couponApplied?.valid ? couponApplied.code : null,
    contact: {
      name: form.fullName,
      phone: form.phone,
      email: form.email,
      address: form.address,
      city: form.city,
      notes: form.notes,
    },
    paymentMethod: form.paymentMethod,
  }), [items, couponApplied, form]);

  // Any material edit invalidates the mounted Preference. The same checkout
  // key is upserted, so the database never creates a second order.
  useEffect(() => {
    if (mpReady) {
      setMpReady(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checkoutFingerprint]);

  // Auto-prepare when user lands on step 3 with MP selected and form is valid.
  useEffect(() => {
    if (
      stepIndex === STEPS.length - 1 &&
      form.paymentMethod === 'mercado_pago' &&
      step2Valid &&
      minimumOrderMet &&
      !mpReady &&
      !mpPreparing &&
      MP_PUBLIC_KEY
    ) {
      void prepareMpBrick();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stepIndex, form.paymentMethod, step2Valid, minimumOrderMet, checkoutFingerprint]);

  const goNext = () => {
    if (stepIndex === 0 && !minimumOrderMet) {
      setError(`La compra mínima es de ${COP(MINIMUM_ORDER_TOTAL_COP)}. Agrega ${COP(minimumOrderMissing)} más para continuar.`);
      return;
    }
    if (stepIndex === 1 && !step2Valid) return;
    setError(null);
    setStepIndex((i) => Math.min(i + 1, STEPS.length - 1));
  };
  const goBack = () => setStepIndex((i) => Math.max(i - 1, 0));

  if (paymentPending) {
    return (
      <div className="min-h-screen pt-32 pb-12">
        <Navbar />
        <div className="max-w-xl mx-auto text-center px-6 py-16 relative z-10">
          <div className="w-28 h-28 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto mb-8">
            <Loader2 size={46} className="animate-spin" />
          </div>
          <h1 className="text-5xl font-serif text-serana-forest mb-4">Pago en revisión</h1>
          <p className="text-serana-terracotta font-bold tracking-widest uppercase text-sm mb-6">
            {COP(paymentPending.total)} · referencia {paymentPending.paymentId}
          </p>
          <p className="text-xl text-gray-600 mb-5 font-light leading-relaxed">
            Mercado Pago todavía no ha acreditado el pago. Tu pedido no ha entrado a cocina y no se enviará al sistema operativo hasta recibir la aprobación.
          </p>
          <p className="text-sm text-serana-forest/60 mb-10">
            Esta pantalla se actualiza automáticamente. Conservamos tu canasta mientras llega la confirmación.
          </p>
          <Link to="/" className="inline-flex items-center gap-2 text-serana-forest font-bold tracking-widest uppercase text-xs border-b border-serana-forest/30 pb-1 hover:text-serana-olive">
            Volver al inicio
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  // Empty cart screen (only show before confirmation)
  if (!confirmation && items.length === 0) {
    return (
      <div className="min-h-screen pt-32">
        <Navbar />
        <div className="max-w-md mx-auto text-center px-6 py-24">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
            <h2 className="text-4xl font-serif text-serana-forest mb-6">Tu canasta está vacía</h2>
            <p className="text-gray-600 mb-8 font-light">Aún no has elegido tu ritual. Vuelve al mercado y descubre la colección.</p>
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 text-serana-terracotta font-bold tracking-widest uppercase text-xs hover:text-serana-ochre transition-colors border-b border-serana-terracotta/30 pb-1"
            >
              <ArrowLeft size={14} /> Volver al mercado
            </Link>
          </motion.div>
        </div>
        <Footer />
      </div>
    );
  }

  // Success screen
  if (confirmation) {
    return (
      <div className="min-h-screen pt-32 pb-12">
        <Navbar />
        <div className="max-w-xl mx-auto text-center px-6 py-12 relative z-10">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
            <div className="w-32 h-32 bg-serana-olive/10 rounded-full flex items-center justify-center mx-auto mb-8 relative">
              <motion.div
                initial={{ scale: 0 }} animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring' }}
                className="bg-serana-olive text-white p-6 rounded-full shadow-xl"
              >
                <CheckCircle size={48} />
              </motion.div>
              <motion.div
                animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="absolute inset-0 bg-serana-olive/20 rounded-full"
              />
            </div>
            <h1 className="text-5xl md:text-6xl font-serif text-serana-forest mb-4">
              {confirmation.kind === 'awaiting_transfer' ? 'Pedido pendiente de pago' : '¡Pedido confirmado!'}
            </h1>
            <p className="text-serana-terracotta font-bold tracking-widest uppercase text-sm mb-6">
              Pedido #{confirmation.orderNumber} · {COP(confirmation.total)}
            </p>
            {confirmation.discount > 0 && (
              <p className="text-sm text-serana-olive font-medium mb-6">
                Aplicaste el cupón <span className="font-mono font-bold">{confirmation.coupon}</span>
                {' '}— ahorraste {COP(confirmation.discount)}
              </p>
            )}
            <p className="text-xl text-gray-600 mb-12 font-light leading-relaxed">
              {confirmation.kind === 'awaiting_transfer'
                ? 'Registramos tu solicitud. Te enviaremos los datos de transferencia y el pedido entrará a cocina únicamente cuando confirmemos el pago.'
                : 'Gracias por elegir Serana. Tu pedido entró a la cocina y te escribimos por WhatsApp con cada novedad.'}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
              <Link to="/" className="inline-flex items-center gap-2 bg-serana-forest text-serana-cream px-10 py-4 rounded-full font-bold hover:bg-serana-olive transition-colors shadow-lg">
                <Truck size={18} /> Volver al inicio
              </Link>
              <Link to="/shop" className="inline-flex items-center gap-2 text-serana-forest font-bold tracking-widest uppercase text-xs border-b border-serana-forest/30 pb-1 hover:text-serana-olive">
                Seguir comprando
              </Link>
            </div>
          </motion.div>
        </div>
        <Footer />
      </div>
    );
  }

  // Wizard
  return (
    <div className="min-h-screen pt-32 pb-12">
      <Navbar />

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        {/* Stepper */}
        <div className="mb-10">
          <div className="flex items-center gap-3 text-serana-terracotta font-bold tracking-[0.3em] uppercase text-[10px] mb-4">
            <span className="w-8 h-px bg-serana-terracotta/60" />
            Checkout · Paso {stepIndex + 1} de {STEPS.length}
          </div>
          <h1 className="font-serif text-4xl md:text-5xl text-serana-forest mb-6 leading-tight">
            {stepIndex === 0 && (<>Revisa tu <span className="italic text-serana-olive">canasta</span>.</>)}
            {stepIndex === 1 && (<>¿Adónde te lo <span className="italic text-serana-olive">enviamos</span>?</>)}
            {stepIndex === 2 && (<>Elige cómo <span className="italic text-serana-olive">pagas</span>.</>)}
          </h1>

          <div className="flex items-center gap-3">
            {STEPS.map((s, i) => {
              const Icon = s.Icon;
              const done = i < stepIndex;
              const active = i === stepIndex;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => i < stepIndex && setStepIndex(i)}
                  disabled={i > stepIndex}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-[10px] font-bold uppercase tracking-widest transition ${
                    active ? 'bg-serana-forest text-serana-cream border-serana-forest'
                    : done ? 'bg-serana-olive/10 text-serana-olive border-serana-olive/40 hover:border-serana-olive cursor-pointer'
                    : 'bg-white text-serana-forest/40 border-serana-forest/10'
                  }`}
                >
                  {done ? <Check className="w-3 h-3" /> : <Icon className="w-3 h-3" />}
                  {s.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid lg:grid-cols-[1fr_380px] gap-12">
          {/* Step content */}
          <motion.div
            key={stepIndex}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="order-2 lg:order-1"
          >
            {stepIndex === 0 && (
              <Step1Cart
                items={items}
                subtotal={subtotal}
                minimumOrderMet={minimumOrderMet}
                minimumOrderMissing={minimumOrderMissing}
              />
            )}

            {stepIndex === 1 && (
              <>
                <CheckoutAccountPrompt loggedIn={Boolean(user)} />
                <Step2Delivery
                  form={form}
                  update={update}
                  contactValid={contactValid}
                  addressValid={addressValid}
                />
              </>
            )}

            {stepIndex === 2 && (
              <>
                <Step3Payment
                  method={form.paymentMethod}
                  onChange={(m) => setForm((prev) => {
                    const next = { ...prev, paymentMethod: m };
                    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {/* ignore */}
                    return next;
                  })}
                />

                {form.paymentMethod === 'mercado_pago' && (
                  <div className="mt-6">
                    {!minimumOrderMet ? (
                      <MinimumOrderNotice missing={minimumOrderMissing} />
                    ) : !MP_PUBLIC_KEY ? (
                      <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800">
                        <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                        <p className="text-sm">
                          Pagos en línea no están configurados en este entorno. Selecciona transferencia o efectivo.
                        </p>
                      </div>
                    ) : mpPreparing && !mpReady ? (
                      <div className="flex items-center gap-3 text-serana-forest/70 px-4 py-8 rounded-2xl bg-white/60 border border-serana-forest/10 justify-center">
                        <Loader2 className="w-5 h-5 animate-spin text-serana-olive" />
                        <span className="text-sm font-medium">Preparando tu pago seguro…</span>
                      </div>
                    ) : mpReady ? (
                      <>
                        {mpRejection && (
                          <div className="flex items-start gap-3 p-4 mb-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700">
                            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                            <div className="text-sm">
                              <p className="font-medium">Pago rechazado</p>
                              <p className="text-rose-600/80 text-[13px] mt-1">
                                {mpRejection.message ?? mpRejection.status_detail}. Intenta con otra tarjeta o método.
                              </p>
                            </div>
                          </div>
                        )}
                        <MercadoPagoBrick
                          publicKey={MP_PUBLIC_KEY}
                          preferenceId={mpReady.preference_id}
                          amount={mpReady.amount}
                          checkoutToken={mpReady.checkout_token}
                          payerEmail={form.email.trim() || undefined}
                          onApproved={handleBrickApproved}
                          onPending={handleBrickPending}
                          onRejected={handleBrickRejected}
                        />
                      </>
                    ) : null}
                  </div>
                )}
              </>
            )}

            {error && (
              <div className="flex items-start gap-3 p-4 mt-6 rounded-xl bg-rose-50 border border-rose-200 text-rose-700">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <p className="text-sm font-medium">{error}</p>
              </div>
            )}

            {/* Wizard nav buttons */}
            <div className="flex items-center justify-between gap-4 mt-10">
              <button
                type="button"
                onClick={stepIndex === 0 ? undefined : goBack}
                disabled={stepIndex === 0}
                className="inline-flex items-center gap-2 text-serana-forest font-bold tracking-widest uppercase text-[10px] hover:text-serana-olive transition disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ArrowLeft size={14} /> Atrás
              </button>
              {stepIndex < STEPS.length - 1 ? (
                <button
                  type="button"
                  onClick={goNext}
                  disabled={(stepIndex === 0 && !minimumOrderMet) || (stepIndex === 1 && !step2Valid)}
                  className="inline-flex items-center gap-2 bg-serana-forest text-serana-cream px-8 py-3.5 rounded-full font-bold tracking-widest uppercase text-xs hover:bg-serana-olive transition disabled:opacity-50"
                >
                  Continuar <ArrowRight size={14} />
                </button>
              ) : form.paymentMethod === 'mercado_pago' ? (
                <span className="text-[11px] text-serana-forest/55 italic">
                  Completa el formulario de pago aquí arriba.
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => void handleSubmit()}
                  disabled={!step2Valid || !minimumOrderMet || submitting || items.length === 0}
                  className="inline-flex items-center gap-2 bg-serana-forest text-serana-cream px-8 py-4 rounded-full font-bold tracking-widest uppercase text-xs hover:bg-serana-olive transition disabled:opacity-60"
                >
                  {submitting ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Enviando…</>
                  ) : (
                    <>Confirmar pedido · {COP(totalToPay)} <ArrowRight size={14} /></>
                  )}
                </button>
              )}
            </div>
          </motion.div>

          {/* Sticky summary */}
          <aside className="order-1 lg:order-2">
            <div className="bg-white/70 backdrop-blur-md p-7 rounded-[1.75rem] shadow-sm border border-serana-forest/5 lg:sticky lg:top-32">
              <h2 className="font-serif text-xl text-serana-forest mb-5">Tu pedido</h2>

              <div className="space-y-3 mb-5 max-h-72 overflow-y-auto pr-1">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-3 items-start">
                    <div className="w-12 h-12 rounded-lg overflow-hidden shadow-sm shrink-0 bg-slate-100">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" loading="lazy" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-serana-forest leading-tight truncate">{item.name}</p>
                      <p className="text-[11px] text-gray-500 uppercase tracking-wider">x{item.quantity}</p>
                      <CheckoutItemCustomizations item={item} compact />
                    </div>
                    <span className="text-sm font-bold text-serana-forest shrink-0">{COP(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>

              {/* Coupon */}
              <div className="border-t border-serana-forest/10 pt-4 mb-4">
                {couponApplied?.valid ? (
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-serana-olive/10 border border-serana-olive/30">
                    <Tag className="w-4 h-4 text-serana-olive shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] uppercase tracking-widest text-serana-olive font-bold">Cupón aplicado</p>
                      <p className="font-mono font-bold text-serana-forest text-sm">{couponApplied.code}</p>
                    </div>
                    <button onClick={removeCoupon} aria-label="Quitar cupón" className="text-serana-forest/50 hover:text-serana-forest p-1">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : couponOpen ? (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="CODIGO"
                        value={couponCode}
                        onChange={(e) => { setCouponCode(e.target.value.toUpperCase()); setCouponError(null); }}
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); void handleApplyCoupon(); } }}
                        className="flex-1 px-3 py-2 rounded-lg border border-serana-forest/15 bg-white font-mono uppercase tracking-widest text-sm focus:outline-none focus:border-serana-olive"
                      />
                      <button
                        type="button"
                        onClick={() => void handleApplyCoupon()}
                        disabled={couponBusy || !couponCode.trim()}
                        className="px-4 py-2 rounded-lg bg-serana-forest text-serana-cream text-[10px] font-bold uppercase tracking-widest hover:bg-serana-olive transition disabled:opacity-50"
                      >
                        {couponBusy ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Aplicar'}
                      </button>
                    </div>
                    {couponError && (
                      <p className="text-[11px] text-rose-600 leading-snug">{couponError}</p>
                    )}
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setCouponOpen(true)}
                    className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-serana-forest/65 hover:text-serana-olive transition"
                  >
                    <Tag className="w-3 h-3" />
                    ¿Tienes un cupón?
                  </button>
                )}
              </div>

              {/* Totals */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-gray-600 font-light">
                  <span>Subtotal</span>
                  <span>{COP(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-serana-olive font-medium">
                    <span>Descuento</span>
                    <span>− {COP(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-600 font-light">
                  <span>Domicilio</span>
                  <span className="text-serana-olive">{COP(DELIVERY_FEE_COP)}</span>
                </div>
                <div className="flex justify-between text-xl font-serif text-serana-forest pt-3 border-t border-serana-forest/10">
                  <span>Total</span>
                  <span>{COP(totalToPay)}</span>
                </div>
                {!minimumOrderMet && (
                  <div className="mt-4 rounded-xl border border-serana-terracotta/25 bg-serana-terracotta/10 px-4 py-3 text-[12px] leading-relaxed text-serana-forest">
                    <p className="font-bold">Compra mínima: {COP(MINIMUM_ORDER_TOTAL_COP)}</p>
                    <p className="text-serana-forest/65">Agrega {COP(minimumOrderMissing)} más para activar el checkout.</p>
                  </div>
                )}
              </div>
            </div>
          </aside>
        </div>
      </div>

      <Footer />
    </div>
  );
}

/* ── Step components ────────────────────────────────────────────────── */

function CheckoutAccountPrompt({ loggedIn }: { loggedIn: boolean }) {
  return (
    <div className={`mb-6 rounded-2xl border p-4 flex flex-col sm:flex-row sm:items-center gap-3 justify-between ${
      loggedIn
        ? 'bg-serana-olive/10 border-serana-olive/25 text-serana-forest'
        : 'bg-white/70 border-serana-forest/10 text-serana-forest'
    }`}>
      <div className="flex items-start gap-3">
        <span className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
          loggedIn ? 'bg-serana-olive text-white' : 'bg-serana-forest text-serana-cream'
        }`}>
          {loggedIn ? <Check className="w-4 h-4" /> : <LogIn className="w-4 h-4" />}
        </span>
        <div>
          <p className="font-bold text-sm">
            {loggedIn ? 'Tu compra quedará guardada en tu cuenta.' : 'Inicia sesión para guardar tu compra.'}
          </p>
          <p className="text-xs text-serana-forest/55 mt-1 leading-relaxed">
            {loggedIn
              ? 'Serana podrá ver tu historial, datos y membresía desde Supabase.'
              : 'También puedes continuar como invitado, pero la cuenta ayuda a llevar membresía e historial.'}
          </p>
        </div>
      </div>
      {!loggedIn && (
        <Link
          to="/login"
          state={{ from: '/checkout' }}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-serana-forest text-serana-cream text-[10px] font-bold uppercase tracking-widest hover:bg-serana-olive transition"
        >
          Entrar <ArrowRight className="w-3 h-3" />
        </Link>
      )}
    </div>
  );
}

function MinimumOrderNotice({ missing }: { missing: number }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-serana-terracotta/25 bg-serana-terracotta/10 p-4 text-serana-forest">
      <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-serana-terracotta" />
      <div className="text-sm leading-relaxed">
        <p className="font-bold">La compra mínima en Serana es de {COP(MINIMUM_ORDER_TOTAL_COP)}.</p>
        <p className="mt-1 text-serana-forest/65">Agrega {COP(missing)} más a tu canasta para continuar con entrega y pago.</p>
      </div>
    </div>
  );
}

function Step1Cart({
  items,
  subtotal,
  minimumOrderMet,
  minimumOrderMissing,
}: {
  items: CartItem[];
  subtotal: number;
  minimumOrderMet: boolean;
  minimumOrderMissing: number;
}) {
  return (
    <div className="space-y-6">
      <p className="text-gray-600 leading-relaxed">
        {items.length === 1 ? '1 producto' : `${items.length} productos`} en tu canasta.
        Te confirmamos cada paso por WhatsApp.
      </p>
      {!minimumOrderMet && <MinimumOrderNotice missing={minimumOrderMissing} />}
      <div className="bg-white/70 rounded-2xl border border-serana-forest/5 divide-y divide-serana-forest/5">
        {items.map((it) => (
          <div key={it.id} className="flex items-center gap-4 p-4">
            <div className="w-16 h-16 rounded-xl overflow-hidden shadow-sm shrink-0 bg-slate-100">
              <img src={it.image} alt={it.name} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-serif text-lg text-serana-forest leading-tight truncate">{it.name}</p>
              <p className="text-xs text-gray-500 uppercase tracking-wider mt-1">Cantidad: {it.quantity}</p>
              <CheckoutItemCustomizations item={it} />
            </div>
            <span className="font-bold text-serana-forest shrink-0">{COP(it.price * it.quantity)}</span>
          </div>
        ))}
      </div>
      <p className="text-[12px] text-serana-forest/55 italic">
        Subtotal calculado · {COP(subtotal)}. La compra mínima es de {COP(MINIMUM_ORDER_TOTAL_COP)}.
      </p>
    </div>
  );
}

function CheckoutItemCustomizations({ item, compact = false }: { item: CartItem; compact?: boolean }) {
  if (item.comboSelections) {
    return (
      <ul className={`mt-2 space-y-1 rounded-xl bg-serana-cream/70 px-3 py-2 leading-snug text-serana-forest/62 ${compact ? 'text-[9px]' : 'text-[10px]'}`}>
        {getComboSummaryLines(item.comboSelections).map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>
    );
  }

  const customizations = stripComboPayloadMarker(item.customizations);
  if (!customizations) return null;
  return (
    <p className={`mt-2 rounded-xl bg-serana-cream/70 px-3 py-2 leading-snug text-serana-forest/62 ${compact ? 'text-[9px]' : 'text-[10px]'}`}>
      {customizations}
    </p>
  );
}

function Step2Delivery({
  form, update, contactValid, addressValid,
}: {
  form: FormState;
  update: (k: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  contactValid: boolean;
  addressValid: boolean;
}) {
  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-xl font-serif text-serana-forest mb-4 flex items-center gap-3">
          <span className="w-7 h-7 rounded-full bg-serana-forest text-serana-cream flex items-center justify-center">
            <User className="w-3.5 h-3.5" />
          </span>
          Contacto
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <input
            required
            placeholder="Nombre completo"
            value={form.fullName}
            onChange={update('fullName')}
            className="col-span-2 p-4 rounded-xl border border-serana-forest/10 bg-white/60 focus:bg-white focus:border-serana-forest/30 outline-none transition"
          />
          <input
            required type="tel" inputMode="tel"
            placeholder="Celular (con WhatsApp)"
            value={form.phone}
            onChange={update('phone')}
            className="col-span-2 sm:col-span-1 p-4 rounded-xl border border-serana-forest/10 bg-white/60 focus:bg-white focus:border-serana-forest/30 outline-none transition"
          />
          <input
            type="email"
            placeholder="Email (opcional)"
            value={form.email}
            onChange={update('email')}
            className="col-span-2 sm:col-span-1 p-4 rounded-xl border border-serana-forest/10 bg-white/60 focus:bg-white focus:border-serana-forest/30 outline-none transition"
          />
        </div>
        {!contactValid && (form.fullName.length > 0 || form.phone.length > 0) && (
          <p className="text-[11px] text-rose-600 mt-2">Necesitamos al menos nombre (2+ chars) y celular (7+ dígitos).</p>
        )}
      </section>

      <section>
        <h2 className="text-xl font-serif text-serana-forest mb-4 flex items-center gap-3">
          <span className="w-7 h-7 rounded-full bg-serana-forest text-serana-cream flex items-center justify-center">
            <MapPin className="w-3.5 h-3.5" />
          </span>
          Dirección de entrega
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <input
            required
            placeholder="Dirección (calle, número, apto, barrio)"
            value={form.address}
            onChange={update('address')}
            className="col-span-2 p-4 rounded-xl border border-serana-forest/10 bg-white/60 focus:bg-white focus:border-serana-forest/30 outline-none transition"
          />
          <input
            placeholder="Ciudad"
            value={form.city}
            onChange={update('city')}
            className="col-span-2 sm:col-span-1 p-4 rounded-xl border border-serana-forest/10 bg-white/60 focus:bg-white focus:border-serana-forest/30 outline-none transition"
          />
          <textarea
            placeholder="Notas para el repartidor (opcional)"
            value={form.notes}
            onChange={update('notes')}
            rows={2}
            className="col-span-2 sm:col-span-1 p-4 rounded-xl border border-serana-forest/10 bg-white/60 focus:bg-white focus:border-serana-forest/30 outline-none transition resize-none"
          />
        </div>
        {!addressValid && form.address.length > 0 && (
          <p className="text-[11px] text-rose-600 mt-2">La dirección debe tener al menos 5 caracteres.</p>
        )}
      </section>
    </div>
  );
}

function Step3Payment({
  method, onChange,
}: { method: PaymentMethod; onChange: (m: PaymentMethod) => void }) {
  return (
    <div className="space-y-5">
      <p className="text-gray-600 leading-relaxed">
        Elige cómo te queda más cómodo. Si pagas con tarjeta o débito, te llevamos a Mercado Pago.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {PAYMENT_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`text-left p-4 rounded-xl border-2 transition-all ${
              method === opt.value
                ? 'border-serana-forest bg-white shadow'
                : 'border-serana-forest/10 bg-white/40 hover:border-serana-forest/30'
            }`}
          >
            <p className="font-bold text-serana-forest">{opt.label}</p>
            <p className="text-xs text-gray-500 mt-1">{opt.hint}</p>
          </button>
        ))}
      </div>
      {method === 'mercado_pago' && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-serana-cream/60 border border-serana-forest/10 text-serana-forest/75 text-[13px] leading-relaxed">
          <CreditCard className="w-4 h-4 shrink-0 mt-0.5 text-serana-olive" />
          Después de confirmar te llevamos a Mercado Pago para completar el pago. Puedes pagar con tarjeta, PSE, Nequi o transferencia.
        </div>
      )}
      {method === 'transferencia' && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-serana-cream/60 border border-serana-forest/10 text-serana-forest/75 text-[13px] leading-relaxed">
          <CreditCard className="w-4 h-4 shrink-0 mt-0.5 text-serana-olive" />
          Recibirás los datos bancarios por WhatsApp. Tu pedido entra a cocina cuando confirmemos el pago.
        </div>
      )}
      {method === 'efectivo' && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-serana-cream/60 border border-serana-forest/10 text-serana-forest/75 text-[13px] leading-relaxed">
          <CreditCard className="w-4 h-4 shrink-0 mt-0.5 text-serana-olive" />
          Pagas en efectivo cuando recibas tu pedido. Confirmamos por WhatsApp el horario de entrega.
        </div>
      )}
    </div>
  );
}
