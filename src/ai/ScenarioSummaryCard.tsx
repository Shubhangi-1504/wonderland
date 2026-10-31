import { useEffect, useMemo } from "react";
import { SimulatedBadge } from "../components/shared/SimulatedBadge";
import { track } from "../lib/track";
import { useGameStore } from "../store/useGameStore";
import { explainScenario } from "./explainScenario";
import { openChat } from "./chatStore";

/**
 * Non-LLM "What happened?" summary. Everything here comes from explainScenario,
 * so it stays correct even if the chat/LLM is unavailable.
 * Crash simulator page: `<ScenarioSummaryCard />` (reads the game store).
 */

const money = (n: number) => `$${Math.round(n).toLocaleString("en-US")}`;
const signedPct = (n: number) => `${n > 0 ? "+" : ""}${n.toFixed(1)}%`;

const SECTOR_COLORS: Record<string, string> = {
  tech: "bg-cyan",
  energy: "bg-gold",
  finance: "bg-purple",
  health: "bg-emerald-400",
  consumer: "bg-pink-400",
  other: "bg-slate-400",
};

export function ScenarioSummaryCard({ className = "" }: { className?: string }) {
  const portfolio = useGameStore((s) => s.portfolio);
  const stocks = useGameStore((s) => s.stocks);
  const result = useGameStore((s) => s.lastScenarioResult);
  const scenarioId = result?.scenarioId ?? null;

  const facts = useMemo(
    () => explainScenario(portfolio, stocks, result),
    [portfolio, stocks, result],
  );

  useEffect(() => {
    track("scenario_summary_viewed", { scenarioId });
  }, [scenarioId]);

  const changeColor =
    facts.totalChangePct < 0 ? "text-rose-400" : facts.totalChangePct > 0 ? "text-emerald-400" : "text-slate-300";

  return (
    <section
      aria-labelledby="scenario-summary-title"
      className={`rounded-2xl border border-white/10 bg-white/5 p-4 ${className}`}
    >
      <header className="mb-3 flex flex-wrap items-center gap-2">
        <h2 id="scenario-summary-title" className="font-display text-sm font-semibold text-white">
          What happened?
        </h2>
        <SimulatedBadge className="ml-auto" />
      </header>

      {!facts.hasResult ? (
        <p className="text-sm text-slate-400">
          No scenario has run yet. Trigger a simulated crash, then come back for the numbers.
        </p>
      ) : (
        <>
          <p className="text-xs text-slate-400">
            <span className="text-white">{facts.title}</span> — {facts.headline}
          </p>

          {/* Before / after totals */}
          <dl className="mt-3 grid grid-cols-3 gap-2 text-center">
            <div className="rounded-xl bg-black/20 p-2">
              <dt className="text-[10px] uppercase tracking-wide text-slate-400">Before</dt>
              <dd className="text-sm font-semibold text-white">{money(facts.totalBefore)}</dd>
            </div>
            <div className="rounded-xl bg-black/20 p-2">
              <dt className="text-[10px] uppercase tracking-wide text-slate-400">After</dt>
              <dd className="text-sm font-semibold text-white">{money(facts.totalAfter)}</dd>
            </div>
            <div className="rounded-xl bg-black/20 p-2">
              <dt className="text-[10px] uppercase tracking-wide text-slate-400">Change</dt>
              <dd className={`text-sm font-semibold ${changeColor}`}>{signedPct(facts.totalChangePct)}</dd>
            </div>
          </dl>

          {/* Best / worst */}
          <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
            <p className="rounded-lg border border-rose-400/20 bg-rose-400/5 px-2 py-1.5 text-slate-300">
              Worst:{" "}
              <span className="font-semibold text-rose-400">
                {facts.worstHolding ? `${facts.worstHolding.symbol} ${signedPct(facts.worstHolding.changePct)}` : "—"}
              </span>
            </p>
            <p className="rounded-lg border border-emerald-400/20 bg-emerald-400/5 px-2 py-1.5 text-slate-300">
              Best:{" "}
              <span className="font-semibold text-emerald-400">
                {facts.bestHolding ? `${facts.bestHolding.symbol} ${signedPct(facts.bestHolding.changePct)}` : "—"}
              </span>
            </p>
          </div>

          {/* Sector exposure */}
          <div className="mt-4">
            <h3 className="mb-1.5 text-[10px] uppercase tracking-wide text-slate-400">
              Sector exposure before the event
            </h3>
            {facts.sectorExposure.length === 0 ? (
              <p className="text-xs text-slate-500">No invested holdings, so no sector exposure.</p>
            ) : (
              <ul className="space-y-1.5">
                {facts.sectorExposure.map((sector) => (
                  <li key={sector.sector} className="text-xs text-slate-300">
                    <div className="flex justify-between">
                      <span className="capitalize">{sector.sector}</span>
                      <span className="tabular-nums">{sector.pct.toFixed(0)}%</span>
                    </div>
                    <div
                      role="progressbar"
                      aria-valuenow={Math.round(sector.pct)}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-label={`${sector.sector} sector exposure`}
                      className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/10"
                    >
                      <div
                        className={`h-full rounded-full ${SECTOR_COLORS[sector.sector] ?? SECTOR_COLORS.other}`}
                        style={{ width: `${Math.min(100, Math.max(0, sector.pct))}%` }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            )}
            {facts.concentrationFlag && (
              <p className="mt-2 rounded-lg bg-gold/10 px-2 py-1.5 text-[11px] text-gold">
                Concentration warning: one holding or sector is over half of your invested money.
              </p>
            )}
          </div>

          {/* Diversified alternative */}
          <div className="mt-4">
            <h3 className="mb-1.5 text-[10px] uppercase tracking-wide text-slate-400">
              The diversified alternative
            </h3>
            {facts.comparison.diversifiedChangePct === null ? (
              <p className="text-xs text-slate-500">Not enough stock data to compare.</p>
            ) : (
              <dl className="space-y-1 text-xs text-slate-300">
                <div className="flex justify-between gap-2">
                  <dt>Your invested loss</dt>
                  <dd className="font-semibold text-rose-400">{money(facts.comparison.actualLoss)}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt>Equal split across all stocks</dt>
                  <dd className="font-semibold text-cyan">
                    {money(facts.comparison.diversifiedLoss)} ({signedPct(facts.comparison.diversifiedChangePct)})
                  </dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt>Same money in cash</dt>
                  <dd className="font-semibold text-slate-200">{money(facts.comparison.cashOnlyAfter)} (0%)</dd>
                </div>
              </dl>
            )}
          </div>

          {/* Lessons */}
          {facts.lessons.length > 0 && (
            <div className="mt-4">
              <h3 className="mb-1.5 text-[10px] uppercase tracking-wide text-slate-400">Lessons</h3>
              <ul className="list-disc space-y-1 pl-4 text-xs text-slate-300">
                {facts.lessons.map((lesson) => (
                  <li key={lesson}>{lesson}</li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}

      <button
        type="button"
        onClick={() => openChat("Explain what just happened to my portfolio.")}
        className="mt-4 w-full rounded-xl bg-gradient-to-br from-purple to-cyan px-3 py-2 text-xs font-semibold text-white transition hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan focus-visible:ring-offset-2 focus-visible:ring-offset-midnight"
      >
        Ask the Guide to explain
      </button>
    </section>
  );
}

export default ScenarioSummaryCard;
