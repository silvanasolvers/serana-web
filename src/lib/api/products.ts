import { supabase, isSupabaseConfigured } from '../supabase';
import type { Product } from '../../store/useCartStore';
import { products as staticProducts } from '../../data/products';
import { PRICE_LIST_PROFILES } from '../../data/priceListProfiles';
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

const FALLBACK_BENEFITS = ['Fresco', 'Natural', 'Sin conservantes'];
const STATIC_BY_ID = new Map(staticProducts.map((product) => [product.id, product]));

function normalizeUnitLabel(name: string) {
  return name
    .replace(/\s*\(Unidad\)/gi, ' (Libra)')
    .replace(/\s*\(3 unidades\)/gi, ' (Libra)');
}

function inferStorefrontCategory(row: ProductRow) {
  const code = row.category_code ?? 'otros';
  const text = `${row.slug ?? ''} ${row.name ?? ''} ${row.description ?? ''}`.toLowerCase();

  if (code === 'frutas') {
    return text.includes('picad') || text.includes('baby bowl') || text.includes('bowl')
      ? 'frutas-picadas'
      : 'mercado-fresco';
  }
  if (code === 'verduras') {
    return text.includes('picad') || text.includes('baby bowl') || text.includes('bowl')
      ? 'verduras-picadas'
      : 'mercado-fresco';
  }
  if (code === 'ensaladas') return 'ensaladas-tradicionales';
  if (code === 'bowls') return text.includes('frut') || text.includes('berry') ? 'frutas-picadas' : 'verduras-picadas';
  return code;
}

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
  const staticMatch = STATIC_BY_ID.get(id);
  const profile = PRICE_LIST_PROFILES[id];
  const hasProfile = Boolean(profile);
  const imageEntry = getCurrentImageEntry(row, manifest);
  const databaseGallery = row.gallery_urls ?? [];
  const optimizedGallery = imageEntry && arraysEqual(imageEntry.gallerySources, databaseGallery)
    ? imageEntry.gallery
    : databaseGallery;

  return {
    ...(staticMatch ?? {}),
    ...(profile ?? {}),
    id,
    name: profile?.name ?? normalizeUnitLabel(row.name || staticMatch?.name || ''),
    price: Number(checkoutPrice?.defaultPrice ?? profile?.price ?? row.price ?? staticMatch?.price ?? 0),
    description: profile?.description ?? row.description ?? staticMatch?.description ?? '',
    image: imageEntry?.desktop ?? row.image_url ?? '',
    gallery: optimizedGallery,
    category: profile?.category ?? inferStorefrontCategory(row) ?? staticMatch?.category ?? 'otros',
    benefits: profile?.benefits ?? staticMatch?.benefits ?? FALLBACK_BENEFITS,
    healthBenefit: profile?.healthBenefit ?? staticMatch?.healthBenefit,
    observation: profile?.observation ?? staticMatch?.observation,
    portions: profile?.portions ?? staticMatch?.portions,
    ingredients: profile?.ingredients ?? staticMatch?.ingredients,
    variants: checkoutPrice?.variants.length
      ? checkoutPrice.variants
      : hasProfile ? profile?.variants : staticMatch?.variants,
  };
}

export async function listProducts(): Promise<Product[]> {
  if (!isSupabaseConfigured) return [];
  const [{ data, error }, { data: priceRows, error: priceError }, manifest] = await Promise.all([
    supabase
      .from('products_public_view')
      .select('id, slug, name, description, price, image_url, gallery_urls, active, category_code, category_name')
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
