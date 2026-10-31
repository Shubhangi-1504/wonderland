import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Mission, Portfolio, ScenarioResult, Stock } from "../types";

interface GameState {
  portfolio: Portfolio;
  stocks: Stock[];
  xp: number;
  missions: Mission[];
  lastScenarioResult: ScenarioResult | null;
  hasEntered: boolean;

  setPortfolio: (portfolio: Portfolio) => void;
  setStocks: (stocks: Stock[]) => void;
  addXP: (n: number) => void;
  completeMission: (id: string) => void;
  setScenarioResult: (result: ScenarioResult | null) => void;
  setHasEntered: (value: boolean) => void;
}

/**
 * Global game store. Persisted to localStorage so guest mode survives refreshes.
 * Import anywhere with: `import { useGameStore } from "../store/useGameStore";`
 */
export const useGameStore = create<GameState>()(
  persist(
    (set) => ({
      portfolio: { cash: 10000, holdings: [] },
      stocks: [],
      xp: 0,
      missions: [],
      lastScenarioResult: null,
      hasEntered: false,

      setPortfolio: (portfolio) => set({ portfolio }),
      setStocks: (stocks) => set({ stocks }),
      addXP: (n) => set((state) => ({ xp: state.xp + n })),
      completeMission: (id) =>
        set((state) => ({
          // Mark the mission done and grant its XP exactly once.
          xp: state.xp + (state.missions.find((m) => m.id === id && !m.completed)?.xpReward ?? 0),
          missions: state.missions.map((m) => (m.id === id ? { ...m, completed: true } : m)),
        })),
      setScenarioResult: (lastScenarioResult) => set({ lastScenarioResult }),
      setHasEntered: (hasEntered) => set({ hasEntered }),
    }),
    {
      name: "moneyverse-game",
      storage: {
        getItem: (name) => {
          const storage = typeof window !== "undefined" && window.localStorage ? window.localStorage : (globalThis as any).localStorage;
          if (!storage) return null;
          const str = storage.getItem(name);
          return str ? JSON.parse(str) : null;
        },
        setItem: (name, value) => {
          const storage = typeof window !== "undefined" && window.localStorage ? window.localStorage : (globalThis as any).localStorage;
          if (storage) {
            storage.setItem(name, JSON.stringify(value));
          }
        },
        removeItem: (name) => {
          const storage = typeof window !== "undefined" && window.localStorage ? window.localStorage : (globalThis as any).localStorage;
          if (storage) {
            storage.removeItem(name);
          }
        },
      },
    },
  ),
);
