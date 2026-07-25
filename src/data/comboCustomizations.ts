import type {
  ComboDefinition,
  ComboGroupDefinition,
  ComboSelectionPayload,
  Product,
} from '../store/useCartStore';

export const COMBO_PAYLOAD_MARKER = '::serana_combo_payload::';

export type ResolvedComboOption = {
  slug: string;
  name: string;
  image: string;
  description: string;
  category: string;
  maxQuantity: number;
};

export type ResolvedComboGroup = ComboGroupDefinition & {
  options: ResolvedComboOption[];
  min: number;
  maxPerOption: number;
};

export function getComboDefinition(
  product: Pick<Product, 'id' | 'productSlug' | 'comboConfiguration'>,
) {
  return product.comboConfiguration ?? null;
}

export function resolveComboGroups(definition: ComboDefinition, products: Product[]): ResolvedComboGroup[] {
  const bySlug = new Map(products.map((product) => [product.id, product]));

  return definition.groups.map((group) => {
    const optionMap = new Map<string, Product>();

    for (const category of group.source.categories ?? []) {
      for (const product of products) {
        if (product.category === category) optionMap.set(product.id, product);
      }
    }

    for (const slug of group.source.slugs ?? []) {
      const product = bySlug.get(slug);
      if (product) optionMap.set(product.id, product);
    }

    for (const excluded of group.source.excludeSlugs ?? []) {
      optionMap.delete(excluded);
    }

    const slugOrder = new Map((group.source.slugs ?? []).map((slug, index) => [slug, index]));
    const options = Array.from(optionMap.values())
      .sort((a, b) => {
        const aOrder = slugOrder.get(a.id);
        const bOrder = slugOrder.get(b.id);
        if (aOrder !== undefined || bOrder !== undefined) {
          return (aOrder ?? 9999) - (bOrder ?? 9999);
        }
        return a.name.localeCompare(b.name, 'es');
      })
      .map((product) => ({
        slug: product.id,
        name: formatComboOptionName(group, product.name),
        image: product.image,
        description: product.description,
        category: product.category,
        maxQuantity: group.perOptionMax?.[product.id] ?? group.maxPerOption ?? group.max,
      }));

    return {
      ...group,
      min: group.min ?? group.max,
      maxPerOption: group.maxPerOption ?? group.max,
      options,
    };
  });
}

function formatComboOptionName(group: ComboGroupDefinition, name: string) {
  if (group.id !== 'hand_fruits') return name;
  return name.replace(/\s*\([^)]*\)$/, ' (Unidad)');
}

export function buildComboCustomizationText(payload: ComboSelectionPayload) {
  const lines = getComboSummaryLines(payload);
  const json = JSON.stringify(payload);
  return [`Combo personalizado: ${payload.comboName}`, ...lines, `${COMBO_PAYLOAD_MARKER}${json}`].join('\n');
}

export function getComboSummaryLines(payload: ComboSelectionPayload) {
  return payload.groups.map((group) => {
    const selected = group.selections
      .map((selection) => `${selection.quantity} x ${selection.name}`)
      .join(', ');
    return `${group.label}: ${selected}`;
  });
}

export function stripComboPayloadMarker(customizations?: string | null) {
  if (!customizations) return '';
  return customizations.split(COMBO_PAYLOAD_MARKER)[0].trim();
}

export function makeComboCartId(payload: ComboSelectionPayload) {
  const key = payload.groups
    .map((group) =>
      `${group.id}:${group.selections
        .map((selection) => `${selection.slug}x${selection.quantity}`)
        .sort()
        .join(',')}`,
    )
    .join('|');
  return `${payload.comboSlug}--combo-${hashString(key)}`;
}

function hashString(value: string) {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
}
