-- Restore staff access to the operational views after private-schema
-- permissions were hardened.
--
-- public.order_board_view and the accounting views authorize each request
-- through identity.has_role().  The helper used to be SECURITY INVOKER, so
-- PostgreSQL evaluated its private-table reads as the authenticated API role.
-- Once direct access to identity.* was correctly revoked, every staff query
-- failed with `permission denied for schema identity`.
--
-- Keep identity tables private and execute only this narrow, self-scoped
-- predicate as its owner. The function can answer only whether auth.uid() has
-- the requested role; callers cannot supply another user id.
create or replace function identity.has_role(role_code text)
returns boolean
language sql
stable
security definer
set search_path = pg_catalog, identity
as $$
  select exists (
    select 1
    from identity.user_roles ur
    join identity.roles r on r.id = ur.role_id
    where ur.user_id = auth.uid()
      and r.code = role_code
  );
$$;

revoke all on function identity.has_role(text)
  from public, anon, authenticated;

grant execute on function identity.has_role(text)
  to authenticated, service_role;
