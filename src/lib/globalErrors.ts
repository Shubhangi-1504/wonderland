import { track } from "./track";

/**
 * Global resilience handlers for window "error" and "unhandledrejection".
 *
 * Logs via console.warn and reports to analytics via track("client_error").
 * Wrapped in try/catch to ensure these handlers NEVER throw or interrupt the client.
 */

let initialized = false;

function extractErrorMessage(error: unknown, fallback: string): string {
  try {
    if (typeof error === "string") return error;
    if (error instanceof Error) return error.message || error.name;
    if (error && typeof error === "object") {
      const maybeMsg = (error as { message?: unknown }).message;
      if (typeof maybeMsg === "string") return maybeMsg;
    }
    return fallback;
  } catch {
    return fallback;
  }
}

export function initGlobalErrors(): void {
  if (initialized || typeof window === "undefined") return;
  initialized = true;

  window.addEventListener("error", (event: ErrorEvent) => {
    try {
      const rawMessage = event.message || extractErrorMessage(event.error, "Unknown client error");
      const cleanMessage = String(rawMessage).trim().slice(0, 200);

      console.warn("[moneyverse:error]", cleanMessage, event.error);
      track("client_error", { message: cleanMessage });
    } catch {
      // Must never throw
    }
  });

  window.addEventListener("unhandledrejection", (event: PromiseRejectionEvent) => {
    try {
      const rawReason = extractErrorMessage(event.reason, "Unhandled promise rejection");
      const cleanReason = String(rawReason).trim().slice(0, 200);

      console.warn("[moneyverse:unhandledrejection]", cleanReason, event.reason);
      track("client_error", { message: cleanReason });
    } catch {
      // Must never throw
    }
  });
}

