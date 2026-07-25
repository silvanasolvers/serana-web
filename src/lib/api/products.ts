import { supabase, isSupabaseConfigured } from '../supabase';
import type { ComboDefinition, Product } from '../../store/useCartStore';
import {
  CATALOG_IMAGE_MANIFEST_URL,
  type CatalogImageManifest,
  type CatalogImageManifestEntry,
} from '../images';

type ProductRow = {
  id: string;
  slug: string | null;
  name: string;
  description: string | null;
  price: number | string | null;
  image_url: string | null;
  gallery_urls: string[] | null;
  active: boolean;
  category_code: string | null;
  category_name: string | null;
  benefits: string[] | null;
  health_benefit: string | null;
  observation: string | null;
  portions: string | null;
  public_ingredients: string[] | null;
  option_groups: Record<string, string[]> | null;
  combo_configuration: ComboDefinition | null;
};

type CheckoutPriceRow = {
  product_slug: string;
  variant_label: string | null;
  price: number | string;
  is_default: boolean;
  sort_order: number;
};

type CheckoutPriceProfile = {
  defaultPrice?: number;
  variants: Array<{ label: string; price: number }>;
};

function arraysEqual(left: string[], right: string[]) {
  return left.length === right.length && left.every((value, index) => value === right[index]);
}

function getCurrentImageEntry(row: ProductRow, manifest: CatalogImageManifest | null) {
  const id = row.slug ?? row.id;
  const entry: CatalogImageManifestEntry | undefined = manifest?.products[id];
  if (!entry || !row.image_url || entry.source !== row.image_url) return null;
  return entry;
}

async function loadImageManifest(): Promise<CatalogImageManifest | null> {
  try {
    const response = await fetch(CATALOG_IMAGE_MANIFEST_URL);
    if (!response.ok) return null;
    const manifest = (await response.json()) as CatalogImageManifest;
    return manifest?.version === 1 && manifest.products ? manifest : null;
  } catch {
    return null;
  }
}

function rowToProduct(
  row: ProductRow,
  manifest: CatalogImageManifest | null,
  checkoutPrice?: CheckoutPriceProfile,
): Product {
  // The cart store uses slug as id so cart entries survive when the UUID changes.
  // Falls back to UUID for catalogue rows that don't have a slug yet.
  const id = row.slug ?? row.id;
  const imageEntry = getCurrentImageEntry(row, manifest);
  const databaseGallery = row.gallery_urls ?? [];
  const optimizedGallery = imageEntry && arraysEqual(imageEntry.gallerySources, databaseGallery)
    ? imageEntry.gallery
    : databaseGallery;

  return {
    id,
    name: row.name,
    price: Number(checkoutPrice?.defaultPrice ?? row.price ?? 0),
    description: row.description ?? '',
    image: imageEntry?.desktop ?? row.image_url ?? '',
    gallery: optimizedGallery,
    category: row.category_code ?? 'otros',
    benefits: row.benefits ?? [],
    healthBenefit: row.health_benefit ?? undefined,
    observation: row.observation ?? undefined,
    portions: row.portions ?? undefined,
    ingredients: row.public_ingredients ?? [],
    variantes: row.option_groups ?? undefined,
    variants: checkoutPrice?.variants ?? [],
    comboConfiguration: row.combo_configuration ?? undefined,
  };
}

export async function listProducts(): Promise<Product[]> {
  if (!isSupabaseConfigured) return [];
  const [{ data, error }, { data: priceRows, error: priceError }, manifest] = await Promise.all([
    supabase
      .from('products_public_view')
      .select('id, slug, name, description, price, image_url, gallery_urls, active, category_code, category_name, benefits, health_benefit, observation, portions, public_ingredients, option_groups, combo_configuration')
      .eq('active', true)
      .order('name', { ascending: true }),
    supabase
      .from('product_checkout_prices_view')
      .select('product_slug, variant_label, price, is_default, sort_order')
      .order('sort_order', { ascending: true }),
    loadImageManifest(),
  ]);
  if (error) {
    console.warn('[serana-web] listProducts failed:', error.message);
    return [];
  }
  if (priceError) {
    console.warn('[serana-web] checkout prices unavailable; using catalog fallback:', priceError.message);
  }

  const pricesBySlug = new Map<string, CheckoutPriceProfile>();
  for (const raw of (priceRows ?? []) as CheckoutPriceRow[]) {
    const current = pricesBySlug.get(raw.product_slug) ?? { variants: [] };
    if (raw.is_default) current.defaultPrice = Number(raw.price);
    if (raw.variant_label) {
      current.variants.push({ label: raw.variant_label, price: Number(raw.price) });
    }
    pricesBySlug.set(raw.product_slug, current);
  }

  return (data ?? []).map((row) => {
    const product = row as ProductRow;
    return rowToProduct(product, manifest, product.slug ? pricesBySlug.get(product.slug) : undefined);
  });
}
