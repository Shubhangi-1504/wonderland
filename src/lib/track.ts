import { isSupabaseConfigured, supabase } from "./supabase";

/**
 * Lightweight product analytics. Fire-and-forget, never throws, and a no-op
 * when Supabase is not configured (local demo still works).
 *
 * Event names + props are documented in src/lib/README.md.
 */

const ANON_KEY = "moneyverse_anon_id";

/** Stable per-browser id so guest events can be grouped without an account. */
function anonId(): string | null {
  try {
    let id = localStorage.getItem(ANON_KEY);
    if (!id) {
      id =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `anon-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      localStorage.setItem(ANON_KEY, id);
    }
    return id;
  } catch {
    // Storage blocked (private mode): still send the event without an id.
    return null;
  }
}

export function track(name: string, props?: Record<string, unknown>): void {
  const clean = typeof name === "string" ? name.trim().slice(0, 64) : "";
  if (!clean || !isSupabaseConfigured) return;

  void (async () => {
    try {
      await supabase.from("events").insert({
        anon_id: anonId(),
        name: clean,
        props: props ?? {},
      });
    } catch {
      // Analytics must never break gameplay or the chat.
    }
  })();
}
