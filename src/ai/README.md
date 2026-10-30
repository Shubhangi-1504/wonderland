# src/ai — MONEYVERSE Guide

- Open from anywhere: `openChat("...")`; quiz: `openQuiz()`. `<ChatLauncher />` is in `App.tsx`.
- Facts pipeline: `explainScenario(portfolio, stocks, lastScenarioResult)` → `ScenarioFacts` (pure, no LLM).
  `buildContext()` attaches it; `askGuide` sends `{ messages, portfolio, facts }`; prompt treats facts as authoritative.
- Summary card: mount `<ScenarioSummaryCard />` on the crash simulator page (non-LLM numbers + "Ask the Guide").
- Quiz: `src/ai/quiz/` — 12-question bank, 5 per session, 10 XP per correct answer, bank fallback offline.
- Simulated labels: mount `<SimulatedBadge />` / `<DataSourceFootnote />` from `src/components/shared`
  (portfolio header, trade panel, company panel, crash overlay — see that folder's README).
- Analytics: `track()` from `src/lib/track.ts`; event names listed in `src/lib/README.md`.
- Env: `ANTHROPIC_API_KEY` (server-only, required), `LLM_MODEL` (optional), `VITE_SUPABASE_URL` +
  `VITE_SUPABASE_ANON_KEY` (analytics; both optional). Run `vercel dev` with `npm run dev` for `/api`.
