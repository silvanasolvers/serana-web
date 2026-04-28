import { useEffect, type ReactNode } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import CartDrawer from './CartDrawer';
import SectionDivider from './SectionDivider';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

type Props = {
  kicker: string;
  title: string;
  italic?: string;
  intro: string;
  lastUpdated: string;
  children: ReactNode;
};

export default function LegalLayout({ kicker, title, italic, intro, lastUpdated, children }: Props) {
  useEffect(() => {
    const fullTitle = italic ? `${title} ${italic}` : title;
    document.title = `${fullTitle} · Serana`;
  }, [title, italic]);

  return (
    <div className="min-h-screen pt-24 bg-[#F9F7F2]">
      <Navbar />
      <CartDrawer />

      <div className="max-w-3xl mx-auto px-6 relative z-10">
        <header className="pt-12 md:pt-16 pb-10">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-serana-forest/60 hover:text-serana-forest text-[10px] font-bold uppercase tracking-[0.3em] mb-8 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Volver al inicio
          </Link>

          <div className="flex items-center gap-3 mb-5">
            <span className="w-10 h-px bg-serana-terracotta" />
            <span className="text-serana-terracotta font-bold tracking-[0.4em] uppercase text-[10px]">
              {kicker}
            </span>
          </div>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="font-serif text-4xl md:text-5xl lg:text-6xl text-serana-forest leading-[1.05] tracking-tight"
          >
            {title}
            {italic && (
              <>
                {' '}
                <span className="italic text-serana-olive">{italic}</span>
              </>
            )}
            .
          </motion.h1>

          <p className="mt-6 text-serana-forest/70 text-base md:text-lg font-light leading-relaxed max-w-2xl">
            {intro}
          </p>

          <p className="mt-8 text-[10px] uppercase tracking-[0.3em] text-serana-forest/40">
            Última actualización · {lastUpdated}
          </p>
        </header>

        <SectionDivider variant="brush" />

        <article className="legal-prose py-12 md:py-16">{children}</article>

        <SectionDivider />

        <div className="py-12 text-center">
          <p className="text-serana-forest/65 text-sm font-light leading-relaxed max-w-md mx-auto">
            ¿Dudas? Escríbenos a{' '}
            <a href="mailto:contacto@serana.co" className="text-serana-terracotta font-medium hover:underline">
              contacto@serana.co
            </a>{' '}
            o por WhatsApp.
          </p>
          <Link
            to="/"
            className="mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-full bg-serana-forest text-serana-cream text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-serana-olive transition"
          >
            Volver al inicio
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
}
