import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Check, Minus, Plus, SlidersHorizontal, X } from 'lucide-react';
import clsx from 'clsx';
import { useCartStore, type ComboSelectionPayload, type Product } from '../store/useCartStore';
import {
  buildComboCustomizationText,
  getComboDefinition,
  makeComboCartId,
  resolveComboGroups,
  type ResolvedComboGroup,
} from '../data/comboCustomizations';
import QuantityControl from './QuantityControl';

type Variant = 'dark' | 'soft';
type SelectionState = Record<string, Record<string, number>>;

const COP = (n: number) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);

export function ComboCartControl({
  product,
  allProducts,
  variant = 'dark',
}: {
  product: Product;
  allProducts: Product[];
  variant?: Variant;
}) {
  const definition = getComboDefinition(product);
  const [open, setOpen] = useState(false);
  const configuredCount = useCartStore((state) =>
    state.items.reduce((total, item) => {
      const slug = item.comboSelections?.comboSlug ?? item.productSlug;
      return slug === product.id ? total + item.quantity : total;
    }, 0),
  );

  if (!definition) return <QuantityControl product={product} variant={variant} />;

  const stop = (event: React.MouseEvent) => {
    event.stopPropagation();
    event.preventDefault();
  };

  return (
    <>
      <button
        type="button"
        onClick={(event) => {
          stop(event);
          setOpen(true);
        }}
        className={clsx(
          'relative inline-flex h-9 items-center justify-center gap-2 rounded-full px-3 text-[10px] font-black uppercase tracking-[0.18em] transition-colors active:scale-95',
          variant === 'dark'
            ? 'bg-serana-forest text-serana-cream hover:bg-serana-olive'
            : 'bg-serana-forest/10 text-serana-forest hover:bg-serana-forest hover:text-serana-cream',
        )}
        aria-label={`Personalizar ${product.name}`}
      >
        <SlidersHorizontal className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Personalizar</span>
        {configuredCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-serana-ochre px-1 text-[9px] font-black text-serana-forest">
            {configuredCount}
          </span>
        )}
      </button>

      <ComboConfigurator
        product={product}
        allProducts={allProducts}
        open={open}
        onClose={() => setOpen(false)}
      />
    </>
  );
}

