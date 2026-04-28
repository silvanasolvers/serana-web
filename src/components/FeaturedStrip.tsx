import { useRef } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { useCartStore, type Product } from '../store/useCartStore';
import { Spark } from './SeranaIcons';

const COP = (n: number) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);

/**
 * Horizontal "Recomendados de la casa" strip — used at the top of the menu
 * when no category filter is active so visitors land on something specific
 * instead of the full 143-product list.
 */
export default function FeaturedStrip({ products }: { products: Product[] }) {
  const scroller = useRef<HTMLDivElement>(null);
  const addItem = useCartStore((s) => s.addItem);

  if (products.length === 0) return null;

  const scrollBy = (dx: number) => {
    scroller.current?.scrollBy({ left: dx, behavior: 'smooth' });
  };

  return (
    <section className="mb-12">
      <div className="flex items-end justify-between gap-4 mb-6">
        <div>
          <span className="inline-flex items-center gap-3 text-serana-terracotta font-bold tracking-[0.4em] uppercase text-[10px] mb-3">
            <Spark className="w-3 h-3" />
            Recomendados de la casa
          </span>
          <h3 className="font-serif text-serana-forest text-2xl md:text-3xl leading-tight tracking-tight">
            Lo que más <span className="italic text-serana-olive">pedimos esta semana</span>
          </h3>
        </div>
        <div className="hidden sm:flex items-center gap-2">
          <button
            type="button"
            onClick={() => scrollBy(-360)}
            className="w-10 h-10 rounded-full border border-serana-forest/15 bg-white/70 hover:bg-white text-serana-forest flex items-center justify-center transition"
            aria-label="Anterior"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => scrollBy(360)}
            className="w-10 h-10 rounded-full border border-serana-forest/15 bg-white/70 hover:bg-white text-serana-forest flex items-center justify-center transition"
            aria-label="Siguiente"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div
        ref={scroller}
        className="-mx-6 px-6 flex gap-4 overflow-x-auto snap-x snap-mandatory scroll-touch pb-4"
        style={{ scrollbarWidth: 'none' as const }}
      >
        {products.map((product, i) => (
          <motion.article
            key={product.id}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.4, delay: i * 0.04 }}
            className="snap-start shrink-0 w-[260px] sm:w-[280px] relative rounded-[1.5rem] overflow-hidden bg-white border border-serana-forest/8 shadow-[0_15px_40px_-25px_rgba(39,54,23,0.25)]"
          >
            <div className="relative aspect-[4/5] overflow-hidden">
              <img
                src={product.image}
                alt={product.name}
                referrerPolicy="no-referrer"
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
              />
              <span className="absolute top-3 left-3 px-2 py-0.5 bg-serana-cream/90 rounded text-[9px] font-black uppercase tracking-widest text-serana-forest">
                {product.category}
              </span>
              <span className="absolute top-3 right-3 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-serana-terracotta text-white text-[9px] font-black uppercase tracking-widest">
                <Spark className="w-2.5 h-2.5" />
                Top
              </span>
            </div>
            <div className="p-4 flex items-end justify-between gap-3">
              <div className="min-w-0">
                <h4 className="font-serif text-lg text-serana-forest leading-tight tracking-tight line-clamp-2">
                  {product.name}
                </h4>
                <p className="mt-1 font-bold text-serana-terracotta">{COP(product.price)}</p>
              </div>
              <button
                type="button"
                onClick={() => addItem(product)}
                className="shrink-0 w-9 h-9 rounded-full bg-serana-forest text-serana-cream flex items-center justify-center hover:bg-serana-olive transition-colors active:scale-90"
                aria-label={`Agregar ${product.name}`}
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </motion.article>
        ))}
      </div>
    </section>
  );
}
