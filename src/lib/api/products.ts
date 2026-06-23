import { supabase, isSupabaseConfigured } from '../supabase';
import type { Product } from '../../store/useCartStore';
import { products as staticProducts } from '../../data/products';

type ProductRow = {
  id: string;
  slug: string | null;
  name: string;
  description: string | null;
  price: number | string | null;
  image_url: string | null;
  active: boolean;
  category_code: string | null;
  category_name: string | null;
};

const FALLBACK_BENEFITS = ['Fresco', 'Natural', 'Sin conservantes'];
const STATIC_BY_ID = new Map(staticProducts.map((product) => [product.id, product]));

function normalizeUnitLabel(name: string) {
  return name
    .replace(/\s*\(Unidad\)/gi, ' (Libra)')
    .replace(/\s*\(3 unidades\)/gi, ' (Libra)');
}

function rowToProduct(row: ProductRow): Product {
  // The cart store uses slug as id so cart entries survive when the UUID changes.
  // Falls back to UUID for catalogue rows that don't have a slug yet.
  const id = row.slug ?? row.id;
  const staticMatch = STATIC_BY_ID.get(id);
  return {
    id,
    name: normalizeUnitLabel(row.name || staticMatch?.name || ''),
    price: Number(row.price ?? 0),
    description: row.description || staticMatch?.description || '',
    image: row.image_url || staticMatch?.image || '',
    category: row.category_code ?? staticMatch?.category ?? 'otros',
    benefits: staticMatch?.benefits ?? FALLBACK_BENEFITS,
  };
}

export async function listProducts(): Promise<Product[]> {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await supabase
    .from('products_public_view')
    .select('id, slug, name, description, price, image_url, active, category_code, category_name')
    .eq('active', true)
    .order('name', { ascending: true });
  if (error) {
    console.warn('[serana-web] listProducts failed:', error.message);
    return [];
  }
  return (data ?? []).map((row) => rowToProduct(row as ProductRow));
}
