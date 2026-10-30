# src/portfolio — Integration Guide

## Person B: Mounting TradePanel in your company info panel

`TradePanel` is fully self-contained — it reads price, cash, and holdings
from the sim store, and calls `buy`/`sell` directly. You only need to pass
the `companyId`.

```tsx
// In your company detail component (src/world/*)
import { TradePanel } from '../portfolio';

// companyId must be one of: 'nova-loom', 'hearth-harbor', 'voltara-grid'
<TradePanel companyId={selectedCompany.id} />

// Tighter layout for a side panel:
<TradePanel companyId={selectedCompany.id} compact />
```

### Market ticker in /world

Reuse `useMarketTicker` so prices update while the player is on the World
screen as well:

```tsx
import { useMarketTicker } from '../portfolio';

// Inside WorldPage or any component mounted on /world:
useMarketTicker({ intervalMs: 3000 }); // pauses when tab is hidden
```

Import path: `'../portfolio'` from inside `src/world/`.

---

## Person D: Reading AI summary from the store

```tsx
import { selectSummaryForAI } from '../store/simSlice';
import { useSimStore } from '../store/useSimStore';

// Inside your AI component or API handler:
const json = useSimStore(selectSummaryForAI);
// → compact JSON string, always has simulated:true, no NaN, no internal ids
```

Or to read once without subscribing:

```ts
import { useSimStore } from '../store/useSimStore';
import { selectSummaryForAI } from '../store/simSlice';

const json = selectSummaryForAI(useSimStore.getState());
```

---

## Person B: Mission checks (isDiversified, getHoldings)

```ts
import { isDiversified, getHoldings, COMPANIES } from '../sim';
import { useSimStore } from '../store/useSimStore';

// In a mission-check hook or component:
const wallet = useSimStore((s) => s.wallet);

const diversified = isDiversified(wallet, COMPANIES, 3); // true when ≥3 sectors held
const holdings = getHoldings(wallet);                     // Holding[] (no zero-qty rows)
```

---

## Store import paths

| Need | Import |
|---|---|
| Sim store hook | `import { useSimStore } from '../store/useSimStore'` |
| Selectors | `import { selectPortfolio, selectSummaryForAI } from '../store/simSlice'` |
| Sim functions | `import { COMPANIES, buy, sell, ... } from '../sim'` |
| UI components | `import { TradePanel, useMarketTicker, formatCoins } from '../portfolio'` |

> **Note on relative paths**: adjust `../` depth based on your file's location
> inside `src/`.
