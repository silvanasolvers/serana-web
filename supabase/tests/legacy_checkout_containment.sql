-- Run after migrations 001 and 002 inside BEGIN/ROLLBACK.
do $$
declare
  v_slug text;
  v_variant_label text;
  v_price numeric;
  v_quantity integer;
  v_result jsonb;
  v_order_id uuid;
  v_status text;
  v_payment_status text;
  v_total numeric;
  v_count integer;
begin
  select product_slug, variant_label, price
  into v_slug, v_variant_label, v_price
  from public.product_checkout_prices_view
  where variant_label is not null and price > 0
  order by price desc limit 1;
  if v_slug is null then raise exception 'test_requires_variant_checkout_price'; end if;
  v_quantity := greatest(1, ceil(50000 / v_price)::integer);

  v_result := public.create_order_anon(jsonb_build_object(
    'customer_phone', '3009990005',
    'customer_name', 'Legacy MP Test',
    'delivery_address', 'Calle Legacy 1',
    'payment_method', 'mercado_pago',
    'payment_status', 'pagado',
    'status', 'recibido',
    'source_code', 'presencial',
    'station_code', 'COCINA',
    'items', jsonb_build_array(jsonb_build_object(
      'product_slug', v_slug,
      'variant_label', v_variant_label,
      'quantity', v_quantity
    ))
  ));
  v_order_id := (v_result->>'order_id')::uuid;
  v_total := (v_result->>'total_amount')::numeric;
  select status, payment_status into v_status, v_payment_status
  from sales.orders where id = v_order_id;
  if v_status <> 'esperando_pago' or v_payment_status <> 'pendiente' then
    raise exception 'legacy_mp_was_operational_before_payment';
  end if;
  if v_total <> (v_price * v_quantity) + 12500 then
    raise exception 'legacy_delivery_fee_missing';
  end if;
  select count(*) into v_count from integration.erp_order_outbox where aggregate_id = v_order_id;
  if v_count <> 0 then raise exception 'legacy_mp_emitted_erp_before_payment'; end if;

  perform public.finalize_legacy_mercadopago_payment(
    v_order_id, 'legacy-mp-001', v_total, 'COP', '{"source":"test"}'::jsonb
  );
  perform public.finalize_legacy_mercadopago_payment(
    v_order_id, 'legacy-mp-001', v_total, 'COP', '{"source":"replay"}'::jsonb
  );
  select status, payment_status into v_status, v_payment_status
  from sales.orders where id = v_order_id;
  if v_status <> 'recibido' or v_payment_status <> 'pagado' then
    raise exception 'legacy_mp_not_promoted_after_payment';
  end if;
  select count(*) into v_count from integration.erp_order_outbox where aggregate_id = v_order_id;
  if v_count <> 1 then raise exception 'legacy_mp_expected_one_erp_event'; end if;
  select count(*) into v_count from sales.payments
  where order_id = v_order_id and transaction_id = 'legacy-mp-001';
  if v_count <> 1 then raise exception 'legacy_mp_payment_not_idempotent'; end if;
end;
$$;

select 'legacy_checkout_containment_ok' as result;
