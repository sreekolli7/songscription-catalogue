import { createClient } from '@supabase/supabase-js';

// This client acts as the single point of access for all Supabase interactions in the application.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Centralizing the client configuration keeps the data layer consistent and simplifies future expansion.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);