# src/sim — Owner: Person C

Pure TypeScript simulation: price engine, trade execution, and crash scenarios.
No React, no DOM — must stay unit-testable.

Contracts: `Stock`, `Holding`, `Portfolio`, `Scenario`, `ScenarioResult` from `src/types.ts`.
Results are pushed to the store via `setScenarioResult`.
