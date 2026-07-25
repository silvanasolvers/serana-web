-- Canonical catalog invariants. This file is read-only and may be run after
-- 20260724234000_canonical_catalog_source.sql.

do $test$
declare
  v_count integer;
begin
  select count(*) into v_count
  from catalog.products p
  left join catalog.product_checkout_prices cp
    on cp.product_id = p.id
   and cp.active
   and cp.is_default
  where p.active
  group by p.id
  having count(cp.id) <> 1
      or max(cp.price) is distinct from max(p.price)
      or max(cp.price) <= 0
  limit 1;

  if v_count is not null then
    raise exception 'An active product is missing one synchronized positive default price';
  end if;

  if exists (
    select 1
    from catalog.products
    where active
    group by lower(trim(name))
    having count(*) > 1
  ) then
    raise exception 'Duplicate normalized active product names remain';
  end if;

  if exists (
    select 1
    from catalog.product_checkout_prices
    where active and variant_label is not null
    group by product_id, lower(regexp_replace(trim(variant_label), '\s+', ' ', 'g'))
    having count(*) > 1
  ) then
    raise exception 'Duplicate normalized active variant labels remain';
  end if;

  if exists (
    select 1
    from catalog.products
    where active
      and (
        image_url is null
        or image_url not like 'https://tjjrnpwwfvmsukfrfchr.supabase.co/storage/v1/object/public/%'
      )
  ) then
    raise exception 'An active product still uses a missing or noncanonical primary image';
  end if;

  if exists (
    select 1
    from catalog.products p
    cross join lateral unnest(coalesce(p.gallery_urls, '{}'::text[])) gallery_url
    where p.active
      and gallery_url not like 'https://tjjrnpwwfvmsukfrfchr.supabase.co/storage/v1/object/public/%'
  ) then
    raise exception 'An active product still uses a noncanonical gallery image';
  end if;

  if (
    select count(*) from public.products_public_view
  ) <> (
    select count(*) from catalog.products where active
  ) then
    raise exception 'The public product view does not match the active catalog';
  end if;

  if (
    select count(*)
    from pg_constraint
    where conrelid = 'catalog.products'::regclass
      and convalidated
      and conname in (
        'products_canonical_media',
        'products_option_groups_shape',
        'products_combo_configuration_shape'
      )
  ) <> 3 then
    raise exception 'Permanent canonical catalog guards are missing';
  end if;
end;
$test$;

do $test$
declare
  v_actual numeric;
  v_expected record;
begin
  for v_expected in
    select *
    from (
      values
        ('apio-und-1-5-kg', 8900::numeric),
        ('auyama-sacata', 3900::numeric),
        ('cebolla-blanca', 3900::numeric),
        ('ceviche-mango', 15900::numeric),
        ('fresa', 21900::numeric),
        ('jengibre', 10900::numeric),
        ('mango-libra', 5500::numeric),
        ('mango-picado', 14900::numeric),
        ('remolacha-libra', 4900::numeric)
    ) expected(slug, price)
  loop
    select cp.price into v_actual
    from catalog.products p
    join catalog.product_checkout_prices cp
      on cp.product_id = p.id
     and cp.active
     and cp.is_default
    where p.slug = v_expected.slug;

    if v_actual is distinct from v_expected.price then
      raise exception 'Unexpected canonical price for %: expected %, got %',
        v_expected.slug, v_expected.price, v_actual;
    end if;
  end loop;
end;
$test$;

do $test$
begin
  if not exists (
    select 1
    from catalog.products
    where slug = 'jugo-naranja'
      and active
      and name = 'Jugo de naranja x6'
      and portions = '6'
  ) then
    raise exception 'Jugo de naranja was not normalized to x6';
  end if;

  if not exists (
    select 1 from catalog.products
    where slug = 'perejil-lavado-x-200-gr' and active
  ) or exists (
    select 1 from catalog.products
    where slug = 'perejil-x-200-gr' and active
  ) then
    raise exception 'The approved Perejil duplicate resolution was not applied';
  end if;

  if exists (
    select 1
    from catalog.product_recipes pr
    join catalog.products p on p.id = pr.product_id
    join catalog.ingredients i on i.id = pr.ingredient_id
    where p.slug = 'aguacate-papelillo'
      and lower(i.name) = 'aguacate hass'
  ) or not exists (
    select 1
    from catalog.product_recipes pr
    join catalog.products p on p.id = pr.product_id
    join catalog.ingredients i on i.id = pr.ingredient_id
    where p.slug = 'aguacate-papelillo'
      and lower(i.name) = 'aguacate papelillo'
  ) then
    raise exception 'Aguacate papelillo still has the wrong recipe ingredient';
  end if;

  if (
    select count(*)
    from catalog.product_recipes pr
    join catalog.products p on p.id = pr.product_id
    where p.slug = 'coco'
  ) < 6 or not exists (
    select 1
    from catalog.product_recipes pr
    join catalog.products p on p.id = pr.product_id
    join catalog.ingredients i on i.id = pr.ingredient_id
    where p.slug = 'coco'
      and lower(i.name) = 'coco'
      and pr.quantity = 0.5
      and pr.waste_factor = 0
  ) then
    raise exception 'Coco picado does not have the approved complete recipe';
  end if;
end;
$test$;

do $test$
begin
  if (
    select count(*)
    from catalog.products
    where active and combo_configuration is not null
  ) <> 11 then
    raise exception 'Expected 11 active products with canonical combo configuration';
  end if;

  if exists (
    select 1
    from catalog.products combo
    cross join lateral jsonb_array_elements(combo.combo_configuration->'groups') group_data
    cross join lateral jsonb_array_elements_text(
      coalesce(group_data->'source'->'slugs', '[]'::jsonb)
    ) referenced_slug
    left join catalog.products referenced
      on referenced.slug = referenced_slug
     and referenced.active
    where combo.active
      and combo.combo_configuration is not null
      and referenced.id is null
  ) then
    raise exception 'A combo references a missing or inactive explicit product slug';
  end if;

  if exists (
    select 1
    from catalog.products combo
    cross join lateral jsonb_array_elements(combo.combo_configuration->'groups') group_data
    cross join lateral jsonb_array_elements_text(
      coalesce(group_data->'source'->'categories', '[]'::jsonb)
    ) category_code
    left join catalog.product_categories category
      on category.code = category_code
    where combo.active
      and combo.combo_configuration is not null
      and category.id is null
  ) then
    raise exception 'A combo references a missing or inactive category';
  end if;
end;
$test$;
