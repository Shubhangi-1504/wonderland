import { create } from "zustand";

interface AuthModalState {
  open: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
}

/** Tiny store so any component can open the auth modal without prop drilling. */
export const useAuthModal = create<AuthModalState>((set) => ({
  open: false,
  openAuthModal: () => set({ open: true }),
  closeAuthModal: () => set({ open: false }),
}));

/** Call from anywhere (event handlers, other stores, etc.). */
export const openAuthModal = () => useAuthModal.getState().openAuthModal();
