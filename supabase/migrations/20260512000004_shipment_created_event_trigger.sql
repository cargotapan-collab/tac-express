-- Migration: auto-create CREATED tracking event on shipment insert + backfill
--
-- Per ADR-004: shipment.status is event-derived from public.tracking_events.
-- Every shipment must carry at least one row in tracking_events so the
-- detail-page Tracking tab + public /track render a timeline. Today
-- createShipment() only inserts the shipment row — leaving zero events.
-- That breaks TC007 (TestSprite: "NO EVENTS · No tracking events yet")
-- and silently violates the ADR invariant for every existing shipment.
--
-- This migration:
--   1. Installs an AFTER INSERT trigger on public.shipments that emits a
--      canonical CREATED event into public.tracking_events.
--   2. Backfills CREATED events for every existing shipment that doesn't
--      already have one (idempotent — WHERE NOT EXISTS guard).
--
-- ADDITIVE: existing tracking_events are not touched. The trigger fires
-- only on future inserts.

create or replace function public.shipment_emit_created_event()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Defensive: only emit if the row doesn't already have a CREATED event
  -- (e.g. bulk-import paths that insert their own canonical event).
  if not exists (
    select 1 from public.tracking_events
    where awb_number = new.awb_number and status = 'CREATED'
  ) then
    insert into public.tracking_events
      (awb_number, status, description, location, hub_code, source, staff_id, created_at)
    values (
      new.awb_number,
      'CREATED',
      'Shipment created',
      coalesce(new.origin_hub, 'UNKNOWN'),
      coalesce(new.origin_hub, 'UNKNOWN'),
      'SYSTEM',
      new.created_by,
      coalesce(new.created_at, now())
    );
  end if;
  return new;
end;
$$;

comment on function public.shipment_emit_created_event is
  'ADR-004 invariant: every shipment row emits a canonical CREATED tracking event.';

drop trigger if exists trg_shipment_created_event on public.shipments;
create trigger trg_shipment_created_event
  after insert on public.shipments
  for each row
  execute function public.shipment_emit_created_event();

-- Backfill: every existing shipment without a CREATED event gets one,
-- timestamped to its created_at so the timeline reads correctly.
insert into public.tracking_events
  (awb_number, status, description, location, hub_code, source, staff_id, created_at)
select
  s.awb_number,
  'CREATED',
  'Shipment created',
  coalesce(s.origin_hub, 'UNKNOWN'),
  coalesce(s.origin_hub, 'UNKNOWN'),
  'SYSTEM',
  s.created_by,
  s.created_at
from public.shipments s
where not exists (
  select 1 from public.tracking_events te
  where te.awb_number = s.awb_number and te.status = 'CREATED'
);
