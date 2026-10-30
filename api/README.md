# api — Owner: Me (infra/backend)

Vercel serverless functions.

- `chat.ts` — `POST /api/chat`. Validates and trims the conversation (last 10 messages, 1000 chars each),
  calls Anthropic with `process.env.ANTHROPIC_API_KEY`, and returns `{ reply, fallback? }`. Timeout 8s,
  best-effort 20 requests/minute/IP limit, and every failure degrades to a friendly canned reply.
- `_prompt.ts` — `SYSTEM_PROMPT` plus `buildSystemPrompt(context)`: guide rules, glossary, capped context.

Secrets belong in Vercel project env vars, never in `VITE_*` variables. Optional `LLM_MODEL`
(defaults to `claude-haiku-5-5`).
