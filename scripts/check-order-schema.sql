-- Read-only: inspect the actual order columns before preparing a migration.
-- Does not read customer order rows or change the database.
select
  column_name,
  data_type,
  udt_name,
  is_nullable,
  column_default,
  is_identity
from information_schema.columns
where table_schema = 'public' and table_name = 'orders'
order by ordinal_position;
