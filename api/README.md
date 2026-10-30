# api — Owner: Me (infra/backend)

Vercel serverless functions.

- `chat.ts` — `POST /api/chat`; currently returns `{ reply: "Chat coming soon." }`.
  TODO: call Anthropic using `process.env.ANTHROPIC_API_KEY`.

Secrets belong in Vercel project env vars, never in `VITE_*` variables.
