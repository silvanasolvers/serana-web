import { motion } from 'motion/react';
import { useProducts } from '../../lib/useProducts';

export default function EcommerceSection() {
  const { products } = useProducts();
  const featuredProducts = products.slice(0, 4);
  return (
    <div className="flex flex-col items-center justify-center w-full h-full px-4">
      <h2 className="mb-16 font-serif text-5xl italic text-serana-forest">La Colección</h2>
      
      <div className="grid w-full max-w-6xl grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
        {featuredProducts.map((product) => (
          <motion.div
            key={product.id}
            whileHover={{ y: -10 }}
            className="relative overflow-hidden bg-white shadow-lg cursor-pointer group rounded-xl aspect-[3/4]"
          >
            <div className="absolute inset-0 overflow-hidden">
              <img 
                src={product.image} 
                alt={product.name} 
                className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-110"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-6 transition-transform duration-300 translate-y-full bg-white/90 backdrop-blur-md group-hover:translate-y-0">
              <h3 className="font-serif text-xl font-bold text-serana-forest">{product.name}</h3>
              <p className="font-sans text-serana-terracotta">
                {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(product.price)}
              </p>
              <button className="w-full px-4 py-2 mt-4 text-white transition-colors rounded-full bg-serana-forest hover:bg-serana-olive">
                Añadir al carrito
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
