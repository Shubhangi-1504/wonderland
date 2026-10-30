# src/ai — MONEYVERSE Guide

Open from anywhere: `openChat("Explain what just happened to my portfolio.")`. `<ChatLauncher />` is mounted in `App.tsx`.
Each request sends cash, holdings (qty, avgPrice, sector, price, value), total value, and the last event (title, shock, before/after, per-holding change).
Rules live in `api/_prompt.ts` (`SYSTEM_PROMPT`); glossary in `glossary.md` / `glossary.ts`; offline answers in `fallbacks.ts`.
Env: `ANTHROPIC_API_KEY` (required, server-only), `LLM_MODEL` (optional, default `claude-haiku-5-5`).
Run `vercel dev` alongside `npm run dev` so `/api/chat` exists locally.
