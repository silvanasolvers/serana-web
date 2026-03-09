import { useCartStore } from '../store/useCartStore';
import { X, Plus, Minus, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';

export default function CartDrawer() {
  const { isOpen, items, toggleCart, removeItem, updateQuantity, total } = useCartStore();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggleCart}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-serana-cream shadow-2xl z-50 flex flex-col border-l border-serana-olive/10"
          >
            <div className="p-6 flex items-center justify-between border-b border-serana-forest/5">
              <h2 className="text-2xl font-serif text-serana-forest">Tu Selección</h2>
              <button onClick={toggleCart} className="p-2 hover:bg-serana-forest/5 rounded-full transition-colors">
                <X size={24} className="text-serana-forest" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-50">
                  <ShoppingBagIcon />
                  <p className="text-lg font-medium">Tu carrito está vacío</p>
                  <p className="text-sm">Empieza tu ritual de bienestar añadiendo productos.</p>
                </div>
              ) : (
                items.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-serana-forest/5">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="font-serif text-serana-forest leading-tight">{item.name}</h3>
                        <p className="text-sm text-serana-olive font-medium mt-1">
                          {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(item.price)}
                        </p>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center space-x-3 bg-white/50 rounded-full px-2 py-1 border border-serana-forest/10">
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-1 hover:text-serana-terracotta transition-colors"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="text-sm font-medium w-4 text-center">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-1 hover:text-serana-terracotta transition-colors"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                        <button 
                          onClick={() => removeItem(item.id)}
                          className="text-serana-forest/40 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {items.length > 0 && (
              <div className="p-6 border-t border-serana-forest/5 bg-white/30">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-serana-forest/60">Subtotal</span>
                  <span className="text-xl font-serif font-bold text-serana-forest">
                    {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(total())}
                  </span>
                </div>
                <Link 
                  to="/checkout"
                  onClick={toggleCart}
                  className="block w-full text-center bg-serana-forest text-serana-cream py-4 rounded-xl font-medium tracking-wide hover:bg-serana-olive transition-colors shadow-lg shadow-serana-forest/20"
                >
                  Proceder al Pago
                </Link>
                <p className="text-center text-xs text-serana-forest/40 mt-4">
                  Envío calculado en el siguiente paso.
                </p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function ShoppingBagIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
      <line x1="3" y1="6" x2="21" y2="6"></line>
      <path d="M16 10a4 4 0 0 1-8 0"></path>
    </svg>
  );
}
