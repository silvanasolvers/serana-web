import { motion, AnimatePresence } from 'motion/react';
import { Plus, Minus } from 'lucide-react';
import { useCartStore, type Product } from '../store/useCartStore';

type Variant = 'dark' | 'soft';

/**
 * Add-to-cart control that doubles as a stepper once the product is in the
 * cart. Closes the loop the user opened the moment they tapped the first
 * "+", so adding several of the same item never requires re-finding it.
 *
 * Variants:
 *  - "dark": forest button on light backgrounds (gallery cards, list rows).
 *  - "soft": neutral button on hero / overlay surfaces.
 */
export default function QuantityControl({
  product,
  variant = 'dark',
}: {
  product: Product;
  variant?: Variant;
}) {
  const items = useCartStore((s) => s.items);
  const addItem = useCartStore((s) => s.addItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);

  const inCart = items.find((i) => i.id === product.id);
  const qty = inCart?.quantity ?? 0;

  const stop = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
  };

  return (
    <div className="relative h-9 flex items-center" onClick={stop}>
      <AnimatePresence mode="wait" initial={false}>
        {qty === 0 ? (
          <motion.button
            key="add"
            type="button"
            onClick={(e) => {
              stop(e);
              addItem(product);
            }}
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.7 }}
            transition={{ type: 'spring', stiffness: 400, damping: 26 }}
            aria-label={`Agregar ${product.name}`}
            className={
              variant === 'dark'
                ? 'w-9 h-9 rounded-full bg-serana-forest text-serana-cream flex items-center justify-center hover:bg-serana-olive transition-colors active:scale-90'
                : 'w-9 h-9 rounded-full bg-serana-forest/10 text-serana-forest flex items-center justify-center hover:bg-serana-forest hover:text-serana-cream transition-colors active:scale-90'
            }
          >
            <Plus className="w-4 h-4" />
          </motion.button>
        ) : (
          <motion.div
            key="stepper"
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.85 }}
            transition={{ type: 'spring', stiffness: 380, damping: 28 }}
            className={
              variant === 'dark'
                ? 'flex items-center gap-1 bg-serana-forest text-serana-cream rounded-full px-1 py-1 shadow-sm'
                : 'flex items-center gap-1 bg-serana-forest/10 text-serana-forest rounded-full px-1 py-1'
            }
          >
            <button
              type="button"
              onClick={(e) => {
                stop(e);
                updateQuantity(product.id, qty - 1);
              }}
              aria-label={`Quitar uno de ${product.name}`}
              className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors active:scale-90"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="min-w-[1.25rem] text-center font-bold text-[13px] tabular-nums">{qty}</span>
            <button
              type="button"
              onClick={(e) => {
                stop(e);
                addItem(product);
              }}
              aria-label={`Agregar uno más de ${product.name}`}
              className={
                variant === 'dark'
                  ? 'w-7 h-7 rounded-full bg-serana-ochre text-serana-forest flex items-center justify-center hover:bg-white transition-colors active:scale-90'
                  : 'w-7 h-7 rounded-full bg-serana-forest text-serana-cream flex items-center justify-center hover:bg-serana-olive transition-colors active:scale-90'
              }
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
