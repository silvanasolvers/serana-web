-- Serana web checkout v2
--
-- Separates a checkout/payment attempt from an operational sales order.
-- A Mercado Pago order is created only after an approved payment has been
-- verified by the server. Cash is operational after the explicit final click;
-- transfer orders remain outside KDS/ERP until payment is registered.

create extension if not exists pgcrypto;
create schema if not exists integration;

alter table sales.orders
  add column if not exists confirmed_at timestamptz;

-- Storefront prices are separate from inventory/base catalog prices. They are
-- authoritative for both the public product cards and checkout calculation,
-- including presentation/weight variants.
create table if not exists catalog.product_checkout_prices (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references catalog.products(id) on delete cascade,
  variant_label text,
  variant_key text generated always as (coalesce(variant_label, '')) stored,
  price numeric(12,2) not null check (price >= 0),
  is_default boolean not null default false,
  sort_order integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (product_id, variant_key)
);

alter table catalog.product_checkout_prices
  add column if not exists sort_order integer not null default 0;

create unique index if not exists uq_product_checkout_prices_default
  on catalog.product_checkout_prices (product_id)
  where is_default and active;

alter table catalog.product_checkout_prices enable row level security;
revoke all on catalog.product_checkout_prices from public, anon, authenticated;

create or replace view public.product_checkout_prices_view as
select
  p.id as product_id,
  p.slug as product_slug,
  cp.variant_label,
  cp.price,
  cp.is_default,
  cp.sort_order
from catalog.product_checkout_prices cp
join catalog.products p on p.id = cp.product_id
where cp.active = true and p.active = true;

grant select on public.product_checkout_prices_view to anon, authenticated;

create unique index if not exists uq_coupon_redemptions_order
  on sales.coupon_redemptions (order_id);

