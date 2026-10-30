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

### Person C (market simulation) — **call setCrash only**
```ts
import { useSceneStore } from '@/scene/sceneStore';
// anywhere (your sim, a UI button, the ?debug slider):
useSceneStore.getState().setCrash(0.7);
```
People only ever read `gamePhase`/`crashLevel` or call `setCrash`. Do not
read or import anything from `src/sim`. All visual reaction is driven here:

| `crashLevel` | What happens |
|---|---|
| > 0 | `applyCrashLook(level)` sets `uCrash` on the shared city/river uniforms |
| tower windows | emissive tints crimson + flicker + dropout (`materials.ts`) |
| gold tower + tickers | extra emissive flicker, green tickers fade to red |
| camera | small damped positional + rotational shake (scaled, disabled w/ reduce-motion) |
| bloom | dims from 0.95 toward 0.35 (`PostFX.tsx`) |
| fog | pulled slightly closer + redder (see `SceneCanvas.tsx`) |
| river | `uFlow` reduced + streak flicker toward red (`River.tsx`) |
| warning lights | red additive pulse (`Atmosphere.tsx`) |

At `0` it eases back to normal. `applyCrashLook` is the single helper
People C can call directly — it eases in/out over ~1.2 s so repeated or
jumping values stay safe.

### Person B (world)
Render your world when `gamePhase === 'world'`.

**TODO place holder:** `src/scene/components/WorldPlaceholder.tsx` (create when Person B's world is wired). Replace the `src/App.tsx` `<WorldPage />` route with the real `src/scene/components/WorldPlaceholder.tsx` — **do not build Person B's world here.**

To make company buildings clickable, use the exported `COMPANY_BUILDINGS`
from `src/scene/index.ts`:
```ts
import { COMPANY_BUILDINGS } from '@/scene';
// [{ id: 'NOVA', x, z, w, h, d }, { id: 'AURA', ... }, { id: 'ZENO', ... }]
```
Positions are the building centers (y is h/2). Raycast against a box at
that position to pick a building.

### Debug panel (`?debug`)
Append `?debug` to the URL and a panel appears on the intro: a `crashLevel`
slider 0..1 and a **Replay intro** button. It exists only to tune the look
without the simulation. It must not ship visible in normal use.

### Jumping to a scene
`scrollToScene(0..4)` from `src/scene/components/ScrollStage` animates the
page (and P) to a scene; it degrades to an instant jump under reduced motion.

## Tunables
- Fog density: `<fogExp2>` in `components/SceneCanvas.tsx`.
- Bloom: `components/PostFX.tsx` (crash dims it automatically).
- Camera pacing/poses + river meander: `worldLayout.ts` (`CAM_POSES`, `GATES_Z`, `riverX`); scroll smoothing: `dampScroll(`k=7.5`)` in `sceneStore.ts`.
- Particle budgets: `hooks/usePerformanceProfile.ts`.
- DPR cap: `[1, 1.5]` in `SceneCanvas.tsx`. Adaptive frame-time fallback lowers
  particle count/dpr and disables bloom once the average frame time pushes past ~24 ms repeatedly (see `SceneCanvas` frame loop).

## Ownership rules
Only `src/scene/` may be edited here (plus the store slice inside it).
`src/world`, `src/learning`, `src/sim`, `src/portfolio`, `src/ai`, `api/`
belong to other teammates.
