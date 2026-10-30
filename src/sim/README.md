# `src/sim` — simulation core

**Owner: Person C (Simulation).** Ask me before changing anything here.

Pure TypeScript for the MONEYVERSE market: prices, trading, portfolio math, crash
scenarios, and the summary the AI assistant reads. All money is virtual.

## Rules for this folder

- Pure functions only. No React, no UI imports, no DOM, no store imports.
- No `Date.now()` and no `Math.random()` inside logic. Time is passed in as `t`;
  randomness is passed in as `rng`.
- Never mutate arguments. Return new objects.
- Prices never go below zero (`clampPrice`).
- Money and prices are rounded to cents with `roundMoney` from `./money` — do not
  round ad hoc in components.
- Every price snapshot carries `source: 'simulated'` and a timestamp (`PricePoint`).
- Shared types live in `src/types.ts`, not here.

## Public functions other people may call

Import them from `@/sim` (or `src/sim`); sources are linked for reference.

| Function | Purpose |
| --- | --- |
| `createRng(seed)` | Seeded PRNG returning `[0, 1)`. |
| `initialPrices(companies)` | Starting price map from `basePrice`. |
| `tickPrices(prices, companies, rng)` | Next price map, one tick. |
| `buy(wallet, companyId, qty, prices)` | `TradeResult`; never throws on user error. |
| `sell(wallet, companyId, qty, prices)` | `TradeResult`; never throws on user error. |
| `tradeCost(qty, unitPrice)` | Cents-rounded cost preview for the TradePanel. |
| `computePortfolio(wallet, prices)` | `{ cash, holdingsValue, total }`. |
| `getHoldings(wallet)` | Copy of open positions. |
| `holdingValue(holding, prices)` | One position's market value. |
| `distinctSectors(wallet, companies)` | Sectors the player is exposed to (missions). |
| `applyScenario(prices, companies, scenario)` | Price map after a shock. |
| `compareBeforeAfter(wallet, before, after)` | `ScenarioComparison` for the crash explainer. |
| `getScenario(id)` / `SCENARIOS` | Predefined shocks: `market-crash-20`, `tech-shock`. |
| `summarizeForAI(wallet, prices, lastEvent)` | Compact `AISummary` for Person D. |
| `COMPANIES` | The three fictional companies. |
| `roundMoney` / `clampPrice` | The one rounding rule. |

Store access (Person B): use `createSimSlice` from `src/store/simSlice.ts` —
`wallet`, `prices`, `priceHistory`, `activeScenario`, `lastEvent`, plus
`buy`, `sell`, `tick`, `triggerScenario`, `resetDemo`.

## Status (hour 0-1)

Signatures, types, data and stubs are in place so everyone can code against them.
Only `initialPrices` and the money helpers are implemented. The rest throw
`Error('not implemented')` until Person C fills them in — wrap calls in the UI
accordingly for now. Tests in `__tests__/` are `it.todo` placeholders.
