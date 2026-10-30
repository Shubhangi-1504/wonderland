import { useCallback, useEffect, useRef, useState } from "react";
import type { ChatMessage } from "../types";
import { askGuide } from "./askGuide";
import { buildContext } from "./buildContext";
import { useChatStore } from "./chatStore";
import { DISCLAIMER, QUICK_PROMPTS } from "./fallbacks";

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

/** Floating guide panel. Mounted once, rendered on every route. */
export function ChatPanel() {
  const [messages, setMessages] = useState<ChatMessage[]>(loadMessages);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const open = useChatStore((s) => s.open);
  const closeChat = useChatStore((s) => s.closeChat);
  const pending = useChatStore((s) => s.pending);
  const consumePending = useChatStore((s) => s.consumePending);

  const send = useCallback(
    async (text: string) => {
      const clean = text.trim();
      if (!clean || loading) return;

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

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

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

  return (
    <section
      aria-label="MONEYVERSE Guide"
      className="flex h-[min(70vh,540px)] w-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-midnight/95 shadow-2xl shadow-purple/20 backdrop-blur-xl"
    >
      {/* Header */}
      <header className="flex items-center gap-2 border-b border-white/10 bg-white/5 px-3 py-2.5">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-purple to-cyan text-sm font-bold text-white">
          M
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-display text-sm font-semibold leading-tight text-white">MONEYVERSE Guide</p>
          <p className="text-[11px] leading-tight text-cyan">Simulated financial tutor</p>
        </div>
        <button
          type="button"
          onClick={clearChat}
          className="rounded-md px-2 py-1 text-[11px] text-slate-400 transition hover:bg-white/10 hover:text-white"
        >
          Clear chat
        </button>
        <button
          type="button"
          onClick={closeChat}
          aria-label="Close chat"
          className="rounded-md px-2 py-1 text-lg leading-none text-slate-400 transition hover:bg-white/10 hover:text-white"
        >
          ×
        </button>
      </header>

      {/* Persistent disclaimer */}
      <p className="border-b border-gold/20 bg-gold/10 px-3 py-1.5 text-center text-[11px] text-gold">
        {DISCLAIMER}
      </p>

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
                  className="h-1.5 w-1.5 animate-bounce rounded-full bg-cyan"
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
            onClick={() => void send(prompt)}
            className="rounded-full border border-cyan/30 bg-cyan/10 px-3 py-1 text-[11px] text-cyan transition hover:bg-cyan/20 disabled:opacity-50"
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
          className="max-h-24 min-h-[42px] flex-1 resize-none rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-cyan focus:outline-none"
        />
        <button
          type="button"
          onClick={() => void send(input)}
          disabled={loading || !input.trim()}
          className="h-[42px] rounded-xl bg-gradient-to-br from-purple to-cyan px-4 text-sm font-semibold text-white transition disabled:opacity-40"
        >
          Send
        </button>
      </div>
    </section>
  );
}
