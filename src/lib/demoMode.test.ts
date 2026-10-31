import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  DEMO_MISSIONS,
  DEMO_PORTFOLIO,
  DEMO_STORAGE_KEY,
  DEMO_XP,
  initDemoMode,
  isDemoMode,
  resetDemo,
} from "./demoMode";
import { useGameStore } from "../store/useGameStore";

describe("demoMode", () => {
  let mockStorage: Record<string, string> = {};

  beforeEach(() => {
    mockStorage = {};
    const fakeLocalStorage = {
      getItem: (key: string) => mockStorage[key] ?? null,
      setItem: (key: string, val: string) => {
        mockStorage[key] = val;
      },
      removeItem: (key: string) => {
        delete mockStorage[key];
      },
      clear: () => {
        mockStorage = {};
      },
    };

    (globalThis as unknown as { localStorage: typeof fakeLocalStorage }).localStorage = fakeLocalStorage;
    (globalThis as unknown as { window: { location: { search: string; href: string; pathname: string }; history: { replaceState: () => void } } }).window = {
      location: {
        search: "",
        href: "http://localhost:5173",
        pathname: "/",
      },
      history: {
        replaceState: () => {},
      },
    };

    resetDemo();
  });

  afterEach(() => {
    resetDemo();
    delete (globalThis as { localStorage?: unknown }).localStorage;
    delete (globalThis as { window?: unknown }).window;
  });

  it("detects when demo mode is not active", () => {
    expect(isDemoMode()).toBe(false);
  });

  it("detects demo mode via localStorage flag", () => {
    mockStorage[DEMO_STORAGE_KEY] = "true";
    expect(isDemoMode()).toBe(true);
  });

  it("detects demo mode via URL parameter ?demo=1", () => {
    window.location.search = "?demo=1";
    expect(isDemoMode()).toBe(true);
    expect(mockStorage[DEMO_STORAGE_KEY]).toBe("true");
  });

  it("preloads the store on initDemoMode when active", () => {
    mockStorage[DEMO_STORAGE_KEY] = "true";
    const initialized = initDemoMode();

    expect(initialized).toBe(true);
    const state = useGameStore.getState();
    expect(state.portfolio.cash).toBe(DEMO_PORTFOLIO.cash);
    expect(state.portfolio.holdings).toHaveLength(3);
    expect(state.xp).toBe(DEMO_XP);
    expect(state.missions).toHaveLength(DEMO_MISSIONS.length);
    expect(state.stocks.length).toBeGreaterThan(0);
    expect(state.hasEntered).toBe(true);
  });

  it("resets demo state cleanly via resetDemo()", () => {
    mockStorage[DEMO_STORAGE_KEY] = "true";
    initDemoMode();
    expect(isDemoMode()).toBe(true);

    resetDemo();

    expect(isDemoMode()).toBe(false);
    expect(mockStorage[DEMO_STORAGE_KEY]).toBeUndefined();
    const state = useGameStore.getState();
    expect(state.portfolio.cash).toBe(10000);
    expect(state.portfolio.holdings).toHaveLength(0);
    expect(state.xp).toBe(0);
  });
});
