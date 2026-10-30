import { ErrorBoundary } from "../components/shared/ErrorBoundary";
import { ChatPanel } from "./ChatPanel";
import { useChatStore } from "./chatStore";

/**
 * Floating launcher + panel. Mount once in the app layout so the guide is
 * available on every route. Slide/fade is CSS-only, so the panel keeps its
 * state while hidden. `invisible` when closed keeps hidden controls out of the
 * keyboard tab order without unmounting the chat.
 */
export function ChatLauncher() {
  const open = useChatStore((s) => s.open);
  const openChat = useChatStore((s) => s.openChat);
  const closeChat = useChatStore((s) => s.closeChat);

  return (
    <div className="pointer-events-none fixed bottom-3 right-3 z-50 flex w-[calc(100%-1.5rem)] max-w-[400px] flex-col items-end gap-3 sm:bottom-6 sm:right-6">
      <div
        aria-hidden={!open}
        className={`w-full origin-bottom-right transition-all duration-300 ease-out motion-reduce:transition-none motion-reduce:transform-none ${
          open
            ? "pointer-events-auto visible translate-y-0 scale-100 opacity-100"
            : "pointer-events-none invisible translate-y-4 scale-95 opacity-0"
        }`}
      >
        {/* A chat crash must never take down the 3D app. */}
        <ErrorBoundary label="Chat">
          <ChatPanel />
        </ErrorBoundary>
      </div>

      <button
        id="chat-launcher"
        type="button"
        onClick={() => (open ? closeChat() : openChat())}
        aria-label={open ? "Close the guide" : "Ask the MONEYVERSE Guide"}
        aria-expanded={open}
        className="pointer-events-auto flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-purple to-cyan text-2xl font-semibold text-white shadow-lg shadow-purple/40 transition hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan focus-visible:ring-offset-2 focus-visible:ring-offset-midnight"
      >
        <span aria-hidden="true">{open ? "×" : "?"}</span>
      </button>
    </div>
  );
}
