import { useEffect, useState } from "react";
import { supabase } from "./supabase";

/** localStorage flag set by "Continue as guest". Used once, to migrate guest progress on signup. */
export const GUEST_FLAG = "moneyverse_guest";

export interface AuthUser {
  id: string;
  email?: string;
  /** display_name from signUp metadata (also copied into public.profiles by the DB trigger). */
  displayName?: string;
}

export interface AuthResult {
  error: string | null;
  /** Non-error info, e.g. "confirm your email before signing in". */
  notice?: string;
}

export interface UseAuthResult {
  user: AuthUser | null;
  /** No session => guest. Guests never touch Supabase tables. */
  isGuest: boolean;
  /** True until the initial session check resolves. */
  loading: boolean;
  signUp: (email: string, password: string, displayName?: string) => Promise<AuthResult>;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signOut: () => Promise<void>;
  continueAsGuest: () => void;
}

function toAuthUser(user: { id: string; email?: string; user_metadata?: Record<string, unknown> } | null): AuthUser | null {
  if (!user) return null;
  const name = user.user_metadata?.display_name;
  return {
    id: user.id,
    email: user.email,
    displayName: typeof name === "string" && name.trim() ? name : undefined,
  };
}

/** Current session user id, or null for guests. Used by persistence + sync. */
export async function getCurrentUserId(): Promise<string | null> {
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data.session?.user.id ?? null;
}

/**
 * Auth + guest mode. Signing out never clears game state; guests keep localStorage progress.
 */
export function useAuth(): UseAuthResult {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    if (!supabase) {
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setUser(toAuthUser(data.session?.user ?? null));
      setLoading(false);
    });

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      setUser(toAuthUser(session?.user ?? null));
      setLoading(false);
    });

    return () => {
      mounted = false;
      data.subscription.unsubscribe();
    };
  }, []);

  async function signUp(email: string, password: string, displayName?: string): Promise<AuthResult> {
    if (!supabase) return { error: "Supabase is not configured. Running in guest mode." };
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: displayName?.trim() ? { display_name: displayName.trim() } : undefined },
    });
    if (error) return { error: error.message };
    // Supabase may require email confirmation, in which case there is no session yet.
    if (!data.session) return { error: null, notice: "Check your email to confirm, then sign in." };
    return { error: null };
  }

  async function signIn(email: string, password: string): Promise<AuthResult> {
    if (!supabase) return { error: "Supabase is not configured. Running in guest mode." };
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error ? error.message : null };
  }

  async function signOut(): Promise<void> {
    if (!supabase) {
      setUser(null);
      return;
    }
    const { error } = await supabase.auth.signOut();
    if (error) console.warn("[moneyverse] signOut failed", error.message);
  }

  function continueAsGuest(): void {
    try {
      localStorage.setItem(GUEST_FLAG, "true");
    } catch {
      // Private mode / storage disabled: guest mode still works, just no local persistence.
    }
  }

  return {
    user,
    isGuest: !user,
    loading,
    signUp,
    signIn,
    signOut,
    continueAsGuest,
  };
}
