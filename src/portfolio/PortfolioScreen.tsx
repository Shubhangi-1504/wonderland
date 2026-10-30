/**
 * PortfolioScreen — the /portfolio page.
 *
 * Shows: summary cards, portfolio value chart, holdings table,
 * allocation bar, and the Market Event Results placeholder.
 * Starts the market ticker (prices update every 3 s) while mounted.
 */
import { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
  type TooltipProps,
} from 'recharts';
import { Link } from 'react-router-dom';
import {
  COMPANIES,
  getCompany,
  largestPositionWeight,
  STARTING_CASH,
} from '../sim';
import { selectPortfolio } from '../store/simSlice';
import { useSimStore } from '../store/useSimStore';
import {
  formatCoins,
  formatCoinsShort,
  formatPct,
  formatTime,
} from './format';
import { useMarketTicker } from './useMarketTicker';

// ─── Reduced-motion hook (respects OS / browser setting) ─────────────────────

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );
  useEffect(() => {
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);
  return reduced;
}

// ─── Palette used across sub-components ──────────────────────────────────────

const HOLDING_COLORS = ['#22d3ee', '#6b3fd4', '#f5b942', '#34d399', '#f87171'];

// ─── Sub-components ───────────────────────────────────────────────────────────

/** Four summary metric cards. */
function SummaryCards() {
  const portfolio = useSimStore(selectPortfolio);
  const { totalValue, cash, holdingsValue, totalPnLVsStart, totalPnLVsStartPct } =
    portfolio;
  const pnlPositive = totalPnLVsStart >= 0;

  const cards = [
    {
      label: 'Total value',
      value: formatCoins(totalValue),
      sub: null,
      accent: 'text-cyan',
    },
    {
      label: 'Cash',
      value: formatCoins(cash),
      sub: null,
      accent: 'text-gold',
    },
    {
      label: 'Invested',
      value: formatCoins(holdingsValue),
      sub: null,
      accent: 'text-white',
    },
    {
      label: 'Total P&L',
      value: `${pnlPositive ? '▲ +' : '▼ '}${formatCoins(totalPnLVsStart)}`,
      sub: formatPct(totalPnLVsStartPct),
      accent: pnlPositive ? 'text-emerald-400' : 'text-red-400',
    },
  ] as const;

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {cards.map(({ label, value, sub, accent }) => (
        <div
          key={label}
          className="rounded-xl border border-white/10 bg-white/5 p-4"
        >
          <p className="mb-1 text-xs font-medium text-slate-400">{label}</p>
          <p className={`tabular-nums text-lg font-bold ${accent}`}>{value}</p>
          {sub && (
            <p className={`tabular-nums text-sm ${accent}`}>{sub}</p>
          )}
        </div>
      ))}
    </div>
  );
}

/** Custom tooltip for the value-over-time chart. */
function ChartTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-white/10 bg-[#0b1030] px-3 py-2 text-sm shadow-lg">
      <p className="text-slate-400">{formatTime(label as number)}</p>
      <p className="tabular-nums font-semibold text-cyan">
        {formatCoins(payload[0]?.value)}
      </p>
    </div>
  );
}

