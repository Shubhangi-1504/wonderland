import type { Company } from '../types';

/**
 * The three fictional companies in the MONEYVERSE demo.
 *
 * Fictional on purpose: names, tickers and numbers are invented, so nobody can
 * mistake this for real market data or real investment advice.
 *
 * Betas are chosen so a crash hits them differently:
 *  - Nova Loom (tech, beta 1.5)  -> falls hardest in a market crash
 *  - Hearth & Harbor (consumer, beta 0.6) -> defensive, barely moves
 *  - Voltara Grid (energy, beta 1.0) -> tracks the market
 */
export const COMPANIES: readonly Company[] = [
  {
    id: 'nova-loom',
    name: 'Nova Loom',
    ticker: 'NVLM',
    sector: 'tech',
    basePrice: 120,
    volatility: 0.035,
    beta: 1.5,
    description:
      'Nova Loom sells AI tools that help small businesses write and design things faster. It is growing quickly, so its share price swings a lot when the market gets nervous.',
    sharesOutstanding: 500_000_000,
  },
  {
    id: 'hearth-harbor',
    name: 'Hearth & Harbor',
    ticker: 'HRHB',
    sector: 'consumer',
    basePrice: 48,
    volatility: 0.012,
    beta: 0.6,
    description:
      'Hearth & Harbor makes everyday home goods like kettles and bedding. People buy them whether the economy is booming or slow, so the business is calm and predictable.',
    sharesOutstanding: 800_000_000,
  },
  {
    id: 'voltara-grid',
    name: 'Voltara Grid',
    ticker: 'VLTA',
    sector: 'energy',
    basePrice: 76,
    volatility: 0.02,
    beta: 1,
    description:
      'Voltara Grid builds solar farms and sells the electricity to cities. Demand is steady, but fuel prices and interest rates still move the stock around.',
    sharesOutstanding: 300_000_000,
  },
];

/** Convenience lookup by id. Returns `undefined` for unknown ids. */
export function getCompany(companies: readonly Company[], id: string): Company | undefined {
  return companies.find((company) => company.id === id);
}
