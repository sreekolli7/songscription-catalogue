import { createClient } from '@supabase/supabase-js';

// This singleton client centralizes all Supabase communication and ensures the application uses a
// single, consistent connection configuration throughout the data layer.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// By constructing the client in one location, the project maintains a clear separation between the
// application logic and the backend integration details.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);