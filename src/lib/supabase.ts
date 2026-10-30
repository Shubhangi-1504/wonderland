import { createClient } from "@supabase/supabase-js";

/**
 * Supabase browser client.
 * Env vars are public by design (anon key + RLS); the service role key must never be used here.
 * Fallbacks prevent initialization crashes in guest/offline mode when environment variables are omitted.
 */
const supabaseUrl =
  (import.meta.env.VITE_SUPABASE_URL as string) || "https://placeholder-project.supabase.co";
const supabaseAnonKey =
  (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || "placeholder-anon-key";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
