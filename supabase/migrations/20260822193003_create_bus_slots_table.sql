/*
# Create bus_slots table for SST Transport Admin

1. New Tables
- `bus_slots`
  - `id` (uuid, primary key, auto-generated)
  - `hostel` (text, not null) — which hostel the bus serves: "Uni 1" or "Uni 2"
  - `direction` (text, not null) — "Hostel to College" or "College to Hostel"
  - `departure_time` (text, not null) — 24-hour HH:MM format time string
  - `status` (text, not null, default "On Time") — one of "On Time", "Delayed 10m", "Delayed 20m", "Cancelled"
  - `created_at` (timestamptz, default now())
2. Security
- Enable RLS on `bus_slots`.
- Single-tenant admin app with no sign-in: allow anon + authenticated full CRUD
  so the anon-key frontend can read and write bus slot data.
*/

CREATE TABLE IF NOT EXISTS bus_slots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hostel text NOT NULL,
  direction text NOT NULL,
  departure_time text NOT NULL,
  status text NOT NULL DEFAULT 'On Time',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE bus_slots ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_bus_slots" ON bus_slots;
CREATE POLICY "anon_select_bus_slots" ON bus_slots FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_bus_slots" ON bus_slots;
CREATE POLICY "anon_insert_bus_slots" ON bus_slots FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_bus_slots" ON bus_slots;
CREATE POLICY "anon_update_bus_slots" ON bus_slots FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_bus_slots" ON bus_slots;
CREATE POLICY "anon_delete_bus_slots" ON bus_slots FOR DELETE
  TO anon, authenticated USING (true);
