import { useMemo } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { CheckCircle, AlertTriangle, Clock, ArrowLeft, Truck } from 'lucide-react';
import type { ReactElement } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

type Variant = 'success' | 'failure' | 'pending';

const COPY: Record<Variant, { title: string; description: string; tone: string }> = {
  success: {
    title: '¡Pago aprobado!',
    description:
      'Mercado Pago confirmó el pago. Tu pedido entró a la cocina y te escribimos por WhatsApp con cada novedad.',
    tone: 'text-serana-olive',
  },
  failure: {
    title: 'No pudimos completar el pago',
    description:
      'Mercado Pago rechazó la operación. No te preocupes, no se hizo ningún cargo. Vuelve al checkout e intenta con otra tarjeta o método.',
    tone: 'text-rose-600',
  },
  pending: {
    title: 'Pago pendiente',
    description:
      'Mercado Pago dejó el pago en revisión. Apenas se apruebe, lo verás reflejado en tu pedido.',
    tone: 'text-amber-600',
  },
};

const ICON: Record<Variant, ReactElement> = {
  success: <CheckCircle size={48} />,
  failure: <AlertTriangle size={48} />,
  pending: <Clock size={48} />,
};

export default function CheckoutResultPage({ variant }: { variant: Variant }) {
  const location = useLocation();
  const params = useParams();
  const search = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const orderNumber = params.orderNumber || search.get('order') || search.get('order_number');
  const meta = COPY[variant];
  const icon = ICON[variant];

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
        {orderNumber && (
          <p className="text-serana-terracotta font-bold tracking-widest uppercase text-sm mb-6">
            Pedido #{orderNumber}
          </p>
        )}
        <p className="text-xl text-gray-600 mb-12 font-light leading-relaxed">{meta.description}</p>

        <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
          {variant === 'success' && (
            <Link
              to="/"
              className="inline-flex items-center gap-2 bg-serana-forest text-serana-cream px-10 py-4 rounded-full font-bold hover:bg-serana-olive transition-colors shadow-lg"
            >
              <Truck size={18} /> Volver al inicio
            </Link>
          )}
          {variant === 'failure' && (
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
