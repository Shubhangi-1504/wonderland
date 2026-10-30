import { describe, expect, it } from "vitest";
import type { Holding, Portfolio, ScenarioResult, Sector, Stock } from "../types";
import { explainScenario } from "./explainScenario";

const stock = (symbol: string, sector: Sector, beta = 1, price = 100): Stock => ({
  symbol,
  name: symbol,
  sector,
  beta,
  price,
  marketCap: 1_000_000,
  description: "",
});

const holding = (symbol: string, qty: number, avgPrice = 100): Holding => ({
  companyId: symbol.toLowerCase(),
  symbol,
  qty,
  avgCost: avgPrice,
  avgPrice,
});

/** ScenarioResult with the extra title/shock the sim engine may attach. */
const result = (
  scenarioId: string,
  before: number,
  after: number,
  perHolding: ScenarioResult["perHolding"],
  marketShockPct?: number,
): ScenarioResult =>
  ({ scenarioId, before, after, perHolding, marketShockPct } as ScenarioResult);

describe("explainScenario", () => {
  it("handles an empty portfolio and a missing result without throwing", () => {
    const facts = explainScenario({ cash: 0, holdings: [] }, [], null);

    expect(facts.hasHoldings).toBe(false);
    expect(facts.hasResult).toBe(false);
    expect(facts.totalBefore).toBe(0);
    expect(facts.totalAfter).toBe(0);
    expect(facts.totalChangePct).toBe(0);
    expect(facts.sectorExposure).toEqual([]);
    expect(facts.concentrationFlag).toBe(false);
    expect(facts.diversificationScore).toBe(0);
    expect(facts.cashShare).toBe(0);
    expect(facts.worstHolding).toBeNull();
    expect(facts.bestHolding).toBeNull();
    expect(facts.comparison.diversifiedAfter).toBe(0);
    expect(facts.lessons.length).toBeGreaterThanOrEqual(2);
    expect(facts.lessons.length).toBeLessThanOrEqual(3);
    expect(facts.lessons.join(" ")).toMatch(/no stocks/i);
  });

  it("flags a single stock as fully concentrated", () => {
    const portfolio: Portfolio = { cash: 1000, holdings: [holding("TECHX", 10)] };
    const stocks = [stock("TECHX", "tech", 1.2)];
    const scenario = result(
      "tech-crash",
      2000,
      1760,
      [{ symbol: "TECHX", before: 1000, after: 760, changePct: -24 }],
      -0.2,
    );

    const facts = explainScenario(portfolio, stocks, scenario);

    expect(facts.title).toBe("Tech crash");
    expect(facts.marketShockPct).toBe(-20);
    expect(facts.totalBefore).toBe(2000);
    expect(facts.totalAfter).toBe(1760);
    expect(facts.totalChangePct).toBe(-12);
    expect(facts.worstHolding).toEqual({ symbol: "TECHX", changePct: -24 });
    expect(facts.bestHolding).toEqual({ symbol: "TECHX", changePct: -24 });
    expect(facts.sectorExposure).toEqual([{ sector: "tech", pct: 100 }]);
    expect(facts.concentrationFlag).toBe(true);
    expect(facts.diversificationScore).toBeLessThanOrEqual(35);
    expect(facts.cashShare).toBe(50);
    expect(facts.betaNote).toMatch(/TECHX/);
    expect(facts.betaNote).toMatch(/beta 1.2/);
    expect(facts.lessons.join(" ")).toMatch(/single sector/i);
  });

  it("reports spread exposure and no concentration for a balanced portfolio", () => {
    const portfolio: Portfolio = {
      cash: 0,
      holdings: [holding("AAA", 10), holding("BBB", 10), holding("CCC", 10), holding("DDD", 10)],
    };
    const stocks = [
      stock("AAA", "tech"),
      stock("BBB", "energy"),
      stock("CCC", "finance"),
      stock("DDD", "health"),
    ];
    const scenario = result(
      "broad-drop",
      4000,
      3200,
      stocks.map((s) => ({ symbol: s.symbol, before: 1000, after: 800, changePct: -20 })),
      -20,
    );

    const facts = explainScenario(portfolio, stocks, scenario);

    expect(facts.concentrationFlag).toBe(false);
    expect(facts.sectorExposure).toHaveLength(4);
    expect(facts.sectorExposure.every((s) => s.pct === 25)).toBe(true);
    expect(facts.diversificationScore).toBeGreaterThan(50);
    expect(facts.cashShare).toBe(0);
    expect(facts.comparison.diversifiedChangePct).toBe(-20);
    expect(facts.comparison.diversifiedAfter).toBe(3200);
    expect(facts.comparison.diversifiedLoss).toBe(800);
    expect(facts.comparison.actualLoss).toBe(800);
    expect(facts.comparison.cashOnlyAfter).toBe(4000);
  });

  it("detects a concentrated sector across several holdings", () => {
    const portfolio: Portfolio = {
      cash: 0,
      holdings: [holding("A1", 10), holding("A2", 10), holding("A3", 10), holding("E1", 10)],
    };
    const stocks = [
      stock("A1", "tech", 1.4),
      stock("A2", "tech", 1.3),
      stock("A3", "tech", 1.2),
      stock("E1", "energy", 0.4),
    ];
    const scenario = result(
      "tech-crash",
      4000,
      2800,
      [
        { symbol: "A1", before: 1000, after: 600, changePct: -40 },
        { symbol: "A2", before: 1000, after: 600, changePct: -40 },
        { symbol: "A3", before: 1000, after: 600, changePct: -40 },
        { symbol: "E1", before: 1000, after: 1000, changePct: 0 },
      ],
      -0.2,
    );

    const facts = explainScenario(portfolio, stocks, scenario);

    expect(facts.sectorExposure[0]).toEqual({ sector: "tech", pct: 75 });
    expect(facts.concentrationFlag).toBe(true);
    expect(facts.worstHolding?.symbol).toBe("A1");
    expect(facts.bestHolding?.symbol).toBe("E1");
    // Energy beta 0.4 => -8%, techs' recorded -40% is used directly.
    expect(facts.betaNote).toMatch(/A1/);
    expect(facts.lessons.join(" ")).toMatch(/sector/i);
  });

  it("reports a high cash share for a cash-heavy portfolio", () => {
    const portfolio: Portfolio = { cash: 9000, holdings: [holding("SAFE", 10)] };
    const stocks = [stock("SAFE", "health", 0.5)];
    const scenario = result(
      "mild-dip",
      10000,
      9950,
      [{ symbol: "SAFE", before: 1000, after: 950, changePct: -5 }],
      -0.1,
    );

    const facts = explainScenario(portfolio, stocks, scenario);

    expect(facts.cashShare).toBe(90);
    expect(facts.totalChangePct).toBe(-0.5);
    expect(facts.lessons.join(" ")).toMatch(/cash was 90%/i);
    expect(facts.comparison.investedAmount).toBe(1000);
  });

  it("compares a diversified alternative when the shock is sector-specific", () => {
    const portfolio: Portfolio = { cash: 0, holdings: [holding("TECHX", 20)] };
    const stocks = [stock("TECHX", "tech", 2), stock("OIL", "energy", 0.5), stock("BANK", "finance", 0.8)];
    const scenario = result(
      "tech-crash",
      2000,
      1400,
      [{ symbol: "TECHX", before: 2000, after: 1400, changePct: -30 }],
      -0.2,
    );

    const facts = explainScenario(portfolio, stocks, scenario);

    // Equal split across TECHX (-30%), OIL (-10%), BANK (-16%) => -18.67%.
    expect(facts.comparison.diversifiedChangePct).toBeCloseTo(-18.67, 1);
    expect(facts.comparison.diversifiedLoss).toBeLessThan(facts.comparison.actualLoss);
    expect(facts.lessons.join(" ")).toMatch(/equally/i);
  });

  it("still works when stock metadata is missing", () => {
    const portfolio: Portfolio = { cash: 500, holdings: [holding("MYSTERY", 5, 50)] };
    const scenario = result("unknown", 750, 700, [
      { symbol: "MYSTERY", before: 250, after: 200, changePct: -20 },
    ]);

    const facts = explainScenario(portfolio, [], scenario);

    expect(facts.sectorExposure).toEqual([{ sector: "other", pct: 100 }]);
    expect(facts.totalBefore).toBe(750);
    expect(facts.totalAfter).toBe(700);
    expect(facts.marketShockPct).toBeNull();
    expect(facts.betaNote).toMatch(/no market shock/i);
    expect(facts.comparison.diversifiedChangePct).toBe(-20);
  });

  it("derives totals from the portfolio when no result exists", () => {
    const portfolio: Portfolio = { cash: 250, holdings: [holding("AAA", 10)] };
    const stocks = [stock("AAA", "tech", 1)];

    const facts = explainScenario(portfolio, stocks, undefined);

    expect(facts.hasResult).toBe(false);
    expect(facts.totalBefore).toBe(1250);
    expect(facts.totalAfter).toBe(1250);
    expect(facts.totalChangePct).toBe(0);
    expect(facts.lessons.join(" ")).toMatch(/run a simulated crash/i);
  });
});
