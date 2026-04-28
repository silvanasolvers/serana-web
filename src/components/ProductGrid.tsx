import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, LayoutGrid, List as ListIcon } from 'lucide-react';
import { type Product } from '../store/useCartStore';
import { Spark } from './SeranaIcons';
import QuantityControl from './QuantityControl';

const COP = (n: number) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);

export type ProductGridViewMode = 'gallery' | 'list';

interface Props {
  products: Product[];
  /** Initial page size (number of cards before "Ver más"). */
  pageSize?: number;
  /** External search bar hides the built-in one when true. */
  externalSearch?: boolean;
  searchTerm?: string;
  onSearchChange?: (term: string) => void;
  viewMode?: ProductGridViewMode;
  onViewModeChange?: (mode: ProductGridViewMode) => void;
}

/**
 * Dynamic product browser:
 *   - Inline text search.
 *   - Toggle between a rich gallery grid and a compact list (good for the
 *     long ingredient categories like Verduras and Frutas).
 *   - Reveal-more pagination so the page never renders 100+ heavy cards
 *     up front.
 */
export default function ProductGrid({
  products,
  pageSize = 24,
  externalSearch = false,
  searchTerm,
  onSearchChange,
  viewMode,
  onViewModeChange,
}: Props) {
  const [internalSearch, setInternalSearch] = useState('');
  const [internalView, setInternalView] = useState<ProductGridViewMode>('gallery');
  const [visibleCount, setVisibleCount] = useState(pageSize);

  const search = externalSearch ? (searchTerm ?? '') : internalSearch;
  const view = viewMode ?? internalView;
  const setView = (v: ProductGridViewMode) => {
    if (onViewModeChange) onViewModeChange(v);
    else setInternalView(v);
  };
  const setSearch = (s: string) => {
    if (onSearchChange) onSearchChange(s);
    else setInternalSearch(s);
  };

  // Reset pagination whenever the source list or filters change.
  useEffect(() => {
    setVisibleCount(pageSize);
  }, [products, pageSize, search]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return products;
    return products.filter((p) => `${p.name} ${p.category}`.toLowerCase().includes(term));
  }, [products, search]);

  const visible = filtered.slice(0, visibleCount);
  const hasMore = filtered.length > visibleCount;

  return (
    <div className="space-y-8">
      {/* Toolbar — hidden when the parent owns search & view */}
      {!externalSearch && (
        <Toolbar
          search={search}
          onSearch={setSearch}
          view={view}
          onView={setView}
          totalCount={products.length}
          filteredCount={filtered.length}
        />
      )}

      <AnimatePresence mode="wait">
        {view === 'gallery' ? (
          <motion.div
            key="gallery"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
          >
            {visible.map((product, i) => (
              <GalleryCard key={product.id} product={product} index={i} />
            ))}
          </motion.div>
        ) : (
          <motion.ul
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-2"
          >
            {visible.map((product, i) => (
              <ListRow key={product.id} product={product} index={i} />
            ))}
          </motion.ul>
        )}
      </AnimatePresence>

      {filtered.length === 0 && (
        <div className="text-center py-24 text-serana-forest/60">
          <p className="font-serif text-2xl italic mb-2">Sin resultados</p>
          <p className="text-sm font-light">
            Probemos otra categoría o un término más amplio.
          </p>
        </div>
      )}

      {hasMore && (
        <div className="flex justify-center pt-2">
          <button
            type="button"
            onClick={() => setVisibleCount((v) => v + pageSize)}
            className="group inline-flex items-center gap-3 px-7 py-3 rounded-full border border-serana-forest/15 bg-white text-serana-forest hover:bg-serana-forest hover:text-serana-cream transition-colors text-[11px] font-bold tracking-[0.3em] uppercase"
          >
            Ver más
            <span className="text-serana-terracotta group-hover:text-serana-ochre">
              +{Math.min(pageSize, filtered.length - visibleCount)}
            </span>
          </button>
        </div>
      )}
    </div>
  );
}

