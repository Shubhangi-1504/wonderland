import { ChatPanel } from "./ChatPanel";
import { useChatStore } from "./chatStore";

/**
 * Floating launcher + panel. Mount once in the app layout so the guide is
 * available on every route. Slide/fade is CSS-only, so the panel keeps its
 * state while hidden.
 */
export function ChatLauncher() {
  const open = useChatStore((s) => s.open);
  const openChat = useChatStore((s) => s.openChat);
  const closeChat = useChatStore((s) => s.closeChat);

  return (
    <div className="pointer-events-none fixed bottom-3 right-3 z-50 flex w-[calc(100%-1.5rem)] max-w-[400px] flex-col items-end gap-3 sm:bottom-6 sm:right-6">
      <div
        aria-hidden={!open}
        className={`w-full origin-bottom-right transition-all duration-300 ease-out ${
          open
            ? "pointer-events-auto translate-y-0 scale-100 opacity-100"
            : "pointer-events-none translate-y-4 scale-95 opacity-0"
        }`}
      >
        <ChatPanel />
      </div>

      <button
        type="button"
        onClick={() => (open ? closeChat() : openChat())}
        aria-label={open ? "Close the guide" : "Ask the MONEYVERSE Guide"}
        aria-expanded={open}
        className="pointer-events-auto flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-purple to-cyan text-2xl font-semibold text-white shadow-lg shadow-purple/40 transition hover:scale-105 focus:outline-none focus:ring-2 focus:ring-cyan"
      >
        {open ? "×" : "?"}
      </button>
    </div>
  );
}
