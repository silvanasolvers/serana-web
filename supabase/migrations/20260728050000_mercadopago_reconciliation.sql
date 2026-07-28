-- Give the server a narrowly scoped, service-role-only queue of stale
-- Mercado Pago attempts. The application uses this as a second recovery path
-- when the synchronous provider response or a webhook is lost.

create or replace function public.list_stale_mercadopago_attempts(
  p_limit integer default 25
)
returns jsonb
language sql
stable
security definer
set search_path = public, sales
as $$
  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'checkout_id', candidate.checkout_session_id,
        'attempt_key', candidate.attempt_key,
        'provider_payment_id', candidate.provider_payment_id,
        'status', candidate.status,
        'updated_at', candidate.updated_at
      )
      order by candidate.updated_at
    ),
    '[]'::jsonb
  )
  from (
    select
      pa.checkout_session_id,
      pa.attempt_key,
      pa.provider_payment_id,
      pa.status,
      pa.updated_at
    from sales.payment_attempts pa
    join sales.checkout_sessions cs
      on cs.id = pa.checkout_session_id
    where pa.provider = 'mercado_pago'
      and pa.status in ('processing', 'pending')
      and pa.updated_at <= now() - interval '90 seconds'
      and cs.payment_method = 'mercado_pago'
      and cs.order_id is null
    order by pa.updated_at
    limit greatest(1, least(coalesce(p_limit, 25), 100))
  ) candidate;
$$;

revoke all on function public.list_stale_mercadopago_attempts(integer)
  from public, anon, authenticated;
grant execute on function public.list_stale_mercadopago_attempts(integer)
  to service_role;

