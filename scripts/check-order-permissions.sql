-- Read-only inspection. Run each SELECT separately in the Supabase SQL Editor.
-- This script reads metadata only and never selects customer order rows.

select relrowsecurity as rls_enabled
from pg_class
where oid = to_regclass('public.orders');

select
  role_name,
  has_table_privilege(role_name, 'public.orders', 'SELECT') as can_select,
  has_table_privilege(role_name, 'public.orders', 'INSERT') as can_insert,
  has_table_privilege(role_name, 'public.orders', 'UPDATE') as can_update,
  has_table_privilege(role_name, 'public.orders', 'DELETE') as can_delete,
  has_sequence_privilege(role_name, to_regclass('public.orders_order_number_seq'), 'USAGE') as can_use_order_sequence
from (values ('anon'), ('authenticated'), ('service_role')) as roles(role_name);

select policyname, roles, cmd, qual, with_check
from pg_policies
where schemaname = 'public' and tablename = 'orders';
