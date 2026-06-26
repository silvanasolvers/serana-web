import { useRef, useState } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, ChevronRight, Info } from 'lucide-react';
import { type Product } from '../store/useCartStore';
import { Spark } from './SeranaIcons';
import { ComboCartControl } from './ComboConfigurator';
import ProductInfoDialog from './ProductInfoDialog';

const COP = (n: number) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);

/**
 * Horizontal "Favoritos de la casa" strip — used at the top of the menu
 * when no category filter is active so visitors land on something specific
 * instead of the full 143-product list.
 */
export default function FeaturedStrip({ products, allProducts = products }: { products: Product[]; allProducts?: Product[] }) {
  const scroller = useRef<HTMLDivElement>(null);
  const [detailProduct, setDetailProduct] = useState<Product | null>(null);

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
            Favoritos de la casa
          </span>
          <h3 className="font-serif text-serana-forest text-2xl md:text-3xl leading-tight tracking-tight">
            Lo que más <span className="italic text-serana-olive">pedimos</span>
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
          <FeaturedCard
            key={product.id}
            product={product}
            allProducts={allProducts}
            index={i}
            onOpen={() => setDetailProduct(product)}
          />
        ))}
      </div>

      <ProductInfoDialog
        product={detailProduct}
        allProducts={allProducts}
        open={Boolean(detailProduct)}
        onClose={() => setDetailProduct(null)}
      />
    </section>
  );
}

function FeaturedCard({
  product,
  allProducts,
  index,
  onOpen,
}: {
  product: Product;
  allProducts: Product[];
  index: number;
  onOpen: () => void;
}) {
  const requiresDetailChoice = Boolean(product.variants?.length);

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.4, delay: index * 0.04 }}
      className="group relative flex w-[260px] shrink-0 snap-start flex-col overflow-hidden rounded-[1.5rem] border border-serana-forest/8 bg-white shadow-[0_15px_40px_-25px_rgba(39,54,23,0.25)] transition-all hover:-translate-y-0.5 hover:border-serana-olive/25 sm:w-[280px]"
    >
      <button type="button" onClick={onOpen} className="block text-left">
        <div className="relative aspect-[4/5] overflow-hidden">
          <img
            src={product.image}
            alt={product.name}
            referrerPolicy="no-referrer"
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <span className="absolute top-3 left-3 rounded bg-serana-cream/90 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest text-serana-forest">
            {product.category}
          </span>
          <span className="absolute top-3 right-3 inline-flex items-center gap-1 rounded-full bg-serana-terracotta px-2 py-0.5 text-[9px] font-black uppercase tracking-widest text-white">
            <Spark className="h-2.5 w-2.5" />
            Top
          </span>
          <span className="absolute bottom-3 right-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-serana-forest shadow-sm transition group-hover:bg-serana-forest group-hover:text-serana-cream">
            <Info className="h-4 w-4" />
          </span>
        </div>

        <div className="p-4 pb-2">
          <h4 className="font-serif text-lg leading-tight tracking-tight text-serana-forest">
            {product.name}
          </h4>
        </div>
      </button>

      <div className="mt-auto border-t border-serana-forest/8 p-4">
        <div className="mb-3 flex items-center justify-between gap-2">
          <p className="font-bold text-serana-terracotta">{COP(product.price)}</p>
          <button
            type="button"
            onClick={onOpen}
            className="inline-flex h-8 items-center gap-1.5 rounded-full bg-serana-forest/6 px-3 text-[9px] font-black uppercase tracking-[0.16em] text-serana-forest/68 transition hover:bg-serana-forest hover:text-serana-cream"
          >
            <Info className="h-3.5 w-3.5" />
            Detalle
          </button>
        </div>
        {requiresDetailChoice ? (
          <button
            type="button"
            onClick={onOpen}
            className="inline-flex h-9 w-full items-center justify-center rounded-full bg-serana-forest text-[10px] font-black uppercase tracking-[0.14em] text-serana-cream transition hover:bg-serana-olive"
          >
            Ver opciones
          </button>
        ) : (
          <ComboCartControl product={product} allProducts={allProducts} variant="dark" fullWidth />
        )}
      </div>
    </motion.article>
  );
}
