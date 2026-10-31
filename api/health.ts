import type { VercelRequest, VercelResponse } from "@vercel/node";

/** GET /api/health — liveness probe and configuration check. Never touches the LLM or returns keys. */
export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET" && req.method !== "HEAD") {
    res.setHeader("Allow", "GET, HEAD");
    res.status(405).json({ ok: false });
    return;
  }
  res.setHeader("Cache-Control", "no-store");
  res.status(200).json({
    ok: true,
    hasLlmKey: Boolean(process.env.ANTHROPIC_API_KEY),
    hasSupabaseUrl: Boolean(process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL),
    time: new Date().toISOString(),
  });
}
