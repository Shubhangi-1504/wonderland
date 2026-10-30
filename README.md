# MONEYVERSE

3D gamified financial education app. Vite + React 18 + TypeScript + Tailwind +
React Three Fiber, with Vercel serverless functions.

This is a **skeleton** — routes are placeholders and features are stubs.

## Quick start

```bash
npm install
cp .env.example .env.local   # fill in Supabase values (optional for placeholders)
npm run dev
```

## Scripts

| Command           | What it does                        |
| ----------------- | ----------------------------------- |
| `npm run dev`     | Vite dev server at localhost:5173   |
| `npm run build`   | Typecheck + production build        |
| `npm run preview` | Serve the production build          |
| `npm run lint`    | ESLint over `src/` and `api/`       |

To run the Vite app and `/api/chat` together (needs the Vercel CLI, logged in):

```bash
npm i -g vercel
vercel login
vercel dev          # http://localhost:3000
```

`vercel dev` rewrites unknown paths to `index.html` (see `vercel.json`) and serves
`api/chat.ts` at `/api/chat`.

## Ownership

| Folder         | Owner                        | Contents                              |
| -------------- | ---------------------------- | ------------------------------------- |
| `src/scene`    | Person A                     | Cinematic 3D intro                    |
| `src/world`    | Person B                     | Stock Market City + info panels       |
| `src/learning` | Person B                     | Missions, quizzes, XP/badges UI       |
| `src/sim`      | Person C                     | Price engine, trading, crash scenarios|
| `src/portfolio`| Person C                     | Portfolio screen + charts             |
| `src/ai`       | Me (infra/backend)           | Chat panel + askGuide client          |
| `src/lib`      | Me (infra/backend)           | Supabase client, auth, persistence    |
| `src/store`    | Me (infra/backend)           | Zustand game store                    |
| `api`          | Me (infra/backend)           | Serverless functions                  |

## Route map

| Path         | Page                              |
| ------------ | --------------------------------- |
| `/`          | `src/scene/IntroPage.tsx`         |
| `/world`     | `src/world/WorldPage.tsx`         |
| `/portfolio` | `src/portfolio/PortfolioPage.tsx` |

## Shared contracts

All cross-team types live in [`src/types.ts`](src/types.ts). Import from there rather
than redefining shapes.

## Env vars

| Name                      | Scope  | Used by              |
| ------------------------- | ------ | -------------------- |
| `VITE_SUPABASE_URL`       | client | `src/lib/supabase.ts`|
| `VITE_SUPABASE_ANON_KEY`  | client | `src/lib/supabase.ts`|
| `ANTHROPIC_API_KEY`       | server | `api/chat.ts`        |

Never prefix a secret with `VITE_` — those are bundled into the browser.
