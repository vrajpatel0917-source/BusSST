/*
# Create students table for SST Transport system

1. New Tables
- `students`
  - `id` (uuid, primary key, auto-generated)
  - `auth_id` (uuid, references auth.users ON DELETE CASCADE) — links to the Supabase auth account
  - `name` (text, not null) — student full name
  - `email` (text, unique, not null) — login email
  - `roll_number` (text, unique, not null) — student roll number
  - `hostel` (text, not null) — "Uni 1" or "Uni 2"
  - `created_at` (timestamptz, default now())

2. Security
- Enable RLS on `students`.
- SELECT: authenticated users can read their own student row (auth.uid() = auth_id).
- INSERT/UPDATE/DELETE: disabled — students are managed via SQL/edge function, not from the client.
*/

CREATE TABLE IF NOT EXISTS students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  roll_number text UNIQUE NOT NULL,
  hostel text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE students ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_student" ON students;
CREATE POLICY "select_own_student" ON students FOR SELECT
  TO authenticated USING (auth.uid() = auth_id);
