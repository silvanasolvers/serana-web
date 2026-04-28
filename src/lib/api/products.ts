import { supabase, isSupabaseConfigured } from '../supabase';
import type { Product } from '../../store/useCartStore';

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

function rowToProduct(row: ProductRow): Product {
  // The cart store uses slug as id so cart entries survive when the UUID changes.
  // Falls back to UUID for catalogue rows that don't have a slug yet.
  const id = row.slug ?? row.id;
  return {
    id,
    name: row.name,
    price: Number(row.price ?? 0),
    description: row.description ?? '',
    image: row.image_url ?? '',
    category: row.category_code ?? 'otros',
    benefits: FALLBACK_BENEFITS,
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
