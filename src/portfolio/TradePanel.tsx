/**
 * TradePanel — self-contained buy/sell widget.
 *
 * Mounted by Person B inside their company info panel:
 *   <TradePanel companyId="nova-loom" />
 *   <TradePanel companyId="nova-loom" compact />
 *
 * No props are needed beyond `companyId`. The component reads everything else
 * from the sim store (price, cash, holdings) and calls store actions directly.
 *
 * Does NOT import anything from src/world/ or src/learning/.
 */
import { useEffect, useId, useRef, useState } from 'react';
import { COMPANIES, getCompany, tradeCost } from '../sim';
import { useSimStore } from '../store/useSimStore';
import { formatCoins, formatPct, formatTime } from './format';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface TradePanelProps {
  /** Stable company id matching one of the COMPANIES slugs, e.g. 'nova-loom'. */
  companyId: string;
  /** Tighter spacing for use inside a side panel. Default: false. */
  compact?: boolean;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const QUICK_QTYS = [1, 5, 10] as const;
const SUCCESS_CLEAR_MS = 4_000;

// ─── Component ───────────────────────────────────────────────────────────────

export function TradePanel({ companyId, compact = false }: TradePanelProps) {
  const company = getCompany(COMPANIES, companyId);

  // ── Store selectors (one per field to minimise re-renders) ─────────────────
  const price = useSimStore((s) => s.prices[companyId] ?? 0);
  const cash = useSimStore((s) => s.wallet.cash);
  const holding = useSimStore((s) =>
    s.wallet.holdings.find((h) => h.companyId === companyId),
  );
  const latestT = useSimStore(
    (s) => s.priceHistory[s.priceHistory.length - 1]?.t ?? 0,
  );
  const firstPrice = useSimStore(
    (s) => s.priceHistory[0]?.prices[companyId] ?? price,
  );
  const buyAction = useSimStore((s) => s.buy);
  const sellAction = useSimStore((s) => s.sell);

  // ── Local UI state ─────────────────────────────────────────────────────────
  const [mode, setMode] = useState<'buy' | 'sell'>('buy');
  const [rawQty, setRawQty] = useState<string>('1');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const successTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputId = useId();
  const alertId = useId();

  // ── Derived values ─────────────────────────────────────────────────────────
  const qty = parseInt(rawQty, 10);
  const isValidQty = Number.isInteger(qty) && qty >= 1;
  const heldQty = holding?.qty ?? 0;
  const priceChangePct =
    firstPrice > 0 ? ((price - firstPrice) / firstPrice) * 100 : 0;
  const cost = isValidQty ? tradeCost(qty, price) : 0;
  const proceeds = isValidQty ? tradeCost(qty, price) : 0;
  const cashAfterBuy = cash - cost;
  const cashAfterSell = cash + proceeds;
  const maxBuyQty = price > 0 ? Math.floor(cash / price) : 0;
  const canAfford = isValidQty && cost <= cash;
  const canSell = heldQty > 0 && isValidQty && qty <= heldQty;

  const isBuyDisabled = !isValidQty || !canAfford;
  const isSellDisabled = heldQty === 0 || !isValidQty || qty > heldQty;

  // ── Helpers ────────────────────────────────────────────────────────────────
  function showSuccess(msg: string) {
    setSuccess(msg);
    setError(null);
    if (successTimerRef.current) clearTimeout(successTimerRef.current);
    successTimerRef.current = setTimeout(() => setSuccess(null), SUCCESS_CLEAR_MS);
  }

  function switchMode(m: 'buy' | 'sell') {
    setMode(m);
    setRawQty('1');
    setError(null);
    setSuccess(null);
  }

  function setMax() {
    setRawQty(
      String(mode === 'buy' ? Math.max(0, maxBuyQty) : Math.max(0, heldQty)),
    );
    setError(null);
  }

  function handleTrade() {
    if (!isValidQty) return;

    if (mode === 'buy') {
      const result = buyAction(companyId, qty);
      if (!result.ok) {
        setError(result.reason);
        setSuccess(null);
      } else {
        showSuccess(
          `Bought ${qty} share${qty === 1 ? '' : 's'} of ${company?.name ?? companyId} at ${formatCoins(price)}`,
        );
        setRawQty('1');
      }
    } else {
      const result = sellAction(companyId, qty);
      if (!result.ok) {
        setError(result.reason);
        setSuccess(null);
      } else {
        showSuccess(
          `Sold ${qty} share${qty === 1 ? '' : 's'} of ${company?.name ?? companyId} for ${formatCoins(proceeds)}`,
        );
        setRawQty('1');
      }
    }
  }

  // Clear the success timer on unmount.
  useEffect(() => {
    return () => {
      if (successTimerRef.current) clearTimeout(successTimerRef.current);
    };
  }, []);

  // ── Unknown company guard ──────────────────────────────────────────────────
  if (!company) {
    return (
      <div className="rounded-xl border border-red-700/40 bg-red-900/20 p-4 text-sm text-red-300">
        Unknown company id: <code>{companyId}</code>
      </div>
    );
  }

  // ── Layout helpers ─────────────────────────────────────────────────────────
  const pad = compact ? 'p-3' : 'p-5';
  const sectionGap = compact ? 'space-y-3' : 'space-y-4';

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div
      className={`rounded-xl border border-white/10 bg-[#0f1535] ${pad} ${sectionGap} font-inter`}
      aria-label={`Trade panel for ${company.name}`}
    >
      {/* ── Company header ─────────────────────────────────────────────── */}
      <div>
        <div className="flex items-baseline gap-2">
          <h2 className="text-base font-bold text-white">{company.name}</h2>
          <span className="text-xs text-slate-400">{company.ticker}</span>
        </div>

        <div className="mt-1 flex items-baseline gap-2">
          <span className="text-2xl font-bold tabular-nums text-cyan">
            {formatCoins(price)}
          </span>
          <span
            className={`text-sm font-medium ${priceChangePct >= 0 ? 'text-emerald-400' : 'text-red-400'}`}
            aria-label={`Price change: ${formatPct(priceChangePct)}`}
          >
            {priceChangePct >= 0 ? '▲' : '▼'} {formatPct(priceChangePct)}
          </span>
        </div>

        <p className="mt-1 text-xs text-slate-500">
          Simulated price · virtual coins · updated {formatTime(latestT)}
        </p>
      </div>

      {/* ── Account snapshot ───────────────────────────────────────────── */}
      <div className="flex gap-2 text-sm">
        <div className="flex-1 rounded-lg bg-white/5 p-2.5">
          <p className="text-xs text-slate-400">Cash available</p>
          <p className="tabular-nums font-semibold text-gold">{formatCoins(cash)}</p>
        </div>
        <div className="flex-1 rounded-lg bg-white/5 p-2.5">
          <p className="text-xs text-slate-400">Shares held</p>
          <p className="font-semibold text-white">
            {heldQty}
            {holding && (
              <span className="ml-1 text-xs text-slate-400">
                @ {formatCoins(holding.avgCost)}
              </span>
            )}
          </p>
        </div>
      </div>

      {/* ── Mode toggle ────────────────────────────────────────────────── */}
      <div
        className="flex overflow-hidden rounded-lg border border-white/10 text-sm"
        role="group"
        aria-label="Trade mode"
      >
        <button
          className={`flex-1 py-2 font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-inset focus:ring-cyan/50 ${
            mode === 'buy'
              ? 'bg-emerald-700 text-white'
              : 'text-slate-400 hover:bg-white/5 hover:text-white'
          }`}
          onClick={() => switchMode('buy')}
          aria-pressed={mode === 'buy'}
        >
          Buy
        </button>
        <button
          className={`flex-1 py-2 font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-inset focus:ring-cyan/50 ${
            mode === 'sell'
              ? 'bg-red-700 text-white'
              : 'text-slate-400 hover:bg-white/5 hover:text-white'
          } disabled:cursor-not-allowed disabled:opacity-40`}
          onClick={() => switchMode('sell')}
          aria-pressed={mode === 'sell'}
          disabled={heldQty === 0}
          aria-disabled={heldQty === 0}
        >
          Sell
          {heldQty === 0 && (
            <span className="ml-1 text-xs font-normal">(none held)</span>
          )}
        </button>
      </div>

      {/* ── Quantity input ─────────────────────────────────────────────── */}
      <div>
        <label
          htmlFor={inputId}
          className="mb-1 block text-xs font-medium text-slate-400"
        >
          Quantity (whole shares)
        </label>

        <div className="flex gap-2">
          <input
            id={inputId}
            type="number"
            min={1}
            step={1}
            value={rawQty}
            onChange={(e) => {
              setRawQty(e.target.value);
              setError(null);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleTrade();
            }}
            className="min-w-0 flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-cyan focus:outline-none focus:ring-2 focus:ring-cyan/30"
            aria-label="Number of shares to trade"
            aria-describedby={alertId}
          />
          <button
            onClick={setMax}
            className="rounded-lg border border-purple/40 bg-purple/20 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-purple/40 focus:outline-none focus:ring-2 focus:ring-purple/50"
            aria-label={
              mode === 'buy'
                ? `Set maximum affordable quantity (${maxBuyQty})`
                : `Set all held shares (${heldQty})`
            }
          >
            Max
          </button>
        </div>

        {/* Quick quantity buttons */}
        <div className="mt-2 flex gap-2" role="group" aria-label="Quick quantities">
          {QUICK_QTYS.map((q) => (
            <button
              key={q}
              onClick={() => {
                setRawQty(String(q));
                setError(null);
              }}
              className="flex-1 rounded-md border border-white/10 bg-white/5 py-1.5 text-xs font-medium text-slate-300 transition-colors hover:bg-white/10 hover:text-white focus:outline-none focus:ring-1 focus:ring-cyan/50"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* ── Live preview ───────────────────────────────────────────────── */}
      {isValidQty && (
        <div
          className="rounded-lg bg-white/5 p-3 text-sm"
          aria-label="Trade preview"
        >
          {mode === 'buy' ? (
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-400">Total cost</span>
                <span className="tabular-nums text-white">{formatCoins(cost)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Cash after</span>
                <span
                  className={`tabular-nums font-semibold ${cashAfterBuy < 0 ? 'text-red-400' : 'text-emerald-400'}`}
                >
                  {formatCoins(cashAfterBuy)}
                </span>
              </div>
            </div>
          ) : (
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-400">Total proceeds</span>
                <span className="tabular-nums text-white">{formatCoins(proceeds)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Cash after</span>
                <span className="tabular-nums font-semibold text-emerald-400">
                  {formatCoins(cashAfterSell)}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Error / Success feedback ───────────────────────────────────── */}
      {/* Always-rendered aria-live region for screen readers */}
      <div id={alertId} className="sr-only" aria-live="polite" aria-atomic="true">
        {success ?? error ?? ''}
      </div>

      {error && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-lg border border-red-700/40 bg-red-900/20 px-3 py-2 text-sm text-red-300"
        >
          <span aria-hidden="true" className="mt-0.5 shrink-0">⚠</span>
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div
          className="flex items-start gap-2 rounded-lg border border-emerald-700/40 bg-emerald-900/20 px-3 py-2 text-sm text-emerald-300"
          aria-hidden="true" /* screen reader uses the sr-only region */
        >
          <span className="mt-0.5 shrink-0">✓</span>
          <span>{success}</span>
        </div>
      )}

      {/* ── Action button ──────────────────────────────────────────────── */}
      {mode === 'buy' ? (
        <div className="space-y-1">
          <button
            onClick={handleTrade}
            disabled={isBuyDisabled}
            aria-disabled={isBuyDisabled}
            className="w-full rounded-lg bg-emerald-700 py-3 text-sm font-semibold text-white transition-colors hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {!isValidQty
              ? 'Enter a valid quantity'
              : !canAfford
                ? 'Not enough virtual cash'
                : `Buy ${qty} share${qty === 1 ? '' : 's'}`}
          </button>
          {isValidQty && !canAfford && (
            <p className="text-center text-xs text-red-400">
              Need {formatCoins(cost - cash)} more coins
            </p>
          )}
          {!isValidQty && (
            <p className="text-center text-xs text-slate-500">
              Enter a whole number ≥ 1
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-1">
          <button
            onClick={handleTrade}
            disabled={isSellDisabled}
            aria-disabled={isSellDisabled}
            className="w-full rounded-lg bg-red-700 py-3 text-sm font-semibold text-white transition-colors hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {heldQty === 0
              ? 'No shares to sell'
              : !isValidQty
                ? 'Enter a valid quantity'
                : qty > heldQty
                  ? `Only ${heldQty} share${heldQty === 1 ? '' : 's'} held`
                  : `Sell ${qty} share${qty === 1 ? '' : 's'}`}
          </button>
          {heldQty === 0 && (
            <p className="text-center text-xs text-slate-500">
              Buy some shares first
            </p>
          )}
          {heldQty > 0 && isValidQty && qty > heldQty && (
            <p className="text-center text-xs text-red-400">
              You hold {heldQty} share{heldQty === 1 ? '' : 's'}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
