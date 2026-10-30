import type { Mission, Portfolio } from "../types";
import { getCurrentUserId } from "./useAuth";

/**
 * Remote persistence stubs.
 * Guests are a no-op (their state already lives in the zustand localStorage persist).
 * Logged-in users will eventually sync to Supabase; table calls are TODO.
 */

export async function savePortfolio(portfolio: Portfolio): Promise<void> {
  const userId = await getCurrentUserId();
  if (!userId) return; // guest: local persist is enough

  // TODO(me): upsert into `portfolios` { user_id: userId, cash, holdings }
  void portfolio;
}

export async function loadPortfolio(): Promise<Portfolio | null> {
  const userId = await getCurrentUserId();
  if (!userId) return null;

  // TODO(me): select from `portfolios` where user_id = userId
  return null;
}

export async function saveMissionProgress(missions: Mission[]): Promise<void> {
  const userId = await getCurrentUserId();
  if (!userId) return;

  // TODO(me): upsert into `mission_progress` { user_id, mission_id, completed }
  void missions;
}

export async function addXPRemote(amount: number): Promise<void> {
  const userId = await getCurrentUserId();
  if (!userId) return;

  // TODO(me): increment `profiles.xp` by amount for user_id
  void amount;
}
