import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export const isSupabaseConfigured = Boolean(
  import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY,
);

/**
 * Supabase browser client.
 * Env vars are public by design (anon key + RLS); the service role key must never be used here.
 *
 * Guest/no-env fallback: if VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY are
 * missing (no .env, preview build, etc.), we return null so the app still renders
 * in guest/localStorage mode instead of throwing at module-load time.
 */
export const supabase = (() => {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
  if (isSupabaseConfigured && url && key) {
    return createClient(url, key) as SupabaseClient;
  }
  return null as unknown as SupabaseClient;
})();
