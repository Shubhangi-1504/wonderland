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
  const holdings = context?.portfolio.holdings ?? [];
  const event = context?.lastEvent;

  if (!event) {
    return "I don't have a saved scenario result yet, so I can't explain a change. Run a scripted event in the simulator, then ask me again — I'll compare your before and after totals.";
  }
  if (holdings.length === 0) {
    return `Your portfolio held no stocks during "${event.title}", so the event mostly left your cash untouched. Buy a few virtual shares, replay an event, and I can show how concentration and sector exposure change the outcome.`;
  }

  const totalChange = event.before > 0 ? ((event.after - event.before) / event.before) * 100 : 0;
  const worst = [...event.perHolding].sort((a, b) => a.changePct - b.changePct)[0];
  const best = [...event.perHolding].sort((a, b) => b.changePct - a.changePct)[0];
  const mover = worst
    ? ` The biggest drag was ${worst.symbol} at ${worst.changePct.toFixed(1)}%${best && best.symbol !== worst.symbol ? `, while ${best.symbol} moved ${best.changePct.toFixed(1)}%` : ""}.`
    : "";

  return `In the simulated event "${event.title}", your portfolio went from ${money(event.before)} to ${money(event.after)}, a ${totalChange.toFixed(1)}% change.${mover} Remember this is a scripted game event, not real market data.`;
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
