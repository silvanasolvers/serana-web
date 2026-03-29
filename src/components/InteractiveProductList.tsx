import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, Plus, ShoppingBag } from 'lucide-react';
import { useCartStore, Product } from '../store/useCartStore';

interface InteractiveProductListProps {
  products: Product[];
}

export default function InteractiveProductList({ products }: InteractiveProductListProps) {
  const [hoveredProduct, setHoveredProduct] = useState<Product | null>(products[0] || null);
  const addItem = useCartStore((state) => state.addItem);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  if (products.length === 0) return null;

  return (
    <div className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 items-start min-h-[500px]">
      
      {/* Left: Product List */}
      <div className="flex flex-col space-y-2">
        {products.map((product) => (
          <motion.div
            key={product.id}
            onMouseEnter={() => setHoveredProduct(product)}
            className={`group relative p-4 rounded-xl cursor-pointer transition-all duration-300 border ${
              hoveredProduct?.id === product.id 
                ? 'bg-serana-forest text-serana-cream border-serana-forest shadow-lg scale-[1.01]' 
                : 'bg-white text-serana-forest border-serana-forest/10 hover:border-serana-olive/30 hover:bg-serana-cream/50'
            }`}
          >
            <div className="flex justify-between items-center relative z-10">
              <div className="flex items-center gap-3">
                <img 
                  src={product.image} 
                  alt={product.name}
                  className="w-10 h-10 rounded-full object-cover lg:hidden border border-serana-forest/10"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <h3 className={`text-lg font-serif font-bold mb-0.5 ${
                    hoveredProduct?.id === product.id ? 'text-serana-cream' : 'text-serana-forest'
                  }`}>
                    {product.name}
                  </h3>
                  <p className={`text-xs ${
                    hoveredProduct?.id === product.id ? 'text-serana-cream/70' : 'text-serana-forest/60'
                  }`}>
                    {product.category.charAt(0).toUpperCase() + product.category.slice(1)}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <span className={`font-mono font-bold text-sm ${
                  hoveredProduct?.id === product.id ? 'text-serana-ochre' : 'text-serana-terracotta'
                }`}>
                  {formatPrice(product.price)}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    addItem(product);
                  }}
                  className={`p-1.5 rounded-full transition-colors ${
                    hoveredProduct?.id === product.id 
                      ? 'bg-serana-cream text-serana-forest hover:bg-serana-olive hover:text-white' 
                      : 'bg-serana-forest/5 text-serana-forest hover:bg-serana-forest hover:text-white'
                  }`}
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Right: Preview Panel (Sticky) */}
      <div className="hidden lg:block sticky top-28 h-[500px] rounded-[2rem] overflow-hidden shadow-xl border border-serana-forest/10 bg-white">
        <AnimatePresence mode='wait'>
          {hoveredProduct && (
            <motion.div
              key={hoveredProduct.id}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="relative w-full h-full"
            >
              <img 
                src={hoveredProduct.image} 
                alt={hoveredProduct.name}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              
              {/* Overlay Content */}
              <div className="absolute inset-0 bg-gradient-to-t from-serana-forest/90 via-transparent to-transparent flex flex-col justify-end p-10">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="flex justify-between items-end mb-4">
                    <div>
                      <span className="text-serana-ochre font-bold tracking-[0.2em] uppercase text-[10px] mb-1 block">
                        {hoveredProduct.category}
                      </span>
                      <h2 className="text-3xl font-serif text-white mb-1">
                        {hoveredProduct.name}
                      </h2>
                    </div>
                    <span className="text-2xl font-mono text-serana-cream font-bold">
                      {formatPrice(hoveredProduct.price)}
                    </span>
                  </div>
                  
                  <p className="text-white/80 mb-6 text-sm font-light leading-relaxed max-w-md">
                    {hoveredProduct.description}
                  </p>
                  
                  <div className="flex gap-3">
                    <button
                      onClick={() => addItem(hoveredProduct)}
                      className="flex-1 bg-serana-ochre text-serana-forest py-3 rounded-xl font-bold hover:bg-white transition-colors flex items-center justify-center gap-2 text-sm"
                    >
                      <ShoppingBag size={18} />
                      Agregar al Carrito
                    </button>

                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
