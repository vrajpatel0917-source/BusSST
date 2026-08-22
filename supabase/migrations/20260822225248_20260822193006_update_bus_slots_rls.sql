/*
# Update bus_slots RLS for authenticated users

1. Purpose
- The bus_slots table currently allows anon + authenticated full CRUD.
- Students (authenticated) need to READ bus_slots to see their schedule.
- Only admin should be able to INSERT/UPDATE/DELETE bus_slots.
- We use raw_app_meta_data->>'role' = 'admin' to distinguish admin from student.

2. Security changes
- SELECT: anon + authenticated can read (students see the schedule, admin sees it too)
- INSERT/UPDATE/DELETE: only users whose raw_app_meta_data role is 'admin'
*/

-- SELECT: everyone (anon + authenticated) can read the schedule
DROP POLICY IF EXISTS "anon_select_bus_slots" ON bus_slots;
CREATE POLICY "anon_select_bus_slots" ON bus_slots FOR SELECT
  TO anon, authenticated USING (true);

-- INSERT: admin only
DROP POLICY IF EXISTS "anon_insert_bus_slots" ON bus_slots;
CREATE POLICY "anon_insert_bus_slots" ON bus_slots FOR INSERT
  TO authenticated WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- UPDATE: admin only
DROP POLICY IF EXISTS "anon_update_bus_slots" ON bus_slots;
CREATE POLICY "anon_update_bus_slots" ON bus_slots FOR UPDATE
  TO authenticated USING (auth.jwt() ->> 'role' = 'admin') WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- DELETE: admin only
DROP POLICY IF EXISTS "anon_delete_bus_slots" ON bus_slots;
CREATE POLICY "anon_delete_bus_slots" ON bus_slots FOR DELETE
  TO authenticated USING (auth.jwt() ->> 'role' = 'admin');
