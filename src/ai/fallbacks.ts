import type { GuidePayload } from "./buildContext";

export const DISCLAIMER = "Educational and simulated. Not investment advice.";

/** Quick-reply chips shown above the input. Clicking one sends the text as-is. */
export const QUICK_PROMPTS = [
  "Why did my portfolio change?",
  "Explain diversification",
  "Quiz me",
  "What is a market crash?",
] as const;

const money = (n: number) => `$${Math.round(n).toLocaleString("en-US")}`;

const GENERIC =
  "I'm offline for a moment, but here's a quick thought: in MONEYVERSE everything is simulated, so use it as a safe place to practise. Spreading virtual coins across companies and sectors, and asking why prices moved, are the habits that matter. Ask me again in a little while!";

/** 2–4 sentence answers so the demo never shows a dead end. */
function portfolioChange(context?: GuidePayload): string {
  const facts = context?.facts;

  if (!facts || (!facts.hasResult && !facts.hasHoldings)) {
    return "You have no portfolio data to explain yet — there are no holdings and no saved scenario. Add a few virtual shares, run a simulated crash, then ask me again.";
  }
  if (!facts.hasResult) {
    return "I don't have a saved scenario result yet, so I can't explain a change. Run a scripted event in the simulator, then ask me again — I'll compare your before and after totals.";
  }
  if (!facts.hasHoldings) {
    return `In the simulated event "${facts.title}", you held no stocks, so your cash was unaffected. Buy a few virtual shares, replay an event, and I can show how concentration and sector exposure change the outcome.`;
  }

  const parts = [
    `In the simulated event "${facts.title}", your portfolio went from ${money(facts.totalBefore)} to ${money(facts.totalAfter)}, a ${facts.totalChangePct.toFixed(1)}% change.`,
  ];
  if (facts.worstHolding) {
    const best =
      facts.bestHolding && facts.bestHolding.symbol !== facts.worstHolding.symbol
        ? `, while ${facts.bestHolding.symbol} moved ${facts.bestHolding.changePct.toFixed(1)}%`
        : "";
    parts.push(
      `The biggest drag was ${facts.worstHolding.symbol} at ${facts.worstHolding.changePct.toFixed(1)}%${best}.`,
    );
  }
  const top = facts.sectorExposure[0];
  if (facts.concentrationFlag && top) {
    parts.push(
      `Concentration mattered: ${top.sector} was ${top.pct.toFixed(0)}% of your invested money, so that sector drove most of the loss.`,
    );
  }
  parts.push("Remember this is scripted game data, not real market data.");
  return parts.join(" ");
}

const DIVERSIFICATION =
  "Diversification means spreading your virtual coins across different companies, sectors and asset types, so one bad event can't wipe out everything. If all your money sits in one tech stock, a tech crash hurts a lot; spread across tech, energy, finance and health, the damage is usually smaller. It doesn't remove risk — it spreads it.";

const QUIZ =
  "Here's one question: which option best describes diversification?\n\nA) Putting all your coins into one fast-growing stock\nB) Spreading coins across different companies and sectors\nC) Only buying right after a market crash\n\nReply with A, B or C and I'll explain the answer.";

const MARKET_CRASH =
  "A market crash is a sudden, steep drop in prices across many stocks in a short time, usually driven by fear and selling. In MONEYVERSE, crashes are scripted events, so you can replay them and see how cash, concentration and sector exposure change the impact. Historically, broad markets have recovered over long periods, but there are no guarantees.";

const ADVICE =
  "I can't tell you to buy or sell any real stock — that would be investment advice, and I'm a learning guide. Generally, people weigh a company's business, valuation, competition and their own goals and risk tolerance, and many speak with a qualified professional. Here in MONEYVERSE feel free to test the idea with virtual coins instead.";

const MATCHERS: { test: RegExp; answer: (context?: GuidePayload) => string }[] = [
  { test: /portfolio|why did my .*change|what happened/i, answer: portfolioChange },
  { test: /diversif/i, answer: () => DIVERSIFICATION },
  { test: /quiz|test me|question/i, answer: () => QUIZ },
  { test: /crash|bear market/i, answer: () => MARKET_CRASH },
  { test: /\b(buy|sell|invest in|should i)\b|tesla|bitcoin|crypto|stock tip/i, answer: () => ADVICE },
];

/** Pick the matching canned answer for the last user message, else a generic one. */
export function getFallbackReply(userText: string, context?: GuidePayload): string {
  const hit = MATCHERS.find((matcher) => matcher.test.test(userText));
  return hit ? hit.answer(context) : GENERIC;
}
