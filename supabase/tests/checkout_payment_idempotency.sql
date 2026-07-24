-- Run after 20260722_001_checkout_payment_idempotency.sql inside a transaction.
-- The test runner wraps this in BEGIN/ROLLBACK, so no synthetic rows persist.

do $$
declare
  v_slug text;
  v_price numeric;
  v_quantity integer;
  v_key uuid := gen_random_uuid();
  v_attempt uuid := gen_random_uuid();
  v_other_attempt uuid := gen_random_uuid();
  v_payload jsonb;
  v_first jsonb;
  v_second jsonb;
  v_prepared jsonb;
  v_pending jsonb;
  v_paid jsonb;
  v_replayed jsonb;
  v_checkout_id uuid;
  v_order_id uuid;
  v_total numeric;
  v_count integer;
begin
  select slug, price into v_slug, v_price
  from catalog.products
  where active = true and price > 0 and slug is not null
  order by price desc
  limit 1;
  if v_slug is null then raise exception 'test_requires_active_catalog_product'; end if;
  v_quantity := greatest(1, ceil(50000 / v_price)::integer);
  if v_quantity > 100 then raise exception 'test_product_price_too_low'; end if;

  v_payload := jsonb_build_object(
    'customer_phone', '3009990001',
    'customer_name', 'Checkout Test',
    'customer_email', 'checkout-test@example.com',
    'delivery_address', 'Calle de prueba 123, Medellín',
    'payment_method', 'mercado_pago',
    'source_code', 'web',
    'items', jsonb_build_array(jsonb_build_object(
      'product_slug', v_slug,
      'quantity', v_quantity
    ))
  );

  v_first := public.upsert_checkout_session(v_key, v_payload);
  v_second := public.upsert_checkout_session(v_key, v_payload);
  if v_first->>'checkout_id' <> v_second->>'checkout_id' then
    raise exception 'same_checkout_key_created_two_sessions';
  end if;
  if v_first->>'order_id' is not null then
    raise exception 'draft_checkout_created_operational_order';
  end if;

  v_checkout_id := (v_first->>'checkout_id')::uuid;
  v_total := (v_first->>'total_amount')::numeric;
  v_prepared := public.prepare_checkout_payment_attempt(
    (v_first->>'checkout_token')::uuid, v_attempt, 'credit_card'
  );
  perform public.prepare_checkout_payment_attempt(
    (v_first->>'checkout_token')::uuid, v_attempt, 'credit_card'
  );
  v_second := public.prepare_checkout_payment_attempt(
    (v_first->>'checkout_token')::uuid, v_other_attempt, 'credit_card'
  );
  if v_second->>'attempt_key' <> v_attempt::text then
    raise exception 'concurrent_tab_did_not_reuse_active_attempt';
  end if;
  select count(*) into v_count from sales.payment_attempts where attempt_key = v_attempt;
  if v_count <> 1 then raise exception 'attempt_retry_not_idempotent'; end if;

  v_pending := public.record_checkout_payment_attempt(
    v_checkout_id, v_attempt, 'test-payment-001', 'pending', 'pending_review', '{}'::jsonb
  );
  if v_pending->>'status' <> 'payment_pending' or v_pending->>'order_id' is not null then
    raise exception 'pending_payment_created_order';
  end if;

  v_paid := public.finalize_checkout_payment(
    v_checkout_id, v_attempt, 'test-payment-001', v_total, 'COP', '{}'::jsonb
  );
  v_replayed := public.finalize_checkout_payment(
    v_checkout_id, v_attempt, 'test-payment-001', v_total, 'COP', '{}'::jsonb
  );
  if v_paid->>'order_id' is null or v_paid->>'order_id' <> v_replayed->>'order_id' then
    raise exception 'approved_payment_finalize_not_idempotent';
  end if;
  v_order_id := (v_paid->>'order_id')::uuid;

  select count(*) into v_count from sales.orders where id = v_order_id;
  if v_count <> 1 then raise exception 'expected_exactly_one_order'; end if;
  select count(*) into v_count from sales.payments where transaction_id = 'test-payment-001';
  if v_count <> 1 then raise exception 'expected_exactly_one_payment'; end if;
  select count(*) into v_count from integration.erp_order_outbox where aggregate_id = v_order_id;
  if v_count <> 1 then raise exception 'expected_exactly_one_erp_event'; end if;
