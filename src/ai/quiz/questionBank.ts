/**
 * Beginner quiz bank. Pure data + a shape validator shared with /api/chat
 * (so a model-generated question is only used if it matches this contract).
 */

export type QuizTopic = "stocks" | "diversification" | "risk" | "ipo" | "mutual-funds" | "crash";

export const QUIZ_TOPICS: QuizTopic[] = [
  "stocks",
  "diversification",
  "risk",
  "ipo",
  "mutual-funds",
  "crash",
];

export interface QuizQuestion {
  id: string;
  topic: QuizTopic;
  question: string;
  /** Exactly four options. */
  options: string[];
  /** Index into options, 0-3. */
  correctIndex: number;
  explanation: string;
}

export const QUESTION_BANK: QuizQuestion[] = [
  {
    id: "q-stock-1",
    topic: "stocks",
    question: "What does owning a share of stock mean?",
    options: [
      "You lent money to the company and get fixed interest",
      "You own a small piece of the company",
      "You are guaranteed a profit when the price rises",
      "You are responsible for the company's debts",
    ],
    correctIndex: 1,
    explanation:
      "A share is a unit of ownership, so shareholders own a slice of the business and its future profits or losses.",
  },
  {
    id: "q-stock-2",
    topic: "stocks",
    question: "If a company's share price falls after you buy, what happens?",
    options: [
      "You automatically lose your shares",
      "Your loss is real only once you sell, but the value has dropped",
      "The company must refund you",
      "You owe the exchange the difference",
    ],
    correctIndex: 1,
    explanation:
      "The unrealised value drops straight away. Selling turns it into a realised loss, while holding leaves room to recover — with no guarantee.",
  },
  {
    id: "q-div-1",
    topic: "diversification",
    question: "What is diversification?",
    options: [
      "Putting all your money in the fastest-growing stock",
      "Spreading money across different companies and sectors",
      "Only buying after a crash",
      "Holding everything in cash forever",
    ],
    correctIndex: 1,
    explanation:
      "Diversification spreads risk so one company or sector doing badly hurts less. It reduces risk but does not remove it.",
  },
  {
    id: "q-div-2",
    topic: "diversification",
    question: "Why can a portfolio concentrated in one sector be riskier?",
    options: [
      "Sector news affects all of those companies at once",
      "Concentrated portfolios never pay dividends",
      "Single-sector stocks cannot be sold",
      "Sectors always move in opposite directions",
    ],
    correctIndex: 0,
    explanation:
      "Companies in the same sector share customers, rules and sentiment, so one shock can hit them all together.",
  },
  {
    id: "q-risk-1",
    topic: "risk",
    question: "Which statement about risk and return is most accurate?",
    options: [
      "Higher potential returns usually come with higher risk",
      "Low-risk investments always lose money",
      "Risk only exists in crypto",
      "Past returns guarantee future returns",
    ],
    correctIndex: 0,
    explanation:
      "Investors generally demand more potential reward for accepting more uncertainty. Nothing is guaranteed.",
  },
  {
    id: "q-risk-2",
    topic: "risk",
    question: "What does a stock's beta describe?",
    options: [
      "How much it pays in dividends",
      "How sensitive it is to overall market moves",
      "The company's total profit",
      "How many shares are for sale",
    ],
    correctIndex: 1,
    explanation:
      "A beta above 1 tends to amplify market moves, up or down; below 1 tends to move less than the market.",
  },
  {
    id: "q-ipo-1",
    topic: "ipo",
    question: "What is an IPO?",
    options: [
      "The first time a private company sells shares to the public",
      "A guaranteed first-day profit for buyers",
      "A government bond sale",
      "A fee charged by brokers",
    ],
    correctIndex: 0,
    explanation:
      "An initial public offering is when a company lists on an exchange and sells shares to public investors for the first time.",
  },
  {
    id: "q-ipo-2",
    topic: "ipo",
    question: "How does the listing price usually compare with the issue price?",
    options: [
      "It is always identical to the issue price",
      "It can be higher or lower, depending on demand",
      "It is set by the government",
      "It is always 50% higher",
    ],
    correctIndex: 1,
    explanation:
      "The issue price is set before listing; the market then decides the first traded price, which can go either way.",
  },
  {
    id: "q-mf-1",
    topic: "mutual-funds",
    question: "What is a mutual fund?",
    options: [
      "A single company's stock",
      "A pooled pot of money managed across many investments",
      "A type of savings account with fixed interest",
      "A loan from a bank",
    ],
    correctIndex: 1,
    explanation:
      "Many investors pool money into one fund, and a manager buys a mix of investments. Each investor owns a slice of the pool.",
  },
  {
    id: "q-mf-2",
    topic: "mutual-funds",
    question: "What does a regular monthly investment plan (SIP) help with?",
    options: [
      "Guaranteeing profits every month",
      "Spreading purchases over time instead of one lump sum",
      "Removing all market risk",
      "Avoiding all fees",
    ],
    correctIndex: 1,
    explanation:
      "Investing a fixed amount on a schedule averages your purchase price over time. It can smooth the ride but cannot remove risk.",
  },
  {
    id: "q-crash-1",
    topic: "crash",
    question: "What usually happens in a market crash?",
    options: [
      "Prices fall sharply across many stocks in a short period",
      "Every company instantly goes bankrupt",
      "Only one stock falls while others rise",
      "Trading is guaranteed to stop forever",
    ],
    correctIndex: 0,
    explanation:
      "A crash is a sudden, broad drop in prices, often driven by fear and selling. It is different from one company's bad news.",
  },
  {
    id: "q-crash-2",
    topic: "crash",
    question: "What is a common risk of panic selling during a crash?",
    options: [
      "You lock in the loss and miss a possible recovery",
      "You cannot sell at all",
      "You are guaranteed to buy back cheaper",
      "Your cash disappears",
    ],
    correctIndex: 0,
    explanation:
      "Selling in a panic turns a temporary paper loss into a realised one, and missing the recovery can hurt long-term returns.",
  },
];

