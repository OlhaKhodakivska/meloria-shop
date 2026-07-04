create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number bigint,
  created_at timestamptz not null default now(),
  customer_name text not null,
  customer_email text not null,
  customer_phone text not null,
  delivery_method text not null,
  delivery_city text not null,
  delivery_branch text not null,
  payment_method text not null,
  payment_status text not null default 'awaiting_prepayment',
  payment_details jsonb not null default '{}'::jsonb,
  comment text,
  items jsonb not null,
  total_amount numeric(12, 2) not null,
  status text not null default 'new'
);

alter table public.orders
  add column if not exists order_number bigint,
  add column if not exists customer_name text,
  add column if not exists customer_email text,
  add column if not exists customer_phone text,
  add column if not exists delivery_method text,
  add column if not exists delivery_city text,
  add column if not exists delivery_branch text,
  add column if not exists payment_method text,
  add column if not exists payment_status text not null default 'awaiting_prepayment',
  add column if not exists payment_details jsonb not null default '{}'::jsonb,
  add column if not exists comment text,
  add column if not exists items jsonb,
  add column if not exists total_amount numeric(12, 2),
  add column if not exists status text not null default 'new';

create sequence if not exists public.orders_order_number_seq start with 1 increment by 1;

with numbered_orders as (
  select id, row_number() over (order by created_at, id)::bigint as number
  from public.orders
  where order_number is null
)
update public.orders orders
set order_number = numbered_orders.number
from numbered_orders
where orders.id = numbered_orders.id;

select setval(
  'public.orders_order_number_seq',
  greatest(coalesce((select max(order_number) from public.orders), 0) + 1, 1),
  false
);

alter table public.orders
  alter column order_number set default nextval('public.orders_order_number_seq'),
  alter column order_number set not null;

create unique index if not exists orders_order_number_key on public.orders (order_number);

alter table public.orders enable row level security;

notify pgrst, 'reload schema';

drop policy if exists "Customers can create orders" on public.orders;

create policy "Customers can create orders"
on public.orders
for insert
to anon, authenticated
with check (true);

drop policy if exists "No public order reads" on public.orders;

create policy "No public order reads"
on public.orders
for select
to anon, authenticated
using (false);
