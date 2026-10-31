# Contributing to MONEYVERSE

Welcome! MONEYVERSE is an open-source, 3D gamified financial education platform.

## Setup & Quickstart

1. Clone and install: `git clone <repo> && cd MONEYVERSE && npm install`
2. Configure local environment: `cp .env.example .env.local`
3. Verify environment setup: `npm run check:env`
4. Start dev server: `npm run dev` (or `vercel dev` to run with `/api` proxy)

## Branch & PR Conventions

- Create branch from `main`: `feat/short-description` or `fix/short-description`.
- Keep PRs focused on a single change. Fill out the PR template checklist.
- Verify everything before pushing: `npm run verify` (`build` + `scan:bundle` + `test`).

## Folder Ownership Map

Respect modular boundaries and shared types in `src/types.ts`:

- `src/scene`: Cinematic 3D intro, Three.js shaders, camera paths, postprocessing.
- `src/world`: Stock Market City, district navigation, interactive building panels.
- `src/learning`: Missions, financial literacy modules, quiz screens, XP rewards.
- `src/sim`: Deterministic pricing engine, math, scenarios, virtual paper trading.
- `src/portfolio`: Portfolio overview, holding breakdowns, interactive charts.
- `src/ai`: Context builder, scenario explanations, AI Guide UI, quiz bank.
- `src/lib`: Supabase auth, persistence, product analytics, global error resilience.

## Tests & Code Style

- Test runner: `npm test` (Vitest). Run in watch mode: `npm run test:watch`.
- Linter: `npm run lint` (ESLint with TypeScript rules).
- Style: Strict TypeScript, no `any`, pure functions in `src/sim`, no unhandled promises.
- Safety: Every price, holding, and event is simulated. Never display simulated numbers without `<SimulatedBadge />` or `<DataSourceFootnote />`.

## Good First Contributions

Check [docs/GOOD_FIRST_ISSUES.md](docs/GOOD_FIRST_ISSUES.md) for 8 starter issues:
1. Add new financial literacy quiz questions in `src/ai/quiz/questionBank.ts`.
2. Expand financial glossary definitions in `src/ai/glossary.ts`.
3. Add a new market shock scenario in `src/sim/scenarios.ts`.
4. Improve accessibility labels for screen readers across simulation badges.

