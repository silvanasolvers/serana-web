-- Run after all checkout/payment migrations inside a transaction.
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
  v_duplicate jsonb;
  v_checkout_id uuid;
  v_order_id uuid;
  v_total numeric;
  v_count integer;
  v_has_recipe boolean;
begin
  select
    p.slug,
    p.price,
    exists (
      select 1
      from catalog.product_recipes pr
      where pr.product_id = p.id
    )
  into v_slug, v_price, v_has_recipe
  from catalog.products p
  where p.active = true and p.price > 0 and p.slug is not null
  order by
    exists (
      select 1
      from catalog.product_recipes pr
      where pr.product_id = p.id
    ) desc,
    p.price desc
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
  if v_first->>'version' <> v_second->>'version' then
    raise exception 'identical_checkout_retry_changed_version';
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

  v_duplicate := public.finalize_checkout_payment(
    v_checkout_id,
    v_attempt,
    'test-payment-002',
    v_total,
    'COP',
    '{"duplicate_test":true}'::jsonb
  );
  if coalesce((v_duplicate->>'duplicate_payment')::boolean, false) is not true then
    raise exception 'distinct_second_approval_not_flagged';
  end if;

  select count(*) into v_count from sales.orders where id = v_order_id;
  if v_count <> 1 then raise exception 'expected_exactly_one_order'; end if;
  select count(*) into v_count from sales.payments where order_id = v_order_id;
  if v_count <> 1 then raise exception 'expected_exactly_one_payment'; end if;
  select count(*) into v_count
  from sales.payment_reconciliation_incidents
  where checkout_session_id = v_checkout_id
    and provider_payment_id = 'test-payment-002'
    and status = 'open';
  if v_count <> 1 then raise exception 'duplicate_payment_incident_missing'; end if;
  select count(*) into v_count
  from sales.payment_attempts
  where checkout_session_id = v_checkout_id
    and provider_payment_id = 'test-payment-001';
  if v_count <> 1 then raise exception 'original_payment_attempt_was_overwritten'; end if;
  select count(*) into v_count from integration.erp_order_outbox where aggregate_id = v_order_id;
  if v_count <> 0 then raise exception 'checkout_used_disabled_erp_outbox'; end if;

  perform sales.advance_order_status(
    v_order_id,
    'en_preparacion',
    '{"test":"atomic_inventory"}'::jsonb
  );
  perform sales.advance_order_status(
    v_order_id,
    'en_preparacion',
    '{"test":"idempotent_inventory_replay"}'::jsonb
  );
  if v_has_recipe then
    select count(*) into v_count
    from inventory.order_inventory_consumptions
    where order_id = v_order_id;
    if v_count <> 1 then raise exception 'inventory_consumption_not_atomic'; end if;
  end if;
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
  select count(*) into v_count
  from sales.payments
  where order_id = v_order_id
    and method = 'transferencia'
    and status = 'pendiente'
    and amount = v_total
    and transaction_id = 'manual-intent:' || v_order_id::text;
  if v_count <> 1 then
    raise exception 'transfer_payment_intent_not_visible_to_erp';
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
    v_order_id,
    v_total,
    'transferencia',
    'dashboard_manual_settlement',
    'manual-settlement:' || v_order_id::text
  );
  perform sales.register_payment(
    v_order_id,
    v_total,
    'transferencia',
    'dashboard_manual_settlement',
    'manual-settlement:' || v_order_id::text
  );
  perform sales.register_payment(
    v_order_id,
    v_total,
    'transferencia',
    'old_dashboard_retry',
    null
  );
  select status, payment_status into v_status, v_payment_status
  from sales.orders where id = v_order_id;
  if v_status <> 'recibido' or v_payment_status <> 'pagado' then
    raise exception 'paid_transfer_not_promoted';
  end if;
  select count(*) into v_count
  from sales.payments
  where order_id = v_order_id;
  if v_count <> 1 then raise exception 'manual_payment_not_idempotent'; end if;
  select count(*) into v_count
  from sales.payments
  where order_id = v_order_id
    and status = 'pendiente';
  if v_count <> 0 then raise exception 'settled_transfer_kept_pending_payment_intent'; end if;
  select count(*) into v_count from integration.erp_order_outbox where aggregate_id = v_order_id;
  if v_count <> 0 then raise exception 'paid_transfer_used_disabled_erp_outbox'; end if;
end;
$$;

select 'checkout_payment_idempotency_ok' as result;

do $$
declare
  v_slug text;
  v_price numeric;
  v_quantity integer;
  v_checkout jsonb;
  v_order jsonb;
  v_order_id uuid;
  v_total numeric;
  v_count integer;
begin
  select slug, price into v_slug, v_price
  from catalog.products
  where active = true and price > 0 and slug is not null
  order by price desc
  limit 1;
  v_quantity := greatest(1, ceil(50000 / v_price)::integer);

  v_checkout := public.upsert_checkout_session(
    gen_random_uuid(),
    jsonb_build_object(
      'customer_phone', '3009990007',
      'customer_name', 'Cash Test',
      'delivery_address', 'Calle Efectivo 1, Medellín',
      'payment_method', 'efectivo',
      'items', jsonb_build_array(jsonb_build_object(
        'product_slug', v_slug,
        'quantity', v_quantity
      ))
    )
  );
  v_order := public.confirm_offline_checkout(
    (v_checkout->>'checkout_token')::uuid
  );
  perform public.confirm_offline_checkout(
    (v_checkout->>'checkout_token')::uuid
  );
  v_order_id := (v_order->>'order_id')::uuid;
  v_total := (v_order->>'total_amount')::numeric;

  select count(*) into v_count
  from sales.orders
  where id = v_order_id
    and status = 'recibido'
    and payment_status = 'pendiente'
    and payment_method = 'efectivo';
  if v_count <> 1 then
    raise exception 'cash_order_not_confirmed_once';
  end if;

  select count(*) into v_count
  from sales.payments
  where order_id = v_order_id
    and method = 'efectivo'
    and status = 'pendiente'
    and amount = v_total
    and transaction_id = 'manual-intent:' || v_order_id::text;
  if v_count <> 1 then
    raise exception 'cash_payment_intent_not_visible_to_erp';
  end if;

  perform sales.register_payment(
    v_order_id,
    v_total,
    'efectivo',
    'dashboard_manual_settlement',
    'manual-settlement:' || v_order_id::text
  );
  perform sales.register_payment(
    v_order_id,
    v_total,
    'efectivo',
    'dashboard_manual_settlement',
    'manual-settlement:' || v_order_id::text
  );

  select count(*) into v_count
  from sales.payments
  where order_id = v_order_id
    and method = 'efectivo'
    and status = 'pagado'
    and amount = v_total
    and transaction_id = 'manual-settlement:' || v_order_id::text;
  if v_count <> 1 then
    raise exception 'cash_payment_settlement_not_idempotent';
  end if;

  select count(*) into v_count
  from sales.payments
  where order_id = v_order_id
    and status = 'pendiente';
  if v_count <> 0 then
    raise exception 'settled_cash_kept_pending_payment_intent';
  end if;
end;
$$;

select 'checkout_cash_payment_intent_ok' as result;

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
