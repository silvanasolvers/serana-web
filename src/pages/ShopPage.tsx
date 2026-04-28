import React, { useState } from 'react';
import { useProducts } from '../lib/useProducts';
import InteractiveProductList from '../components/InteractiveProductList';
import Navbar from '../components/Navbar';
import CartDrawer from '../components/CartDrawer';
import Footer from '../components/Footer';
import clsx from 'clsx';
import { motion } from 'motion/react';
import { ArrowRight, Sparkles, Zap, Leaf, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCartStore } from '../store/useCartStore';

type Category = 'all' | 'ensaladas' | 'salsas' | 'sopas' | 'bebidas' | 'frutas' | 'verduras' | 'combos';

export default function ShopPage() {
  const [activeCategory, setActiveCategory] = useState<Category>('all');
  const { products } = useProducts();

  const filteredProducts = activeCategory === 'all'
    ? [...products].sort((a, b) => {
        // Combos first when showing "Todos"
        if (a.category === 'combos' && b.category !== 'combos') return -1;
        if (a.category !== 'combos' && b.category === 'combos') return 1;
        return 0;
      })
    : products.filter(p => p.category === activeCategory);

  const categories = [
    { id: 'all', label: 'Todos' },
    { id: 'ensaladas', label: 'Ensaladas' },
    { id: 'sopas', label: 'Sopas y cremas' },
    { id: 'bebidas', label: 'Bebidas y shots' },
    { id: 'salsas', label: 'Salsas y complementos' },
    { id: 'combos', label: 'Combos' },
    { id: 'frutas', label: 'Mercado fresco' },
    { id: 'verduras', label: 'Verduras' },
  ];

  const suggestions = [
    { icon: Leaf, label: 'Si buscas algo ligero', filter: 'ensaladas' as Category, color: 'text-serana-olive' },
    { icon: Zap, label: 'Si quieres más energía', filter: 'bebidas' as Category, color: 'text-serana-terracotta' },
    { icon: Sparkles, label: 'Si quieres algo práctico', filter: 'combos' as Category, color: 'text-serana-forest' },
    { icon: Heart, label: 'Favoritos de la casa', filter: 'all' as Category, color: 'text-serana-ochre' },
  ];

  return (
    <div className="min-h-screen pt-24 bg-serana-cream/30">
      <Navbar />
      <CartDrawer />
      
      <div className="max-w-6xl mx-auto px-6 relative z-10">

        {/* ═══ PANEL 1 — Encabezado + Categorías (Entiendo cómo navegar) ═══ */}
        <div className="py-14 text-center">
          <motion.span 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-serana-terracotta font-bold tracking-[0.3em] uppercase text-[10px] mb-4 block"
          >
            El Mercado Serana
          </motion.span>
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-serif text-serana-forest mb-5"
          >
            Elige tu forma de <span className="italic text-serana-olive">nutrirte</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-base text-serana-forest/70 max-w-lg mx-auto font-light leading-relaxed"
          >
            Explora por categorías y encuentra opciones frescas, conscientes y deliciosas para tu alimentación diaria.
          </motion.p>
        </div>

        {/* Categorías */}
        <div className="flex flex-nowrap md:flex-wrap justify-start md:justify-center gap-3 mb-16 sticky top-20 z-40 bg-serana-cream/80 backdrop-blur-md py-3 px-4 rounded-full shadow-sm border border-white/20 overflow-x-auto scrollbar-hide">
          {categories.map((cat, i) => (
            <motion.button
              key={cat.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + (i * 0.05) }}
              onClick={() => setActiveCategory(cat.id as Category)}
              className={clsx(
                'px-5 py-1.5 rounded-full text-[10px] font-bold tracking-[0.15em] uppercase transition-all duration-500 border whitespace-nowrap',
                activeCategory === cat.id
                  ? 'bg-serana-forest text-serana-cream border-serana-forest shadow-lg scale-105'
                  : 'bg-transparent text-serana-forest border-transparent hover:border-serana-forest/20 hover:bg-serana-forest/5'
              )}
            >
              {cat.label}
            </motion.button>
          ))}
        </div>

        {/* ═══ PANEL 2 — Exploración de productos (Se me antoja algo) ═══ */}
        <motion.div 
          layout
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <InteractiveProductList products={filteredProducts} />
        </motion.div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-24 text-serana-forest/60 font-serif text-xl italic">
            No se encontraron productos para esta categoría.
          </div>
        )}

        {/* ═══ PANEL 3 — Ayuda para elegir (Sé qué me conviene) ═══ */}
        <section className="py-16 md:py-20">
          <div className="text-center mb-10">
            <span className="inline-block text-serana-olive font-bold tracking-[0.2em] uppercase text-[10px] mb-3 border border-serana-olive/20 px-4 py-1.5 rounded-full">
              ¿No sabes por dónde empezar?
            </span>
            <h2 className="text-3xl md:text-4xl font-serif text-serana-forest">
              Te ayudamos a <span className="italic text-serana-ochre">elegir</span>
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {suggestions.map((sug, idx) => (
              <motion.button
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                onClick={() => {
                  setActiveCategory(sug.filter);
                  window.scrollTo({ top: 400, behavior: 'smooth' });
                }}
                className="group bg-white p-6 rounded-2xl border border-serana-forest/5 hover:border-serana-forest/20 hover:shadow-lg transition-all text-center"
              >
                <div className={clsx("mx-auto mb-3 p-3 rounded-xl bg-serana-cream w-fit", sug.color)}>
                  <sug.icon size={24} strokeWidth={1.5} />
                </div>
                <p className="font-serif text-sm text-serana-forest group-hover:text-serana-olive transition-colors">
                  {sug.label}
                </p>
              </motion.button>
            ))}
          </div>
        </section>

        {/* ═══ PANEL 4 — Complementos / Combos / Upsell (Quiero completar mi compra) ═══ */}
        <section className="py-16 md:py-20 border-t border-serana-forest/5">
          <div className="text-center mb-10">
            <span className="inline-block text-serana-terracotta font-bold tracking-[0.2em] uppercase text-[10px] mb-3 border border-serana-terracotta/20 px-4 py-1.5 rounded-full">
              Completa tu experiencia
            </span>
            <h2 className="text-3xl md:text-4xl font-serif text-serana-forest mb-3">
              Acompáñalo con <span className="italic text-serana-ochre">algo más</span>
            </h2>
            <p className="text-sm text-serana-forest/60 font-light max-w-md mx-auto">
              Combínalo con una salsa, agrégale una bebida funcional o arma tu ritual de bienestar completo.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: "Agrégale una bebida",
                desc: "Un shot funcional o jugo que potencia tu energía, digestión o enfoque.",
                action: "bebidas" as Category,
                emoji: "🍹"
              },
              {
                title: "Combínalo con una salsa",
                desc: "Pesto, hummus, chimichurri o cualquier vinagreta para elevar tu plato.",
                action: "salsas" as Category,
                emoji: "🫒"
              },
              {
                title: "Prueba un shot funcional",
                desc: "Metabólico, serenidad, concentración, muscular o piel perfecta. Tu cuerpo te lo agradece.",
                action: "bebidas" as Category,
                emoji: "⚡"
              },
              {
                title: "Completa tu elección",
                desc: "Acompaña tu ensalada con una crema o sopa para una comida completa.",
                action: "sopas" as Category,
                emoji: "🍲"
              },
              {
                title: "Arma tu ritual",
                desc: "Ensalada + bebida + salsa + shot. Crea tu combinación perfecta de bienestar.",
                action: "combos" as Category,
                emoji: "✨"
              },
              {
                title: "Acompáñalo con frutas frescas",
                desc: "Completa tu pedido con frutas de temporada seleccionadas para ti.",
                action: "frutas" as Category,
                emoji: "🍓"
              }
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                onClick={() => {
                  setActiveCategory(item.action);
                  window.scrollTo({ top: 400, behavior: 'smooth' });
                }}
                className="group bg-white p-6 rounded-2xl border border-serana-forest/5 hover:border-serana-olive/30 hover:shadow-lg transition-all cursor-pointer"
              >
                <span className="text-3xl mb-3 block">{item.emoji}</span>
                <h3 className="font-serif text-lg text-serana-forest mb-2 group-hover:text-serana-olive transition-colors">{item.title}</h3>
                <p className="text-xs text-serana-forest/60 font-light leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ═══ PANEL 5 — Cierre / Rutina / Recurrencia (Actúo) ═══ */}
        <section className="py-16 md:py-20 mb-10">
          <div className="bg-serana-forest rounded-[2rem] p-8 md:p-14 text-center relative overflow-hidden">
            <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-15">
              <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-serana-olive rounded-full blur-[100px]" />
              <div className="absolute bottom-[-20%] right-[-10%] w-[40%] h-[40%] bg-serana-ochre rounded-full blur-[80px]" />
            </div>

            <div className="relative z-10">
              <span className="inline-block text-serana-ochre font-bold tracking-[0.2em] uppercase text-[10px] mb-4 border border-serana-ochre/20 px-4 py-1.5 rounded-full">
                Haz de Serana tu rutina
              </span>
              <h2 className="text-3xl md:text-4xl font-serif text-serana-cream mb-4">
                Nutrirse bien no tiene que ser <span className="italic text-serana-ochre">complicado</span>
              </h2>
              <p className="text-base text-serana-cream/70 font-light max-w-lg mx-auto mb-8 leading-relaxed">
                Arma tu pedido semanal, activa tu suscripción o simplemente elige lo que te provoca hoy. Tú decides el ritmo.
              </p>

              {/* Opciones de rutina */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto mb-10">
                {[
                  { emoji: "📦", title: "Pedido semanal", desc: "Recibe tu selección cada semana" },
                  { emoji: "🔄", title: "Compra recurrente", desc: "Automatiza tus favoritos" },
                  { emoji: "⭐", title: "Club Serana", desc: "Acumula semillas y gana premios" },
                ].map((opt, idx) => (
                  <div key={idx} className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-xl p-4 text-center">
                    <span className="text-2xl block mb-2">{opt.emoji}</span>
                    <h4 className="font-serif text-sm text-serana-cream mb-1">{opt.title}</h4>
                    <p className="text-[10px] text-serana-cream/60 font-light">{opt.desc}</p>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => {
                    setActiveCategory('all');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-serana-ochre text-serana-forest rounded-full transition-all hover:shadow-xl hover:-translate-y-0.5 font-sans font-bold tracking-widest text-[11px] uppercase"
                >
                  Explorar todo el menú
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </button>
                <Link
                  to="/"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-serana-cream/30 text-serana-cream rounded-full font-sans font-medium tracking-widest text-[11px] uppercase hover:bg-serana-cream/10 transition-all"
                >
                  Volver al inicio
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
      
      <Footer />
    </div>
  );
}
