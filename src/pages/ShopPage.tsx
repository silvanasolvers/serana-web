import React, { useState } from 'react';
import { products } from '../data/products';
import InteractiveProductList from '../components/InteractiveProductList';
import Navbar from '../components/Navbar';
import CartDrawer from '../components/CartDrawer';
import Footer from '../components/Footer';
import clsx from 'clsx';
import { motion } from 'motion/react';

type Category = 'all' | 'ensaladas' | 'salsas' | 'sopas' | 'bebidas' | 'frutas' | 'verduras' | 'combos';

export default function ShopPage() {
  const [activeCategory, setActiveCategory] = useState<Category>('all');

  const filteredProducts = activeCategory === 'all' 
    ? products 
    : products.filter(p => p.category === activeCategory);

  const categories = [
    { id: 'all', label: 'Todos' },
    { id: 'ensaladas', label: 'Ensaladas' },
    { id: 'salsas', label: 'Salsas' },
    { id: 'sopas', label: 'Sopas' },
    { id: 'bebidas', label: 'Bebidas' },
    { id: 'frutas', label: 'Frutas' },
    { id: 'verduras', label: 'Verduras' },
    { id: 'combos', label: 'Combos' },
  ];

  return (
    <div className="min-h-screen pt-24 bg-serana-cream/30">
      <Navbar />
      <CartDrawer />
      
      <div className="max-w-6xl mx-auto px-6 py-10 relative z-10">
        <div className="mb-12 text-center">
          <motion.span 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-serana-terracotta font-bold tracking-[0.3em] uppercase text-[10px] mb-3 block"
          >
            El Mercado
          </motion.span>
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-serif text-serana-forest mb-4"
          >
            Nutrición <span className="italic text-serana-olive">Curada</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-base text-serana-forest/70 max-w-lg mx-auto font-light leading-relaxed"
          >
            Selecciona tu categoría para encontrar el combustible perfecto para tu ritual diario.
          </motion.p>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap justify-center gap-3 mb-16 sticky top-20 z-40 bg-serana-cream/80 backdrop-blur-md py-3 rounded-full shadow-sm border border-white/20">
          {categories.map((cat, i) => (
            <motion.button
              key={cat.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + (i * 0.1) }}
              onClick={() => setActiveCategory(cat.id as Category)}
              className={clsx(
                'px-5 py-1.5 rounded-full text-[10px] font-bold tracking-[0.15em] uppercase transition-all duration-500 border',
                activeCategory === cat.id
                  ? 'bg-serana-forest text-serana-cream border-serana-forest shadow-lg scale-105'
                  : 'bg-transparent text-serana-forest border-transparent hover:border-serana-forest/20 hover:bg-serana-forest/5'
              )}
            >
              {cat.label}
            </motion.button>
          ))}
        </div>

        {/* Interactive Product List */}
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
      </div>
      
      <Footer />
    </div>
  );
}
