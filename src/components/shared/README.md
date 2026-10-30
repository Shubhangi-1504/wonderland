# src/components/shared — simulated-data labelling

Both components are presentation-only; import and mount them, do not copy them.

```tsx
import { SimulatedBadge, DataSourceFootnote } from "../components/shared/SimulatedBadge";
<SimulatedBadge />
<DataSourceFootnote source="Simulated price engine" timestamp={new Date()} />
```

| Where to mount | What to add |
| --- | --- |
| Portfolio screen header (`src/portfolio`) | `<SimulatedBadge />` |
| Trade panel / order form (`src/world`) | `<SimulatedBadge />` + `<DataSourceFootnote source="Simulated price engine" timestamp={lastTick} />` |
| Company info panel (`src/world`) | `<SimulatedBadge />` |
| Crash overlay / scenario page (`src/sim` consumers) | `<ScenarioSummaryCard />` (already contains the badge) |

`ErrorBoundary` (same folder) wraps any panel that could crash; `label` is shown in the fallback:

```tsx
<ErrorBoundary label="Chat"><ChatPanel /></ErrorBoundary>
```

All MONEYVERSE prices, companies and events are fictional or simulated.
