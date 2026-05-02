-- ============================================================================
-- TAC Express — Seed data (idempotent)
-- ============================================================================

insert into public.hubs (code, name, city, state, country, pincode, address, is_active)
values
  ('IMP', 'Imphal Hub',     'Imphal',     'Manipur',         'IN', '795001', 'Tiddim Road, Imphal',                          true),
  ('DEL', 'Delhi Hub',      'New Delhi',  'Delhi',           'IN', '110037', 'Cargo Terminal, IGI Airport',                  true),
  ('BLR', 'Bengaluru Hub',  'Bengaluru',  'Karnataka',       'IN', '560300', 'Air Cargo Complex, Devanahalli',               true),
  ('BOM', 'Mumbai Hub',     'Mumbai',     'Maharashtra',     'IN', '400099', 'Air Cargo Complex, Sahar',                     true),
  ('GAU', 'Guwahati Hub',   'Guwahati',   'Assam',           'IN', '781015', 'LGBI Cargo Terminal',                          true),
  ('CCU', 'Kolkata Hub',    'Kolkata',    'West Bengal',     'IN', '700052', 'Cargo Complex, NSCBI Airport',                 true),
  ('MAA', 'Chennai Hub',    'Chennai',    'Tamil Nadu',      'IN', '600027', 'Cargo Complex, Meenambakkam',                  true),
  ('HYD', 'Hyderabad Hub',  'Hyderabad',  'Telangana',       'IN', '500409', 'Cargo Terminal, Shamshabad',                   true),
  ('AGT', 'Agartala Hub',   'Agartala',   'Tripura',         'IN', '799006', 'MBB Cargo Terminal',                           true),
  ('IXA', 'Aizawl Hub',     'Aizawl',     'Mizoram',         'IN', '796012', 'Lengpui Cargo Terminal',                       true)
on conflict (code) do nothing;

-- Default rate card (used when no customer-specific card matches)
insert into public.rate_cards (
  name, customer_id, origin_hub, dest_hub, service_level, transport_mode,
  base_rate, rate_per_kg, min_charge, fuel_surcharge_pct,
  handling_fee, docket_charge, packing_charge, insurance_pct, volumetric_divisor,
  is_active, effective_from
)
values
  ('Default — Standard Road',  null, null, null, 'standard', 'road', 50, 18, 100, 8, 25, 30, 0,  0.5, 5000, true, current_date),
  ('Default — Express Road',   null, null, null, 'express',  'road', 80, 28, 200, 8, 35, 30, 0,  0.5, 5000, true, current_date),
  ('Default — Priority Air',   null, null, null, 'priority', 'air', 250, 65, 500, 12, 50, 50, 0, 1.0, 6000, true, current_date),
  ('Default — Same Day Air',   null, null, null, 'same_day', 'air', 500, 95, 800, 15, 50, 50, 0, 1.0, 6000, true, current_date)
on conflict do nothing;
