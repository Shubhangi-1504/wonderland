import type { Mission, Portfolio } from "../types";
import {
  addXPRemote,
  loadProgress,
  saveMissionProgress,
  savePortfolio,
  type RemoteProgress,
} from "../lib/persistence";
import { supabase } from "../lib/supabase";
import { getCurrentUserId, GUEST_FLAG } from "../lib/useAuth";
import { useGameStore } from "./useGameStore";

/**
 * Two-way sync between the zustand store and Supabase, for logged-in users only.
 * Guests never reach this code path with a session, so they make zero table calls.
 *
 * Loop safety: the store subscription is detached while remote data is hydrated,
 * then freshly snapshotted, so loaded data is never saved straight back.
 */

const SYNC_DEBOUNCE_MS = 1500;

let started = false;
let active = false;
let hydrating = false;
let sessionToken = 0;

let cleanupStore: (() => void) | null = null;

let flushTimer: ReturnType<typeof setTimeout> | null = null;
let pendingPortfolio: Portfolio | null = null;
let pendingXP: number | null = null;

// Last values known to be in sync (or just hydrated) — used to detect real changes.
let lastPortfolio: Portfolio | null = null;
let lastXP = 0;
let lastMissions: Record<string, boolean> = {};

function snapshotMissions(missions: Mission[]): Record<string, boolean> {
  // Mission.completed is optional in the shared types (Person B owns it).
  return Object.fromEntries(missions.map((mission) => [mission.id, Boolean(mission.completed)]));
}

function readGuestFlag(): boolean {
  try {
    return localStorage.getItem(GUEST_FLAG) === "true";
  } catch {
    return false;
  }
}

function clearGuestFlag(): void {
  try {
    localStorage.removeItem(GUEST_FLAG);
  } catch {
    // ignore
  }
}

/** Fresh account with nothing recorded remotely yet. */
function remoteIsEmpty(remote: RemoteProgress): boolean {
  return (
    remote.xp === 0 &&
    remote.portfolio.cash === 10000 &&
    remote.portfolio.holdings.length === 0 &&
    Object.keys(remote.missions).length === 0
  );
}

function localHasProgress(): boolean {
  const { xp, portfolio, missions } = useGameStore.getState();
  return (
    xp > 0 || portfolio.cash !== 10000 || portfolio.holdings.length > 0 || missions.some((m) => m.completed)
  );
}

function applyRemote(remote: RemoteProgress): void {
  const { missions } = useGameStore.getState();
  useGameStore.setState({
    xp: remote.xp,
    portfolio: { cash: remote.portfolio.cash, holdings: remote.portfolio.holdings },
    // quizScore is not part of Mission; the learning module saves it via saveMissionProgress.
    missions: missions.map((mission) =>
      remote.missions[mission.id]
        ? { ...mission, completed: remote.missions[mission.id].completed }
        : mission,
    ),
  });
}

function queueSave(change: { portfolio?: Portfolio; xp?: number }): void {
  if (change.portfolio) pendingPortfolio = change.portfolio;
  if (change.xp !== undefined) pendingXP = change.xp;
  if (flushTimer) clearTimeout(flushTimer);
  flushTimer = setTimeout(() => void flush(), SYNC_DEBOUNCE_MS);
}

async function flush(): Promise<void> {
  flushTimer = null;
  const portfolio = pendingPortfolio;
  const xp = pendingXP;
  pendingPortfolio = null;
  pendingXP = null;
  if (!active) return;
  if (portfolio) await savePortfolio(portfolio);
  if (xp !== null) await addXPRemote(xp);
}

function startSyncing(): void {
  const state = useGameStore.getState();
  lastPortfolio = state.portfolio;
  lastXP = state.xp;
  lastMissions = snapshotMissions(state.missions);
  active = true;

  cleanupStore?.();
  cleanupStore = useGameStore.subscribe((next) => {
    if (!active) return;

    if (next.portfolio !== lastPortfolio) {
      lastPortfolio = next.portfolio;
      queueSave({ portfolio: next.portfolio });
    }

    if (next.xp !== lastXP) {
      lastXP = next.xp;
      queueSave({ xp: next.xp });
    }

    // Mission completion is pushed right away; the progress map keeps it idempotent.
    for (const mission of next.missions) {
      if (lastMissions[mission.id] !== Boolean(mission.completed)) {
        lastMissions[mission.id] = Boolean(mission.completed);
        void saveMissionProgress(mission.id, { completed: Boolean(mission.completed) });
      }
    }
  });
}

/** Stop pushing to Supabase but keep the store intact. */
function stopSyncing(): void {
  active = false;
  cleanupStore?.();
  cleanupStore = null;
  if (flushTimer) clearTimeout(flushTimer);
  flushTimer = null;
  pendingPortfolio = null;
  pendingXP = null;
}

/** Login: migrate guest progress once, otherwise load remote state, then start syncing. */
async function onSignedIn(): Promise<void> {
  if (hydrating) return;
  hydrating = true;
  stopSyncing();
  const token = ++sessionToken;

  try {
    const userId = await getCurrentUserId();
    if (!userId) return;

    const wasGuest = readGuestFlag();
    const remote = await loadProgress();
    const shouldMigrate = wasGuest && (!remote || remoteIsEmpty(remote)) && localHasProgress();

    if (shouldMigrate) {
      const local = useGameStore.getState();
      await savePortfolio(local.portfolio);
      await addXPRemote(local.xp);
      for (const mission of local.missions) {
        if (mission.completed) await saveMissionProgress(mission.id, { completed: true });
      }
      clearGuestFlag();
    } else if (remote) {
      applyRemote(remote);
    }

    if (wasGuest) clearGuestFlag();
  } finally {
    hydrating = false;
    // Signed out (or a newer session) while loading: do not attach the sync listener.
    if (token === sessionToken) startSyncing();
  }
}

/**
 * Call once at startup (main.tsx). Safe to call more than once.
 * Returns a cleanup function for tests / hot reload.
 */
export function initSync(): () => void {
  if (started) return () => {};
  started = true;

  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    if (session?.user) {
      // Defer: awaiting Supabase auth calls inside this callback can deadlock supabase-js.
      setTimeout(() => void onSignedIn(), 0);
    } else {
      sessionToken++;
      stopSyncing();
    }
  });

  // Safety net for a session that already existed before we subscribed.
  void supabase.auth.getSession().then(({ data: sessionData }) => {
    if (sessionData.session?.user) void onSignedIn();
  });

  return () => {
    data.subscription.unsubscribe();
    sessionToken++;
    stopSyncing();
    started = false;
  };
}
