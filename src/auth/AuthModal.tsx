import { useState } from "react";
import { useAuth } from "../lib/useAuth";
import { useAuthModal } from "./authModalStore";

type Mode = "signin" | "signup";

const input =
  "w-full rounded-md border border-white/10 bg-midnight px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-cyan focus:outline-none";
const tab = "flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition";
const primary =
  "w-full rounded-md bg-purple px-4 py-2 text-sm font-semibold text-white transition hover:bg-purple/80 disabled:cursor-not-allowed disabled:opacity-60";

/** Self-contained email/password + guest modal. Mounted once in App. */
export function AuthModal() {
  const open = useAuthModal((s) => s.open);
  const close = useAuthModal((s) => s.closeAuthModal);
  const { user, signIn, signUp, signOut, continueAsGuest } = useAuth();

  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  if (!open) return null;

  function switchMode(next: Mode) {
    setMode(next);
    setError(null);
    setNotice(null);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    setNotice(null);

    const result =
      mode === "signup"
        ? await signUp(email.trim(), password, displayName)
        : await signIn(email.trim(), password);

    setBusy(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    if (result.notice) {
      setNotice(result.notice);
      return;
    }
    close();
  }

  async function handleGuest() {
    continueAsGuest();
    close();
  }

  async function handleSignOut() {
    setBusy(true);
    await signOut();
    setBusy(false);
    close();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-midnight/80 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Sign in to MONEYVERSE"
      onClick={close}
    >
      <div
        className="w-full max-w-sm rounded-xl border border-purple/40 bg-navy p-6 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 className="text-xl font-bold tracking-wide text-gold">MONEYVERSE</h2>

        {user ? (
          <div className="mt-4 space-y-4">
            <p className="text-sm text-slate-300">
              Signed in as <span className="text-white">{user.displayName ?? user.email}</span>
            </p>
            <button className={primary} onClick={handleSignOut} disabled={busy}>
              {busy ? "Signing out…" : "Sign out"}
            </button>
            <button
              className="w-full text-sm text-slate-400 hover:text-cyan"
              onClick={close}
              disabled={busy}
            >
              Close
            </button>
          </div>
        ) : (
          <>
            <div className="mt-4 flex gap-2 rounded-lg bg-midnight p-1">
              <button
                className={`${tab} ${mode === "signin" ? "bg-purple text-white" : "text-slate-400 hover:text-white"}`}
                onClick={() => switchMode("signin")}
              >
                Sign in
              </button>
              <button
                className={`${tab} ${mode === "signup" ? "bg-purple text-white" : "text-slate-400 hover:text-white"}`}
                onClick={() => switchMode("signup")}
              >
                Sign up
              </button>
            </div>

            <form className="mt-4 space-y-3" onSubmit={handleSubmit}>
              {mode === "signup" && (
                <input
                  className={input}
                  placeholder="Display name"
                  value={displayName}
                  onChange={(event) => setDisplayName(event.target.value)}
                  autoComplete="nickname"
                />
              )}
              <input
                className={input}
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                required
              />
              <input
                className={input}
                type="password"
                placeholder="Password (min 6 characters)"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete={mode === "signup" ? "new-password" : "current-password"}
                minLength={6}
                required
              />

              {error && <p className="rounded-md bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</p>}
              {notice && <p className="rounded-md bg-cyan/10 px-3 py-2 text-sm text-cyan">{notice}</p>}

              <button className={primary} type="submit" disabled={busy}>
                {busy ? "Please wait…" : mode === "signup" ? "Create account" : "Sign in"}
              </button>
            </form>

            <div className="my-4 flex items-center gap-2 text-xs uppercase tracking-widest text-slate-500">
              <span className="h-px flex-1 bg-white/10" />
              or
              <span className="h-px flex-1 bg-white/10" />
            </div>

            <button
              className="w-full rounded-md border border-cyan/60 px-4 py-2 text-sm font-semibold text-cyan transition hover:bg-cyan/10"
              onClick={handleGuest}
              disabled={busy}
            >
              Continue as guest
            </button>
            <p className="mt-3 text-center text-xs text-slate-500">
              Guest progress is saved on this device and moves into your account when you sign up.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
