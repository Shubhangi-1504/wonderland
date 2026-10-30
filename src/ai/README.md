# src/ai — Owner: Me (infra/backend)

AI guide chat panel plus the `askGuide` client. `askGuide` POSTs to `/api/chat` with the
conversation and game context; the Anthropic key stays server-side.

Keep prompt/context shaping here and in `api/chat.ts`, not in feature folders.
