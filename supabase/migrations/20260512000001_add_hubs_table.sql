-- Migration: add hubs master table (TestSprite TC011 unblock + manifest creation)
--
-- Context: existing shipments store `origin_hub` / `dest_hub` as plain text
-- ("IMPHAL", "NEW_DELHI", etc.). The manifest builder wizard depends on a
-- `useHubs()` query that selects from `public.hubs` — which never landed in
-- the deployed schema (despite being declared in 20260430000002_core_schema.sql).
-- Without this table:
--   * Manifest "+ New" wizard hub picker shows "No results"
--   * /management page can't enumerate or create hubs
--   * Fresh operators are blocked from building manifests
--
-- This migration is ADDITIVE — no existing data is touched. Seeded codes
-- match the strings the existing shipments + manifests already use, so
-- routing continues to work without backfill.

create table if not exists public.hubs (
  id          uuid primary key default gen_random_uuid(),
  code        text not null unique,
  name        text not null,
  city        text not null,
  state       text not null,
  country     text not null default 'IN',
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists idx_hubs_active on public.hubs(is_active) where is_active = true;
create index if not exists idx_hubs_city   on public.hubs(city);

comment on table public.hubs is 'Origin/destination hub master data referenced by manifests + shipments.';

-- RLS: authenticated read; SUPER_ADMIN write.
alter table public.hubs enable row level security;

drop policy if exists hubs_select_authenticated on public.hubs;
create policy hubs_select_authenticated on public.hubs
  for select using (auth.role() = 'authenticated');

drop policy if exists hubs_modify_super_admin on public.hubs;
create policy hubs_modify_super_admin on public.hubs
  for all using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'SUPER_ADMIN'
    )
  );

-- Seed hubs matching existing shipment/manifest codes.
insert into public.hubs (code, name, city, state) values
  ('IMPHAL',    'Imphal Hub',     'Imphal',    'Manipur'),
  ('NEW_DELHI', 'New Delhi Hub',  'New Delhi', 'Delhi'),
  ('BOM',       'Mumbai Hub',     'Mumbai',    'Maharashtra'),
  ('MAA',       'Chennai Hub',    'Chennai',   'Tamil Nadu'),
  ('BLR',       'Bangalore Hub',  'Bangalore', 'Karnataka'),
  ('CCU',       'Kolkata Hub',    'Kolkata',   'West Bengal'),
  ('HYD',       'Hyderabad Hub',  'Hyderabad', 'Telangana'),
  ('PNQ',       'Pune Hub',       'Pune',      'Maharashtra')
on conflict (code) do nothing;
