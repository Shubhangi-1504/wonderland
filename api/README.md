# api — Owner: Me (infra/backend)

Vercel serverless functions.

- `chat.ts` — `POST /api/chat`. JSON only, max 32 KB, last 10 messages of 1000 chars, control
  characters stripped. Chat body `{ messages, portfolio?, facts? }` → `{ reply, fallback? }`.
  Quiz body `{ mode: "quiz", topic?, facts? }` → `{ question }`, shape-validated server-side
  and falling back to the local bank. Timeout 8s, best-effort 20 req/min/IP, every failure
  degrades to a canned reply. Calls matching `_safety.ts` patterns are replaced with `FALLBACK`.
- `_prompt.ts` — rules + glossary + delimited `<portfolio_data>` / `<scenario_facts>` blocks.
  FACTS are authoritative; the model explains them and never recomputes numbers.
- `_safety.ts` — unsafe-output regex list + control-character stripper.
- `health.ts` — `GET /api/health` → `{ ok: true }`.

Secrets belong in Vercel project env vars, never in `VITE_*` variables. Optional `LLM_MODEL`
(defaults to `claude-haiku-5-5`).
