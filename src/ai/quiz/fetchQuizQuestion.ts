import { parseQuizQuestion, type QuizQuestion, type QuizTopic } from "./questionBank";

const TIMEOUT_MS = 5000;

/**
 * Optional LLM-personalised question. Resolves to null on any problem
 * (offline, disabled chat, malformed/invalid output) so callers fall back
 * to the local bank. Output is re-validated on the client too.
 */
export async function fetchQuizQuestion(topic: QuizTopic): Promise<QuizQuestion | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mode: "quiz", topic }),
      signal: controller.signal,
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { question?: unknown };
    return parseQuizQuestion(data.question);
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}
