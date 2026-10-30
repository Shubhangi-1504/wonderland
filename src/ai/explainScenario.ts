import type { Portfolio, ScenarioResult, Stock } from "../types";

/**
 * Deterministic "what happened" facts. Pure, no LLM, no I/O, never throws.
 * These numbers are the single source of truth sent to /api/chat, so the model
 * explains them instead of inventing its own arithmetic.
 */

export interface HoldingFact {
  symbol: string;
  /** Percent change across the event, e.g. -24. */
  changePct: number;
}

export interface SectorFact {
  sector: string;
  /** Share of invested value before the event, 0-100. */
  pct: number;
}

export interface DiversifiedComparison {
  /** Amount the user had invested before the event. */
  investedAmount: number;
  /** What the same amount would be worth split equally across all available stocks. */
  diversifiedAfter: number;
  diversifiedChangePct: number | null;
  /** Loss (positive number) under the diversified alternative. */
  diversifiedLoss: number;
  /** The user's actual invested loss (positive number). */
  actualLoss: number;
  /** Actual change on the invested portion only, in percent. */
  actualChangePct: number | null;
  /** The same amount held as cash: unchanged. */
  cashOnlyAfter: number;
}

export interface ScenarioFacts {
  hasHoldings: boolean;
  hasResult: boolean;
  title: string;
  headline: string;
  /** Market shock in percent, e.g. -20. */
  marketShockPct: number | null;
  totalBefore: number;
  totalAfter: number;
  totalChangePct: number;
  worstHolding: HoldingFact | null;
  bestHolding: HoldingFact | null;
  sectorExposure: SectorFact[];
  concentrationFlag: boolean;
  /** 0-100, from number of holdings and sector spread. */
  diversificationScore: number;
  /** Cash as a share of total portfolio value, 0-100. */
  cashShare: number;
  comparison: DiversifiedComparison;
  betaNote: string;
  lessons: string[];
}

type ResultExtras = ScenarioResult & { title?: string; headline?: string; marketShockPct?: number };

const num = (v: unknown): number | null =>
  typeof v === "number" && Number.isFinite(v) ? v : null;

const round2 = (n: number) => Math.round(n * 100) / 100;

const share = (part: number, whole: number) => (whole > 0 ? round2((part / whole) * 100) : 0);

const money = (n: number) =>
  `$${Math.round(Number.isFinite(n) ? n : 0).toLocaleString("en-US")}`;

const humanize = (id: string) =>
  id.replace(/[-_]+/g, " ").replace(/^./, (c) => c.toUpperCase());

const mean = (values: number[]) =>
  values.length ? values.reduce((sum, v) => sum + v, 0) / values.length : null;

/**
 * Compute every number the Guide and the summary card need.
 * `result` may be null (no scenario run yet) and `stocks` may be empty.
 */
