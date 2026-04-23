import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

/** Supabase client (auth, etc.). Admin course uploads use `src/lib/upload-api.ts` → backend. */
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
