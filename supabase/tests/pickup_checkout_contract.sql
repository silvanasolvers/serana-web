-- Run after 20260729090000_pickup_checkout_contract.sql inside a transaction.
-- The runner must wrap this file in BEGIN/ROLLBACK so no QA order persists.

do $$
declare
  v_slug text;
  v_price numeric;
  v_quantity integer;
  v_phone text := '3009990029';
  v_home_address text := 'Dirección hogar QA protegida';
  v_store_address text :=
    'Recogida en tienda · Carrera 45F #40 sur 03, Barrio Alcalá, Envigado, Urb Villas del Vallejuelo';
  v_checkout jsonb;
  v_order jsonb;
  v_order_id uuid;
  v_count integer;
  v_customer_address text;
  v_method text;
  v_attempt uuid;
  v_provider_payment_id text;
  v_expected_payment_status text;
begin
  select slug, price into v_slug, v_price
  from catalog.products
  where active = true and price > 0 and slug is not null
  order by price desc
  limit 1;
  if v_slug is null then raise exception 'test_requires_active_catalog_product'; end if;

  v_quantity := greatest(1, ceil(50000 / v_price)::integer);
  if v_quantity > 100 then raise exception 'test_product_price_too_low'; end if;

  insert into crm.customers (full_name, phone, default_address)
  values ('Pickup Contract QA', v_phone, v_home_address)
  on conflict (phone) do update
  set default_address = excluded.default_address;

  foreach v_method in array array['mercado_pago', 'transferencia', 'efectivo']
  loop
    v_checkout := public.upsert_checkout_session(
      gen_random_uuid(),
      jsonb_build_object(
        'customer_phone', v_phone,
        'customer_name', 'Pickup Contract QA',
        'delivery_address', v_store_address,
        'type', 'recogida',
        'payment_method', v_method,
        'source_code', 'web',
        'items', jsonb_build_array(jsonb_build_object(
          'product_slug', v_slug,
          'quantity', v_quantity
        ))
      )
    );

    if (v_checkout->>'delivery_fee')::numeric <> 0 then
      raise exception 'pickup_delivery_fee_is_not_zero: %', v_method;
    end if;
    if (v_checkout->>'total_amount')::numeric <> v_price * v_quantity then
      raise exception 'pickup_total_does_not_match_catalog_subtotal: %', v_method;
    end if;

    select count(*) into v_count
    from sales.checkout_sessions
    where id = (v_checkout->>'checkout_id')::uuid
      and type = 'recogida'
      and payment_method = v_method
      and delivery_fee = 0
      and delivery_address = v_store_address;
    if v_count <> 1 then
      raise exception 'pickup_checkout_contract_not_persisted: %', v_method;
    end if;

    if v_method = 'mercado_pago' then
      if v_checkout->>'order_id' is not null then
        raise exception 'pickup_mp_draft_created_order';
      end if;
      v_attempt := gen_random_uuid();
      v_provider_payment_id := 'pickup-contract-' || (v_checkout->>'checkout_id');
      perform public.prepare_checkout_payment_attempt(
        (v_checkout->>'checkout_token')::uuid,
        v_attempt,
        'credit_card'
      );
      v_order := public.finalize_checkout_payment(
        (v_checkout->>'checkout_id')::uuid,
        v_attempt,
        v_provider_payment_id,
        (v_checkout->>'total_amount')::numeric,
        'COP',
        '{"test":"pickup_contract"}'::jsonb
      );
      v_expected_payment_status := 'pagado';
    else
      v_order := public.confirm_offline_checkout(
        (v_checkout->>'checkout_token')::uuid
      );
      perform public.confirm_offline_checkout(
        (v_checkout->>'checkout_token')::uuid
      );
      v_expected_payment_status := 'pendiente';
    end if;
    v_order_id := (v_order->>'order_id')::uuid;

    select count(*) into v_count
    from sales.orders
    where id = v_order_id
      and type = 'recogida'
      and payment_method = v_method
      and payment_status = v_expected_payment_status
      and status = 'recibido'
      and delivery_address_snapshot = v_store_address;
    if v_count <> 1 then
      raise exception 'pickup_order_not_visible_to_erp: %', v_method;
    end if;

    select count(*) into v_count
    from ops_analytics.order_board_view
    where order_id = v_order_id
      and type = 'recogida'
      and payment_status = v_expected_payment_status
      and delivery_address = v_store_address;
    if v_count <> 1 then
      raise exception 'pickup_order_missing_from_order_board: %', v_method;
    end if;

    if v_method = 'mercado_pago' then
      select count(*) into v_count
      from sales.payments
      where order_id = v_order_id
        and gateway = 'mercado_pago'
        and status = 'pagado'
        and transaction_id = v_provider_payment_id
        and reference = (v_checkout->>'checkout_id');
      if v_count <> 1 then
        raise exception 'pickup_mp_payment_missing_from_ledger';
      end if;
    else
      select count(*) into v_count
      from sales.payments
      where order_id = v_order_id
        and method = v_method
        and status = 'pendiente'
        and transaction_id = 'manual-intent:' || v_order_id::text;
      if v_count <> 1 then
        raise exception 'pickup_manual_payment_intent_missing: %', v_method;
      end if;
    end if;
  end loop;

  select default_address into v_customer_address
  from crm.customers
  where phone = v_phone;
  if v_customer_address is distinct from v_home_address then
    raise exception 'pickup_overwrote_customer_default_address';
  end if;

end;
$$;

select 'pickup_checkout_contract_ok' as result;
