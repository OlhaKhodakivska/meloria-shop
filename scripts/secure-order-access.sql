-- Targeted fix for public.orders only. This changes access permissions, not order data.
-- The existing deployed API may stop accepting orders until redeployed with its server secret.
-- Run this entire transaction in the Supabase SQL Editor after reviewing the impact.

begin;

alter table public.orders enable row level security;
revoke all privileges on table public.orders from anon, authenticated, public;
grant select, insert on table public.orders to service_role;

drop policy if exists "Anyone can insert orders" on public.orders;
drop policy if exists "Allow public insert to orders" on public.orders;
drop policy if exists "Customers can create orders" on public.orders;

commit;
