import type { Holding, Portfolio } from "../types";
import { getCurrentUserId } from "./useAuth";
import { supabase } from "./supabase";

/**
 * Supabase persistence for logged-in users.
 * Every function no-ops for guests (localStorage persist already covers them),
 * never throws, and reports failure via its return value + console.warn.
 */

export interface RemoteProgress {
  xp: number;
  portfolio: Portfolio;
  missions: Record<string, { completed: boolean; quizScore?: number }>;
}

/** Postgres numeric comes back as a string, so normalise it. */
function toNumber(value: unknown, fallback: number): number {
  const n = typeof value === "string" ? Number(value) : value;
  return typeof n === "number" && Number.isFinite(n) ? n : fallback;
}

/**
 * Fetch xp + portfolio + mission progress. Returns null on any failure (e.g. offline).
 * A user with no rows yet gets defaults, which the sync layer treats as "empty".
 */
export async function loadProgress(): Promise<RemoteProgress | null> {
  const userId = await getCurrentUserId();
  if (!userId) return null;

  try {
    const [profile, portfolio, missions] = await Promise.all([
      supabase.from("profiles").select("xp").eq("id", userId).maybeSingle(),
      supabase.from("portfolios").select("cash, holdings").eq("user_id", userId).maybeSingle(),
      supabase
        .from("mission_progress")
        .select("mission_id, completed, quiz_score")
        .eq("user_id", userId),
    ]);

    const error = profile.error ?? portfolio.error ?? missions.error;
    if (error) throw error;

    const missionMap: RemoteProgress["missions"] = {};
    for (const row of missions.data ?? []) {
      missionMap[row.mission_id] = {
        completed: Boolean(row.completed),
        quizScore: row.quiz_score ?? undefined,
      };
    }

    return {
      xp: toNumber(profile.data?.xp, 0),
      portfolio: {
        cash: toNumber(portfolio.data?.cash, 10000),
        holdings: (portfolio.data?.holdings as Holding[] | null) ?? [],
      },
      missions: missionMap,
    };
  } catch (error) {
    console.warn("[moneyverse] loadProgress failed", error);
    return null;
  }
}

/** Upsert the whole portfolio. Returns true on success. */
export async function savePortfolio(portfolio: Portfolio): Promise<boolean> {
  const userId = await getCurrentUserId();
  if (!userId) return false; // guest: no-op

  try {
    const { error } = await supabase.from("portfolios").upsert(
      {
        user_id: userId,
        cash: portfolio.cash,
        holdings: portfolio.holdings,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" },
    );
    if (error) throw error;
    return true;
  } catch (error) {
    console.warn("[moneyverse] savePortfolio failed", error);
    return false;
  }
}

/** Upsert one mission's progress. Returns true on success. */
export async function saveMissionProgress(
  id: string,
  data: { completed: boolean; quizScore?: number },
): Promise<boolean> {
  const userId = await getCurrentUserId();
  if (!userId) return false; // guest: no-op

  try {
    const { error } = await supabase.from("mission_progress").upsert(
      {
        user_id: userId,
        mission_id: id,
        completed: data.completed,
        quiz_score: data.quizScore ?? null,
      },
      { onConflict: "user_id,mission_id" },
    );
    if (error) throw error;
    return true;
  } catch (error) {
    console.warn("[moneyverse] saveMissionProgress failed", error);
    return false;
  }
}

/** Write the absolute XP total (not a delta). Returns true on success. */
export async function addXPRemote(newTotal: number): Promise<boolean> {
  const userId = await getCurrentUserId();
  if (!userId) return false; // guest: no-op

  try {
    const { error } = await supabase.from("profiles").update({ xp: newTotal }).eq("id", userId);
    if (error) throw error;
    return true;
  } catch (error) {
    console.warn("[moneyverse] addXPRemote failed", error);
    return false;
  }
}
