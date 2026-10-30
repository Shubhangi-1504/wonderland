import { useEffect } from 'react';
import { useSimStore } from '../store/useSimStore';

export interface MarketTickerOptions {
  /** How often to call `tick()`, in milliseconds. Default: 3000. */
  intervalMs?: number;
  /** Set to false to pause the ticker (e.g. when a modal is open). Default: true. */
  enabled?: boolean;
}

/**
 * Calls `tick()` on a fixed interval while mounted and while the tab is visible.
 * Pauses automatically when `document.visibilityState` is not `'visible'`.
 * Cleans up the interval on unmount.
 *
 * The sim layer stays pure (no timers inside `src/sim/`). All timing lives here.
 *
 * Person B can import and reuse this hook in `/world`:
 *   ```tsx
 *   import { useMarketTicker } from '../portfolio';
 *   useMarketTicker({ intervalMs: 2000 });
 *   ```
 */
export function useMarketTicker({
  intervalMs = 3_000,
  enabled = true,
}: MarketTickerOptions = {}): void {
  // Grab only the action — this selector never changes, so no re-renders.
  const tick = useSimStore((s) => s.tick);

  useEffect(() => {
    if (!enabled) return;

    let id: ReturnType<typeof setInterval> | null = null;

    const start = () => {
      if (id !== null) return; // already running
      id = setInterval(() => tick(), intervalMs);
    };

    const stop = () => {
      if (id !== null) {
        clearInterval(id);
        id = null;
      }
    };

    const onVisibility = () => {
      document.visibilityState === 'visible' ? start() : stop();
    };

    // Start immediately if the tab is already visible.
    if (document.visibilityState === 'visible') start();
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      stop();
    };
  }, [enabled, intervalMs, tick]);
}
