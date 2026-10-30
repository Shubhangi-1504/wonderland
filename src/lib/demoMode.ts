import { COMPANIES } from "../sim";
import { useGameStore } from "../store/useGameStore";
import type { Mission, Portfolio, Stock } from "../types";

/**
 * MONEYVERSE Demo Mode
 *
 * Activated by appending ?demo=1 to any URL.
 * Sets a localStorage flag and preloads the Zustand store with sample data
 * so judges/evaluators can demo all features without network access or signup.
 */

export const DEMO_STORAGE_KEY = "moneyverse_demo_active";

export const DEMO_PORTFOLIO: Portfolio = {
  cash: 4000,
  holdings: [
    { companyId: "nova-loom", symbol: "NVLM", qty: 15, avgCost: 120, avgPrice: 120 },
    { companyId: "hearth-harbor", symbol: "HRHB", qty: 25, avgCost: 48, avgPrice: 48 },
    { companyId: "voltara-grid", symbol: "VLTA", qty: 10, avgCost: 76, avgPrice: 76 },
  ],
};

export const DEMO_XP = 120;

export const DEMO_MISSIONS: Mission[] = [
  {
    id: "first-trade",
    title: "First Investment",
    description: "Purchase shares in a simulated company",
    reward: 50,
    xpReward: 50,
    completed: true,
  },
  {
    id: "diversify-sectors",
    title: "Sector Spreader",
    description: "Hold positions across at least 2 different market sectors",
    reward: 70,
    xpReward: 70,
    completed: true,
  },
  {
    id: "survive-crash",
    title: "Market Resilience",
    description: "Observe portfolio change during a simulated market correction",
    reward: 100,
    xpReward: 100,
    completed: false,
  },
];

export const DEMO_STOCKS: Stock[] = COMPANIES.map((c) => ({
  symbol: c.ticker,
  name: c.name,
  sector: c.sector,
  beta: c.beta,
  price: c.basePrice,
  marketCap: c.basePrice * c.sharesOutstanding,
  description: c.description,
}));

/**
 * Returns true if the app is currently running in Demo Mode.
 * Checks query string ?demo=1 and the persisted localStorage flag.
 */
export function isDemoMode(): boolean {
  try {
    if (typeof window === "undefined") return false;
    const params = new URLSearchParams(window.location.search);
    if (params.get("demo") === "1") {
      localStorage.setItem(DEMO_STORAGE_KEY, "true");
      return true;
    }
    return localStorage.getItem(DEMO_STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

/**
 * Preloads the store if demo mode is enabled.
 * Safe to call at startup (main.tsx).
 */
export function initDemoMode(): boolean {
  if (!isDemoMode()) return false;

  useGameStore.setState({
    portfolio: DEMO_PORTFOLIO,
    xp: DEMO_XP,
    missions: DEMO_MISSIONS,
    stocks: DEMO_STOCKS,
    hasEntered: true,
  });

  return true;
}

/**
 * Clears demo mode and resets the store back to initial blank slate.
 */
export function resetDemo(): void {
  try {
    localStorage.removeItem(DEMO_STORAGE_KEY);
    if (typeof window !== "undefined" && window.location.search.includes("demo=1")) {
      const url = new URL(window.location.href);
      url.searchParams.delete("demo");
      window.history.replaceState({}, "", url.pathname + (url.search ? url.search : ""));
    }
  } catch {
    // Ignore storage errors in private browsing
  }

  useGameStore.setState({
    portfolio: { cash: 10000, holdings: [] },
    xp: 0,
    missions: [],
    lastScenarioResult: null,
    hasEntered: false,
  });
}

