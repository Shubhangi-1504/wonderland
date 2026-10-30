/**
 * Shared contracts for MONEYVERSE.
 * Everyone imports from here so the 3D, trading, portfolio and AI teams stay in sync.
 */

export type Sector = "tech" | "energy" | "finance" | "health";

export interface Stock {
  symbol: string;
  name: string;
  sector: Sector;
  beta: number;
  price: number;
  marketCap: number;
  description: string;
}

export interface Holding {
  symbol: string;
  qty: number;
  avgPrice: number;
}

export interface Portfolio {
  cash: number;
  holdings: Holding[];
}

export interface Scenario {
  id: string;
  title: string;
  headline: string;
  /** Overall market move, e.g. -0.2 for a 20% crash. */
  marketShockPct: number;
  /** Optional per-sector multipliers layered on top of the market shock. */
  sectorBetas?: Partial<Record<Sector, number>>;
  explanation: string;
}

export interface ScenarioResult {
  scenarioId: string;
  before: number;
  after: number;
  perHolding: { symbol: string; before: number; after: number; changePct: number }[];
}

export interface Mission {
  id: string;
  title: string;
  description: string;
  xpReward: number;
  completed: boolean;
}

export interface AuthState {
  user: { id: string; email?: string } | null;
  isGuest: boolean;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

/** Context the AI guide receives alongside the conversation. */
export interface GuideContext {
  portfolio: Portfolio | null;
  lastEvent: ScenarioResult | null;
}
