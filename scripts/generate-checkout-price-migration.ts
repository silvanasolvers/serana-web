import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PRICE_LIST_PROFILES } from '../src/data/priceListProfiles';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outputPath = path.resolve(
  __dirname,
  '../supabase/migrations/20260722_003_storefront_checkout_prices.sql',
);

const quote = (value: string) => `'${value.replaceAll("'", "''")}'`;
const rows: string[] = [];

for (const [slug, profile] of Object.entries(PRICE_LIST_PROFILES)) {
  if (typeof profile.price === 'number' && Number.isFinite(profile.price)) {
    rows.push(`(${quote(slug)}, null, ${profile.price}, true, 0)`);
  }
  for (const [index, variant] of (profile.variants ?? []).entries()) {
    if (!variant.label || !Number.isFinite(variant.price)) continue;
    rows.push(`(${quote(slug)}, ${quote(variant.label)}, ${variant.price}, false, ${index + 1})`);
  }
}

const sql = `-- Generated from src/data/priceListProfiles.ts.
-- Run: npm run prices:generate
--
-- This snapshot moves storefront pricing authority into Supabase. Product
-- cards and checkout both read these rows; catalog.products.price remains the
-- inventory/base fallback only.

insert into catalog.product_checkout_prices (
  product_id, variant_label, price, is_default, sort_order, active, updated_at
)
select
  p.id,
  v.variant_label,
  v.price,
  v.is_default,
  v.sort_order,
  true,
  now()
from (values
  ${rows.join(',\n  ')}
) as v(product_slug, variant_label, price, is_default, sort_order)
join catalog.products p on p.slug = v.product_slug
on conflict (product_id, variant_key) do update
set price = excluded.price,
    is_default = excluded.is_default,
    sort_order = excluded.sort_order,
    active = true,
    updated_at = now();

select pg_notify('pgrst', 'reload schema');
`;

fs.writeFileSync(outputPath, sql);
console.log(`Wrote ${rows.length} checkout price rows to ${outputPath}`);
