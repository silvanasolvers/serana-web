-- Consolidate payment/order operations around one database source of truth.
--
-- Decisions:
--   * sales.orders + Supabase Realtime is the ERP/dashboard delivery channel.
--   * integration.erp_order_outbox is reserved and receives no new events.
--   * manual settlements are capped at the unpaid balance and idempotent.
--   * order state and inventory consumption commit in the same transaction.
--   * a second distinct approved gateway payment is recorded as an incident,
--     never as a second payment/order.

create table if not exists sales.payment_reconciliation_incidents (
  id uuid primary key default gen_random_uuid(),
  checkout_session_id uuid references sales.checkout_sessions(id) on delete set null,
  order_id uuid references sales.orders(id) on delete set null,
  provider text not null,
  provider_payment_id text not null,
  reason text not null,
  status text not null default 'open'
    check (status in ('open', 'resolved', 'ignored')),
  provider_metadata jsonb not null default '{}'::jsonb,
  resolution_notes text,
  resolved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (provider, provider_payment_id)
);

alter table sales.payment_reconciliation_incidents enable row level security;
revoke all on sales.payment_reconciliation_incidents
  from public, anon, authenticated;
grant all on sales.payment_reconciliation_incidents to service_role;

create unique index if not exists uq_payments_mp_checkout_reference
  on sales.payments (reference)
  where gateway = 'mercado_pago'
    and status = 'pagado'
    and reference is not null;

comment on table integration.erp_order_outbox is
  'Reserved for a future controlled ERP worker. Disabled: sales.orders + Realtime is the current and only ERP/dashboard delivery channel.';

-- Signature compatibility is intentional. p_emit_erp_event is ignored because
-- sales.orders is now the only operational delivery source.
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
begin
  select * into v_session
  from sales.checkout_sessions
  where id = p_checkout_id
  for update;

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
      default_address = coalesce(
        excluded.default_address,
        crm.customers.default_address
      ),
      updated_at = now()
  returning id into v_customer_id;

  select id into v_source_id
  from sales.order_sources
  where code = v_session.source_code
  limit 1;

  if v_source_id is null then
    select id into v_source_id
    from sales.order_sources
    where code = 'web'
    limit 1;
  end if;

  insert into sales.orders (
    customer_id,
    source_id,
    status,
    type,
    payment_status,
    payment_method,
    total_amount,
    delivery_address_snapshot,
    station_code,
    coupon_code,
    discount_amount,
    confirmed_at
  ) values (
    v_customer_id,
    v_source_id,
    p_order_status,
    v_session.type,
    p_payment_status,
    v_session.payment_method,
    v_session.total_amount,
    v_session.delivery_address,
    v_session.station_code,
    v_session.coupon_code,
    v_session.discount_amount,
    case when p_order_status = 'recibido' then now() else null end
  )
  returning id into v_order_id;

  insert into sales.order_items (
    order_id,
    product_id,
    quantity,
    unit_price,
    customizations
  )
  select
    v_order_id,
    product_id,
    quantity,
    unit_price,
    customizations
  from sales.checkout_session_items
  where checkout_session_id = p_checkout_id;

  perform sales._consume_checkout_coupon(p_checkout_id, v_order_id);

  insert into sales.order_status_history (
    order_id,
    from_status,
    to_status,
    metadata
  ) values (
    v_order_id,
    null,
    p_order_status,
    jsonb_build_object(
      'source',
      'web_checkout_v2',
      'checkout_id',
      p_checkout_id,
      'erp_delivery',
      'sales_orders_realtime'
    )
  );

  update sales.checkout_sessions
  set order_id = v_order_id,
      status = case
        when p_payment_status = 'pagado' then 'paid'
        when p_order_status = 'esperando_pago' then 'awaiting_transfer'
        else 'confirmed'
      end,
      updated_at = now()
  where id = p_checkout_id;

  return v_order_id;
end;
$$;

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
  v_remaining numeric(12,2);
  v_amount_to_record numeric(12,2);
  v_order sales.orders%rowtype;
  v_new_payment_status text;
