# src/lib — Supabase auth + persistence

Use these; never import Supabase directly in feature code.

1. `useAuth()` → `{ user, isGuest, loading, signUp, signIn, signOut, continueAsGuest }`.
2. `savePortfolio(portfolio)` → upserts cash + holdings for the logged-in user.
3. `saveMissionProgress(id, { completed, quizScore? })` → upserts one mission row.
4. `addXPRemote(newTotal)` → writes the absolute XP total to `profiles.xp`.
5. `loadProgress()` → `{ xp, portfolio, missions }` or `null` (used by `src/store/syncWithSupabase.ts`).
6. All of the above return `false`/`null` and never throw. Ignore the result.
7. Guests (no session) are no-ops: their state is already saved in localStorage by zustand.
8. Auto-sync is already wired — portfolio (1.5s debounce), XP, and mission completion.
9. First signup after guest play uploads that device's progress once.
10. `openAuthModal()` from `src/auth/authModalStore.ts` opens the login modal anywhere.
