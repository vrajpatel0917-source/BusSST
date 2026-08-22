import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type BusSlot = {
  id: string;
  hostel: string;
  direction: string;
  departure_time: string;
  status: string;
  created_at: string;
};

export type Student = {
  id: string;
  auth_id: string;
  name: string;
  email: string;
  roll_number: string;
  hostel: string;
  created_at: string;
};

export type UserRole = 'admin' | 'student';
