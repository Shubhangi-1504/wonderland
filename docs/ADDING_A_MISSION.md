# Adding a Mission to MONEYVERSE

Missions guide users through hands-on financial concepts (e.g. trading, diversification, crash survival).

## Existing Extension Points

1. **Mission Types (`src/types.ts`)**:
   - `Mission`: `{ id: string; title: string; description: string; reward?: number; xpReward?: number; completed?: boolean }`
   - `MissionProgress`: `{ missionId: string; completed: boolean }`

2. **Game Store State (`src/store/useGameStore.ts`)**:
   - `missions: Mission[]`
   - `completeMission(id: string)`: Marks mission complete and automatically awards `xpReward`.

3. **Remote Persistence & Sync (`src/lib/persistence.ts`, `src/store/syncWithSupabase.ts`)**:
   - `saveMissionProgress(id, { completed, quizScore? })`: Upserts row to Supabase `mission_progress` table.
   - Auto-sync detects completion deltas and flushes remotely for authenticated users.

4. **Telemetry (`src/lib/track.ts`)**:
   - `track("mission_completed", { missionId: id })`.

## How to Add a New Mission

Because a static missions registry file does not yet exist, define your mission and evaluation logic as follows:

1. **Define Mission Object**: Instantiate a `Mission` shape in `src/learning/` or seed list in `src/lib/demoMode.ts`.
2. **Implement Evaluation Logic**: Use sim helpers (e.g., `distinctSectors()` or `isDiversified()` in `src/sim/portfolio.ts`).
3. **Trigger Completion**: Call `useGameStore.getState().completeMission(missionId)`.
4. **Emit Analytics**: Call `track("mission_completed", { missionId })`.