export function explainScenario(
  portfolio: Portfolio | null | undefined,
  stocks: Stock[] | null | undefined,
  result: ScenarioResult | null | undefined,
): ScenarioFacts {
  const rawCash = num(portfolio?.cash);
  const cash = rawCash !== null && rawCash > 0 ? rawCash : 0;
  const holdings = (portfolio?.holdings ?? []).filter(
    (h) => !!h && typeof h.qty === "number" && h.qty > 0,
  );

  const stockList = Array.isArray(stocks) ? stocks : [];
  const bySymbol = new Map(stockList.filter((s) => !!s?.symbol).map((s) => [s.symbol, s]));

  const extra = (result ?? {}) as ResultExtras;
  const rows = new Map(
    (result?.perHolding ?? []).filter((row) => !!row?.symbol).map((row) => [row.symbol, row]),
  );

  // Value each holding before/after the event, falling back to price or avgPrice.
  const valued = holdings.map((holding) => {
    // Holdings carry companyId + optional UI aliases (symbol/avgPrice).
    const symbol = holding.symbol || holding.companyId || "unknown";
    const stock = bySymbol.get(symbol) ?? bySymbol.get(holding.companyId);
    const row = rows.get(symbol) ?? rows.get(holding.companyId);
    const unit = num(stock?.price) ?? num(holding.avgPrice) ?? num(holding.avgCost) ?? 0;
    const before = num(row?.before) ?? unit * holding.qty;
    const after = num(row?.after) ?? before;
    const changePct = num(row?.changePct) ?? (before > 0 ? round2(((after - before) / before) * 100) : null);
    return {
      symbol,
      sector: typeof stock?.sector === "string" ? stock.sector : "other",
      beta: num(stock?.beta),
      before: round2(before),
      after: round2(after),
      changePct,
    };
  });

  const investedBefore = round2(valued.reduce((sum, h) => sum + h.before, 0));
  const investedAfter = round2(valued.reduce((sum, h) => sum + h.after, 0));

  // Totals prefer the scenario engine's numbers when it recorded them.
  const totalBefore = num(result?.before) ?? round2(cash + investedBefore);
  const totalAfter = num(result?.after) ?? totalBefore;
  const totalChangePct = totalBefore > 0 ? round2(((totalAfter - totalBefore) / totalBefore) * 100) : 0;

  // Normalise the shock: Scenario uses fractions (-0.2), payloads may use -20.
  const rawShock = num(extra.marketShockPct);
  const marketShockPct =
    rawShock === null ? null : round2(Math.abs(rawShock) <= 1.5 ? rawShock * 100 : rawShock);

  const withChange = valued.filter(
    (h): h is typeof h & { changePct: number } => h.changePct !== null,
  );
  const worstHolding = withChange.length
    ? withChange.reduce((worst, h) => (h.changePct < worst.changePct ? h : worst))
    : null;
  const bestHolding = withChange.length
    ? withChange.reduce((best, h) => (h.changePct > best.changePct ? h : best))
    : null;

  // Sector exposure by invested value BEFORE the event.
  const sectorTotals = new Map<string, number>();
  for (const h of valued) {
    sectorTotals.set(h.sector, (sectorTotals.get(h.sector) ?? 0) + h.before);
  }
  const sectorExposure = [...sectorTotals.entries()]
    .map(([sector, value]) => ({ sector, pct: share(value, investedBefore) }))
    .sort((a, b) => b.pct - a.pct);

  const largestHoldingPct = valued.length
    ? Math.max(...valued.map((h) => share(h.before, investedBefore)))
    : 0;
  const concentrationFlag =
    largestHoldingPct > 50 || (sectorExposure[0]?.pct ?? 0) > 50;

  // Simple 0-100: half for holding count (6+ caps out), half for sectors (4 caps out).
  const sectorCount = sectorExposure.length;
  let diversificationScore =
    valued.length === 0
      ? 0
      : Math.round(
          50 * (Math.min(valued.length, 6) / 6) + 50 * (Math.min(sectorCount, 4) / 4),
        );
  if (concentrationFlag) diversificationScore = Math.min(diversificationScore, 35);

  const portfolioValue = round2(cash + investedBefore);
  const cashShare = portfolioValue > 0 ? share(cash, portfolioValue) : 0;

  // Diversified alternative: same invested amount, equal weight across all stocks.
  const estimatedChanges: number[] = [];
  for (const stock of stockList) {
    const direct = num(rows.get(stock.symbol)?.changePct);
    const viaBeta =
      marketShockPct !== null ? round2(marketShockPct * (num(stock.beta) ?? 1)) : null;
    const change = direct ?? viaBeta;
    if (change !== null) estimatedChanges.push(change);
  }
  if (estimatedChanges.length === 0) {
    for (const h of withChange) estimatedChanges.push(h.changePct);
  }
  const diversifiedChangePct = mean(estimatedChanges);
  const diversifiedAfter =
    diversifiedChangePct === null
      ? investedBefore
      : round2(Math.max(0, investedBefore * (1 + diversifiedChangePct / 100)));

  const comparison: DiversifiedComparison = {
    investedAmount: investedBefore,
    diversifiedAfter,
    diversifiedChangePct: diversifiedChangePct === null ? null : round2(diversifiedChangePct),
    diversifiedLoss: round2(Math.max(0, investedBefore - diversifiedAfter)),
    actualLoss: round2(Math.max(0, investedBefore - investedAfter)),
    actualChangePct: investedBefore > 0 ? round2(((investedAfter - investedBefore) / investedBefore) * 100) : null,
    cashOnlyAfter: investedBefore,
  };

  const title =
    typeof extra.title === "string" && extra.title.trim()
      ? extra.title.trim()
      : result?.scenarioId
        ? humanize(result.scenarioId)
        : "No scenario yet";
  const headline =
    typeof extra.headline === "string" && extra.headline.trim()
      ? extra.headline.trim()
      : marketShockPct !== null
        ? `Simulated market move of ${marketShockPct}% in this fictional event.`
        : result
          ? `Simulated event affecting ${valued.length} holding${valued.length === 1 ? "" : "s"}; all figures are precomputed.`
          : "No simulated event data has been recorded yet.";

  const betaNote = buildBetaNote(valued, marketShockPct);
  const lessons = buildLessons({
    valued,
    sectorExposure,
    concentrationFlag,
    largestHoldingPct,
    cashShare,
    actualChangePct: comparison.actualChangePct,
    diversifiedChangePct,
    investedBefore,
    hasResult: !!result,
    worstHolding,
  });

  return {
    hasHoldings: valued.length > 0,
    hasResult: !!result,
    title,
    headline,
    marketShockPct,
    totalBefore: round2(totalBefore),
    totalAfter: round2(totalAfter),
    totalChangePct,
    worstHolding: worstHolding ? { symbol: worstHolding.symbol, changePct: worstHolding.changePct } : null,
    bestHolding: bestHolding ? { symbol: bestHolding.symbol, changePct: bestHolding.changePct } : null,
    sectorExposure,
    concentrationFlag,
    diversificationScore,
    cashShare,
    comparison,
    betaNote,
    lessons,
  };
}