/** Portfolio value over time — Recharts LineChart. */
function ValueChart({ reducedMotion }: { reducedMotion: boolean }) {
  const valueHistory = useSimStore((s) => s.valueHistory);

  if (valueHistory.length < 2) {
    return (
      <div className="flex h-[200px] items-center justify-center rounded-xl border border-white/10 bg-white/5 text-sm text-slate-400">
        Not enough data yet — prices are updating every few seconds.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart
        data={valueHistory}
        margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
      >
        <XAxis
          dataKey="t"
          tickFormatter={(t: number) => formatTime(t)}
          stroke="#475569"
          tick={{ fill: '#94a3b8', fontSize: 10 }}
          tickLine={false}
          axisLine={false}
          minTickGap={60}
        />
        <YAxis
          tickFormatter={formatCoinsShort}
          stroke="#475569"
          tick={{ fill: '#94a3b8', fontSize: 10 }}
          tickLine={false}
          axisLine={false}
          width={56}
        />
        <Tooltip content={<ChartTooltip />} />
        <ReferenceLine
          y={STARTING_CASH}
          stroke="#f5b942"
          strokeDasharray="4 4"
          label={{
            value: 'Start',
            position: 'insideTopRight',
            fill: '#f5b942',
            fontSize: 10,
          }}
        />
        <Line
          type="monotone"
          dataKey="totalValue"
          stroke="#22d3ee"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4, fill: '#22d3ee' }}
          isAnimationActive={!reducedMotion}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

/** Holdings table — scrolls horizontally on mobile. */
function HoldingsTable() {
  const portfolio = useSimStore(selectPortfolio);
  const { holdings } = portfolio;

  if (holdings.length === 0) {
    return (
      <div className="rounded-xl border border-white/10 bg-white/5 px-6 py-10 text-center">
        <p className="text-slate-300">You don't own any stocks yet.</p>
        <p className="mt-1 text-sm text-slate-500">
          Visit{' '}
          <Link
            to="/world"
            className="text-cyan underline underline-offset-2 hover:text-white focus:outline-none focus:ring-1 focus:ring-cyan"
          >
            Stock Market City
          </Link>{' '}
          to make your first simulated trade.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-white/10">
      <table className="w-full min-w-[640px] text-sm">
        <thead>
          <tr className="border-b border-white/10 bg-white/5 text-left text-xs text-slate-400">
            <th scope="col" className="px-4 py-3 font-medium">
              Company
            </th>
            <th scope="col" className="px-4 py-3 font-medium">
              Sector
            </th>
            <th scope="col" className="px-4 py-3 text-right font-medium">
              Qty
            </th>
            <th scope="col" className="px-4 py-3 text-right font-medium">
              Avg cost
            </th>
            <th scope="col" className="px-4 py-3 text-right font-medium">
              Price
            </th>
            <th scope="col" className="px-4 py-3 text-right font-medium">
              Value
            </th>
            <th scope="col" className="px-4 py-3 text-right font-medium">
              P&amp;L
            </th>
            <th scope="col" className="px-4 py-3 text-right font-medium">
              Weight
            </th>
          </tr>
        </thead>
        <tbody>
          {holdings.map((h) => {
            const company = getCompany(COMPANIES, h.companyId);
            const pnlPos = h.pnl >= 0;
            return (
              <tr
                key={h.companyId}
                className="border-b border-white/5 transition-colors hover:bg-white/5"
              >
                <td className="px-4 py-3 font-medium text-white">
                  {company?.name ?? h.companyId}
                  <span className="ml-1.5 text-xs text-slate-500">
                    {company?.ticker}
                  </span>
                </td>
                <td className="px-4 py-3 capitalize text-slate-400">
                  {company?.sector ?? '—'}
                </td>
                <td className="px-4 py-3 text-right tabular-nums text-white">
                  {h.qty}
                </td>
                <td className="px-4 py-3 text-right tabular-nums text-slate-300">
                  {formatCoins(h.avgCost)}
                </td>
                <td className="px-4 py-3 text-right tabular-nums text-cyan">
                  {formatCoins(h.price)}
                </td>
                <td className="px-4 py-3 text-right tabular-nums font-medium text-white">
                  {formatCoins(h.marketValue)}
                </td>
                <td
                  className={`px-4 py-3 text-right tabular-nums font-medium ${pnlPos ? 'text-emerald-400' : 'text-red-400'}`}
                >
                  {pnlPos ? '+' : ''}
                  {formatCoins(h.pnl)}
                  <span className="ml-1 text-xs">
                    ({formatPct(h.pnlPct)})
                  </span>
                </td>
                <td className="px-4 py-3 text-right tabular-nums text-slate-400">
                  {h.weightPct.toFixed(1)}%
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/** Allocation stacked bar + largest position text. */
function AllocationBar() {
  const wallet = useSimStore((s) => s.wallet);
  const prices = useSimStore((s) => s.prices);
  const portfolio = useSimStore(selectPortfolio);
  const { holdings } = portfolio;

  if (holdings.length === 0) return null;

  const largest = largestPositionWeight(wallet, prices);

  return (
    <div className="space-y-3">
      <div className="flex gap-1 overflow-hidden rounded-full" role="img" aria-label="Portfolio allocation by holding">
        {holdings.map((h, i) => {
          const company = getCompany(COMPANIES, h.companyId);
          const color = HOLDING_COLORS[i % HOLDING_COLORS.length];
          return (
            <div
              key={h.companyId}
              style={{ width: `${h.weightPct}%`, backgroundColor: color }}
              className="h-4 min-w-[4px] transition-all first:rounded-l-full last:rounded-r-full"
              title={`${company?.name ?? h.companyId}: ${h.weightPct.toFixed(1)}%`}
              aria-label={`${company?.name ?? h.companyId} ${h.weightPct.toFixed(1)}%`}
            />
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3">
        {holdings.map((h, i) => {
          const company = getCompany(COMPANIES, h.companyId);
          const color = HOLDING_COLORS[i % HOLDING_COLORS.length];
          return (
            <div key={h.companyId} className="flex items-center gap-1.5 text-xs text-slate-400">
              <span
                className="inline-block h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: color }}
                aria-hidden="true"
              />
              {company?.name ?? h.companyId} ({h.weightPct.toFixed(1)}%)
            </div>
          );
        })}
      </div>

      <p className="text-sm text-slate-400">
        Largest position:{' '}
        <span className="font-semibold text-white">
          {(largest * 100).toFixed(1)}%
        </span>{' '}
        of total portfolio
      </p>
    </div>
  );
}

// ─── Reset confirmation ───────────────────────────────────────────────────────

function ResetButton() {
  const resetDemo = useSimStore((s) => s.resetDemo);
  const [confirming, setConfirming] = useState(false);

  if (confirming) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-slate-300">Reset all progress?</span>
        <button
          onClick={() => {
            resetDemo();
            setConfirming(false);
          }}
          className="rounded-md bg-red-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400"
        >
          Yes, reset
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="rounded-md border border-white/10 px-3 py-1.5 text-xs text-slate-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-cyan/50"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="rounded-md border border-white/10 px-3 py-1.5 text-xs text-slate-400 transition-colors hover:border-red-700/50 hover:text-red-400 focus:outline-none focus:ring-2 focus:ring-red-400/50"
    >
      Reset demo
    </button>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function PortfolioScreen() {
  const latestT = useSimStore(
    (s) => s.priceHistory[s.priceHistory.length - 1]?.t ?? 0,
  );
  const reducedMotion = usePrefersReducedMotion();

  // Start the market ticker — 3 s interval, pauses when tab is hidden.
  useMarketTicker({ intervalMs: 3_000 });

  return (
    <main className="mx-auto max-w-5xl space-y-6 px-4 py-6">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div>
        <h1 className="text-2xl font-bold text-white sm:text-3xl">
          Your Portfolio
        </h1>

        {/* Persistent disclaimer banner */}
        <div
          role="note"
          className="mt-3 flex items-start gap-2 rounded-lg border border-gold/30 bg-gold/10 px-4 py-2.5 text-sm text-gold"
        >
          <span aria-hidden="true" className="mt-0.5 shrink-0">ⓘ</span>
          <span>
            Simulated data · virtual coins only. This is education, not
            investment advice.
          </span>
        </div>
      </div>

      {/* ── Summary cards ───────────────────────────────────────────────── */}
      <section aria-labelledby="summary-heading">
        <h2 id="summary-heading" className="sr-only">
          Account summary
        </h2>
        <SummaryCards />
      </section>

      {/* ── Value chart ─────────────────────────────────────────────────── */}
      <section
        aria-labelledby="chart-heading"
        className="rounded-xl border border-white/10 bg-white/5 p-4"
      >
        <h2 id="chart-heading" className="mb-3 text-sm font-semibold text-slate-300">
          Portfolio value over time
        </h2>
        <ValueChart reducedMotion={reducedMotion} />
      </section>

      {/* ── Holdings table ──────────────────────────────────────────────── */}
      <section aria-labelledby="holdings-heading">
        <h2 id="holdings-heading" className="mb-3 text-sm font-semibold text-slate-300">
          Holdings
        </h2>
        <HoldingsTable />
      </section>

      {/* ── Allocation ──────────────────────────────────────────────────── */}
      <section
        aria-labelledby="allocation-heading"
        className="rounded-xl border border-white/10 bg-white/5 p-4"
      >
        <h2
          id="allocation-heading"
          className="mb-3 text-sm font-semibold text-slate-300"
        >
          Allocation
        </h2>
        <AllocationBar />
      </section>

      {/* ── Market Event Results placeholder ────────────────────────────── */}
      {/* TODO(phase 2): render ScenarioComparison here after Person C
          implements applyScenario / compareBeforeAfter in src/sim/scenarios.ts.
          The crash before/after comparison will show which holdings were hit
          and by how much when the player triggers a CrashScenario. */}
      <section
        aria-labelledby="events-heading"
        className="rounded-xl border border-dashed border-purple/30 bg-purple/5 p-6"
      >
        <h2
          id="events-heading"
          className="mb-2 text-sm font-semibold text-purple"
        >
          Market Event Results
        </h2>
        <p className="text-sm text-slate-500">
          Crash scenario results will appear here after a market event is
          triggered. (Phase 2)
        </p>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <footer className="flex items-center justify-between border-t border-white/10 pt-4 text-xs text-slate-500">
        <span>
          Prices simulated · last updated{' '}
          <time dateTime={latestT > 0 ? new Date(latestT).toISOString() : ''}>
            {formatTime(latestT)}
          </time>
        </span>
        <ResetButton />
      </footer>
    </main>
  );
}