const isTopic = (value: unknown): value is QuizTopic =>
  typeof value === "string" && (QUIZ_TOPICS as string[]).includes(value);

const text = (value: unknown, max: number): string | null => {
  if (typeof value !== "string") return null;
  const clean = value.replace(/\s+/g, " ").trim();
  return clean.length >= 2 && clean.length <= max ? clean : null;
};

/**
 * Validate a model-generated question. Returns null unless every field is
 * exactly right, so malformed output can never reach the UI.
 */
export function parseQuizQuestion(value: unknown): QuizQuestion | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const raw = value as Record<string, unknown>;

  const question = text(raw.question, 220);
  const explanation = text(raw.explanation, 400);
  const options = Array.isArray(raw.options) ? raw.options : null;
  const correctIndex = raw.correctIndex;

  if (!question || !explanation) return null;
  if (!options || options.length !== 4) return null;
  const cleanOptions: string[] = [];
  for (const option of options) {
    const clean = text(option, 160);
    if (!clean) return null;
    cleanOptions.push(clean);
  }
  if (new Set(cleanOptions).size !== 4) return null;
  if (typeof correctIndex !== "number" || !Number.isInteger(correctIndex) || correctIndex < 0 || correctIndex > 3) {
    return null;
  }

  return {
    id: text(raw.id, 60) ?? `ai-${Date.now()}`,
    topic: isTopic(raw.topic) ? raw.topic : "stocks",
    question,
    options: cleanOptions,
    correctIndex,
    explanation,
  };
}

const shuffle = <T,>(items: T[]): T[] => {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

/**
 * Pick a 5-question session. After a crash, prefer crash/diversification
 * questions, then fill from the rest of the bank.
 */
export function pickQuestions(
  count = 5,
  preferTopics?: QuizTopic | QuizTopic[] | null,
): QuizQuestion[] {
  const topics = preferTopics
    ? Array.isArray(preferTopics)
      ? preferTopics
      : [preferTopics]
    : [];
  const preferred = QUESTION_BANK.filter((q) => topics.includes(q.topic));
  const rest = QUESTION_BANK.filter((q) => !preferred.includes(q));
  return [...shuffle(preferred), ...shuffle(rest)].slice(0, Math.max(1, count));
}