begin
  if p_amount is null or p_amount <= 0 then
    raise exception 'payment_amount_invalid';
  end if;

  select * into v_order
  from sales.orders
  where id = p_order_id
  for update;

  if v_order.id is null then raise exception 'order_not_found'; end if;

  if p_transaction_id like 'manual-settlement:%'
     and p_transaction_id <> 'manual-settlement:' || p_order_id::text then
    raise exception 'manual_settlement_key_mismatch';
  end if;

  if p_transaction_id is not null then
    select id, order_id into v_payment_id, v_existing_order_id
    from sales.payments
    where transaction_id = p_transaction_id
    limit 1;

    if v_payment_id is not null then
      if v_existing_order_id <> p_order_id then
        raise exception 'transaction_id_already_used';
      end if;
      return v_payment_id;
    end if;
  end if;

  select coalesce(sum(amount), 0)
  into v_total_paid
  from sales.payments
  where order_id = p_order_id
    and status = 'pagado';

  v_remaining := greatest(v_order.total_amount - v_total_paid, 0);

  -- An old dashboard or a concurrent operator may retry without an idempotency
  -- key. Once the ledger already covers the order, return its latest payment
  -- rather than inserting another row.
  if v_remaining <= 0 then
    select id into v_payment_id
    from sales.payments
    where order_id = p_order_id
      and status = 'pagado'
    order by recorded_at desc
    limit 1;

    if v_payment_id is null then
      raise exception 'order_marked_paid_without_payment';
    end if;

    update sales.orders
    set payment_status = 'pagado',
        status = case
          when status = 'esperando_pago' then 'recibido'
          else status
        end,
        confirmed_at = case
          when confirmed_at is null then now()
          else confirmed_at
        end
    where id = p_order_id;

    if v_order.status = 'esperando_pago' then
      insert into sales.order_status_history (
        order_id,
        from_status,
        to_status,
        metadata
      ) values (
        p_order_id,
        'esperando_pago',
        'recibido',
        jsonb_build_object(
          'reason',
          'payment_ledger_reconciled',
          'erp_delivery',
          'sales_orders_realtime'
        )
      );
    end if;

    return v_payment_id;
  end if;

  -- Do not let a duplicated/full-balance action overpay the order. Partial
  -- payments remain supported by passing an amount below the remaining value.
  v_amount_to_record := least(p_amount, v_remaining);

  insert into sales.payments (
    order_id,
    amount,
    method,
    status,
    reference,
    transaction_id,
    recorded_by,
    gateway
  ) values (
    p_order_id,
    v_amount_to_record,
    p_method,
    'pagado',
    p_reference,
    p_transaction_id,
    auth.uid(),
    case
      when p_method in ('mercado_pago', 'wompi', 'link_pago') then p_method
      else null
    end
  )
  on conflict (transaction_id) where transaction_id is not null do nothing
  returning id into v_payment_id;

  if v_payment_id is null then
    select id, order_id into v_payment_id, v_existing_order_id
    from sales.payments
    where transaction_id = p_transaction_id
    limit 1;

    if v_existing_order_id <> p_order_id then
      raise exception 'transaction_id_already_used';
    end if;
    return v_payment_id;
  end if;

  v_total_paid := v_total_paid + v_amount_to_record;
  v_new_payment_status := case
    when v_total_paid <= 0 then 'pendiente'
    when v_total_paid < v_order.total_amount then 'parcial'
    else 'pagado'
  end;

  update sales.orders
  set payment_status = v_new_payment_status,
      payment_method = coalesce(payment_method, p_method),
      status = case
        when v_new_payment_status = 'pagado'
          and status = 'esperando_pago' then 'recibido'
        else status
      end,
      confirmed_at = case
        when v_new_payment_status = 'pagado'
          and confirmed_at is null then now()
        else confirmed_at
      end
  where id = p_order_id;

  if v_new_payment_status = 'pagado'
     and v_order.status = 'esperando_pago' then
    insert into sales.order_status_history (
      order_id,
      from_status,
      to_status,
      metadata
    ) values (
      p_order_id,
      'esperando_pago',
      'recibido',
      jsonb_build_object(
        'reason',
        'payment_confirmed',
        'erp_delivery',
        'sales_orders_realtime'
      )
    );
  end if;

  return v_payment_id;
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
  v_existing_payment_id uuid;
  v_existing_transaction_id text;
  v_payment_id uuid;
