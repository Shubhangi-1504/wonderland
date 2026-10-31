import type { VercelRequest, VercelResponse } from "@vercel/node";
import { buildSystemPrompt, QUIZ_SYSTEM_PROMPT } from "./_prompt";
import { isUnsafeReply, stripControlChars } from "./_safety";
import {
  parseQuizQuestion,
  pickQuestions,
  QUIZ_TOPICS,
  type QuizQuestion,
  type QuizTopic,
} from "../src/ai/quiz/questionBank";

/**
 * POST /api/chat — server-side LLM proxy.
 *
 * The Anthropic key lives only in process.env.ANTHROPIC_API_KEY (Vercel project
 * env var). It is never a VITE_* variable, never logged, and never returned.
 *
 * Body (chat): { messages: ChatMessage[], portfolio?: object, facts?: object }
 * Body (quiz): { mode: "quiz", topic?: string, facts?: object }
 * Reply: { reply } | { reply, fallback: true } | { question, fallback?: true }
 */

type Role = "user" | "assistant";
interface Message {
  role: Role;
  content: string;
}

/** Friendly answer when the model, network or safety check fails. */
export const FALLBACK =
  "I can't reach my notes right now, but here's the short version: diversification means spreading your virtual coins across different companies and sectors, so one scripted event can't sink everything. Try again in a moment!";

const API_URL = "https://api.anthropic.com/v1/messages";
const DEFAULT_MODEL = "claude-haiku-5-5";
const TIMEOUT_MS = 8000;
const MAX_MESSAGES = 10;
const MAX_MESSAGE_CHARS = 1000;
const MAX_BODY_BYTES = 32_000;
const MAX_REPLY_CHARS = 4000;

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

const asObject = (value: unknown) =>
  value && typeof value === "object" && !Array.isArray(value) ? value : undefined;

interface ParsedBody {
  mode: "chat" | "quiz";
  messages: Message[];
  portfolio?: unknown;
  facts?: unknown;
  topic?: QuizTopic;
}

type ParseResult = { ok: true; body: ParsedBody } | { ok: false; status: number };

/** Strict body parsing: JSON only, bounded size, control characters stripped. */
function readBody(raw: unknown, contentType: string): ParseResult {
  if (!/^application\/json\b/i.test(contentType)) return { ok: false, status: 415 };

  let body: unknown = raw;
  if (typeof raw === "string") {
    if (raw.length > MAX_BODY_BYTES) return { ok: false, status: 413 };
    try {
      body = JSON.parse(raw);
    } catch {
      return { ok: false, status: 400 };
    }
  }
  if (!body || typeof body !== "object" || Array.isArray(body)) return { ok: false, status: 400 };
  try {
    if (JSON.stringify(body).length > MAX_BODY_BYTES) return { ok: false, status: 413 };
  } catch {
    return { ok: false, status: 400 };
  }

  const record = body as Record<string, unknown>;
  const facts = asObject(record.facts);
  const portfolio = asObject(record.portfolio);

  if (record.mode === "quiz") {
    const topic =
      typeof record.topic === "string" && (QUIZ_TOPICS as string[]).includes(record.topic)
        ? (record.topic as QuizTopic)
        : undefined;
    return { ok: true, body: { mode: "quiz", messages: [], portfolio, facts, topic } };
  }

  const messages = record.messages;
  if (!Array.isArray(messages) || messages.length === 0) return { ok: false, status: 400 };

  const trimmed: Message[] = [];
  for (const item of messages.slice(-MAX_MESSAGES)) {
    if (!item || typeof item !== "object") return { ok: false, status: 400 };
    const { role, content } = item as { role?: unknown; content?: unknown };
    if (role !== "user" && role !== "assistant") return { ok: false, status: 400 };
    if (typeof content !== "string") return { ok: false, status: 400 };
    const clean = stripControlChars(content).slice(0, MAX_MESSAGE_CHARS);
    if (clean) trimmed.push({ role, content: clean });
  }
  if (trimmed.length === 0) return { ok: false, status: 400 };

  return { ok: true, body: { mode: "chat", messages: trimmed, portfolio, facts } };
}

