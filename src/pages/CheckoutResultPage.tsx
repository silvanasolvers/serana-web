import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { CheckCircle, AlertTriangle, Clock, ArrowLeft, Truck, Loader2 } from 'lucide-react';
import type { ReactElement } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { getCheckoutStatus, type CheckoutPublicStatus } from '../lib/api/orders';
import { clearCheckoutSource } from '../lib/checkoutSource';
import { useCartStore } from '../store/useCartStore';

type Variant = 'success' | 'failure' | 'pending';
type ResolvedVariant = Variant | 'verifying';

const COPY: Record<ResolvedVariant, { title: string; description: string; tone: string }> = {
  success: {
    title: '¡Pago aprobado!',
    description:
      'Confirmamos el pago y creamos tu pedido. Ya puede entrar a cocina y te escribiremos por WhatsApp con cada novedad.',
    tone: 'text-serana-olive',
  },
  failure: {
    title: 'No pudimos completar el pago',
    description:
      'El pago no fue aprobado. Puedes volver al checkout e intentar con otro medio; no creamos un pedido operativo.',
    tone: 'text-rose-600',
  },
  pending: {
    title: 'Pago en revisión',
    description:
      'Mercado Pago todavía no ha acreditado el pago. El pedido no entrará a cocina hasta recibir la confirmación.',
    tone: 'text-amber-600',
  },
  verifying: {
    title: 'Verificando el pago',
    description:
      'Estamos consultando el estado real del checkout. No mostraremos una aprobación hasta confirmarla con el servidor.',
    tone: 'text-serana-olive',
  },
};

const ICON: Record<ResolvedVariant, ReactElement> = {
  success: <CheckCircle size={48} />,
  failure: <AlertTriangle size={48} />,
  pending: <Clock size={48} />,
  verifying: <Loader2 size={48} className="animate-spin" />,
};

function resolveVariant(status: CheckoutPublicStatus | null, routeVariant: Variant): ResolvedVariant {
  if (!status) return 'verifying';
  if (status.status === 'paid' && status.payment_status === 'pagado' && status.order_number) return 'success';
  if (['payment_processing', 'payment_pending'].includes(status.status)) return 'pending';
  if (['payment_failed', 'cancelled', 'expired'].includes(status.status)) return 'failure';
  return routeVariant === 'failure' ? 'failure' : 'pending';
}

export default function CheckoutResultPage({ variant }: { variant: Variant }) {
  const location = useLocation();
  const clearCart = useCartStore((state) => state.clearCart);
  const search = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const checkoutToken = search.get('checkout');
  const [status, setStatus] = useState<CheckoutPublicStatus | null>(null);
  const [verificationFailed, setVerificationFailed] = useState(false);

  useEffect(() => {
    if (!checkoutToken) {
      setVerificationFailed(true);
      return;
    }
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | null = null;
    let attempts = 0;

    const refresh = async () => {
      attempts += 1;
      try {
        const next = await getCheckoutStatus(checkoutToken);
        if (cancelled) return;
        setStatus(next);
        setVerificationFailed(false);
        if (next.status === 'paid' && next.payment_status === 'pagado' && next.order_number) {
          clearCart();
          clearCheckoutSource();
          sessionStorage.removeItem('serana:checkout:key:v2');
          return;
        }
        if (['payment_processing', 'payment_pending'].includes(next.status) && attempts < 45) {
          timer = setTimeout(refresh, 4000);
        }
      } catch {
        if (cancelled) return;
        setVerificationFailed(true);
        if (attempts < 5) timer = setTimeout(refresh, 3000);
      }
    };
    void refresh();
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [checkoutToken, clearCart]);

  const resolved = verificationFailed && !status ? 'verifying' : resolveVariant(status, variant);
  const meta = COPY[resolved];
  const icon = ICON[resolved];

  return (
    <div className="min-h-screen pt-32 pb-12">
      <Navbar />
      <div className="max-w-xl mx-auto text-center py-24 px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-32 h-32 rounded-full flex items-center justify-center mx-auto mb-8 relative bg-serana-cream"
        >
          <div className={`p-6 rounded-full shadow-xl bg-white ${meta.tone}`}>{icon}</div>
        </motion.div>

        <h1 className="text-5xl md:text-6xl font-serif text-serana-forest mb-4">{meta.title}</h1>
        {status?.order_number && (
          <p className="text-serana-terracotta font-bold tracking-widest uppercase text-sm mb-6">
            Pedido #{status.order_number}
          </p>
        )}
        <p className="text-xl text-gray-600 mb-5 font-light leading-relaxed">{meta.description}</p>
        {verificationFailed && !status && (
          <p className="text-sm text-amber-700 mb-10">
            No pudimos consultar el checkout en este momento. Recarga esta página; una URL por sí sola nunca confirma el pago.
          </p>
        )}

        <div className="flex flex-col sm:flex-row gap-4 items-center justify-center mt-10">
          {resolved === 'success' && (
            <Link
              to="/"
              className="inline-flex items-center gap-2 bg-serana-forest text-serana-cream px-10 py-4 rounded-full font-bold hover:bg-serana-olive transition-colors shadow-lg"
            >
              <Truck size={18} /> Volver al inicio
            </Link>
          )}
          {resolved === 'failure' && (
            <Link
              to="/checkout"
              className="inline-flex items-center gap-2 bg-serana-forest text-serana-cream px-10 py-4 rounded-full font-bold hover:bg-serana-olive transition-colors shadow-lg"
            >
              <ArrowLeft size={18} /> Reintentar pago
            </Link>
          )}
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 text-serana-forest font-bold tracking-widest uppercase text-xs border-b border-serana-forest/30 pb-1 hover:text-serana-olive"
          >
            Seguir comprando
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  );
}
