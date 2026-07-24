-- Emergency authorization hardening for the operational order/payment surface.
--
-- Supabase grants privileges directly to anon/authenticated through default
-- privileges. Revoking only from PUBLIC therefore does not close an object.
-- Every private object below is revoked from each API role explicitly.

-- Keep the public PostgREST views usable by the dashboard, but filter them by
-- the Serana staff roles carried by the authenticated user's identity record.
-- These remain definer views intentionally: the dashboard only has access to
-- the public schema, while the predicate prevents customer accounts from
-- reading the operational schemas through the view owner.
create or replace view public.order_board_view
with (security_barrier = true)
as
select *
from ops_analytics.order_board_view
where
  identity.has_role('ADMIN')
  or identity.has_role('SUPERVISOR')
  or identity.has_role('COCINA')
  or identity.has_role('DESPACHO');

create or replace view public.accounting_orders_view
with (security_barrier = true)
as
select *
from ops_analytics.accounting_orders_view
where identity.has_role('ADMIN') or identity.has_role('SUPERVISOR');

create or replace view public.accounting_payments_view
with (security_barrier = true)
as
select *
from ops_analytics.accounting_payments_view
where identity.has_role('ADMIN') or identity.has_role('SUPERVISOR');

revoke all on
  public.order_board_view,
  public.accounting_orders_view,
  public.accounting_payments_view
from public, anon, authenticated;

grant select on
  public.order_board_view,
  public.accounting_orders_view,
  public.accounting_payments_view
to authenticated, service_role;

-- The private pass-through sources must not be an alternate API route.
revoke all on
  ops_analytics.order_board_view,
  ops_analytics.accounting_orders_view,
  ops_analytics.accounting_payments_view
from public, anon, authenticated;

grant select on
  ops_analytics.order_board_view,
  ops_analytics.accounting_orders_view,
  ops_analytics.accounting_payments_view
to service_role;

-- Staff-only wrapper: orders created from the ERP/dashboard.
create or replace function public.create_order(payload jsonb)
returns uuid
language plpgsql
security definer
set search_path = public, sales, crm, identity
as $$
begin
  if coalesce(auth.role(), '') <> 'service_role'
     and not (
       identity.has_role('ADMIN')
       or identity.has_role('SUPERVISOR')
     ) then
    raise exception 'staff_role_required'
      using errcode = '42501';
  end if;

  return sales.create_order(payload);
end;
$$;

-- Kitchen/order-state changes are available only to the roles that operate
-- the KDS or dispatch screens.
create or replace function public.advance_order_status(
  p_order_id uuid,
  p_to_status text,
  p_metadata jsonb default '{}'::jsonb
)
returns void
language plpgsql
security definer
set search_path = public, sales, identity
as $$
begin
  if coalesce(auth.role(), '') <> 'service_role'
     and not (
       identity.has_role('ADMIN')
       or identity.has_role('SUPERVISOR')
       or identity.has_role('COCINA')
       or identity.has_role('DESPACHO')
     ) then
    raise exception 'order_operator_role_required'
      using errcode = '42501';
  end if;

  perform sales.advance_order_status(p_order_id, p_to_status, p_metadata);
end;
$$;

-- Manual settlement is restricted to the roles that can operate dispatch or
-- supervise payments. Gateway settlement continues through service-role-only
-- checkout RPCs and does not use this wrapper.
create or replace function public.register_payment(
  p_order_id uuid,
  p_amount numeric,
  p_method text,
  p_reference text default null,
  p_transaction_id text default null
)
returns uuid
language plpgsql
security definer
set search_path = public, sales, identity
as $$
begin
  if coalesce(auth.role(), '') <> 'service_role'
     and not (
       identity.has_role('ADMIN')
       or identity.has_role('SUPERVISOR')
       or identity.has_role('DESPACHO')
     ) then
    raise exception 'payment_operator_role_required'
      using errcode = '42501';
  end if;

  return sales.register_payment(
    p_order_id,
    p_amount,
    p_method,
    p_reference,
    p_transaction_id
  );
end;
$$;

revoke all on function public.create_order(jsonb)
  from public, anon, authenticated;
revoke all on function public.advance_order_status(uuid, text, jsonb)
  from public, anon, authenticated;
revoke all on function public.register_payment(uuid, numeric, text, text, text)
  from public, anon, authenticated;

grant execute on function public.create_order(jsonb)
  to authenticated, service_role;
grant execute on function public.advance_order_status(uuid, text, jsonb)
  to authenticated, service_role;
grant execute on function public.register_payment(uuid, numeric, text, text, text)
  to authenticated, service_role;

-- Callers must enter through the role-checking public wrappers. The checkout
-- server's service-role functions invoke their own private workflow.
revoke all on function sales.create_order(jsonb)
  from public, anon, authenticated;
revoke all on function sales.advance_order_status(uuid, text, jsonb)
  from public, anon, authenticated;
revoke all on function sales.register_payment(uuid, numeric, text, text, text)
  from public, anon, authenticated;

grant execute on function sales.create_order(jsonb)
  to service_role;
grant execute on function sales.advance_order_status(uuid, text, jsonb)
  to service_role;
grant execute on function sales.register_payment(uuid, numeric, text, text, text)
  to service_role;

-- The legacy browser checkout creator is retired. Keep its definition only
-- until the broader legacy cleanup, but make it unreachable from every API
-- role now.
revoke all on function public.create_order_anon(jsonb)
  from public, anon, authenticated, service_role;

-- Remove both PUBLIC-inherited and direct anon access from every other private
-- dashboard RPC. The three intentionally public RPCs remain: capture_lead,
-- track_order, and validate_coupon.
do $$
declare
  v_function regprocedure;
begin
  for v_function in
    select p.oid::regprocedure
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.prokind = 'f'
      and p.proname not in (
        'capture_lead',
        'track_order',
        'validate_coupon'
      )
  loop
    execute format(
      'revoke execute on function %s from public, anon',
      v_function
    );
  end loop;
end;
$$;

-- Remove anonymous reads from private dashboard views. Public catalog,
-- checkout-price, and published-testimonial views remain intentionally public.
do $$
declare
  v_view regclass;
begin
  for v_view in
    select c.oid::regclass
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public'
      and c.relkind in ('v', 'm')
      and c.relname not in (
        'product_categories_view',
        'product_checkout_prices_view',
        'products_public_view',
        'testimonials_public_view'
      )
  loop
    execute format('revoke all on %s from public, anon', v_view);
  end loop;
end;
$$;
