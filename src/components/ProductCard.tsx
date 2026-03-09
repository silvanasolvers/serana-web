import React from 'react';
import { motion } from 'motion/react';
import { useCartStore } from '../store/useCartStore';
import { Plus } from 'lucide-react';
import { Product } from '../store/useCartStore';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const addItem = useCartStore((state) => state.addItem);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group relative"
    >
      <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-white shadow-sm transition-all duration-500 hover:shadow-2xl">
        <img
          src={product.image}
          alt={product.name}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        
        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-serana-forest/80 opacity-0 group-hover:opacity-100 transition-all duration-500 backdrop-blur-[2px] flex flex-col items-center justify-center p-6">
          <div className="text-center transform translate-y-8 group-hover:translate-y-0 transition-transform duration-500 delay-100">
            <p className="text-serana-cream font-serif italic mb-6 text-2xl">Beneficios del Ritual</p>
            <ul className="space-y-3 mb-8">
              {product.benefits.map((benefit, index) => (
                <li key={index} className="text-white text-xs font-bold tracking-[0.2em] uppercase border-b border-white/20 pb-1 inline-block mx-2">
                  {benefit}
                </li>
              ))}
            </ul>
            
            <button
              onClick={() => addItem(product)}
              className="bg-serana-ochre text-serana-forest px-8 py-3 rounded-full font-bold hover:bg-white transition-all shadow-lg hover:scale-105 flex items-center gap-2 mx-auto uppercase tracking-widest text-xs"
            >
              <Plus size={16} /> Agregar al Carrito
            </button>
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-between items-start">
        <div>
          <h3 className="font-serif text-2xl text-serana-forest group-hover:text-serana-olive transition-colors duration-300">
            {product.name}
          </h3>
          <p className="text-xs text-serana-forest/60 mt-1 uppercase tracking-wider font-medium">{product.category}</p>
        </div>
        <span className="font-bold text-serana-terracotta font-serif text-xl">
          {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(product.price)}
        </span>
      </div>
    </motion.div>
  );
}

export default ProductCard;
