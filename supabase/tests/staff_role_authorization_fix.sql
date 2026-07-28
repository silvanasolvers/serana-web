-- Regression coverage for 20260728034000_staff_role_authorization_fix.sql.
-- This test intentionally changes the active PostgreSQL role: setting only
-- JWT GUCs while remaining postgres would not reproduce PostgREST permissions.

begin;

do $$
declare
  v_client_id uuid;
  v_admin_id uuid;
begin
  select ur.user_id
  into v_client_id
  from identity.user_roles ur
  join identity.roles r on r.id = ur.role_id
  where r.code = 'CLIENTE'
  limit 1;

  select ur.user_id
  into v_admin_id
  from identity.user_roles ur
  join identity.roles r on r.id = ur.role_id
  where r.code = 'ADMIN'
  limit 1;

  if v_client_id is null or v_admin_id is null then
    raise exception 'staff_role_authorization_test_requires_admin_and_client';
  end if;

  perform set_config('test.client_id', v_client_id::text, true);
  perform set_config('test.admin_id', v_admin_id::text, true);
end;
$$;

select set_config(
  'request.jwt.claims',
  json_build_object(
    'sub', current_setting('test.client_id'),
    'role', 'authenticated'
  )::text,
  true
);

set local role authenticated;

do $$
declare
  v_count integer;
begin
  select count(*) into v_count
  from public.order_board_view;

  if v_count <> 0 then
    raise exception 'customer_account_can_read_order_board';
  end if;
end;
$$;

reset role;

select set_config(
  'request.jwt.claims',
  json_build_object(
    'sub', current_setting('test.admin_id'),
    'role', 'authenticated'
  )::text,
  true
);

set local role authenticated;

do $$
declare
  v_count integer;
begin
  select count(*) into v_count
  from public.order_board_view;

  if v_count = 0 then
    raise exception 'admin_cannot_read_order_board';
  end if;
end;
$$;

reset role;
rollback;

select 'staff_role_authorization_fix_ok' as result;
