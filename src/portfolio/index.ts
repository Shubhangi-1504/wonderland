/**
 * Public API of src/portfolio.
 *
 * Person B mounts TradePanel; Person D reads selectSummaryForAI from the store.
 * See INTEGRATION.md for usage examples.
 */

// Components
export { TradePanel } from './TradePanel';
export type { TradePanelProps } from './TradePanel';
export { PortfolioScreen } from './PortfolioScreen';
export { PortfolioPage } from './PortfolioPage';

// Hooks
export { useMarketTicker } from './useMarketTicker';
export type { MarketTickerOptions } from './useMarketTicker';

// Formatting helpers
export { formatCoins, formatCoinsShort, formatPct, formatTime } from './format';
