-- Read-only metadata check. No customer rows are selected or changed.
-- At least one row must report guarantees_unique_id = true before deployment.
select
  i.indexrelid::regclass::text as index_name,
  i.indisprimary as is_primary_key,
  pg_get_indexdef(i.indexrelid) as definition,
  (
    i.indisunique and i.indisvalid and i.indisready
    and i.indnkeyatts = 1
    and i.indexprs is null and i.indpred is null
    and i.indkey[0] = a.attnum
  ) as guarantees_unique_id
from pg_index i
join pg_attribute a on a.attrelid = i.indrelid and a.attname = 'id'
where i.indrelid = to_regclass('public.orders') and i.indisunique;
