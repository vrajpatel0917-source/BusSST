/*
# Seed auth accounts and students

1. Purpose
- Create 1 admin auth account (admin@sst.edu / admin123)
- Create 20 student auth accounts (student1@sst.edu .. student20@sst.edu / student123)
- Create 20 corresponding rows in the `students` table with name, email, roll_number, hostel
- All accounts have email_confirmed_at set so login works immediately
- The `raw_app_meta_data` stores a `role` field: "admin" or "student"

2. Security
- Passwords are bcrypt-hashed via pgcrypto crypt() function
- No RLS changes — students table already has SELECT policy for own row
*/

-- Helper: insert into auth.users if the email doesn't already exist
DO $$
DECLARE
  admin_id uuid;
  stu_id uuid;
  i int;
  stu_name text;
  stu_email text;
  stu_roll text;
  stu_hostel text;
  pw text;
BEGIN
  pw := crypt('admin123', gen_salt('bf'));

  -- Admin account
  SELECT id INTO admin_id FROM auth.users WHERE email = 'admin@sst.edu';
  IF admin_id IS NULL THEN
    INSERT INTO auth.users (id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, created_at, updated_at)
    VALUES (
      gen_random_uuid(),
      'authenticated',
      'authenticated',
      'admin@sst.edu',
      pw,
      now(),
      '{"role":"admin"}'::jsonb,
      now(),
      now()
    );
  END IF;

  pw := crypt('student123', gen_salt('bf'));

  -- 20 student accounts
  FOR i IN 1..20 LOOP
    stu_email := 'student' || i || '@sst.edu';
    stu_roll := 'SST' || lpad(i::text, 3, '0');
    -- alternate hostels
    IF (i % 2) = 1 THEN
      stu_hostel := 'Uni 1';
      stu_name := 'Student ' || i || ' (Uni1)';
    ELSE
      stu_hostel := 'Uni 2';
      stu_name := 'Student ' || i || ' (Uni2)';
    END IF;

    SELECT id INTO stu_id FROM auth.users WHERE email = stu_email;
    IF stu_id IS NULL THEN
      INSERT INTO auth.users (id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, created_at, updated_at)
      VALUES (
        gen_random_uuid(),
        'authenticated',
        'authenticated',
        stu_email,
        pw,
        now(),
        '{"role":"student"}'::jsonb,
        now(),
        now()
      )
      RETURNING id INTO stu_id;
    END IF;

    -- Insert student record if not exists
    IF NOT EXISTS (SELECT 1 FROM students WHERE email = stu_email) THEN
      INSERT INTO students (auth_id, name, email, roll_number, hostel)
      VALUES (stu_id, stu_name, stu_email, stu_roll, stu_hostel);
    END IF;
  END LOOP;
END $$;
