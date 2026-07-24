-- Run after 20260724163000_emergency_permissions_hardening.sql inside a
-- transaction. No order or payment is created by these checks.

do $$
begin
  if has_table_privilege('anon', 'public.order_board_view', 'select') then
    raise exception 'anon_can_read_order_board';
  end if;
  if has_table_privilege('anon', 'public.accounting_orders_view', 'select') then
    raise exception 'anon_can_read_accounting_orders';
  end if;
  if has_table_privilege('anon', 'public.accounting_payments_view', 'select') then
    raise exception 'anon_can_read_accounting_payments';
  end if;

  if has_function_privilege(
    'anon',
    'public.create_order(jsonb)',
    'execute'
  ) then
    raise exception 'anon_can_create_operational_order';
  end if;
  if has_function_privilege(
    'anon',
    'public.advance_order_status(uuid,text,jsonb)',
    'execute'
  ) then
    raise exception 'anon_can_advance_order';
  end if;
  if has_function_privilege(
    'anon',
    'public.register_payment(uuid,numeric,text,text,text)',
    'execute'
  ) then
    raise exception 'anon_can_register_payment';
  end if;
  if has_function_privilege(
    'anon',
    'public.create_order_anon(jsonb)',
    'execute'
  ) then
    raise exception 'legacy_order_creator_is_public';
  end if;

  if not has_table_privilege('anon', 'public.products_public_view', 'select') then
    raise exception 'public_catalog_was_closed';
  end if;
  if not has_table_privilege(
    'anon',
    'public.product_checkout_prices_view',
    'select'
  ) then
    raise exception 'public_checkout_prices_were_closed';
  end if;
  if not has_function_privilege(
    'anon',
    'public.validate_coupon(text,numeric)',
    'execute'
  ) then
    raise exception 'public_coupon_validation_was_closed';
  end if;
end;
$$;

do $$
declare
  v_client_id uuid;
  v_admin_id uuid;
  v_count integer;
begin
  select ur.user_id into v_client_id
  from identity.user_roles ur
  join identity.roles r on r.id = ur.role_id
  where r.code = 'CLIENTE'
  limit 1;

  if v_client_id is not null then
    perform set_config('request.jwt.claim.sub', v_client_id::text, true);
    perform set_config('request.jwt.claim.role', 'authenticated', true);

    select count(*) into v_count from public.order_board_view;
    if v_count <> 0 then
      raise exception 'customer_account_can_read_order_board';
    end if;

    begin
      perform public.register_payment(
        '00000000-0000-4000-8000-000000000000'::uuid,
        1,
        'transferencia',
        null,
        null
      );
      raise exception 'customer_account_registered_payment';
    exception
      when insufficient_privilege then
        null;
    end;
  end if;

  select ur.user_id into v_admin_id
  from identity.user_roles ur
  join identity.roles r on r.id = ur.role_id
  where r.code = 'ADMIN'
  limit 1;

  if v_admin_id is not null then
    perform set_config('request.jwt.claim.sub', v_admin_id::text, true);
    perform set_config('request.jwt.claim.role', 'authenticated', true);

    select count(*) into v_count from public.order_board_view;
    if exists (select 1 from ops_analytics.order_board_view) and v_count = 0 then
      raise exception 'admin_cannot_read_order_board';
    end if;
  end if;
end;
$$;

select 'emergency_permissions_hardening_ok' as result;
