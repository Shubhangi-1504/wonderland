import type { VercelRequest, VercelResponse } from "@vercel/node";
import { buildSystemPrompt } from "./_prompt";

/**
 * POST /api/chat — server-side LLM proxy.
 *
 * The Anthropic key lives only in process.env.ANTHROPIC_API_KEY (Vercel project
 * env var). It is never a VITE_* variable, never logged, and never returned.
 *
 * Body: { messages: ChatMessage[], portfolio?: object, lastEvent?: object }
 * Reply: { reply: string, fallback?: true }
 */

type Role = "user" | "assistant";
interface Message {
  role: Role;
  content: string;
}

/** Friendly answer when the model or network is unavailable. */
export const FALLBACK =
  "I can't reach my notes right now, but here's the short version: diversification means spreading your virtual coins across different companies and sectors, so one scripted event can't sink everything. Try again in a moment!";

const API_URL = "https://api.anthropic.com/v1/messages";
const DEFAULT_MODEL = "claude-haiku-5-5";
const TIMEOUT_MS = 8000;
const MAX_MESSAGES = 10;
const MAX_CHARS = 1000;

// Best-effort rate limit: an in-memory map per serverless instance. Instances
// cold-start, scale out and are recycled, so this only blunts casual abuse.
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 20;
const hits = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((at) => now - at < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  // Drop stale entries so the map cannot grow without bound.
  if (hits.size > 500) {
    for (const [key, times] of hits) {
      if (!times.some((at) => now - at < WINDOW_MS)) hits.delete(key);
    }
  }
  return recent.length > MAX_PER_WINDOW;
}

function clientIp(req: VercelRequest): string {
  const header = req.headers["x-forwarded-for"];
  const raw = Array.isArray(header) ? header[0] : header;
  return raw?.split(",")[0]?.trim() || "unknown";
}

/** Parse + validate the body; returns null when it is unusable. */
function readBody(raw: unknown): { messages: Message[]; portfolio?: unknown; lastEvent?: unknown } | null {
  let body: unknown = raw;
  try {
    if (typeof raw === "string") body = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!body || typeof body !== "object") return null;

  const { messages, portfolio, lastEvent } = body as {
    messages?: unknown;
    portfolio?: unknown;
    lastEvent?: unknown;
  };
  if (!Array.isArray(messages) || messages.length === 0) return null;

  const valid = messages.every(
    (m) =>
      !!m &&
      typeof m === "object" &&
      ((m as Message).role === "user" || (m as Message).role === "assistant") &&
      typeof (m as Message).content === "string",
  );
  if (!valid) return null;

  const trimmed = (messages as Message[])
    .slice(-MAX_MESSAGES)
    .map((m) => ({ role: m.role, content: m.content.slice(0, MAX_CHARS) }));

  const asObject = (value: unknown) =>
    value && typeof value === "object" && !Array.isArray(value) ? value : undefined;

  return { messages: trimmed, portfolio: asObject(portfolio), lastEvent: asObject(lastEvent) };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const parsed = readBody(req.body);
  if (!parsed) {
    res.status(400).json({ error: "Invalid body: expected { messages: { role, content }[] }" });
    return;
  }

  if (isRateLimited(clientIp(req))) {
    res.status(429).json({ reply: "You're asking a lot of questions! Take a breath, then try again in a minute.", fallback: true });
    return;
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    // Misconfigured deploy: still answer 200 so the demo degrades gracefully.
    res.status(200).json({ reply: FALLBACK, fallback: true });
    return;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const upstream = await fetch(API_URL, {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.LLM_MODEL || DEFAULT_MODEL,
        max_tokens: 500,
        system: buildSystemPrompt({ portfolio: parsed.portfolio, lastEvent: parsed.lastEvent }),
        messages: parsed.messages,
      }),
      signal: controller.signal,
    });

    if (!upstream.ok) {
      // Status only — never log headers or the key.
      console.error("Anthropic returned", upstream.status);
      res.status(200).json({ reply: FALLBACK, fallback: true });
      return;
    }

    const data = (await upstream.json()) as { content?: { type?: string; text?: string }[] };
    const reply = (data.content ?? [])
      .filter((block) => block.type === "text" && typeof block.text === "string")
      .map((block) => block.text)
      .join("\n")
      .trim();

    if (!reply) {
      res.status(200).json({ reply: FALLBACK, fallback: true });
      return;
    }

    res.status(200).json({ reply });
  } catch (error) {
    console.error("Anthropic request failed:", error instanceof Error ? error.name : "unknown");
    res.status(200).json({ reply: FALLBACK, fallback: true });
  } finally {
    clearTimeout(timeout);
  }
}