function buildBetaNote(
  valued: { symbol: string; changePct: number | null; beta: number | null }[],
  marketShockPct: number | null,
): string {
  if (valued.length === 0) {
    return "You held no stocks during this event, so market beta did not affect you.";
  }
  if (marketShockPct === null) {
    return "No market shock was recorded, so there is no beta comparison for this event.";
  }
  const fellMore = valued
    .filter((h) => h.changePct !== null && h.changePct < marketShockPct - 0.01)
    .sort((a, b) => (a.changePct ?? 0) - (b.changePct ?? 0))
    .slice(0, 3);

  if (fellMore.length === 0) {
    return `No holding fell further than the ${marketShockPct}% simulated market shock, so lower-beta or defensive holdings cushioned the drop.`;
  }
  const list = fellMore
    .map((h) => {
      const beta = h.beta !== null ? `, beta ${h.beta}` : "";
      return `${h.symbol} (${h.changePct?.toFixed(1)}%${beta})`;
    })
    .join(", ");
  return `${list} fell more than the ${marketShockPct}% simulated market shock. Higher-beta holdings amplify market moves, up and down.`;
}

function buildLessons(input: {
  valued: { symbol: string; before: number; changePct: number | null }[];
  sectorExposure: SectorFact[];
  concentrationFlag: boolean;
  largestHoldingPct: number;
  cashShare: number;
  actualChangePct: number | null;
  diversifiedChangePct: number | null;
  investedBefore: number;
  hasResult: boolean;
  worstHolding: { symbol: string; changePct: number } | null;
}): string[] {
  const lessons: string[] = [];
  const topSector = input.sectorExposure[0];

  if (input.valued.length === 0) {
    lessons.push("You held no stocks, so this simulated event left your cash untouched.");
  } else {
    if (topSector && topSector.pct > 50) {
      lessons.push(
        `A single sector (${topSector.sector}) made up ${topSector.pct.toFixed(0)}% of your investments, so it dominated the change.`,
      );
    }
    if (input.cashShare >= 50) {
      lessons.push(
        `Cash was ${input.cashShare.toFixed(0)}% of your portfolio, which softened the drop.`,
      );
    }
    if (input.largestHoldingPct > 50) {
      const biggest = [...input.valued].sort((a, b) => b.before - a.before)[0];
      lessons.push(
        `${biggest?.symbol ?? "One holding"} alone was ${input.largestHoldingPct.toFixed(0)}% of your invested money, so its move drove most of the result.`,
      );
    }
    if (
      input.hasResult &&
      input.diversifiedChangePct !== null &&
      input.actualChangePct !== null &&
      Math.abs(input.diversifiedChangePct - input.actualChangePct) >= 0.5
    ) {
      lessons.push(
        `Spreading the same ${money(input.investedBefore)} equally across all available stocks would have changed your investments by ${input.diversifiedChangePct.toFixed(1)}% instead of ${input.actualChangePct.toFixed(1)}%.`,
      );
    }
  }

  if (!input.hasResult) {
    lessons.push("Run a simulated crash to see how these holdings react, then ask again.");
  }
  if (input.worstHolding && input.worstHolding.changePct < -10) {
    lessons.push("Panic selling locks in a loss; in this simulation you can replay the event and compare.");
  }
  lessons.push(
    "Diversifying across several companies and sectors is the simplest way to reduce a single shock.",
  );

  return lessons.slice(0, 3);
}
