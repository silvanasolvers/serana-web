-- Manual bank transfers must be visible in the ERP order board immediately.
--
-- Keep the payment and checkout pending, but place the operational order in
-- "recibido". sales.advance_order_status still blocks web transfer orders from
-- entering preparation until sales.register_payment marks them as paid.

create or replace function public.confirm_offline_checkout(
  p_checkout_token uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public, sales
as $$
declare
  v_session sales.checkout_sessions%rowtype;
  v_order_id uuid;
  v_promoted_order_id uuid;
begin
  select *
  into v_session
  from sales.checkout_sessions
  where public_token = p_checkout_token
  for update;

  if v_session.id is null then
    raise exception 'checkout_not_found';
  end if;

  if v_session.payment_method not in ('efectivo', 'transferencia') then
    raise exception 'offline_checkout_requires_cash_or_transfer';
  end if;

  if v_session.order_id is not null then
    if v_session.payment_method = 'transferencia' then
      update sales.orders
      set status = 'recibido',
          confirmed_at = coalesce(confirmed_at, now())
      where id = v_session.order_id
        and status = 'esperando_pago'
      returning id into v_promoted_order_id;

      if v_promoted_order_id is not null then
        insert into sales.order_status_history (
          order_id,
          from_status,
          to_status,
          metadata
        ) values (
          v_promoted_order_id,
          'esperando_pago',
          'recibido',
          jsonb_build_object(
            'reason',
            'manual_transfer_visible_in_erp',
            'payment_status',
            'pendiente'
          )
        );
      end if;

      update sales.checkout_sessions
      set status = case
            when status = 'paid' then status
            else 'awaiting_transfer'
          end,
          updated_at = now()
      where id = v_session.id;
    end if;

    return sales._checkout_result(v_session.id);
  end if;

  v_order_id := sales._create_order_from_checkout(
    v_session.id,
    'recibido',
    'pendiente',
    false
  );

  if v_session.payment_method = 'transferencia' then
    update sales.checkout_sessions
    set status = 'awaiting_transfer',
        updated_at = now()
    where id = v_session.id;
  end if;

  return sales._checkout_result(v_session.id);
end;
$$;

-- Repair unresolved transfer orders already created by the current checkout.
with promoted as (
  update sales.orders o
  set status = 'recibido',
      confirmed_at = coalesce(o.confirmed_at, now())
  where o.status = 'esperando_pago'
    and o.payment_status <> 'pagado'
    and o.payment_method = 'transferencia'
    and exists (
      select 1
      from sales.checkout_sessions cs
      where cs.order_id = o.id
        and cs.payment_method = 'transferencia'
    )
  returning o.id
)
insert into sales.order_status_history (
  order_id,
  from_status,
  to_status,
  metadata
)
select
  id,
  'esperando_pago',
  'recibido',
  jsonb_build_object(
    'reason',
    'manual_transfer_visible_in_erp_backfill',
    'payment_status',
    'pendiente'
  )
from promoted;

update sales.checkout_sessions cs
set status = 'awaiting_transfer',
    updated_at = now()
where cs.payment_method = 'transferencia'
  and cs.order_id is not null
  and cs.status <> 'paid'
  and exists (
    select 1
    from sales.orders o
    where o.id = cs.order_id
      and o.payment_status <> 'pagado'
  );

revoke all on function public.confirm_offline_checkout(uuid)
  from public, anon, authenticated;
grant execute on function public.confirm_offline_checkout(uuid)
  to service_role;
