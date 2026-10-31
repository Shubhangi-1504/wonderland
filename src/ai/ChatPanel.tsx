import { useCallback, useEffect, useRef, useState } from "react";
import { SimulatedBadge } from "../components/shared/SimulatedBadge";
import { track } from "../lib/track";
import type { ChatMessage } from "../types";
import { askGuide } from "./askGuide";
import { buildContext } from "./buildContext";
import { useChatStore } from "./chatStore";
import { DISCLAIMER, QUICK_PROMPTS } from "./fallbacks";
import { QuizCard } from "./quiz/QuizCard";

const STORAGE_KEY = "moneyverse-chat-v1";
const GREETING: ChatMessage = {
  role: "assistant",
  content:
    "Hi! I'm the MONEYVERSE Guide. Everything here is simulated, so it's a safe place to ask about stocks, risk or why your portfolio moved.",
};

function loadMessages(): ChatMessage[] {
  try {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    if (!saved) return [GREETING];
    const parsed = JSON.parse(saved) as unknown;
    if (!Array.isArray(parsed)) return [GREETING];
    const valid = parsed.filter(
      (m): m is ChatMessage =>
        !!m &&
        typeof m === "object" &&
        ((m as ChatMessage).role === "user" || (m as ChatMessage).role === "assistant") &&
        typeof (m as ChatMessage).content === "string",
    );
    return valid.length ? valid.slice(-30) : [GREETING];
  } catch {
    return [GREETING];
  }
}

const FOCUSABLE =
  'button:not([disabled]), [href], input, textarea, select, [tabindex]:not([tabindex="-1"])';

