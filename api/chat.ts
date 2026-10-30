import type { VercelRequest, VercelResponse } from "@vercel/node";

/**
 * POST /api/chat — serverless LLM proxy (stub).
 * The key must live in process.env.ANTHROPIC_API_KEY (set in Vercel project settings),
 * NEVER in a VITE_ variable, which would be bundled into the browser.
 *
 * Body: { messages: ChatMessage[], portfolio?: Portfolio, lastEvent?: ScenarioResult }
 */
export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  // TODO: read req.body, call Anthropic with process.env.ANTHROPIC_API_KEY,
  // and return a real coaching reply.

  res.status(200).json({ reply: "Chat coming soon." });
}