function Toolbar({
  search,
  onSearch,
  view,
  onView,
  totalCount,
  filteredCount,
}: {
  search: string;
  onSearch: (s: string) => void;
  view: ProductGridViewMode;
  onView: (v: ProductGridViewMode) => void;
  totalCount: number;
  filteredCount: number;
}) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div className="relative flex-1 max-w-md">
        <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-serana-forest/40" />
        <input
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="Busca por nombre o categoría…"
          className="w-full pl-11 pr-4 py-3 rounded-full bg-white/70 border border-serana-forest/15 text-sm text-serana-forest placeholder-serana-forest/40 focus:bg-white focus:border-serana-forest/40 focus:outline-none transition"
        />
        {search && (
          <button
            type="button"
            onClick={() => onSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] uppercase tracking-widest font-bold text-serana-forest/50 hover:text-serana-forest"
          >
            limpiar
          </button>
        )}
      </div>

      <div className="flex items-center gap-3 self-stretch md:self-auto">
        <span className="text-[10px] uppercase tracking-[0.3em] text-serana-forest/50 font-bold">
          {filteredCount === totalCount
            ? `${totalCount} referencias`
            : `${filteredCount} / ${totalCount}`}
        </span>
        <div className="flex items-center bg-white/70 border border-serana-forest/15 rounded-full p-0.5">
          <ToolbarToggle active={view === 'gallery'} onClick={() => onView('gallery')} icon={LayoutGrid} label="Galería" />
          <ToolbarToggle active={view === 'list'} onClick={() => onView('list')} icon={ListIcon} label="Lista" />
        </div>
      </div>
    </div>
  );
}

function ToolbarToggle({
  active,
  onClick,
  icon: Icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: typeof LayoutGrid;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] uppercase tracking-[0.3em] font-bold transition-colors ${
        active ? 'text-serana-cream' : 'text-serana-forest/55 hover:text-serana-forest'
      }`}
    >
      {active && (
        <motion.span
          layoutId="grid-toolbar-pill"
          className="absolute inset-0 bg-serana-forest rounded-full -z-10"
          transition={{ type: 'spring', stiffness: 380, damping: 30 }}
        />
      )}
      <Icon className="w-3 h-3" />
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

function GalleryCard({ product, index }: { product: Product; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.45, delay: Math.min(index, 8) * 0.04, ease: [0.16, 1, 0.3, 1] }}
      className="group relative"
    >
      <div className="relative rounded-[1.4rem] overflow-hidden bg-white border border-serana-forest/8 shadow-[0_15px_40px_-25px_rgba(39,54,23,0.25)] hover:shadow-[0_25px_60px_-25px_rgba(39,54,23,0.35)] transition-shadow duration-500">
        <div className="relative aspect-[4/5] overflow-hidden">
          <img
            src={product.image}
            alt={product.name}
            referrerPolicy="no-referrer"
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute top-3 left-3">
            <span className="px-2 py-0.5 bg-serana-cream/90 rounded text-[9px] font-black uppercase tracking-widest text-serana-forest">
              {product.category}
            </span>
          </div>
          {product.isSubscription && (
            <div className="absolute top-3 right-3">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-serana-terracotta text-white text-[9px] font-black uppercase tracking-widest">
                <Spark className="w-2.5 h-2.5" /> Sub
              </span>
            </div>
          )}
        </div>

        <div className="p-4 flex items-end justify-between gap-3">
          <div className="min-w-0">
            <h3 className="font-serif text-lg text-serana-forest leading-tight tracking-tight line-clamp-2">
              {product.name}
            </h3>
            <p className="mt-1 font-bold text-serana-terracotta text-sm">{COP(product.price)}</p>
          </div>
          <QuantityControl product={product} variant="dark" />
        </div>
      </div>
    </motion.div>
  );
}

function ListRow({ product, index }: { product: Product; index: number }) {
  return (
    <motion.li
      initial={{ opacity: 0, x: -10 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.3, delay: Math.min(index, 8) * 0.02 }}
      className="group flex items-center gap-3 px-4 py-3 rounded-2xl bg-white border border-serana-forest/8 hover:border-serana-olive/30 hover:shadow transition-all"
    >
      <img
        src={product.image}
        alt={product.name}
        referrerPolicy="no-referrer"
        loading="lazy"
        className="w-12 h-12 rounded-xl object-cover shrink-0 border border-serana-forest/10"
      />
      <div className="flex-1 min-w-0">
        <p className="font-serif text-base text-serana-forest leading-tight truncate">{product.name}</p>
        <p className="text-[10px] uppercase tracking-widest font-bold text-serana-forest/50">{product.category}</p>
      </div>
      <span className="font-bold text-serana-terracotta tabular-nums whitespace-nowrap">{COP(product.price)}</span>
      <QuantityControl product={product} variant="soft" />
    </motion.li>
  );
}
