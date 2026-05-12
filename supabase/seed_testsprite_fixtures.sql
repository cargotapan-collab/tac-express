-- Seed: TestSprite fixture data for 100% pass rate on the public-tracking suite
--
-- This is NOT a migration — run AFTER 20260512000001..03 are applied. It's
-- idempotent (ON CONFLICT DO NOTHING) and only seeds the rows TestSprite's
-- test plan expects to find:
--   * Shipment with AWB `TAC0123456789` (the synthetic AWB TC002/005/008/014
--     search for on /track)
--   * Tracking-event timeline on the existing TAC26051110025 + the new
--     TAC0123456789 (TC007/014 need event history to render)
--
-- Run via:
--   psql $DATABASE_URL -f supabase/seed_testsprite_fixtures.sql
-- or via Supabase SQL Editor.

-- ── 1. Sample customer (idempotent) ──────────────────────────────────────
insert into public.customers (id, name, phone, email, gstin, address_line1, city, state, zip)
values
  ('00000000-0000-0000-0000-000000000001',
   'TestSprite Demo Customer', '+91-9999000111', 'demo@testsprite.example',
   '07ABCDE1234F1Z5', '123 Test Park', 'New Delhi', 'Delhi', '110001')
on conflict (id) do nothing;

-- ── 2. Synthetic shipment that TestSprite tracks (idempotent) ────────────
-- Schema reminder: shipments has sender/receiver fields, weight columns,
-- origin_hub/dest_hub strings, status, awb_number unique.
insert into public.shipments (
  id, awb_number, status,
  sender_name, sender_phone, sender_address, sender_city, sender_state, sender_pincode,
  receiver_name, receiver_phone, receiver_address, receiver_city, receiver_state, receiver_pincode,
  origin_hub, dest_hub,
  pieces, dead_weight, volumetric_weight, chargeable_weight,
  payment_mode, service_level,
  created_at, updated_at
) values (
  '00000000-0000-0000-0000-000000aaaaaa',
  'TAC0123456789',
  'IN_TRANSIT',
  'Acme Industries', '+91-9000000001', '1 Acme Way', 'New Delhi', 'Delhi', '110001',
  'Bharat Traders', '+91-9000000002', '99 Trade Lane', 'Mumbai', 'Maharashtra', '400001',
  'NEW_DELHI', 'BOM',
  1, 2.50, 1.80, 2.50,
  'PAID', 'STANDARD',
  now() - interval '3 days', now()
) on conflict (awb_number) do nothing;

-- ── 3. Tracking events for the synthetic shipment ────────────────────────
-- Schema: tracking_events(id, shipment_id, awb_number, event_type, status_to,
--                         hub_code, occurred_at, recorded_by, notes)
insert into public.tracking_events
  (shipment_id, awb_number, event_type, status_to, hub_code, occurred_at)
select
  '00000000-0000-0000-0000-000000aaaaaa', 'TAC0123456789', e.event_type, e.status_to, e.hub_code, e.occurred_at
from (values
  ('CREATED'::text,           'CREATED'::text,           'NEW_DELHI'::text, now() - interval '3 days'),
  ('PICKUP_SCHEDULED',  'PICKUP_SCHEDULED',  'NEW_DELHI', now() - interval '2 days 18 hours'),
  ('PICKED_UP',         'PICKED_UP',         'NEW_DELHI', now() - interval '2 days 12 hours'),
  ('RECEIVED_AT_ORIGIN','RECEIVED_AT_ORIGIN','NEW_DELHI', now() - interval '2 days 6 hours'),
  ('IN_TRANSIT',        'IN_TRANSIT',        'NEW_DELHI', now() - interval '1 day 18 hours')
) as e(event_type, status_to, hub_code, occurred_at)
where not exists (
  select 1 from public.tracking_events te
  where te.awb_number = 'TAC0123456789' and te.event_type = e.event_type
);

-- ── 4. Tracking events for the operator-created shipment from screenshot
-- (TAC26051110025 — UUID 35aa7c27-7754-460a-8244-a61fb3cf0bab). Adds a
-- realistic event history so the shipment detail Tracking tab + public
-- /track flow render a timeline. Skipped if rows already exist.
insert into public.tracking_events
  (shipment_id, awb_number, event_type, status_to, hub_code, occurred_at)
select
  '35aa7c27-7754-460a-8244-a61fb3cf0bab', 'TAC26051110025', e.event_type, e.status_to, e.hub_code, e.occurred_at
from (values
  ('CREATED'::text, 'CREATED'::text, 'IMPHAL'::text, now() - interval '6 hours')
) as e(event_type, status_to, hub_code, occurred_at)
where exists (select 1 from public.shipments s where s.id = '35aa7c27-7754-460a-8244-a61fb3cf0bab')
  and not exists (
    select 1 from public.tracking_events te
    where te.shipment_id = '35aa7c27-7754-460a-8244-a61fb3cf0bab' and te.event_type = e.event_type
  );

-- ── 5. Verification ──────────────────────────────────────────────────────
do $$
declare
  v_hubs int;
  v_events int;
  v_payments_table boolean;
  v_rpc boolean;
begin
  select count(*) into v_hubs from public.hubs;
  select count(*) into v_events from public.tracking_events where awb_number = 'TAC0123456789';
  v_payments_table := to_regclass('public.invoice_payments') is not null;
  v_rpc := exists (select 1 from pg_proc where proname = 'record_invoice_payment');
  raise notice 'Seed verification: hubs=% events_on_TAC0123456789=% invoice_payments_table=% record_invoice_payment_rpc=%',
    v_hubs, v_events, v_payments_table, v_rpc;
end$$;
