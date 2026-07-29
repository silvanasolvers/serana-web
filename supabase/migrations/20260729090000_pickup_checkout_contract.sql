-- Preserve the customer's real delivery address when a web order is collected
-- at Serana. The checkout keeps the store address as the order snapshot so the
-- ERP can show the pickup point, but that operational snapshot must never
-- become the customer's default/home address.

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
    case
      when v_session.type = 'domicilio' then v_session.delivery_address
      else null
    end
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

comment on function sales._create_order_from_checkout(uuid, text, text, boolean) is
  'Creates one operational order from checkout. Pickup/store snapshots remain on the order and never overwrite crm.customers.default_address.';
