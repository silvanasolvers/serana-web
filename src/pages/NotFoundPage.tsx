import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight, Home, Search } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import CartDrawer from '../components/CartDrawer';
import { Sprout, SerenaMark } from '../components/SeranaIcons';

export default function NotFoundPage() {
  useEffect(() => {
    document.title = 'No encontrado · Serana';
  }, []);

  return (
    <div className="min-h-screen pt-24 bg-[#F9F7F2] flex flex-col">
      <Navbar />
      <CartDrawer />

      <main className="flex-1 flex items-center px-6 py-16 md:py-24 relative overflow-hidden">
        {/* Decorative drifting sprig */}
        <div aria-hidden className="absolute -top-10 -right-10 text-serana-olive/8 pointer-events-none">
          <Sprout className="w-72 h-72 md:w-[28rem] md:h-[28rem]" />
        </div>
        <div aria-hidden className="absolute -bottom-12 -left-10 text-serana-terracotta/8 pointer-events-none rotate-180">
          <Sprout className="w-56 h-56 md:w-80 md:h-80" />
        </div>

        <div className="max-w-2xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="inline-flex items-center gap-3 text-serana-terracotta font-bold tracking-[0.4em] uppercase text-[10px] mb-6">
              <span className="w-10 h-px bg-serana-terracotta" />
              Página no encontrada
              <span className="w-10 h-px bg-serana-terracotta" />
            </span>

            <h1 className="font-serif text-7xl md:text-9xl text-serana-forest leading-none tracking-tight mb-2">
              4<span className="italic text-serana-olive">0</span>4
            </h1>

            <p className="font-serif italic text-xl md:text-2xl text-serana-forest/75 mt-6 leading-snug">
              Esta página se fue de la cocina.
            </p>

            <p className="text-serana-forest/60 text-base font-light leading-relaxed max-w-md mx-auto mt-4">
              Tal vez el enlace está mal escrito o la receta cambió de nombre. Te llevamos de vuelta
              al menú principal o a explorar lo que tenemos hoy.
            </p>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
              <Link
                to="/"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-serana-forest text-serana-cream text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-serana-olive transition group"
              >
                <Home className="w-3.5 h-3.5" />
                Ir al inicio
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white border border-serana-forest/15 text-serana-forest text-[10px] font-bold uppercase tracking-[0.3em] hover:border-serana-olive hover:text-serana-olive transition"
              >
                <Search className="w-3.5 h-3.5" />
                Ver el menú
              </Link>
            </div>

            <div className="mt-12 inline-flex items-center gap-2 text-serana-forest/40">
              <SerenaMark className="w-5 h-5 text-serana-ochre" />
              <span className="text-[10px] font-bold uppercase tracking-[0.3em]">
                Serana · Hecho en Bogotá
              </span>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
