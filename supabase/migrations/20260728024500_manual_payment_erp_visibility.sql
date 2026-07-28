-- Make cash and bank-transfer payment intentions visible to the ERP as soon as
-- the order is confirmed, without treating them as settled.
--
-- The pending row is the ERP-facing manual payment intention. When staff
-- registers money against the order, it is reduced to the remaining balance or
-- removed after full settlement. The paid ledger therefore remains the source
-- of truth and retries cannot overstate the collected amount.

create or replace function sales._sync_manual_payment_intent()
returns trigger
language plpgsql
security definer
set search_path = public, sales
as $$
declare
  v_paid numeric(12,2);
  v_remaining numeric(12,2);
begin
  if new.payment_method not in ('efectivo', 'transferencia') then
    return new;
  end if;

  if new.status = 'cancelado' then
    update sales.payments
    set status = 'cancelado'
    where order_id = new.id
      and status = 'pendiente'
      and transaction_id = 'manual-intent:' || new.id::text;
    return new;
  end if;

  if new.payment_status = 'pagado' then
    delete from sales.payments
    where order_id = new.id
      and status = 'pendiente'
      and transaction_id = 'manual-intent:' || new.id::text;
    return new;
  end if;

  select coalesce(sum(amount), 0)
  into v_paid
  from sales.payments
  where order_id = new.id
    and status = 'pagado';

  v_remaining := greatest(new.total_amount - v_paid, 0);
  if v_remaining <= 0 then
    delete from sales.payments
    where order_id = new.id
      and status = 'pendiente'
      and transaction_id = 'manual-intent:' || new.id::text;
    return new;
  end if;

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
    new.id,
    v_remaining,
    new.payment_method,
    'pendiente',
    'manual_payment_intent',
    'manual-intent:' || new.id::text,
    null,
    jsonb_build_object(
      'source',
      'order_creation',
      'erp_visibility',
      true
    )
  )
  on conflict (transaction_id) where transaction_id is not null
  do update
  set amount = excluded.amount,
      method = excluded.method,
      status = 'pendiente',
      reference = excluded.reference,
      gateway = null,
      gateway_metadata = excluded.gateway_metadata;

  return new;
end;
$$;

drop trigger if exists trg_sync_manual_payment_intent on sales.orders;
create trigger trg_sync_manual_payment_intent
after insert or update of status, payment_status, payment_method, total_amount
on sales.orders
for each row
execute function sales._sync_manual_payment_intent();

create or replace function sales._reconcile_manual_payment_intent()
returns trigger
language plpgsql
security definer
set search_path = public, sales
as $$
declare
  v_order sales.orders%rowtype;
  v_paid numeric(12,2);
  v_remaining numeric(12,2);
begin
  if new.status <> 'pagado'
     or new.transaction_id like 'manual-intent:%' then
    return new;
  end if;

  select *
  into v_order
  from sales.orders
  where id = new.order_id;

  if v_order.id is null
     or v_order.payment_method not in ('efectivo', 'transferencia') then
    return new;
  end if;

  select coalesce(sum(amount), 0)
  into v_paid
  from sales.payments
  where order_id = new.order_id
    and status = 'pagado';

  v_remaining := greatest(v_order.total_amount - v_paid, 0);
  if v_remaining <= 0 then
    delete from sales.payments
    where order_id = new.order_id
      and status = 'pendiente'
      and transaction_id = 'manual-intent:' || new.order_id::text;
  else
    update sales.payments
    set amount = v_remaining,
        method = v_order.payment_method
    where order_id = new.order_id
      and status = 'pendiente'
      and transaction_id = 'manual-intent:' || new.order_id::text;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_reconcile_manual_payment_intent on sales.payments;
create trigger trg_reconcile_manual_payment_intent
after insert on sales.payments
for each row
execute function sales._reconcile_manual_payment_intent();

-- Repair only unresolved manual orders created by the current web checkout.
-- Historical ERP orders outside this flow are deliberately left untouched.
insert into sales.payments (
  order_id,
  amount,
  method,
  status,
  reference,
  transaction_id,
  gateway,
  gateway_metadata
)
select
  o.id,
  greatest(
    o.total_amount - coalesce((
      select sum(p.amount)
      from sales.payments p
      where p.order_id = o.id
        and p.status = 'pagado'
    ), 0),
    0
  ),
  o.payment_method,
  'pendiente',
  'manual_payment_intent',
  'manual-intent:' || o.id::text,
  null,
  jsonb_build_object(
    'source',
    'web_checkout_backfill',
    'erp_visibility',
    true
  )
from sales.orders o
where o.payment_method in ('efectivo', 'transferencia')
  and o.payment_status <> 'pagado'
  and o.status <> 'cancelado'
  and exists (
    select 1
    from sales.checkout_sessions cs
    where cs.order_id = o.id
      and cs.payment_method in ('efectivo', 'transferencia')
  )
  and not exists (
    select 1
    from sales.payments p
    where p.order_id = o.id
      and p.transaction_id = 'manual-intent:' || o.id::text
  )
  and greatest(
    o.total_amount - coalesce((
      select sum(p.amount)
      from sales.payments p
      where p.order_id = o.id
        and p.status = 'pagado'
    ), 0),
    0
  ) > 0
on conflict (transaction_id) where transaction_id is not null do nothing;

revoke all on function sales._sync_manual_payment_intent()
  from public, anon, authenticated;
revoke all on function sales._reconcile_manual_payment_intent()
  from public, anon, authenticated;
grant execute on function sales._sync_manual_payment_intent()
  to service_role;
grant execute on function sales._reconcile_manual_payment_intent()
  to service_role;
