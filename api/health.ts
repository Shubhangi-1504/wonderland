import type { VercelRequest, VercelResponse } from "@vercel/node";

/** GET /api/health — liveness probe. Never touches the LLM. */
export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET" && req.method !== "HEAD") {
    res.setHeader("Allow", "GET, HEAD");
    res.status(405).json({ ok: false });
    return;
  }
  res.setHeader("Cache-Control", "no-store");
  res.status(200).json({ ok: true });
}