/** Floating guide panel. Mounted once, rendered on every route. */
export function ChatPanel() {
  const [messages, setMessages] = useState<ChatMessage[]>(loadMessages);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const panelRef = useRef<HTMLElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const wasOpen = useRef(false);

  const open = useChatStore((s) => s.open);
  const mode = useChatStore((s) => s.mode);
  const setMode = useChatStore((s) => s.setMode);
  const closeChat = useChatStore((s) => s.closeChat);
  const pending = useChatStore((s) => s.pending);
  const consumePending = useChatStore((s) => s.consumePending);
  const openQuiz = useChatStore((s) => s.openQuiz);

  const send = useCallback(
    async (text: string) => {
      const clean = text.trim();
      if (!clean || loading) return;

      track("chat_message_sent", { length: clean.length });
      const userMessage: ChatMessage = { role: "user", content: clean };
      const conversation = [...messages, userMessage];
      setMessages(conversation);
      setInput("");
      setLoading(true);

      try {
        // buildContext reads the live zustand store, so portfolio data is current.
        const { reply } = await askGuide(conversation, buildContext());
        setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
      } catch {
        // askGuide already falls back; this is a last-resort guard.
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: "Something glitched on my side. Please try that again in a moment!" },
        ]);
      } finally {
        setLoading(false);
      }
    },
    [loading, messages],
  );

  // Survives route changes and refreshes within the tab.
  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-30)));
    } catch {
      /* storage full or blocked — chat still works in memory */
    }
  }, [messages]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  // openChat(prefill) from another page: send it as soon as the panel opens.
  useEffect(() => {
    if (pending && !loading) void send(consumePending() ?? "");
  }, [pending, loading, send, consumePending]);

  // Move focus into the panel on open (and Esc-to-close from anywhere).
  useEffect(() => {
    if (!open) return;
    const target =
      mode === "chat"
        ? inputRef.current
        : panelRef.current?.querySelector<HTMLElement>("[data-autofocus]");
    const timer = window.setTimeout(() => (target ?? panelRef.current)?.focus(), 0);

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeChat();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, mode, closeChat]);

  // Esc/close returns focus to the launcher instead of dropping it on <body>.
  useEffect(() => {
    if (wasOpen.current && !open) document.getElementById("chat-launcher")?.focus();
    wasOpen.current = open;
  }, [open]);

  /** Keep Tab focus inside the panel while it is open. */
  const trapFocus = (event: React.KeyboardEvent<HTMLElement>) => {
    if (event.key !== "Tab" || !panelRef.current) return;
    const nodes = Array.from(panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
      (node) => node.offsetParent !== null,
    );
    if (nodes.length === 0) return;
    const first = nodes[0];
    const last = nodes[nodes.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void send(input);
    }
  };

  const clearChat = () => {
    setMessages([GREETING]);
    setLoading(false);
  };

  const handleChip = (prompt: string) => {
    track("chip_used", { chip: prompt });
    if (prompt === "Quiz me") {
      openQuiz();
      return;
    }
    void send(prompt);
  };

  return (
    <section
      ref={panelRef}
      tabIndex={-1}
      aria-label={mode === "quiz" ? "MONEYVERSE quiz" : "MONEYVERSE Guide"}
      onKeyDown={trapFocus}
      className="flex h-[min(70vh,540px)] w-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-midnight/95 shadow-2xl shadow-purple/20 backdrop-blur-xl focus:outline-none"
    >
      {/* Header */}
      <header className="flex items-center gap-2 border-b border-white/10 bg-white/5 px-3 py-2.5">
        <span
          aria-hidden="true"
          className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-purple to-cyan text-sm font-bold text-white"
        >
          M
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-display text-sm font-semibold leading-tight text-white">
            {mode === "quiz" ? "MONEYVERSE Quiz" : "MONEYVERSE Guide"}
          </p>
          <p className="text-[11px] leading-tight text-cyan">
            {mode === "quiz" ? "5 questions · 10 XP each" : "Simulated financial tutor"}
          </p>
        </div>
        <SimulatedBadge />
        {mode === "quiz" ? (
          <button
            type="button"
            onClick={() => setMode("chat")}
            className="rounded-md px-2 py-1 text-[11px] text-slate-400 transition hover:bg-white/10 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan"
          >
            Back
          </button>
        ) : (
          <button
            type="button"
            onClick={clearChat}
            className="rounded-md px-2 py-1 text-[11px] text-slate-400 transition hover:bg-white/10 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan"
          >
            Clear chat
          </button>
        )}
        <button
          type="button"
          onClick={closeChat}
          aria-label="Close chat"
          className="rounded-md px-2 py-1 text-lg leading-none text-slate-400 transition hover:bg-white/10 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan"
        >
          ×
        </button>
      </header>

      {/* Persistent disclaimer */}
      <p className="border-b border-gold/20 bg-gold/10 px-3 py-1.5 text-center text-[11px] text-gold">
        {DISCLAIMER}
      </p>

      {mode === "quiz" ? (
        <QuizCard />
      ) : (
        <>
          {/* Messages */}
          <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto p-3" aria-live="polite">
            {messages.map((message, index) => (
              <div key={index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                <p
                  className={`max-w-[85%] whitespace-pre-wrap break-words rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                    message.role === "user"
                      ? "rounded-br-sm bg-purple text-white"
                      : "rounded-bl-sm border border-white/10 bg-white/5 text-slate-100"
                  }`}
                >
                  {message.content}
                </p>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="flex items-center gap-1 rounded-2xl rounded-bl-sm border border-white/10 bg-white/5 px-3 py-2.5">
                  {[0, 150, 300].map((delay) => (
                    <span
                      key={delay}
                      className="h-1.5 w-1.5 animate-bounce rounded-full bg-cyan motion-reduce:animate-none"
                      style={{ animationDelay: `${delay}ms` }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Quick replies */}
          <div className="flex flex-wrap gap-1.5 px-3 pb-2 pt-1">
            {QUICK_PROMPTS.map((prompt) => (
              <button
                key={prompt}
                type="button"
                disabled={loading}
                onClick={() => handleChip(prompt)}
                aria-label={`Ask the guide: ${prompt}`}
                className="rounded-full border border-cyan/30 bg-cyan/10 px-3 py-1 text-[11px] text-cyan transition hover:bg-cyan/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan disabled:opacity-50"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="flex items-end gap-2 border-t border-white/10 p-2.5">
            <textarea
              ref={inputRef}
              rows={1}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about stocks or risk…"
              aria-label="Message the guide"
              className="max-h-24 min-h-[42px] flex-1 resize-none rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-cyan focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan"
            />
            <button
              type="button"
              onClick={() => void send(input)}
              disabled={loading || !input.trim()}
              aria-label="Send message"
              className="h-[42px] rounded-xl bg-gradient-to-br from-purple to-cyan px-4 text-sm font-semibold text-white transition focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan disabled:opacity-40"
            >
              Send
            </button>
          </div>
        </>
      )}
    </section>
  );
}
