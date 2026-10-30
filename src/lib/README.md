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

## Analytics — `track(name, props?)`

Fire-and-forget, never throws, no-ops when Supabase is not configured. Run `supabase/analytics.sql`
once; rows go to `public.events` (insert-only from clients, no select policy). An `anon_id` is kept
in `localStorage` to group guest events.

Already tracked:

| Event | Props |
| --- | --- |
| `chat_opened` | `{ source }` |
| `chat_message_sent` | `{ length }` |
| `chip_used` | `{ chip }` |
| `quiz_started` | `{ source }` |
| `quiz_completed` | `{ score, total }` |
| `scenario_summary_viewed` | `{ scenarioId }` |
| `fallback_shown` | `{ reason }` |

Teammates: add yours the same way (no new tables, no awaits).

```ts
track("entered_world");
track("mission_completed", { missionId: id });
track("trade_executed", { side, symbol, qty });
track("scenario_run", { scenarioId, changePct });
```
