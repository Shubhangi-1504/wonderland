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
}

export const useSceneStore = create<SceneState>((set) => ({
  gamePhase: 'loading',
  progress: 0,
  crashLevel: 0,
  setGamePhase: (gamePhase) => set({ gamePhase }),
  setProgress: (progress) => set({ progress }),
  setCrash: (level) => set({ crashLevel: Math.min(1, Math.max(0, level)) }),
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

/** Resets intro state and camera position when navigating back to the intro */
export function resetIntro() {
  enterState.active = false;
  enterState.start = 0;
  scrollRuntime.target = 0;
  scrollRuntime.current = 0;
  introTiming.start = performance.now() / 1000;
  uniforms.river.uBurst.value = 0;
  uniforms.city.uReveal.value = 1;
  useSceneStore.getState().setGamePhase('intro');
  useSceneStore.getState().setProgress(0);
  if (typeof window !== 'undefined') {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }
}

/* Intro reveal timing (set once the canvas is up; eased over ~2.6 s). */
export const introTiming = { start: 0 };

/* Shared shader uniform singletons (single write-point per uniform). */
export const uniforms = {
  city: { uTime: { value: 0 }, uReveal: { value: 0 }, uCrash: { value: 0 } },
  river: { uTime: { value: 0 }, uFlow: { value: 1 }, uBurst: { value: 0 }, uCrash: { value: 0 } },
};
