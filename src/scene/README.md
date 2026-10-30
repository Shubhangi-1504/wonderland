# src/scene — MONEYVERSE intro (Owner: Person A)

Cinematic 3D intro: a fixed full-screen React-Three-Fiber canvas where
scrolling dives the camera **into the world** — one glowing cyan river
runs down the middle of the path and the camera flies forward along it
through five scenes (Hero city → Stock Market City → Investment Forest →
IPO Island → Moonlit Lake), passing between scenes through rock-arch
gates whose openings are centered on the river. No gradient fades.

## What goes here
- `IntroScene.tsx` + `index.ts` — the single default component the "/" route renders.
- `sceneStore.ts` — the shared slice: `gamePhase ('loading'|'intro'|'world')`,
  `progress (0..4)`, `crashLevel (0..1)`, `setCrash(level)`. Live scroll values
  (`scrollRuntime`) and shader uniform singletons live here too, updated in
  the frame loop only — never through React state.
- `worldLayout.ts` — river/camera CatmullRom curves, scene generators,
  gate positions, and `COMPANY_BUILDINGS` (NOVA / AURA / ZENO ids + positions).
- `materials.ts` — shader factories (instanced window grid with tower-by-tower
  reveal + crash tint, ticker bars, river ribbon, canvas textures).
- `components/` — the five scene environments, camera rig, river, gates,
  overlay copy, loading screen, atmosphere, cursor light, postprocessing.
- `hooks/usePerformanceProfile.ts` — reduced-motion + low-end budgets.

## How to hook in

**Person C (market simulation):** call `setCrash(level)` on the store
(`import { useSceneStore } from '@/scene/sceneStore'`) with 0..1. At >0 the
city lights tint crimson and flicker, the camera shakes slightly and bloom
dims; it eases back when set to 0. Do **not** touch `src/sim` from here.

**Person B (world):** render your world when `gamePhase === 'world'`
(see `src/App.tsx` placeholder). To make company buildings clickable,
use the exported `COMPANY_BUILDINGS` from `src/scene/index.ts`:
```ts
import { COMPANY_BUILDINGS } from '@/scene';
// [{ id: 'NOVA', x, z, w, h, d }, { id: 'AURA', ... }, { id: 'ZENO', ... }]
```
Positions are the building centers (y is h/2). Raycast against a box at
that position to pick a building.

**Jumping to a scene:** `scrollToScene(0..4)` from
`src/scene/components/ScrollStage` animates the page (and P) to a scene;
it degrades to an instant jump under reduced motion.

## Tunables
- Fog density: `<fogExp2>` in `components/SceneCanvas.tsx`.
- Bloom: `components/PostFX.tsx` (crash dims it automatically).
- Camera pacing/poses + river meander: `worldLayout.ts` (`CAM_POSES`,
  `GATES_Z`, `riverX`); scroll smoothing: `dampScroll(`k=7.5`)` in `sceneStore.ts`.
- Particle budgets: `hooks/usePerformanceProfile.ts`.

## Ownership rules
Only `src/scene/` may be edited here (plus the store slice inside it).
`src/world`, `src/learning`, `src/sim`, `src/portfolio`, `src/ai`, `api/`
belong to other teammates.
