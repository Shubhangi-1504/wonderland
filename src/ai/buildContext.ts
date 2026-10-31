import { useGameStore } from "../store/useGameStore";
import type { ScenarioResult } from "../types";

/** Compact, prompt-sized snapshot of the player's simulated portfolio. */
export interface GuidePayload {
  portfolio: {
    cash: number;
    totalValue: number;
    holdings: {
      symbol: string;
      qty: number;
      avgPrice: number;
      sector: string | null;
      price: number | null;
      value: number;
    }[];
  };
  lastEvent: {
    title: string;
    marketShockPct: number | null;
    before: number;
    after: number;
    changePct: number;
    perHolding: { symbol: string; before: number; after: number; changePct: number }[];
  } | null;
}

const round = (n: number) => Math.round(n * 100) / 100;

/** "tech-crash" -> "Tech crash" when the result carries no title. */
const humanize = (id: string) => id.replace(/[-_]+/g, " ").replace(/^./, (c) => c.toUpperCase());

/**
 * Read the zustand store once and flatten it into the small object the guide
 * needs. Safe on an empty store (default state has cash and no holdings).
 */
export function buildContext(): GuidePayload {
  const { portfolio, stocks, lastScenarioResult } = useGameStore.getState();

  const cash = portfolio?.cash ?? 0;
  const priceBySymbol = new Map((stocks ?? []).map((stock) => [stock.symbol, stock]));

    const holdings = (portfolio?.holdings ?? []).flatMap((holding) => {
    // Skip malformed rows that have no symbol.
    if (!holding.symbol) return [];
    const stock = priceBySymbol.get(holding.symbol);
    // Without a live quote, fall back to the average purchase price.
    const price = typeof stock?.price === "number" ? stock.price : null;
    const avgPrice = holding.avgPrice ?? 0;
    return [
      {
        symbol: holding.symbol,
        qty: holding.qty,
        avgPrice,
        sector: stock?.sector ?? null,
        price,
        value: round((price ?? avgPrice) * holding.qty),
      },
    ];
  });

  const holdingsValue = holdings.reduce((sum, holding) => sum + holding.value, 0);

  return {
    portfolio: { cash: round(cash), totalValue: round(cash + holdingsValue), holdings },
    lastEvent: summarizeEvent(lastScenarioResult),
  };
}

function summarizeEvent(result: ScenarioResult | null | undefined): GuidePayload["lastEvent"] {
  if (!result) return null;
  // ScenarioResult has no title/marketShockPct today; the sim may add them later.
  const extra = result as ScenarioResult & { title?: string; marketShockPct?: number };
  const changePct = result.before > 0 ? ((result.after - result.before) / result.before) * 100 : 0;

  return {
    title: extra.title ?? humanize(result.scenarioId),
    marketShockPct: typeof extra.marketShockPct === "number" ? extra.marketShockPct : null,
    before: round(result.before),
    after: round(result.after),
    changePct: round(changePct),
    perHolding: (result.perHolding ?? []).map((row) => ({
      symbol: row.symbol,
      before: round(row.before),
      after: round(row.after),
      changePct: round(row.changePct),
    })),
  };
}
