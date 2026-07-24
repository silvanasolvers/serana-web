-- Rolling-deploy containment for the checkout-v1 browser.
--
-- The old frontend still calls create_order_anon before mounting Mercado Pago.
-- Keep that call working during rollout, but make its rows non-operational and
-- remove browser authority over financial/operational state. Checkout v2 does
-- not use this function; it is revoked after the new release is verified.

create or replace function public.create_order_anon(payload jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public, sales, crm, catalog
as $$
declare
  v_customer_id uuid;
  v_order_id uuid;
  v_order_number bigint;
  v_order_item jsonb;
  v_product_id uuid;
  v_product_price numeric(12,2);
  v_variant_label text;
  v_quantity integer;
  v_subtotal numeric(12,2) := 0;
  v_total numeric(12,2);
  v_delivery_fee numeric(12,2) := 12500;
  v_source_id uuid;
  v_phone text;
  v_coupon_code text;
  v_coupon record;
  v_discount numeric(12,2) := 0;
  v_method text;
  v_initial_status text;
begin
  v_phone := regexp_replace(coalesce(payload->>'customer_phone', ''), '[^0-9]', '', 'g');
  if length(v_phone) < 7 then raise exception 'customer_phone_required'; end if;
  if jsonb_typeof(payload->'items') is distinct from 'array'
     or jsonb_array_length(payload->'items') = 0 then
    raise exception 'items_required';
  end if;
  if jsonb_array_length(payload->'items') > 50 then raise exception 'items_limit'; end if;

  v_method := case when payload->>'payment_method' in ('mercado_pago', 'transferencia', 'efectivo')
    then payload->>'payment_method' else 'mercado_pago' end;
  v_initial_status := case
    when v_method in ('mercado_pago', 'transferencia') then 'esperando_pago'
    else 'recibido'
  end;

  insert into crm.customers (full_name, phone, email, default_address)
  values (
    coalesce(nullif(trim(payload->>'customer_name'), ''), 'Cliente sin nombre'),
    v_phone,
    nullif(lower(trim(payload->>'customer_email')), ''),
    nullif(trim(payload->>'delivery_address'), '')
  )
  on conflict (phone) do update
  set full_name = coalesce(nullif(excluded.full_name, ''), crm.customers.full_name),
      email = coalesce(excluded.email, crm.customers.email),
      default_address = coalesce(excluded.default_address, crm.customers.default_address),
      updated_at = now()
  returning id into v_customer_id;

  select id into v_source_id from sales.order_sources where code = 'web' limit 1;

  insert into sales.orders (
    customer_id, source_id, status, type, payment_status, payment_method,
    total_amount, delivery_address_snapshot, station_code, confirmed_at
  ) values (
    v_customer_id, v_source_id, v_initial_status, 'domicilio', 'pendiente',
    v_method, 0, nullif(trim(payload->>'delivery_address'), ''), null,
    case when v_initial_status = 'recibido' then now() else null end
  ) returning id, order_number into v_order_id, v_order_number;

  for v_order_item in select * from jsonb_array_elements(payload->'items')
  loop
    v_product_id := null;
    if v_order_item->>'product_id' is not null then
      v_product_id := (v_order_item->>'product_id')::uuid;
    elsif v_order_item->>'product_slug' is not null then
      select id into v_product_id
      from catalog.products
      where slug = v_order_item->>'product_slug' and active = true
      limit 1;
    end if;
    if v_product_id is null then raise exception 'product_not_found'; end if;

    v_variant_label := nullif(trim(v_order_item->>'variant_label'), '');
    v_product_price := null;
    if v_variant_label is not null then
      select price into v_product_price
      from catalog.product_checkout_prices
      where product_id = v_product_id and active = true and variant_label = v_variant_label
      limit 1;
      if v_product_price is null then raise exception 'variant_not_found: %', v_variant_label; end if;
    else
      select price into v_product_price
      from catalog.product_checkout_prices
      where product_id = v_product_id and active = true and is_default = true
      limit 1;
      if v_product_price is null then
        select price into v_product_price
        from catalog.products where id = v_product_id and active = true;
      end if;
      if v_product_price is null then raise exception 'product_not_active'; end if;
    end if;
    v_quantity := greatest(coalesce((v_order_item->>'quantity')::integer, 1), 1);
    if v_quantity > 100 then raise exception 'item_quantity_limit'; end if;

    insert into sales.order_items (order_id, product_id, quantity, unit_price, customizations)
    values (v_order_id, v_product_id, v_quantity, v_product_price, v_order_item->>'customizations');
    v_subtotal := v_subtotal + (v_quantity * v_product_price);
  end loop;

  v_coupon_code := nullif(upper(trim(payload->>'coupon_code')), '');
  if v_coupon_code is not null then
    select coupon_id, code, discount_amount, reason into v_coupon
    from sales._validate_coupon(v_coupon_code, v_subtotal);
    if v_coupon.reason <> 'ok' then raise exception 'coupon_invalid: %', v_coupon.reason; end if;
    v_discount := v_coupon.discount_amount;
    update sales.coupons
    set used_count = used_count + 1, updated_at = now()
    where id = v_coupon.coupon_id
      and (usage_limit is null or used_count < usage_limit);
    if not found then raise exception 'coupon_invalid: usage_limit'; end if;
    insert into sales.coupon_redemptions (coupon_id, order_id, code_snapshot, discount_amount)
    values (v_coupon.coupon_id, v_order_id, v_coupon.code, v_discount)
    on conflict (order_id) do nothing;
  end if;

  if greatest(v_subtotal - v_discount, 0) < 50000 then
    raise exception 'minimum_order_not_met';
  end if;
  v_total := greatest(v_subtotal - v_discount, 0) + v_delivery_fee;

  update sales.orders
  set total_amount = v_total,
      coupon_code = v_coupon_code,
      discount_amount = v_discount
  where id = v_order_id;

  insert into sales.order_status_history (order_id, from_status, to_status, metadata)
  values (v_order_id, null, v_initial_status, jsonb_build_object(
    'source', 'web_anon_legacy_contained',
    'subtotal', v_subtotal,
    'discount', v_discount,
    'delivery_fee', v_delivery_fee
  ));

  if v_initial_status = 'recibido' then
    insert into integration.erp_order_outbox (aggregate_id, event_type, idempotency_key, payload)
    values (
      v_order_id, 'erp_order_ready', 'erp:create-order:' || v_order_id::text,
      jsonb_build_object('order_id', v_order_id, 'order_number', v_order_number)
    ) on conflict (idempotency_key) do nothing;
  end if;

  return jsonb_build_object(
    'order_id', v_order_id,
    'order_number', v_order_number,
    'total_amount', v_total,
    'subtotal', v_subtotal,
    'discount_amount', v_discount,
    'delivery_fee', v_delivery_fee,
    'coupon_code', v_coupon_code,
    'customer_id', v_customer_id,
    'status', v_initial_status,
    'payment_status', 'pendiente'
  );
end;
$$;

grant execute on function public.create_order_anon(jsonb) to anon, authenticated;
