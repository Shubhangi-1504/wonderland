# src/portfolio — Owner: Person C

Portfolio screen, trade panel, and market ticker for MONEYVERSE.

## What lives here

| File | Purpose |
|---|---|
| `PortfolioPage.tsx` | Route stub — re-exports `PortfolioScreen` for `App.tsx` |
| `PortfolioScreen.tsx` | The `/portfolio` page: summary cards, value chart, holdings table, allocation bar |
| `TradePanel.tsx` | Self-contained buy/sell widget. Person B mounts it in `/world`. |
| `useMarketTicker.ts` | Hook: calls `tick()` on an interval, pauses on hidden tabs |
| `format.ts` | `formatCoins`, `formatPct`, `formatTime`, `formatCoinsShort` |
| `index.ts` | Public barrel — import from `'../portfolio'` |
| `INTEGRATION.md` | Exact usage snippets for Persons B and D |
| `README.md` | This file |

## Public components and hooks

### `<TradePanel companyId="nova-loom" compact? />`
Reads price, cash, holdings from the sim store. Calls `buy`/`sell` actions.
Shows inline errors and a 4-second success toast.

### `<PortfolioScreen />`
The full `/portfolio` page. Starts `useMarketTicker` while mounted.

### `useMarketTicker({ intervalMs?, enabled? })`
Calls `tick()` every N ms while the tab is visible. Import and reuse in
`/world` so prices update there too.

## Store

All simulation state lives in `src/store/useSimStore` (wraps `createSimSlice`).
This is separate from Person A's `useGameStore` which uses a different data model.

Selectors: `selectPortfolio(state)` and `selectSummaryForAI(state)` are exported
from `src/store/simSlice`.

## Routes

- `/portfolio` → `PortfolioPage` (imported in `src/App.tsx`)

## Depends on (read-only)

- `src/sim/` — COMPANIES, price functions, portfolio math, summary
- `src/store/simSlice.ts` — SimState, SimActions, selectors
- `src/store/useSimStore.ts` — the Zustand store instance
