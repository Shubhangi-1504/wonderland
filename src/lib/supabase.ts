import { createClient } from "@supabase/supabase-js";

/**
 * Supabase browser client.
 * Env vars are public by design (anon key + RLS); the service role key must never be used here.
 *
 * When the env vars are missing we still create a client pointed at a placeholder
 * host, so imports never crash. Every call fails gracefully (auth = signed out,
 * persistence no-ops) and `isSupabaseConfigured` gates optional features.
 */
const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(url && anonKey);

export const supabase = createClient(
  url || "https://placeholder.supabase.co",
  anonKey || "public-anon-key",
);