function ComboConfigurator({
  product,
  allProducts,
  open,
  onClose,
}: {
  product: Product;
  allProducts: Product[];
  open: boolean;
  onClose: () => void;
}) {
  const definition = getComboDefinition(product);
  const groups = useMemo(
    () => (definition ? resolveComboGroups(definition, allProducts) : []),
    [allProducts, definition],
  );
  const addItem = useCartStore((state) => state.addItem);
  const [selections, setSelections] = useState<SelectionState>({});

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose, open]);

  useEffect(() => {
    if (open) setSelections({});
  }, [open, product.id]);

  if (!definition) return null;

  const selectedTotal = groups.reduce((total, group) => total + getGroupTotal(selections, group.id), 0);
  const requiredTotal = groups.reduce((total, group) => total + group.min, 0);
  const complete = groups.length > 0 && groups.every((group) => getGroupTotal(selections, group.id) >= group.min);

  const addConfiguredCombo = () => {
    if (!complete) return;
    const payload = buildSelectionPayload(product, groups, selections, definition.fixedItems);
    const cartId = makeComboCartId(payload);
    const customizations = buildComboCustomizationText(payload);

    addItem({
      ...product,
      id: cartId,
      productSlug: product.id,
      comboSelections: payload,
      customizations,
    });
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-[60] bg-black/30 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={`Personalizar ${product.name}`}
            className="fixed inset-x-0 bottom-0 z-[61] max-h-[94vh] overflow-hidden rounded-t-[1.5rem] bg-serana-cream shadow-2xl md:inset-x-auto md:left-1/2 md:top-1/2 md:bottom-auto md:w-[min(920px,calc(100vw-48px))] md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-[1.5rem]"
            initial={{ opacity: 0, y: 40, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.98 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="grid max-h-[94vh] grid-rows-[auto_1fr_auto]">
              <header className="border-b border-serana-forest/10 bg-white/70 px-5 py-4 md:px-6">
                <div className="flex items-start gap-4">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="h-16 w-16 shrink-0 rounded-2xl object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="mb-1 text-[10px] font-black uppercase tracking-[0.3em] text-serana-terracotta">
                      Combo semipersonalizado
                    </p>
                    <h2 className="font-serif text-2xl leading-tight text-serana-forest md:text-3xl">
                      {product.name}
                    </h2>
                    <p className="mt-1 text-sm font-bold text-serana-olive">{COP(product.price)}</p>
                  </div>
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-serana-forest/55 transition hover:bg-serana-forest/5 hover:text-serana-forest"
                    aria-label="Cerrar"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-serana-forest/10">
                  <div
                    className="h-full rounded-full bg-serana-olive transition-all duration-300"
                    style={{ width: `${requiredTotal ? Math.min((selectedTotal / requiredTotal) * 100, 100) : 0}%` }}
                  />
                </div>
              </header>

              <div className="overflow-y-auto px-5 py-5 md:px-6">
                <div className="grid gap-4 md:grid-cols-2">
                  {groups.map((group) => (
                    <ComboGroupCard
                      key={group.id}
                      group={group}
                      selections={selections[group.id] ?? {}}
                      onChange={(optionSlug, delta) =>
                        setSelections((current) => updateSelection(current, group, optionSlug, delta))
                      }
                    />
                  ))}
                </div>

                {definition.fixedItems?.length ? (
                  <section className="mt-5 rounded-2xl border border-serana-forest/10 bg-white/60 p-4">
                    <p className="mb-3 text-[10px] font-black uppercase tracking-[0.25em] text-serana-forest/50">
                      Incluido fijo
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {definition.fixedItems.map((item) => (
                        <span
                          key={item}
                          className="rounded-full bg-serana-olive/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-serana-forest/70"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </section>
                ) : null}
              </div>

              <footer className="border-t border-serana-forest/10 bg-white/80 px-5 py-4 md:px-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.25em] text-serana-forest/45">
                      Seleccionado
                    </p>
                    <p className="text-sm font-bold text-serana-forest">
                      {selectedTotal} de {requiredTotal}
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled={!complete}
                    onClick={addConfiguredCombo}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-serana-forest px-7 py-3.5 text-[11px] font-black uppercase tracking-[0.22em] text-serana-cream transition hover:bg-serana-olive disabled:cursor-not-allowed disabled:opacity-45"
                  >
                    <Check className="h-4 w-4" />
                    Agregar combo
                  </button>
                </div>
              </footer>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function ComboGroupCard({
  group,
  selections,
  onChange,
}: {
  group: ResolvedComboGroup;
  selections: Record<string, number>;
  onChange: (optionSlug: string, delta: number) => void;
}) {
  const total = Object.values(selections).reduce((sum, qty) => sum + qty, 0);
  const complete = total >= group.min;
  const unit = group.unitLabel ? ` ${group.unitLabel}` : '';

  return (
    <section className="rounded-2xl border border-serana-forest/10 bg-white/70 p-4">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h3 className="font-serif text-xl leading-tight text-serana-forest">{group.label}</h3>
          <p className="mt-1 text-[11px] font-medium text-serana-forest/52">{group.helper}</p>
        </div>
        <span
          className={clsx(
            'shrink-0 rounded-full px-2.5 py-1 text-[10px] font-black tabular-nums',
            complete ? 'bg-serana-olive text-white' : 'bg-serana-forest/8 text-serana-forest/58',
          )}
        >
          {total}/{group.max}
          {unit}
        </span>
      </div>

      <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
        {group.options.map((option) => {
          const quantity = selections[option.slug] ?? 0;
          const atGroupLimit = total >= group.max && quantity === 0;
          const atOptionLimit = quantity >= group.maxPerOption;
          return (
            <article
              key={option.slug}
              className={clsx(
                'grid grid-cols-[44px_1fr_auto] items-center gap-3 rounded-xl border px-2.5 py-2 transition-colors',
                quantity > 0
                  ? 'border-serana-olive/35 bg-serana-olive/8'
                  : 'border-serana-forest/8 bg-white/60',
              )}
            >
              <img
                src={option.image}
                alt={option.name}
                className="h-11 w-11 rounded-lg object-cover"
                loading="lazy"
                referrerPolicy="no-referrer"
              />
              <div className="min-w-0">
                <p className="truncate text-sm font-bold leading-tight text-serana-forest">{option.name}</p>
                <p className="mt-0.5 line-clamp-1 text-[10px] leading-snug text-serana-forest/48">
                  {option.description}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => onChange(option.slug, -1)}
                  disabled={quantity === 0}
                  className="flex h-7 w-7 items-center justify-center rounded-full bg-serana-forest/8 text-serana-forest transition hover:bg-serana-forest hover:text-serana-cream disabled:opacity-30"
                  aria-label={`Quitar ${option.name}`}
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span className="w-5 text-center text-sm font-black tabular-nums text-serana-forest">{quantity}</span>
                <button
                  type="button"
                  onClick={() => onChange(option.slug, 1)}
                  disabled={atGroupLimit || atOptionLimit}
                  className="flex h-7 w-7 items-center justify-center rounded-full bg-serana-forest text-serana-cream transition hover:bg-serana-olive disabled:opacity-30"
                  aria-label={`Agregar ${option.name}`}
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
            </article>
          );
        })}

        {group.options.length === 0 && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs font-medium text-amber-800">
            Sin opciones activas en el catalogo.
          </div>
        )}
      </div>
    </section>
  );
}

function getGroupTotal(selections: SelectionState, groupId: string) {
  return Object.values(selections[groupId] ?? {}).reduce((sum, qty) => sum + qty, 0);
}

function updateSelection(
  current: SelectionState,
  group: ResolvedComboGroup,
  optionSlug: string,
  delta: number,
): SelectionState {
  const groupSelections = current[group.id] ?? {};
  const currentQty = groupSelections[optionSlug] ?? 0;
  const groupTotal = Object.values(groupSelections).reduce((sum, qty) => sum + qty, 0);

  if (delta > 0 && groupTotal >= group.max) return current;
  if (delta > 0 && currentQty >= group.maxPerOption) return current;

  const nextQty = Math.max(0, currentQty + delta);
  const nextGroup = { ...groupSelections };
  if (nextQty === 0) delete nextGroup[optionSlug];
  else nextGroup[optionSlug] = nextQty;

  return {
    ...current,
    [group.id]: nextGroup,
  };
}

function buildSelectionPayload(
  product: Product,
  groups: ResolvedComboGroup[],
  selections: SelectionState,
  fixedItems?: string[],
): ComboSelectionPayload {
  const payloadGroups = groups.map((group) => {
    const selectedBySlug = selections[group.id] ?? {};
    const groupSelections = group.options
      .map((option) => ({
        slug: option.slug,
        name: option.name,
        quantity: selectedBySlug[option.slug] ?? 0,
      }))
      .filter((selection) => selection.quantity > 0);

    return {
      id: group.id,
      label: group.label,
      max: group.max,
      unitLabel: group.unitLabel,
      selections: groupSelections,
    };
  });

  const selectedProducts = payloadGroups.flatMap((group) =>
    group.selections.map((selection) => ({
      slug: selection.slug,
      name: selection.name,
      quantity: selection.quantity,
      groupId: group.id,
      groupLabel: group.label,
    })),
  );

  return {
    version: 1,
    type: 'combo_configuration',
    comboSlug: product.id,
    comboName: product.name,
    groups: payloadGroups,
    selectedProducts,
    fixedItems,
  };
}