/** One Anthropic call. Returns plain text, or null on any failure (never throws). */
async function callModel(
  apiKey: string,
  system: string,
  messages: Message[],
  maxTokens: number,
): Promise<string | null> {
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
        max_tokens: maxTokens,
        system,
        messages,
      }),
      signal: controller.signal,
    });

    if (!upstream.ok) {
      // Status only — never log headers or the key.
      console.error("Anthropic returned", upstream.status);
      return null;
    }

    const data = (await upstream.json()) as { content?: { type?: string; text?: string }[] };
    return (
      (data.content ?? [])
        .filter((block) => block.type === "text" && typeof block.text === "string")
        .map((block) => block.text)
        .join("\n")
        .trim() || null
    );
  } catch (error) {
    console.error("Anthropic request failed:", error instanceof Error ? error.name : "unknown");
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

/** Pull the first JSON object out of a model reply (tolerates fences/preamble). */
function extractJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    /* try the braces below */
  }
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end <= start) return null;
  try {
    return JSON.parse(text.slice(start, end + 1));
  } catch {
    return null;
  }
}

/** Facts are untrusted JSON; read only the bits we use for personalisation. */
function quizFocus(facts: unknown): string {
  if (!facts || typeof facts !== "object") return "";
  const value = facts as { sectorExposure?: unknown; concentrationFlag?: unknown };
  const top = Array.isArray(value.sectorExposure) ? value.sectorExposure[0] : null;
  const sector =
    top && typeof top === "object" && typeof (top as { sector?: unknown }).sector === "string"
      ? (top as { sector: string }).sector
      : null;
  if (value.concentrationFlag === true && sector) {
    return ` The player recently saw a concentrated ${sector} portfolio lose money in a crash.`;
  }
  return sector ? ` The player's largest sector exposure is ${sector}.` : "";
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const contentType = String(req.headers["content-type"] ?? "");
  const declaredSize = Number(req.headers["content-length"] ?? 0);
  if (Number.isFinite(declaredSize) && declaredSize > MAX_BODY_BYTES) {
    res.status(413).json({ error: "Request too large" });
    return;
  }

  const parsed = readBody(req.body, contentType);
  if (!parsed.ok) {
    res.status(parsed.status).json({ error: "Invalid request" });
    return;
  }

  // Quiz falls back to the local bank, so a rate limit or missing key still works.
  const bankQuestion = (topic?: QuizTopic): QuizQuestion =>
    pickQuestions(1, topic ?? "stocks")[0];

  if (isRateLimited(clientIp(req))) {
    if (parsed.body.mode === "quiz") {
      res.status(200).json({ question: bankQuestion(parsed.body.topic), fallback: true });
    } else {
      res.status(429).json({ reply: "You're asking a lot of questions! Take a breath, then try again in a minute.", fallback: true });
    }
    return;
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    // Misconfigured or chat-disabled deploy: still answer 200 so the UI degrades gracefully.
    if (parsed.body.mode === "quiz") {
      res.status(200).json({ question: bankQuestion(parsed.body.topic), fallback: true });
    } else {
      res.status(200).json({ reply: FALLBACK, fallback: true });
    }
    return;
  }

  if (parsed.body.mode === "quiz") {
    const topic = parsed.body.topic ?? "stocks";
    const reply = await callModel(
      apiKey,
      QUIZ_SYSTEM_PROMPT,
      [{ role: "user", content: `Create one beginner question about ${topic}.${quizFocus(parsed.body.facts)}` }],
      400,
    );

    const candidate = reply ? parseQuizQuestion({ ...(extractJson(reply) as object), topic }) : null;
    // Never trust model output: shape must be exact and the wording must be safe.
    if (
      !candidate ||
      isUnsafeReply([candidate.question, candidate.explanation, ...candidate.options].join(" "))
    ) {
      res.status(200).json({ question: bankQuestion(topic), fallback: true });
      return;
    }

    res.status(200).json({ question: candidate });
    return;
  }

  const reply = await callModel(
    apiKey,
    buildSystemPrompt({ portfolio: parsed.body.portfolio, facts: parsed.body.facts }),
    parsed.body.messages,
    500,
  );

  if (!reply || isUnsafeReply(reply)) {
    res.status(200).json({ reply: FALLBACK, fallback: true });
    return;
  }

  res.status(200).json({ reply: reply.slice(0, MAX_REPLY_CHARS) });
}