begin
  if nullif(p_provider_payment_id, '') is null then
    raise exception 'provider_payment_id_required';
  end if;

  select * into v_session
  from sales.checkout_sessions
  where id = p_checkout_id
  for update;

  if v_session.id is null then raise exception 'checkout_not_found'; end if;
  if p_currency <> 'COP' then raise exception 'payment_currency_mismatch'; end if;
  if round(p_amount, 2) <> round(v_session.total_amount, 2) then
    raise exception 'payment_amount_mismatch';
  end if;
  if v_session.payment_method <> 'mercado_pago' then
    raise exception 'payment_method_mismatch';
  end if;

  select id, order_id
  into v_existing_payment_id, v_existing_order_id
  from sales.payments
  where transaction_id = p_provider_payment_id
  limit 1;

  if v_existing_payment_id is not null then
    if v_session.order_id is null
       or v_existing_order_id <> v_session.order_id then
      raise exception 'provider_payment_already_used';
    end if;
    return sales._checkout_result(v_session.id);
  end if;

  -- The checkout row lock serializes distinct gateway notifications. If one
  -- approved payment already owns this checkout/order, persist an incident and
  -- acknowledge the second approval without creating another ledger row.
  select p.id, p.order_id, p.transaction_id
  into
    v_existing_payment_id,
    v_existing_order_id,
    v_existing_transaction_id
  from sales.payments p
  where p.gateway = 'mercado_pago'
    and p.status = 'pagado'
    and (
      p.reference = p_checkout_id::text
      or (
        v_session.order_id is not null
        and p.order_id = v_session.order_id
      )
    )
  order by
    case when p.reference = p_checkout_id::text then 0 else 1 end,
    p.recorded_at
  limit 1;

  if v_existing_payment_id is not null then
    insert into sales.payment_reconciliation_incidents (
      checkout_session_id,
      order_id,
      provider,
      provider_payment_id,
      reason,
      provider_metadata
    ) values (
      v_session.id,
      v_existing_order_id,
      'mercado_pago',
      p_provider_payment_id,
      'duplicate_approved_payment',
      coalesce(p_provider_metadata, '{}'::jsonb)
        || jsonb_build_object(
          'existing_payment_id',
          v_existing_payment_id,
          'existing_transaction_id',
          v_existing_transaction_id
        )
    )
    on conflict (provider, provider_payment_id) do update
    set provider_metadata = excluded.provider_metadata,
        updated_at = now();

    update sales.payment_attempts
    set provider_payment_id = p_provider_payment_id,
        status = 'approved',
        status_detail = 'duplicate_approved_payment_requires_review',
        provider_metadata = coalesce(p_provider_metadata, '{}'::jsonb)
          || jsonb_build_object(
            'duplicate_payment',
            true,
            'existing_payment_id',
            v_existing_payment_id
          ),
        updated_at = now()
    where id = (
      select pa.id
      from sales.payment_attempts pa
      where pa.checkout_session_id = v_session.id
        and (
          p_attempt_key is null
          or pa.attempt_key = p_attempt_key
        )
        and (
          pa.provider_payment_id is null
          or pa.provider_payment_id = p_provider_payment_id
        )
      order by pa.created_at desc
      limit 1
    );

    return sales._checkout_result(v_session.id)
      || jsonb_build_object(
        'duplicate_payment',
        true,
        'duplicate_provider_payment_id',
        p_provider_payment_id,
        'existing_payment_id',
        v_existing_payment_id
      );
  end if;

  v_order_id := sales._create_order_from_checkout(
    v_session.id,
    'recibido',
    'pagado',
    false
  );

  insert into sales.payments (
    order_id,
    amount,
    method,
    status,
    reference,
    transaction_id,
    gateway,
    gateway_metadata
  ) values (
    v_order_id,
    p_amount,
    'mercado_pago',
    'pagado',
    p_checkout_id::text,
    p_provider_payment_id,
    'mercado_pago',
    coalesce(p_provider_metadata, '{}'::jsonb)
  )
  on conflict (transaction_id) where transaction_id is not null do nothing
  returning id into v_payment_id;

  if v_payment_id is null then
    select id, order_id
    into v_payment_id, v_existing_order_id
    from sales.payments
    where transaction_id = p_provider_payment_id
    limit 1;

    if v_existing_order_id <> v_order_id then
      raise exception 'provider_payment_already_used';
    end if;
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
      and (
        p_attempt_key is null
        or pa.attempt_key = p_attempt_key
      )
    order by pa.created_at desc
    limit 1
  );

  update sales.checkout_sessions
  set status = 'paid',
      updated_at = now()
  where id = v_session.id;

  return sales._checkout_result(v_session.id)
    || jsonb_build_object('duplicate_payment', false);
