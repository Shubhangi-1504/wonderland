import type { ChatMessage, GuideContext } from "../types";

/**
 * Ask the AI guide a question. The API key stays server-side in /api/chat.
 * Falls back to a friendly message so the UI never breaks.
 */
export async function askGuide(
  messages: ChatMessage[],
  context: GuideContext,
): Promise<string> {
  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages,
        portfolio: context.portfolio,
        lastEvent: context.lastEvent,
      }),
    });

    if (!res.ok) throw new Error(`Chat request failed: ${res.status}`);

    const data = (await res.json()) as { reply?: string };
    return data.reply ?? "The guide is thinking... try again in a moment.";
  } catch (error) {
    console.error("askGuide failed", error);
    return "The guide is offline right now. Explore the market and try again soon!";
  }
}
