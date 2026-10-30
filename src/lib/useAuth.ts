import { useEffect, useState } from "react";
import type { AuthState } from "../types";
import { supabase } from "./supabase";

/** Signed-out users are treated as guests so the whole app works without an account. */
export function useAuth(): AuthState {
  const [state, setState] = useState<AuthState>({ user: null, isGuest: true });

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const user = data.session?.user;
      setState(
        user
          ? { user: { id: user.id, email: user.email }, isGuest: false }
          : { user: null, isGuest: true },
      );
    });

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user;
      setState(
        user
          ? { user: { id: user.id, email: user.email }, isGuest: false }
          : { user: null, isGuest: true },
      );
    });

    return () => data.subscription.unsubscribe();
  }, []);

  return state;
}

/** Convenience helper for the persistence stubs. */
export async function getCurrentUserId(): Promise<string | null> {
  const { data } = await supabase.auth.getSession();
  return data.session?.user.id ?? null;
}