end;
$$;

do $$
declare
  v_slug text;
  v_price numeric;
  v_quantity integer;
  v_key uuid := gen_random_uuid();
  v_payload jsonb;
  v_checkout jsonb;
  v_order jsonb;
  v_order_id uuid;
  v_total numeric;
  v_payment_id uuid;
  v_status text;
  v_payment_status text;
  v_count integer;
begin
  select slug, price into v_slug, v_price
  from catalog.products where active = true and price > 0 and slug is not null
  order by price desc limit 1;
  v_quantity := greatest(1, ceil(50000 / v_price)::integer);
  v_payload := jsonb_build_object(
    'customer_phone', '3009990002',
    'customer_name', 'Transfer Test',
    'delivery_address', 'Carrera de prueba 456, Medellín',
    'payment_method', 'transferencia',
    'items', jsonb_build_array(jsonb_build_object('product_slug', v_slug, 'quantity', v_quantity))
  );

  v_checkout := public.upsert_checkout_session(v_key, v_payload);
  v_order := public.confirm_offline_checkout((v_checkout->>'checkout_token')::uuid);
  perform public.confirm_offline_checkout((v_checkout->>'checkout_token')::uuid);
  v_order_id := (v_order->>'order_id')::uuid;
  v_total := (v_order->>'total_amount')::numeric;

  select status, payment_status into v_status, v_payment_status
  from sales.orders where id = v_order_id;
  if v_status <> 'esperando_pago' or v_payment_status <> 'pendiente' then
    raise exception 'transfer_became_operational_before_payment';
  end if;
  select count(*) into v_count from integration.erp_order_outbox where aggregate_id = v_order_id;
  if v_count <> 0 then raise exception 'transfer_emitted_erp_event_before_payment'; end if;

  begin
    perform sales.advance_order_status(v_order_id, 'en_preparacion', '{}'::jsonb);
    raise exception 'unpaid_transfer_advanced_to_kitchen';
  exception when others then
    if sqlerrm = 'unpaid_transfer_advanced_to_kitchen' then raise; end if;
  end;

  v_payment_id := sales.register_payment(
    v_order_id, v_total, 'transferencia', 'manual-test', 'test-transfer-001'
  );
  perform sales.register_payment(
    v_order_id, v_total, 'transferencia', 'manual-test', 'test-transfer-001'
  );
  select status, payment_status into v_status, v_payment_status
  from sales.orders where id = v_order_id;
  if v_status <> 'recibido' or v_payment_status <> 'pagado' then
    raise exception 'paid_transfer_not_promoted';
  end if;
  select count(*) into v_count from sales.payments where id = v_payment_id;
  if v_count <> 1 then raise exception 'manual_payment_not_idempotent'; end if;
  select count(*) into v_count from integration.erp_order_outbox where aggregate_id = v_order_id;
  if v_count <> 1 then raise exception 'paid_transfer_expected_one_erp_event'; end if;
end;
$$;

select 'checkout_payment_idempotency_ok' as result;

do $$
declare
  v_slug text;
  v_variant_label text;
  v_variant_price numeric;
  v_quantity integer;
  v_checkout jsonb;
begin
  select product_slug, variant_label, price
  into v_slug, v_variant_label, v_variant_price
  from public.product_checkout_prices_view
  where variant_label is not null and price > 0
  order by price desc
  limit 1;
  if v_slug is null then raise exception 'test_requires_variant_checkout_price'; end if;
  v_quantity := greatest(1, ceil(50000 / v_variant_price)::integer);
  v_checkout := public.upsert_checkout_session(gen_random_uuid(), jsonb_build_object(
    'customer_phone', '3009990006',
    'customer_name', 'Variant Price Test',
    'delivery_address', 'Calle Variante 1',
    'payment_method', 'mercado_pago',
    'items', jsonb_build_array(jsonb_build_object(
      'product_slug', v_slug,
      'variant_label', v_variant_label,
      'quantity', v_quantity
    ))
  ));
  if (v_checkout->>'subtotal')::numeric <> v_variant_price * v_quantity then
    raise exception 'checkout_did_not_use_authoritative_variant_price';
  end if;
end;
$$;

select 'checkout_variant_price_ok' as result;
