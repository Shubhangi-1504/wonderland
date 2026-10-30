import { createClient } from "@supabase/supabase-js";

/**
 * Supabase browser client.
 * Env vars are public by design (anon key + RLS); the service role key must never be used here.
 */
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
);