end;
$$;

create or replace function sales.advance_order_status(
  p_order_id uuid,
  p_to_status text,
  p_metadata jsonb default '{}'::jsonb
)
returns void
language plpgsql
security definer
set search_path = public, sales, inventory, identity
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

  if p_to_status in ('en_preparacion', 'listo', 'entregado')
     and v_source_code = 'web'
     and v_order.payment_method in ('mercado_pago', 'transferencia')
     and v_order.payment_status <> 'pagado' then
    raise exception 'payment_required_before_preparation';
  end if;

  if v_order.status = p_to_status then
    if p_to_status in ('en_preparacion', 'listo', 'entregado') then
      perform inventory.consume_ingredients_for_order(
        p_order_id,
        coalesce(p_metadata, '{}'::jsonb)
          || jsonb_build_object(
            'status_trigger',
            p_to_status,
            'idempotent_replay',
            true
          )
      );
    end if;
    return;
  end if;

  if not (
    (
      v_order.status = 'esperando_pago'
      and p_to_status = 'cancelado'
    )
    or (
      v_order.status = 'recibido'
      and p_to_status in ('en_preparacion', 'cancelado')
    )
    or (
      v_order.status = 'en_preparacion'
      and p_to_status in ('listo', 'cancelado')
    )
    or (
      v_order.status = 'listo'
      and p_to_status in ('entregado', 'cancelado')
    )
  ) then
    raise exception
      'Invalid order status transition: % -> %',
      v_order.status,
      p_to_status;
  end if;

  update sales.orders
  set status = p_to_status,
      ready_at = case
        when p_to_status = 'listo' then now()
        else ready_at
      end,
      delivered_at = case
        when p_to_status = 'entregado' then now()
        else delivered_at
      end,
      cancelled_at = case
        when p_to_status = 'cancelado' then now()
        else cancelled_at
      end
  where id = p_order_id;

  insert into sales.order_status_history (
    order_id,
    from_status,
    to_status,
    changed_by,
    metadata
  ) values (
    p_order_id,
    v_order.status,
    p_to_status,
    auth.uid(),
    coalesce(p_metadata, '{}'::jsonb)
  );

  if p_to_status in ('en_preparacion', 'listo', 'entregado') then
    perform inventory.consume_ingredients_for_order(
      p_order_id,
      coalesce(p_metadata, '{}'::jsonb)
        || jsonb_build_object('status_trigger', p_to_status)
    );
  end if;
end;
$$;

-- Preserve the permissions established by the emergency hardening migration.
revoke all on function sales._create_order_from_checkout(uuid, text, text, boolean)
  from public, anon, authenticated;
revoke all on function sales.register_payment(uuid, numeric, text, text, text)
  from public, anon, authenticated;
revoke all on function sales.advance_order_status(uuid, text, jsonb)
  from public, anon, authenticated;
revoke all on function public.finalize_checkout_payment(
  uuid,
  uuid,
  text,
  numeric,
  text,
  jsonb
) from public, anon, authenticated;

grant execute on function sales._create_order_from_checkout(
  uuid,
  text,
  text,
  boolean
) to service_role;
grant execute on function sales.register_payment(uuid, numeric, text, text, text)
  to service_role;
grant execute on function sales.advance_order_status(uuid, text, jsonb)
  to service_role;
grant execute on function public.finalize_checkout_payment(
  uuid,
  uuid,
  text,
  numeric,
  text,
  jsonb
) to service_role;
