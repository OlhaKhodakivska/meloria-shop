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

alter table public.orders enable row level security;

create policy "Customers can create orders"
on public.orders
for insert
to anon, authenticated
with check (true);

create policy "No public order reads"
on public.orders
for select
to anon, authenticated
using (false);
