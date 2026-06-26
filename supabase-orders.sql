create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
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
