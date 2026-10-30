// MONEYVERSE — intro scene shared state (Person A slice).
// Small and typed; Person B/C read `gamePhase`/`crashLevel`, call `setCrash`.
// The only global store the intro needs lives here.
import { create } from 'zustand';

export type GamePhase = 'loading' | 'intro' | 'world';

interface SceneState {
  gamePhase: GamePhase;
  /** 0..4 — which scene the camera is in (quantized; live value is scrollRuntime) */
  progress: number;
  /** 0..1 — marketShock visual level; Person C's sim or any UI may call setCrash */
  crashLevel: number;
  setGamePhase: (phase: GamePhase) => void;
  setProgress: (p: number) => void;
  setCrash: (level: number) => void;
  /** Clean reset used by the exit-to-world + ?debug Replay. */
  reset: () => void;
}

export const useSceneStore = create<SceneState>((set) => ({
  gamePhase: 'loading',
  progress: 0,
  crashLevel: 0,
  setGamePhase: (gamePhase) => set({ gamePhase }),
  setProgress: (progress) => set({ progress }),
  setCrash: (level) => set({ crashLevel: Math.min(1, Math.max(0, level)) }),
  reset: () => {
    set({ gamePhase: 'loading', progress: 0, crashLevel: 0 });
    applyCrashLook(0);
  },
}));

/* Live scroll values — written/read inside the frame loop, never React state. */
export const scrollRuntime = { target: 0, current: 0 };
export function dampScroll(cur: number, target: number, dt: number) {
  return cur + (target - cur) * (1 - Math.exp(-7.5 * dt));
}

/* Enter-the-World dash signal (consumed by CameraRig, triggered by Overlay). */
export const enterState = { active: false, start: 0 };
export function startEnterWorld() {
  if (!enterState.active) {
    enterState.active = true;
    enterState.start = performance.now() / 1000;
  }
}

/* Intro reveal timing (set once the canvas is up; eased over ~2.6 s). */
export const introTiming = { start: 0 };

/* Shared shader uniform singletons (single write-point per uniform). */
export const uniforms = {
  city: { uTime: { value: 0 }, uReveal: { value: 0 }, uCrash: { value: 0 } },
  river: { uTime: { value: 0 }, uFlow: { value: 1 }, uBurst: { value: 0 }, uCrash: { value: 0 } },
};

/* ------------------------------------------------------------------ */
/* Crash visual — one typed helper, single write-point, smooth easing. */
/* Called by setCrash() and by the ?debug slider.                      */
/* ------------------------------------------------------------------ */
export function applyCrashLook(level: number): void {
  const c = Math.min(1, Math.max(0, level));
  uniforms.city.uCrash.value = c;
  uniforms.river.uCrash.value = c;
}

/* Clean reset — no leaked listeners, no GPU holdover between intro/world. */
export function resetSceneState() {
  useSceneStore.getState().reset();
  applyCrashLook(0);
}