create table if not exists sales.checkout_sessions (
  id uuid primary key default gen_random_uuid(),
  checkout_key uuid not null unique,
  public_token uuid not null default gen_random_uuid() unique,
  status text not null default 'draft' check (status in (
    'draft',
    'payment_processing',
    'payment_pending',
    'payment_failed',
    'awaiting_transfer',
    'confirmed',
    'paid',
    'expired',
    'cancelled'
  )),
  payment_method text not null default 'mercado_pago' check (
    payment_method in ('mercado_pago', 'transferencia', 'efectivo')
  ),
  type text not null default 'domicilio',
  source_code text not null default 'web',
  customer_name text not null default '',
  customer_phone text not null default '',
  customer_email text,
  delivery_address text,
  notes text,
  station_code text,
  coupon_id uuid references sales.coupons(id),
  coupon_code text,
  subtotal numeric(12,2) not null default 0 check (subtotal >= 0),
  discount_amount numeric(12,2) not null default 0 check (discount_amount >= 0),
  delivery_fee numeric(12,2) not null default 0 check (delivery_fee >= 0),
  total_amount numeric(12,2) not null default 0 check (total_amount >= 0),
  payload_fingerprint text,
  preference_id text,
  order_id uuid unique references sales.orders(id) on delete set null,
  version bigint not null default 1,
  expires_at timestamptz not null default (now() + interval '30 minutes'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_checkout_sessions_status_expires
  on sales.checkout_sessions (status, expires_at);

create table if not exists sales.checkout_session_items (
  id uuid primary key default gen_random_uuid(),
  checkout_session_id uuid not null references sales.checkout_sessions(id) on delete cascade,
  product_id uuid not null references catalog.products(id),
  product_name text not null,
  variant_label text,
  quantity integer not null check (quantity > 0),
  unit_price numeric(12,2) not null check (unit_price >= 0),
  customizations text,
  line_total numeric(12,2) generated always as (quantity * unit_price) stored,
  created_at timestamptz not null default now()
);

alter table sales.checkout_session_items
  add column if not exists variant_label text;

create index if not exists idx_checkout_session_items_session
  on sales.checkout_session_items (checkout_session_id);

create table if not exists sales.coupon_reservations (
  id uuid primary key default gen_random_uuid(),
  checkout_session_id uuid not null unique references sales.checkout_sessions(id) on delete cascade,
  coupon_id uuid not null references sales.coupons(id) on delete cascade,
  discount_amount numeric(12,2) not null check (discount_amount >= 0),
  expires_at timestamptz not null,
  consumed_at timestamptz,
  released_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_coupon_reservations_active
  on sales.coupon_reservations (coupon_id, expires_at)
  where consumed_at is null and released_at is null;

create table if not exists sales.payment_attempts (
  id uuid primary key default gen_random_uuid(),
  checkout_session_id uuid not null references sales.checkout_sessions(id) on delete cascade,
  attempt_key uuid not null unique,
  provider text not null default 'mercado_pago',
  selected_method text,
  amount numeric(12,2) not null check (amount > 0),
  currency text not null default 'COP',
  status text not null default 'created' check (status in (
    'created', 'processing', 'pending', 'approved', 'rejected', 'cancelled', 'error'
  )),
  provider_payment_id text,
  status_detail text,
  provider_metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists uq_payment_attempts_provider_payment
  on sales.payment_attempts (provider, provider_payment_id)
  where provider_payment_id is not null;

create index if not exists idx_payment_attempts_checkout
  on sales.payment_attempts (checkout_session_id, created_at desc);

create table if not exists integration.erp_order_outbox (
  id uuid primary key default gen_random_uuid(),
  aggregate_id uuid not null references sales.orders(id) on delete cascade,
  event_type text not null,
  event_version integer not null default 1,
  idempotency_key text not null unique,
  payload jsonb not null default '{}'::jsonb,
  status text not null default 'pending' check (status in ('pending', 'processing', 'delivered', 'failed')),
  attempt_count integer not null default 0,
  available_at timestamptz not null default now(),
  delivered_at timestamptz,
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (aggregate_id, event_type, event_version)
);

create index if not exists idx_erp_order_outbox_pending
  on integration.erp_order_outbox (status, available_at)
  where status in ('pending', 'failed');

alter table sales.checkout_sessions enable row level security;
alter table sales.checkout_session_items enable row level security;
alter table sales.coupon_reservations enable row level security;
alter table sales.payment_attempts enable row level security;
alter table integration.erp_order_outbox enable row level security;

revoke all on sales.checkout_sessions from public, anon, authenticated;
revoke all on sales.checkout_session_items from public, anon, authenticated;
revoke all on sales.coupon_reservations from public, anon, authenticated;
revoke all on sales.payment_attempts from public, anon, authenticated;
revoke all on integration.erp_order_outbox from public, anon, authenticated;

create or replace function sales._checkout_result(p_session_id uuid)
returns jsonb
language sql
stable
security definer
set search_path = public, sales
as $$
  select jsonb_build_object(
    'checkout_id', s.id,
    'checkout_token', s.public_token,
    'status', s.status,
    'payment_method', s.payment_method,
    'subtotal', s.subtotal,
    'discount_amount', s.discount_amount,
    'delivery_fee', s.delivery_fee,
    'total_amount', s.total_amount,
    'coupon_code', s.coupon_code,
    'preference_id', s.preference_id,
    'version', s.version,
    'expires_at', s.expires_at,
    'order_id', s.order_id,
    'order_number', o.order_number,
    'order_status', o.status,
    'payment_status', o.payment_status,
    'items', coalesce((
      select jsonb_agg(jsonb_build_object(
        'product_id', i.product_id,
        'product_name', i.product_name,
        'variant_label', i.variant_label,
        'quantity', i.quantity,
        'unit_price', i.unit_price,
        'customizations', i.customizations
      ) order by i.created_at, i.id)
      from sales.checkout_session_items i
      where i.checkout_session_id = s.id
    ), '[]'::jsonb)
  )
  from sales.checkout_sessions s
  left join sales.orders o on o.id = s.order_id
  where s.id = p_session_id;
$$;

create or replace function public.upsert_checkout_session(
  p_checkout_key uuid,
  payload jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public, sales, catalog
as $$
declare
  v_session sales.checkout_sessions%rowtype;
  v_item jsonb;
  v_product catalog.products%rowtype;
  v_variant_label text;
  v_unit_price numeric(12,2);
  v_quantity integer;
  v_subtotal numeric(12,2) := 0;
  v_discount numeric(12,2) := 0;
  v_delivery_fee numeric(12,2) := 0;
  v_coupon sales.coupons%rowtype;
  v_coupon_code text;
  v_active_reservations integer := 0;
  v_fingerprint text;
  v_phone text;
  v_method text;
  v_type text;
  v_source text;
begin
  if p_checkout_key is null then
    raise exception 'checkout_key_required';
  end if;
  if payload is null or jsonb_typeof(payload) <> 'object' then
    raise exception 'checkout_payload_required';
  end if;
  if jsonb_typeof(payload->'items') is distinct from 'array'
     or jsonb_array_length(payload->'items') = 0 then
    raise exception 'checkout_items_required';
  end if;
  if jsonb_array_length(payload->'items') > 50 then
    raise exception 'checkout_items_limit';
  end if;

  v_phone := regexp_replace(coalesce(payload->>'customer_phone', ''), '[^0-9]', '', 'g');
  if length(v_phone) < 7 then
    raise exception 'customer_phone_required';
  end if;

  v_method := coalesce(nullif(payload->>'payment_method', ''), 'mercado_pago');
  if v_method not in ('mercado_pago', 'transferencia', 'efectivo') then
    raise exception 'unsupported_payment_method';
  end if;

  v_type := case when payload->>'type' in ('domicilio', 'recogida', 'mesa')
    then payload->>'type' else 'domicilio' end;
  v_source := case when payload->>'source_code' in ('web', 'whatsapp_bot', 'presencial', 'telefono')
    then payload->>'source_code' else 'web' end;
  v_delivery_fee := case when v_type = 'domicilio' then 12500 else 0 end;
  v_fingerprint := encode(extensions.digest(jsonb_build_object(
    'customer_phone', v_phone,
    'customer_name', trim(coalesce(payload->>'customer_name', '')),
    'customer_email', lower(trim(coalesce(payload->>'customer_email', ''))),
    'delivery_address', trim(coalesce(payload->>'delivery_address', '')),
    'payment_method', v_method,
    'type', v_type,
    'coupon_code', upper(trim(coalesce(payload->>'coupon_code', ''))),
    'items', payload->'items'
  )::text, 'sha256'), 'hex');

  insert into sales.checkout_sessions (checkout_key, customer_phone, payment_method, type, source_code)
  values (p_checkout_key, v_phone, v_method, v_type, v_source)
  on conflict (checkout_key) do nothing;

  select * into v_session
  from sales.checkout_sessions
  where checkout_key = p_checkout_key
  for update;

  if v_session.order_id is not null or v_session.status in ('confirmed', 'paid', 'awaiting_transfer') then
    if v_session.payload_fingerprint = v_fingerprint then
      return sales._checkout_result(v_session.id);
    end if;
    raise exception 'checkout_already_finalized';
  end if;

  if v_session.status in ('payment_processing', 'payment_pending') then
    if v_session.payload_fingerprint = v_fingerprint then
      return sales._checkout_result(v_session.id);
    end if;
    raise exception 'checkout_payment_in_progress';
  end if;

  delete from sales.checkout_session_items where checkout_session_id = v_session.id;

  for v_item in select * from jsonb_array_elements(payload->'items')
  loop
    select * into v_product
    from catalog.products
    where active = true
      and (
        (v_item->>'product_id' is not null and id = (v_item->>'product_id')::uuid)
        or (v_item->>'product_id' is null and slug = v_item->>'product_slug')
      )
    limit 1;

    if v_product.id is null then
      raise exception 'checkout_product_not_found: %', coalesce(v_item->>'product_slug', v_item->>'product_id');
    end if;

    v_variant_label := nullif(trim(v_item->>'variant_label'), '');
    v_unit_price := null;
    if v_variant_label is not null then
      select price into v_unit_price
      from catalog.product_checkout_prices
      where product_id = v_product.id
        and active = true
        and variant_label = v_variant_label
      limit 1;
      if v_unit_price is null then raise exception 'checkout_variant_not_found: %', v_variant_label; end if;
    else
      select price into v_unit_price
      from catalog.product_checkout_prices
      where product_id = v_product.id
        and active = true
        and is_default = true
      limit 1;
      v_unit_price := coalesce(v_unit_price, v_product.price);
    end if;

    v_quantity := greatest(coalesce((v_item->>'quantity')::integer, 1), 1);
    if v_quantity > 100 then
      raise exception 'checkout_item_quantity_limit';
    end if;

    insert into sales.checkout_session_items (
      checkout_session_id, product_id, product_name, variant_label, quantity, unit_price, customizations
    ) values (
      v_session.id, v_product.id, v_product.name, v_variant_label, v_quantity, v_unit_price,
      nullif(v_item->>'customizations', '')
    );
    v_subtotal := v_subtotal + (v_unit_price * v_quantity);
    v_product := null;
  end loop;

  v_coupon_code := nullif(upper(trim(payload->>'coupon_code')), '');
  if v_coupon_code is null then
    update sales.coupon_reservations
    set released_at = now(), updated_at = now()
    where checkout_session_id = v_session.id
      and consumed_at is null
      and released_at is null;
  else
    select * into v_coupon
    from sales.coupons
    where lower(code) = lower(v_coupon_code)
    for update;

    if v_coupon.id is null then raise exception 'coupon_invalid: not_found'; end if;
    if not v_coupon.active then raise exception 'coupon_invalid: inactive'; end if;
    if v_coupon.starts_at is not null and v_coupon.starts_at > now() then
      raise exception 'coupon_invalid: not_yet_active';
    end if;
    if v_coupon.expires_at is not null and v_coupon.expires_at <= now() then
      raise exception 'coupon_invalid: expired';
    end if;
    if v_subtotal < v_coupon.min_subtotal then
      raise exception 'coupon_invalid: min_subtotal';
    end if;

    select count(*) into v_active_reservations
    from sales.coupon_reservations r
    where r.coupon_id = v_coupon.id
      and r.checkout_session_id <> v_session.id
      and r.consumed_at is null
      and r.released_at is null
      and r.expires_at > now();

    if v_coupon.usage_limit is not null
       and v_coupon.used_count + v_active_reservations >= v_coupon.usage_limit then
      raise exception 'coupon_invalid: usage_limit';
    end if;

    v_discount := sales._coupon_discount_for(v_coupon, v_subtotal);
    insert into sales.coupon_reservations (
      checkout_session_id, coupon_id, discount_amount, expires_at
    ) values (
      v_session.id, v_coupon.id, v_discount, now() + interval '30 minutes'
    )
    on conflict (checkout_session_id) do update
    set coupon_id = excluded.coupon_id,
        discount_amount = excluded.discount_amount,
        expires_at = excluded.expires_at,
        consumed_at = null,
        released_at = null,
        updated_at = now();
  end if;

  -- The COP 50,000 minimum excludes delivery, matching the public terms.
  if greatest(v_subtotal - v_discount, 0) < 50000 then
    raise exception 'minimum_order_not_met';
  end if;

  update sales.checkout_sessions
  set status = 'draft',
      payment_method = v_method,
      type = v_type,
      source_code = v_source,
      customer_name = left(trim(coalesce(payload->>'customer_name', '')), 160),
      customer_phone = v_phone,
      customer_email = nullif(lower(left(trim(coalesce(payload->>'customer_email', '')), 320)), ''),
      delivery_address = nullif(left(trim(coalesce(payload->>'delivery_address', '')), 500), ''),
      notes = nullif(left(trim(coalesce(payload->>'notes', '')), 1000), ''),
      station_code = null,
      coupon_id = v_coupon.id,
      coupon_code = case when v_coupon.id is null then null else v_coupon.code end,
      subtotal = v_subtotal,
      discount_amount = v_discount,
      delivery_fee = v_delivery_fee,
      total_amount = greatest(v_subtotal - v_discount, 0) + v_delivery_fee,
      payload_fingerprint = v_fingerprint,
      preference_id = null,
      version = version + 1,
      expires_at = now() + interval '30 minutes',
      updated_at = now()
  where id = v_session.id;

  return sales._checkout_result(v_session.id);
end;
$$;

create or replace function public.get_checkout_context(p_checkout_token uuid)
returns jsonb
language sql
stable
security definer
set search_path = public, sales
as $$
  select sales._checkout_result(id)
  from sales.checkout_sessions
  where public_token = p_checkout_token;
$$;

create or replace function public.get_checkout_context_by_id(p_checkout_id uuid)
returns jsonb
language sql
stable
security definer
set search_path = public, sales
as $$
  select sales._checkout_result(id)
  from sales.checkout_sessions
  where id = p_checkout_id;
$$;

create or replace function public.store_checkout_preference(
  p_checkout_token uuid,
  p_preference_id text,
  p_expected_version bigint
)
returns jsonb
language plpgsql
security definer
set search_path = public, sales
as $$
declare v_session sales.checkout_sessions%rowtype;
begin
  select * into v_session from sales.checkout_sessions
  where public_token = p_checkout_token for update;
  if v_session.id is null then raise exception 'checkout_not_found'; end if;
  if v_session.version <> p_expected_version then raise exception 'checkout_version_changed'; end if;
  if v_session.status not in ('draft', 'payment_failed') then raise exception 'checkout_not_payable'; end if;
  update sales.checkout_sessions
  set preference_id = p_preference_id, updated_at = now()
  where id = v_session.id;
  return sales._checkout_result(v_session.id);
end;
$$;

create or replace function public.prepare_checkout_payment_attempt(
  p_checkout_token uuid,
  p_attempt_key uuid,
  p_selected_method text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public, sales
as $$
declare
  v_session sales.checkout_sessions%rowtype;
  v_attempt sales.payment_attempts%rowtype;
begin
  select * into v_session from sales.checkout_sessions
  where public_token = p_checkout_token for update;
  if v_session.id is null then raise exception 'checkout_not_found'; end if;
  if v_session.order_id is not null then return sales._checkout_result(v_session.id); end if;
  if v_session.payment_method <> 'mercado_pago' then raise exception 'checkout_not_mercado_pago'; end if;
  if v_session.expires_at <= now() then
    update sales.checkout_sessions set status = 'expired', updated_at = now() where id = v_session.id;
    raise exception 'checkout_expired';
  end if;

  -- The checkout row lock makes this a server-side mutex across tabs and
  -- devices. While an attempt is ambiguous/pending, a different client UUID
  -- is mapped back to the existing attempt rather than creating a new charge.
  if v_session.status in ('payment_processing', 'payment_pending') then
    select * into v_attempt
    from sales.payment_attempts
    where checkout_session_id = v_session.id
      and status in ('processing', 'pending')
    order by created_at desc
    limit 1;
  end if;

  if v_attempt.id is null then
    insert into sales.payment_attempts (
      checkout_session_id, attempt_key, selected_method, amount, status
    ) values (
      v_session.id, p_attempt_key, nullif(p_selected_method, ''), v_session.total_amount, 'processing'
    )
    on conflict (attempt_key) do nothing;
    select * into v_attempt from sales.payment_attempts where attempt_key = p_attempt_key;
  end if;

  if v_attempt.checkout_session_id <> v_session.id then raise exception 'attempt_checkout_mismatch'; end if;
  if v_attempt.amount <> v_session.total_amount then raise exception 'attempt_amount_mismatch'; end if;

  update sales.checkout_sessions
  set status = 'payment_processing', expires_at = now() + interval '48 hours', updated_at = now()
  where id = v_session.id;
  update sales.coupon_reservations
  set expires_at = now() + interval '48 hours', updated_at = now()
  where checkout_session_id = v_session.id
    and consumed_at is null and released_at is null;

  return sales._checkout_result(v_session.id) || jsonb_build_object(
    'attempt_id', v_attempt.id,
    'attempt_key', v_attempt.attempt_key,
    'attempt_status', v_attempt.status,
    'provider_payment_id', v_attempt.provider_payment_id,
    'status_detail', v_attempt.status_detail
  );
end;
$$;

create or replace function public.record_checkout_payment_attempt(
  p_checkout_id uuid,
  p_attempt_key uuid,
  p_provider_payment_id text,
  p_status text,
  p_status_detail text default null,
  p_provider_metadata jsonb default '{}'::jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public, sales
as $$
declare v_session sales.checkout_sessions%rowtype;
begin
  select * into v_session from sales.checkout_sessions where id = p_checkout_id for update;
  if v_session.id is null then raise exception 'checkout_not_found'; end if;

  update sales.payment_attempts
  set provider_payment_id = coalesce(nullif(p_provider_payment_id, ''), provider_payment_id),
      status = case
        when p_status = 'in_process' then 'pending'
        when p_status in ('approved', 'pending', 'rejected', 'cancelled') then p_status
        else 'error'
      end,
      status_detail = p_status_detail,
      provider_metadata = coalesce(p_provider_metadata, '{}'::jsonb),
      updated_at = now()
  where attempt_key = p_attempt_key and checkout_session_id = p_checkout_id;
  if not found then raise exception 'payment_attempt_not_found'; end if;

  update sales.checkout_sessions
  set status = case
        when p_status in ('pending', 'in_process') then 'payment_pending'
        when p_status in ('rejected', 'cancelled') then 'payment_failed'
        else status
      end,
      updated_at = now()
  where id = p_checkout_id;
  return sales._checkout_result(p_checkout_id);
end;
$$;

create or replace function sales._consume_checkout_coupon(
  p_checkout_id uuid,
  p_order_id uuid
)
returns void
language plpgsql
security definer
set search_path = sales
as $$
declare
  v_session sales.checkout_sessions%rowtype;
  v_reservation sales.coupon_reservations%rowtype;
begin
  select * into v_session from sales.checkout_sessions where id = p_checkout_id;
  if v_session.coupon_id is null then return; end if;

  select * into v_reservation
  from sales.coupon_reservations
  where checkout_session_id = p_checkout_id
    and coupon_id = v_session.coupon_id
  for update;
  if v_reservation.id is null or v_reservation.released_at is not null then
    raise exception 'coupon_reservation_missing';
  end if;
  if v_reservation.consumed_at is null then
    update sales.coupons
    set used_count = used_count + 1, updated_at = now()
    where id = v_session.coupon_id
      and (usage_limit is null or used_count < usage_limit);
    if not found then raise exception 'coupon_invalid: usage_limit'; end if;
    update sales.coupon_reservations
    set consumed_at = now(), updated_at = now()
    where id = v_reservation.id;
  end if;

  insert into sales.coupon_redemptions (coupon_id, order_id, code_snapshot, discount_amount)
  values (v_session.coupon_id, p_order_id, v_session.coupon_code, v_session.discount_amount)
  on conflict (order_id) do nothing;
end;
$$;

create or replace function sales._create_order_from_checkout(
  p_checkout_id uuid,
  p_order_status text,
  p_payment_status text,
  p_emit_erp_event boolean
)
returns uuid
language plpgsql
security definer
set search_path = public, sales, crm
as $$
declare
  v_session sales.checkout_sessions%rowtype;
  v_customer_id uuid;
  v_source_id uuid;
  v_order_id uuid;
  v_order_number bigint;
begin
  select * into v_session from sales.checkout_sessions where id = p_checkout_id for update;
  if v_session.id is null then raise exception 'checkout_not_found'; end if;
  if v_session.order_id is not null then return v_session.order_id; end if;

  insert into crm.customers (full_name, phone, email, default_address)
  values (
    coalesce(nullif(v_session.customer_name, ''), 'Cliente sin nombre'),
    v_session.customer_phone,
    v_session.customer_email,
    v_session.delivery_address
  )
  on conflict (phone) do update
  set full_name = coalesce(nullif(excluded.full_name, ''), crm.customers.full_name),
      email = coalesce(excluded.email, crm.customers.email),
      default_address = coalesce(excluded.default_address, crm.customers.default_address),
      updated_at = now()
  returning id into v_customer_id;

  select id into v_source_id from sales.order_sources where code = v_session.source_code limit 1;
  if v_source_id is null then
    select id into v_source_id from sales.order_sources where code = 'web' limit 1;
  end if;

  insert into sales.orders (
    customer_id, source_id, status, type, payment_status, payment_method,
    total_amount, delivery_address_snapshot, station_code,
    coupon_code, discount_amount, confirmed_at
  ) values (
    v_customer_id, v_source_id, p_order_status, v_session.type,
    p_payment_status, v_session.payment_method, v_session.total_amount,
    v_session.delivery_address, v_session.station_code,
    v_session.coupon_code, v_session.discount_amount,
    case when p_order_status = 'recibido' then now() else null end
  ) returning id, order_number into v_order_id, v_order_number;

  insert into sales.order_items (order_id, product_id, quantity, unit_price, customizations)
  select v_order_id, product_id, quantity, unit_price, customizations
  from sales.checkout_session_items
  where checkout_session_id = p_checkout_id;

  perform sales._consume_checkout_coupon(p_checkout_id, v_order_id);

  insert into sales.order_status_history (order_id, from_status, to_status, metadata)
  values (v_order_id, null, p_order_status, jsonb_build_object(
    'source', 'web_checkout_v2', 'checkout_id', p_checkout_id
  ));

  update sales.checkout_sessions
  set order_id = v_order_id,
      status = case
        when p_payment_status = 'pagado' then 'paid'
        when p_order_status = 'esperando_pago' then 'awaiting_transfer'
        else 'confirmed'
      end,
      updated_at = now()
  where id = p_checkout_id;

  if p_emit_erp_event then
    insert into integration.erp_order_outbox (
      aggregate_id, event_type, idempotency_key, payload
    ) values (
      v_order_id,
      'erp_order_ready',
      'erp:create-order:' || v_order_id::text,
      jsonb_build_object('order_id', v_order_id, 'order_number', v_order_number)
    ) on conflict (idempotency_key) do nothing;
  end if;

  return v_order_id;
end;
$$;

create or replace function public.confirm_offline_checkout(p_checkout_token uuid)
returns jsonb
language plpgsql
security definer
set search_path = public, sales
as $$
declare
  v_session sales.checkout_sessions%rowtype;
  v_order_id uuid;
begin
  select * into v_session from sales.checkout_sessions
  where public_token = p_checkout_token for update;
  if v_session.id is null then raise exception 'checkout_not_found'; end if;
  if v_session.order_id is not null then return sales._checkout_result(v_session.id); end if;
  if v_session.payment_method = 'efectivo' then
    v_order_id := sales._create_order_from_checkout(v_session.id, 'recibido', 'pendiente', true);
  elsif v_session.payment_method = 'transferencia' then
    v_order_id := sales._create_order_from_checkout(v_session.id, 'esperando_pago', 'pendiente', false);
  else
    raise exception 'offline_checkout_requires_cash_or_transfer';
  end if;
  return sales._checkout_result(v_session.id);
end;
$$;

create or replace function public.finalize_checkout_payment(
  p_checkout_id uuid,
  p_attempt_key uuid,
  p_provider_payment_id text,
  p_amount numeric,
  p_currency text,
  p_provider_metadata jsonb default '{}'::jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public, sales
as $$
declare
  v_session sales.checkout_sessions%rowtype;
  v_order_id uuid;
  v_existing_order_id uuid;
  v_payment_id uuid;
begin
  select * into v_session from sales.checkout_sessions where id = p_checkout_id for update;
  if v_session.id is null then raise exception 'checkout_not_found'; end if;
  if p_currency <> 'COP' then raise exception 'payment_currency_mismatch'; end if;
  if round(p_amount, 2) <> round(v_session.total_amount, 2) then
    raise exception 'payment_amount_mismatch';
  end if;
  if v_session.payment_method <> 'mercado_pago' then raise exception 'payment_method_mismatch'; end if;

  select order_id into v_existing_order_id
  from sales.payments where transaction_id = p_provider_payment_id limit 1;
  if v_existing_order_id is not null then
    if v_session.order_id is null or v_existing_order_id <> v_session.order_id then
      raise exception 'provider_payment_already_used';
    end if;
    return sales._checkout_result(v_session.id);
  end if;

  v_order_id := sales._create_order_from_checkout(v_session.id, 'recibido', 'pagado', true);

  insert into sales.payments (
    order_id, amount, method, status, reference, transaction_id, gateway, gateway_metadata
  ) values (
    v_order_id, p_amount, 'mercado_pago', 'pagado', p_checkout_id::text,
    p_provider_payment_id, 'mercado_pago', coalesce(p_provider_metadata, '{}'::jsonb)
  )
  on conflict (transaction_id) where transaction_id is not null do nothing
  returning id into v_payment_id;

  if v_payment_id is null then
    select order_id into v_existing_order_id
    from sales.payments where transaction_id = p_provider_payment_id limit 1;
    if v_existing_order_id <> v_order_id then raise exception 'provider_payment_already_used'; end if;
  end if;

  update sales.payment_attempts
  set provider_payment_id = p_provider_payment_id,
      status = 'approved',
      provider_metadata = coalesce(p_provider_metadata, '{}'::jsonb),
      updated_at = now()
  where id = (
    select pa.id
    from sales.payment_attempts pa
    where pa.checkout_session_id = v_session.id
      and (p_attempt_key is null or pa.attempt_key = p_attempt_key)
    order by pa.created_at desc
    limit 1
  );

  update sales.checkout_sessions
  set status = 'paid', updated_at = now()
  where id = v_session.id;
  return sales._checkout_result(v_session.id);
end;
$$;

-- Keep manual payment registration idempotent and promote transfer orders
-- into the operational queue only when they become fully paid.
create or replace function sales.register_payment(
  p_order_id uuid,
  p_amount numeric,
  p_method text,
  p_reference text default null,
  p_transaction_id text default null
)
returns uuid
language plpgsql
security definer
set search_path = public, sales
as $$
declare
  v_payment_id uuid;
  v_existing_order_id uuid;
  v_total_paid numeric(12,2);
  v_order sales.orders%rowtype;
  v_new_payment_status text;
begin
  if p_amount is null or p_amount <= 0 then raise exception 'payment_amount_invalid'; end if;
  select * into v_order from sales.orders where id = p_order_id for update;
  if v_order.id is null then raise exception 'order_not_found'; end if;

  if p_transaction_id is not null then
    select id, order_id into v_payment_id, v_existing_order_id
    from sales.payments where transaction_id = p_transaction_id limit 1;
    if v_payment_id is not null then
      if v_existing_order_id <> p_order_id then raise exception 'transaction_id_already_used'; end if;
      return v_payment_id;
    end if;
  end if;

  insert into sales.payments (
    order_id, amount, method, status, reference, transaction_id, recorded_by, gateway
  ) values (
    p_order_id, p_amount, p_method, 'pagado', p_reference, p_transaction_id, auth.uid(),
    case when p_method in ('mercado_pago', 'wompi', 'link_pago') then p_method else null end
  )
  on conflict (transaction_id) where transaction_id is not null do nothing
  returning id into v_payment_id;

  if v_payment_id is null then
    select id, order_id into v_payment_id, v_existing_order_id
    from sales.payments where transaction_id = p_transaction_id limit 1;
    if v_existing_order_id <> p_order_id then raise exception 'transaction_id_already_used'; end if;
    return v_payment_id;
  end if;

  select coalesce(sum(amount), 0) into v_total_paid
  from sales.payments where order_id = p_order_id and status = 'pagado';
  v_new_payment_status := case
    when v_total_paid <= 0 then 'pendiente'
    when v_total_paid < v_order.total_amount then 'parcial'
    else 'pagado'
  end;

  update sales.orders
  set payment_status = v_new_payment_status,
      payment_method = coalesce(payment_method, p_method),
      status = case
        when v_new_payment_status = 'pagado' and status = 'esperando_pago' then 'recibido'
        else status
      end,
      confirmed_at = case
        when v_new_payment_status = 'pagado' and confirmed_at is null then now()
        else confirmed_at
      end
  where id = p_order_id;

  if v_new_payment_status = 'pagado' and v_order.status = 'esperando_pago' then
    insert into sales.order_status_history (order_id, from_status, to_status, metadata)
    values (p_order_id, 'esperando_pago', 'recibido', jsonb_build_object('reason', 'payment_confirmed'));
    insert into integration.erp_order_outbox (aggregate_id, event_type, idempotency_key, payload)
    values (
      p_order_id, 'erp_order_ready', 'erp:create-order:' || p_order_id::text,
      jsonb_build_object('order_id', p_order_id)
    ) on conflict (idempotency_key) do nothing;
  end if;
  return v_payment_id;
end;
$$;

-- During the rolling deployment, a payment created by checkout-v1 can arrive
-- after checkout-v2 is already serving webhooks. Reconcile only an existing
-- web Mercado Pago order, while enforcing the gateway amount/currency and the
-- same transaction-id idempotency used by checkout-v2.
create or replace function public.finalize_legacy_mercadopago_payment(
  p_order_id uuid,
  p_provider_payment_id text,
  p_amount numeric,
  p_currency text,
  p_provider_metadata jsonb default '{}'::jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public, sales
as $$
declare
  v_order sales.orders%rowtype;
  v_source_code text;
  v_payment_id uuid;
begin
  if nullif(p_provider_payment_id, '') is null then
    raise exception 'provider_payment_id_required';
  end if;
  select * into v_order from sales.orders where id = p_order_id for update;
  if v_order.id is null then raise exception 'legacy_order_not_found'; end if;

  select code into v_source_code from sales.order_sources where id = v_order.source_id;
  if v_source_code <> 'web' or v_order.payment_method <> 'mercado_pago' then
    raise exception 'legacy_order_payment_mismatch';
  end if;
  if p_currency <> 'COP' then raise exception 'payment_currency_mismatch'; end if;
  if round(p_amount, 2) <> round(v_order.total_amount, 2) then
    raise exception 'payment_amount_mismatch';
  end if;

  v_payment_id := sales.register_payment(
    p_order_id,
    p_amount,
    'mercado_pago',
    p_order_id::text,
    p_provider_payment_id
  );
  update sales.payments
  set gateway_metadata = coalesce(p_provider_metadata, '{}'::jsonb)
  where id = v_payment_id;

  select * into v_order from sales.orders where id = p_order_id;
  return jsonb_build_object(
    'order_id', v_order.id,
    'order_number', v_order.order_number,
    'order_status', v_order.status,
    'payment_status', v_order.payment_status,
    'payment_id', v_payment_id
  );
end;
$$;

-- Financial barrier for both new and legacy web orders.
create or replace function sales.advance_order_status(
  p_order_id uuid,
  p_to_status text,
  p_metadata jsonb default '{}'::jsonb
)
returns void
language plpgsql
security definer
set search_path = public, sales
as $$
declare
  v_order sales.orders%rowtype;
  v_source_code text;
begin
  select * into v_order
  from sales.orders
  where id = p_order_id
  for update;
  if v_order.id is null then raise exception 'Order not found'; end if;
  select code into v_source_code
  from sales.order_sources
  where id = v_order.source_id;
  if v_order.status = p_to_status then return; end if;

  if p_to_status = 'en_preparacion'
     and v_source_code = 'web'
     and v_order.payment_method in ('mercado_pago', 'transferencia')
     and v_order.payment_status <> 'pagado' then
    raise exception 'payment_required_before_preparation';
  end if;

  if not (
    (v_order.status = 'esperando_pago' and p_to_status = 'cancelado')
    or (v_order.status = 'recibido' and p_to_status in ('en_preparacion', 'cancelado'))
    or (v_order.status = 'en_preparacion' and p_to_status in ('listo', 'cancelado'))
    or (v_order.status = 'listo' and p_to_status in ('entregado', 'cancelado'))
  ) then
    raise exception 'Invalid order status transition: % -> %', v_order.status, p_to_status;
  end if;

  update sales.orders
  set status = p_to_status,
      ready_at = case when p_to_status = 'listo' then now() else ready_at end,
      delivered_at = case when p_to_status = 'entregado' then now() else delivered_at end,
      cancelled_at = case when p_to_status = 'cancelado' then now() else cancelled_at end
  where id = p_order_id;
  insert into sales.order_status_history (order_id, from_status, to_status, changed_by, metadata)
  values (p_order_id, v_order.status, p_to_status, auth.uid(), coalesce(p_metadata, '{}'::jsonb));
end;
$$;

revoke all on function public.upsert_checkout_session(uuid, jsonb) from public, anon, authenticated;
revoke all on function public.get_checkout_context(uuid) from public, anon, authenticated;
revoke all on function public.get_checkout_context_by_id(uuid) from public, anon, authenticated;
revoke all on function public.store_checkout_preference(uuid, text, bigint) from public, anon, authenticated;
revoke all on function public.prepare_checkout_payment_attempt(uuid, uuid, text) from public, anon, authenticated;
revoke all on function public.record_checkout_payment_attempt(uuid, uuid, text, text, text, jsonb) from public, anon, authenticated;
revoke all on function public.confirm_offline_checkout(uuid) from public, anon, authenticated;
revoke all on function public.finalize_checkout_payment(uuid, uuid, text, numeric, text, jsonb) from public, anon, authenticated;
revoke all on function public.finalize_legacy_mercadopago_payment(uuid, text, numeric, text, jsonb) from public, anon, authenticated;

grant execute on function public.upsert_checkout_session(uuid, jsonb) to service_role;
grant execute on function public.get_checkout_context(uuid) to service_role;
grant execute on function public.get_checkout_context_by_id(uuid) to service_role;
grant execute on function public.store_checkout_preference(uuid, text, bigint) to service_role;
grant execute on function public.prepare_checkout_payment_attempt(uuid, uuid, text) to service_role;
grant execute on function public.record_checkout_payment_attempt(uuid, uuid, text, text, text, jsonb) to service_role;
grant execute on function public.confirm_offline_checkout(uuid) to service_role;
grant execute on function public.finalize_checkout_payment(uuid, uuid, text, numeric, text, jsonb) to service_role;
grant execute on function public.finalize_legacy_mercadopago_payment(uuid, text, numeric, text, jsonb) to service_role;

-- Deliberately do not revoke create_order_anon in this additive migration.
-- Revoke it only after the web deployment using checkout v2 is live, avoiding
-- a rolling-deploy outage. The follow-up lockdown SQL is versioned separately.
