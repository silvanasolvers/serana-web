import React, { useState } from 'react';
import { useCartStore } from '../store/useCartStore';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { motion } from 'motion/react';
import { CheckCircle, Truck, ArrowLeft, AlertCircle, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createOrderAnon, type PaymentMethod } from '../lib/api/orders';

const COP = (n: number) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
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
  city: 'Bogotá',
  notes: '',
  paymentMethod: 'mercado_pago',
};

export default function CheckoutPage() {
  const { items, total, clearCart } = useCartStore();
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [form, setForm] = useState<FormState>(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<{ orderNumber: number; total: number } | null>(null);

  const update = (k: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((prev) => ({ ...prev, [k]: e.target.value }));

  const phoneDigits = form.phone.replace(/\D/g, '');
  const isFormValid =
    form.fullName.trim().length >= 2 &&
    phoneDigits.length >= 7 &&
    form.address.trim().length >= 5 &&
    items.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const fullAddress = [form.address.trim(), form.city.trim()].filter(Boolean).join(', ');
      const result = await createOrderAnon({
        customer_phone: phoneDigits,
        customer_name: form.fullName.trim(),
        customer_email: form.email.trim() || undefined,
        delivery_address: fullAddress,
        type: 'domicilio',
        payment_method: form.paymentMethod,
        payment_status: 'pendiente',
        source_code: 'web',
        items: items.map((item) => ({
          product_slug: item.id,
          quantity: item.quantity,
          customizations: undefined,
        })),
      });

      if (form.paymentMethod === 'mercado_pago') {
        // Hand off to Mercado Pago for the actual payment. The cart stays
        // untouched until we know the user committed (success page clears it).
        const mpResp = await fetch('/api/checkout/mp/preference', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ order_id: result.order_id }),
        });
        if (!mpResp.ok) {
          const errorBody = await mpResp.text();
          throw new Error(`No pudimos abrir Mercado Pago (${mpResp.status}). ${errorBody.slice(0, 240)}`);
        }
        const mpData = (await mpResp.json()) as { init_point?: string; sandbox_init_point?: string };
        const target = mpData.init_point || mpData.sandbox_init_point;
        if (!target) {
          throw new Error('Mercado Pago no devolvió un enlace de pago. Intenta nuevamente.');
        }
        window.location.href = target;
        return;
      }

      // Cash / transfer / cualquier flujo no-online: confirmar inmediatamente.
      setConfirmation({
        orderNumber: result.order_number,
        total: Number(result.total_amount),
      });
      setStep('success');
      clearCart();
    } catch (err: any) {
      const message: string =
        err?.message || err?.error_description || 'No pudimos confirmar tu pedido. Intenta nuevamente.';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (items.length === 0 && step === 'form') {
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

  return (
    <div className="min-h-screen pt-32 pb-12">
      <Navbar />

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        {step === 'form' ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid lg:grid-cols-2 gap-16">
            {/* Form Section */}
            <div>
              <div className="mb-12">
                <span className="text-serana-terracotta font-bold tracking-[0.3em] uppercase text-xs mb-4 block">Último paso</span>
                <h1 className="text-5xl font-serif text-serana-forest mb-4">Completa tu ritual</h1>
                <p className="text-gray-600 font-light">Te confirmamos por WhatsApp y empezamos a prepararlo.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-12">
                <section>
                  <h2 className="text-2xl font-serif text-serana-forest mb-6 flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-serana-forest text-serana-cream flex items-center justify-center text-sm font-sans font-bold">1</span>
                    Datos de contacto
                  </h2>
                  <div className="grid grid-cols-2 gap-6">
                    <input
                      required
                      placeholder="Nombre completo"
                      value={form.fullName}
                      onChange={update('fullName')}
                      className="col-span-2 p-4 rounded-xl border border-serana-forest/10 bg-white/50 focus:bg-white focus:border-serana-forest/30 outline-none transition-all"
                    />
                    <input
                      required
                      type="tel"
                      inputMode="tel"
                      placeholder="Celular (con WhatsApp)"
                      value={form.phone}
                      onChange={update('phone')}
                      className="col-span-2 sm:col-span-1 p-4 rounded-xl border border-serana-forest/10 bg-white/50 focus:bg-white focus:border-serana-forest/30 outline-none transition-all"
                    />
                    <input
                      type="email"
                      placeholder="Email (opcional)"
                      value={form.email}
                      onChange={update('email')}
                      className="col-span-2 sm:col-span-1 p-4 rounded-xl border border-serana-forest/10 bg-white/50 focus:bg-white focus:border-serana-forest/30 outline-none transition-all"
                    />
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-serif text-serana-forest mb-6 flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-serana-forest text-serana-cream flex items-center justify-center text-sm font-sans font-bold">2</span>
                    Dirección de entrega
                  </h2>
                  <div className="grid grid-cols-2 gap-6">
                    <input
                      required
                      placeholder="Dirección (Calle / carrera, número, apto, barrio)"
                      value={form.address}
                      onChange={update('address')}
                      className="col-span-2 p-4 rounded-xl border border-serana-forest/10 bg-white/50 focus:bg-white focus:border-serana-forest/30 outline-none transition-all"
                    />
                    <input
                      placeholder="Ciudad"
                      value={form.city}
                      onChange={update('city')}
                      className="col-span-2 sm:col-span-1 p-4 rounded-xl border border-serana-forest/10 bg-white/50 focus:bg-white focus:border-serana-forest/30 outline-none transition-all"
                    />
                    <textarea
                      placeholder="Notas para el repartidor (opcional)"
                      value={form.notes}
                      onChange={update('notes')}
                      rows={2}
                      className="col-span-2 p-4 rounded-xl border border-serana-forest/10 bg-white/50 focus:bg-white focus:border-serana-forest/30 outline-none transition-all resize-none"
                    />
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-serif text-serana-forest mb-6 flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-serana-forest text-serana-cream flex items-center justify-center text-sm font-sans font-bold">3</span>
                    Método de pago
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {(
                      [
                        { value: 'mercado_pago', label: 'Mercado Pago', hint: 'Tarjeta · PSE · Nequi' },
                        { value: 'transferencia', label: 'Transferencia', hint: 'Te enviamos los datos' },
                        { value: 'efectivo', label: 'Efectivo', hint: 'Pagas al recibir' },
                      ] as const
                    ).map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setForm((prev) => ({ ...prev, paymentMethod: opt.value as PaymentMethod }))}
                        className={`text-left p-4 rounded-xl border-2 transition-all ${
                          form.paymentMethod === opt.value
                            ? 'border-serana-forest bg-white shadow'
                            : 'border-serana-forest/10 bg-white/40 hover:border-serana-forest/30'
                        }`}
                      >
                        <p className="font-bold text-serana-forest">{opt.label}</p>
                        <p className="text-xs text-gray-500 mt-1">{opt.hint}</p>
                      </button>
                    ))}
                  </div>
                  {form.paymentMethod === 'mercado_pago' && (
                    <p className="text-[11px] text-gray-500 mt-3 italic">
                      Después de confirmar te llevamos a Mercado Pago para completar el pago.
                    </p>
                  )}
                </section>

                {error && (
                  <div className="flex items-start gap-3 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700">
                    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                    <p className="text-sm font-medium">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={!isFormValid || submitting}
                  className="w-full bg-serana-forest text-serana-cream py-5 rounded-full font-bold text-lg hover:bg-serana-olive transition-all shadow-xl hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-3"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      {form.paymentMethod === 'mercado_pago' ? 'Abriendo Mercado Pago…' : 'Enviando pedido…'}
                    </>
                  ) : (
                    <>
                      {form.paymentMethod === 'mercado_pago'
                        ? `Pagar con Mercado Pago · ${COP(total())}`
                        : `Confirmar pedido · ${COP(total())}`}
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Order Summary */}
            <div className="lg:pl-12">
              <div className="bg-white/60 backdrop-blur-md p-10 rounded-[2rem] shadow-sm border border-serana-forest/5 sticky top-32">
                <h2 className="text-2xl font-serif text-serana-forest mb-8">Tu pedido</h2>
                <div className="space-y-6 mb-8 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-6 items-center group">
                      <div className="w-20 h-20 rounded-xl overflow-hidden shadow-sm shrink-0">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-serif text-lg text-serana-forest leading-tight mb-1 truncate">{item.name}</h4>
                        <p className="text-xs text-gray-500 uppercase tracking-wider">Cantidad: {item.quantity}</p>
                      </div>
                      <span className="font-bold text-serana-forest shrink-0">{COP(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-serana-forest/10 pt-6 space-y-3">
                  <div className="flex justify-between text-gray-600 font-light">
                    <span>Subtotal</span>
                    <span>{COP(total())}</span>
                  </div>
                  <div className="flex justify-between text-gray-600 font-light">
                    <span>Domicilio</span>
                    <span className="text-serana-olive font-medium">Por confirmar</span>
                  </div>
                  <div className="flex justify-between text-2xl font-serif text-serana-forest pt-4 border-t border-serana-forest/10 mt-4">
                    <span>Total</span>
                    <span>{COP(total())}</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-xl mx-auto text-center py-24">
            <div className="w-32 h-32 bg-serana-olive/10 rounded-full flex items-center justify-center mx-auto mb-8 relative">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
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

            <h1 className="text-5xl md:text-6xl font-serif text-serana-forest mb-4">¡Pedido confirmado!</h1>
            {confirmation && (
              <p className="text-serana-terracotta font-bold tracking-widest uppercase text-sm mb-6">
                Pedido #{confirmation.orderNumber} · {COP(confirmation.total)}
              </p>
            )}
            <p className="text-xl text-gray-600 mb-12 font-light leading-relaxed">
              Gracias por elegir Serana. Tu pedido entró a la cocina y te escribimos por WhatsApp con cada novedad.
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
        )}
      </div>

      <Footer />
    </div>
  );
}
