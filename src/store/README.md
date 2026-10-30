# src/store — Owner: Me (infra/backend)

Global Zustand store (`useGameStore`) persisted to localStorage for guest mode.
Shared by all feature folders — change the state shape only after telling the team.

Select narrowly in components, e.g. `useGameStore((s) => s.xp)`.
