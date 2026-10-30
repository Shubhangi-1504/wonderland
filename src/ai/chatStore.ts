import { create } from "zustand";
import { track } from "../lib/track";

export type ChatMode = "chat" | "quiz";

interface ChatState {
  open: boolean;
  mode: ChatMode;
  /** Message to send as soon as the panel can accept it (used by openChat(prefill)). */
  pending: string | null;
  setOpen: (open: boolean) => void;
  setMode: (mode: ChatMode) => void;
  openChat: (prefill?: string) => void;
  openQuiz: () => void;
  closeChat: () => void;
  consumePending: () => string | null;
}

/** Tiny store so any page can open the guide without prop drilling. */
export const useChatStore = create<ChatState>((set, get) => ({
  open: false,
  mode: "chat",
  pending: null,
  setOpen: (open) => set({ open }),
  setMode: (mode) => set({ mode }),
  openChat: (prefill) => {
    track("chat_opened", { source: prefill ? "prefill" : "launcher" });
    set({ open: true, mode: "chat", pending: prefill?.trim() || null });
  },
  openQuiz: () => {
    track("chat_opened", { source: "quiz" });
    set({ open: true, mode: "quiz", pending: null });
  },
  closeChat: () => set({ open: false }),
  consumePending: () => {
    const { pending } = get();
    if (pending) set({ pending: null });
    return pending;
  },
}));

/**
 * Call from anywhere (event handlers, other stores, pages).
 * Example: openChat("Explain what just happened to my portfolio.")
 */
export const openChat = (prefill?: string) => useChatStore.getState().openChat(prefill);

/** Open the panel directly in quiz mode (the "Quiz me" chip does this). */
export const openQuiz = () => useChatStore.getState().openQuiz();
