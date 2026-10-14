-- Local test fixture only: reproduces the column types reported by the owner.
-- Contains no customer data. Do not run this file in production.
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default timezone('utc', now()),
  customer_name text not null,
  customer_phone text not null,
  delivery_info text,
  items jsonb not null,
  total_price numeric,
  status text not null default 'new',
  customer_email text,
  delivery_branch text,
  delivery_method text,
  payment_method text,
  delivery_city text,
  customer_lastname text,
  payment_details text,
  payment_status text default 'pending',
  comment text,
  notes text,
  user_id text,
  total_amount numeric,
  customer_first_name text,
  customer_name_full text,
  delivery_address text,
  tracking_number text
);
