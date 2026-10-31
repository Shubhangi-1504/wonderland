import type { ChatMessage } from "../types";
import { track } from "../lib/track";
import { buildContext, type GuidePayload } from "./buildContext";
import { getFallbackReply } from "./fallbacks";

export interface GuideReply {
  reply: string;
  fallback: boolean;
}

const TIMEOUT_MS = 10_000;

/**
 * Ask the AI guide a question. The key stays server-side in /api/chat.
 * Never throws: network errors, timeouts and server fallbacks all resolve to a
 * canned, on-topic answer so the chat UI keeps working offline.
 */
export async function askGuide(
  messages: ChatMessage[],
  context?: GuidePayload,
): Promise<GuideReply> {
  const payload = context ?? buildContext();
  const lastUserText = [...messages].reverse().find((m) => m.role === "user")?.content ?? "";
  const offline = (reason: string): GuideReply => {
    track("fallback_shown", { reason });
    return { reply: getFallbackReply(lastUserText, payload), fallback: true };
  };

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages,
        portfolio: payload.portfolio,
        // Precomputed, authoritative facts replace the raw event dump.
        facts: payload.facts,
      }),
      signal: controller.signal,
    });

    if (!res.ok) return offline(`http_${res.status}`);

    const data = (await res.json()) as { reply?: unknown; fallback?: boolean };
    if (data.fallback || typeof data.reply !== "string" || !data.reply.trim()) {
      return offline("server_fallback");
    }

    return { reply: data.reply, fallback: false };
  } catch {
    return offline("network");
  } finally {
    clearTimeout(timer);
  }
}
