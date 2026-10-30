import { create } from "zustand";

interface ChatState {
  open: boolean;
  /** Message to send as soon as the panel can accept it (used by openChat(prefill)). */
  pending: string | null;
  setOpen: (open: boolean) => void;
  openChat: (prefill?: string) => void;
  closeChat: () => void;
  consumePending: () => string | null;
}

/** Tiny store so any page can open the guide without prop drilling. */
export const useChatStore = create<ChatState>((set, get) => ({
  open: false,
  pending: null,
  setOpen: (open) => set({ open }),
  openChat: (prefill) => set({ open: true, pending: prefill?.trim() || null }),
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
