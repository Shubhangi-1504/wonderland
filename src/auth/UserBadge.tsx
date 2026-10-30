import { useAuth } from "../lib/useAuth";
import { useGameStore } from "../store/useGameStore";
import { useAuthModal } from "./authModalStore";

/** Compact nav badge: name (or "Guest"), XP, and sign in/out. */
export function UserBadge() {
  const { user, isGuest, signOut } = useAuth();
  const xp = useGameStore((s) => s.xp);
  const openAuthModal = useAuthModal((s) => s.openAuthModal);

  const name = user?.displayName ?? user?.email ?? "Guest";

  return (
    <div className="ml-auto flex items-center gap-3 text-sm">
      <span className="text-slate-300">
        {isGuest ? "Guest" : name} · <span className="text-gold">{xp} XP</span>
      </span>
      {isGuest ? (
        <button
          className="rounded-md border border-cyan/60 px-3 py-1.5 font-semibold text-cyan transition hover:bg-cyan/10"
          onClick={openAuthModal}
        >
          Sign in
        </button>
      ) : (
        <button
          className="rounded-md border border-white/15 px-3 py-1.5 text-slate-300 transition hover:border-purple hover:text-white"
          onClick={() => void signOut()}
        >
          Sign out
        </button>
      )}
    </div>
  );
}
