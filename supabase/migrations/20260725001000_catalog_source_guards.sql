-- Permanent guards for the canonical catalog. These prevent future ERP edits
-- from reintroducing external images, malformed option/combo configuration,
-- or references to products/categories that are not available.

create or replace function catalog.is_canonical_product_gallery(urls text[])
returns boolean
language plpgsql
immutable
set search_path = catalog
as $$
declare
  url text;
begin
  foreach url in array coalesce(urls, '{}'::text[])
  loop
    if url is null
       or url not like 'https://tjjrnpwwfvmsukfrfchr.supabase.co/storage/v1/object/public/%' then
      return false;
    end if;
  end loop;
  return true;
end;
$$;

create or replace function catalog.is_valid_option_groups(configuration jsonb)
returns boolean
language sql
immutable
set search_path = catalog
as $$
  select configuration is null
    or (
      jsonb_typeof(configuration) = 'object'
      and not exists (
        select 1
        from jsonb_each(configuration) entry
        where jsonb_typeof(entry.value) <> 'array'
           or exists (
             select 1
             from jsonb_array_elements(entry.value) option_value
             where jsonb_typeof(option_value) <> 'string'
           )
      )
    );
$$;

create or replace function catalog.is_valid_combo_configuration(
  product_slug text,
  configuration jsonb
)
returns boolean
language sql
immutable
set search_path = catalog
as $$
  select configuration is null
    or (
      jsonb_typeof(configuration) = 'object'
      and configuration->>'slug' = product_slug
      and jsonb_typeof(configuration->'groups') = 'array'
      and jsonb_array_length(configuration->'groups') > 0
      and not exists (
        select 1
        from jsonb_array_elements(configuration->'groups') group_data
        where jsonb_typeof(group_data) <> 'object'
           or coalesce(group_data->>'id', '') = ''
           or coalesce(group_data->>'label', '') = ''
           or jsonb_typeof(group_data->'max') <> 'number'
           or (group_data->>'max')::numeric <= 0
           or jsonb_typeof(group_data->'source') <> 'object'
           or (
             group_data->'min' is not null
             and (
               jsonb_typeof(group_data->'min') <> 'number'
               or (group_data->>'min')::numeric < 0
               or (group_data->>'min')::numeric > (group_data->>'max')::numeric
             )
           )
           or (
             group_data->'source'->'categories' is not null
             and jsonb_typeof(group_data->'source'->'categories') <> 'array'
           )
           or (
             group_data->'source'->'slugs' is not null
             and jsonb_typeof(group_data->'source'->'slugs') <> 'array'
           )
           or (
             group_data->'source'->'excludeSlugs' is not null
             and jsonb_typeof(group_data->'source'->'excludeSlugs') <> 'array'
           )
      )
    );
$$;

alter table catalog.products
  drop constraint if exists products_canonical_media,
  drop constraint if exists products_option_groups_shape,
  drop constraint if exists products_combo_configuration_shape;

alter table catalog.products
  add constraint products_canonical_media check (
    not active
    or (
      image_url like 'https://tjjrnpwwfvmsukfrfchr.supabase.co/storage/v1/object/public/%'
      and catalog.is_canonical_product_gallery(gallery_urls)
    )
  ) not valid,
  add constraint products_option_groups_shape check (
    catalog.is_valid_option_groups(option_groups)
  ) not valid,
  add constraint products_combo_configuration_shape check (
    catalog.is_valid_combo_configuration(slug, combo_configuration)
  ) not valid;

alter table catalog.products
  validate constraint products_canonical_media;
alter table catalog.products
  validate constraint products_option_groups_shape;
alter table catalog.products
  validate constraint products_combo_configuration_shape;

create or replace function catalog.enforce_catalog_configuration_references()
returns trigger
language plpgsql
security definer
set search_path = catalog
as $$
begin
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
    raise exception 'An active combo references a missing or inactive product';
  end if;

  if exists (
    select 1
    from catalog.products combo
    cross join lateral jsonb_array_elements(combo.combo_configuration->'groups') group_data
    cross join lateral jsonb_array_elements_text(
      coalesce(group_data->'source'->'categories', '[]'::jsonb)
    ) referenced_category
    left join catalog.product_categories category
      on category.code = referenced_category
    where combo.active
      and combo.combo_configuration is not null
      and category.id is null
  ) then
    raise exception 'An active combo references a missing product category';
  end if;

  return null;
end;
$$;

drop trigger if exists canonical_configuration_references_on_product on catalog.products;
create constraint trigger canonical_configuration_references_on_product
after insert or update or delete on catalog.products
deferrable initially deferred
for each row execute function catalog.enforce_catalog_configuration_references();

drop trigger if exists canonical_configuration_references_on_category on catalog.product_categories;
create constraint trigger canonical_configuration_references_on_category
after insert or update or delete on catalog.product_categories
deferrable initially deferred
for each row execute function catalog.enforce_catalog_configuration_references();

revoke all on function catalog.is_canonical_product_gallery(text[]) from public;
revoke all on function catalog.is_valid_option_groups(jsonb) from public;
revoke all on function catalog.is_valid_combo_configuration(text, jsonb) from public;
revoke all on function catalog.enforce_catalog_configuration_references() from public;

select pg_notify('pgrst', 'reload schema');
