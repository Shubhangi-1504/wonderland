import { useMemo, useState, useEffect } from 'react';

export interface PerformanceProfile {
  reducedMotion: boolean;
  lowEnd: boolean;
  particles: number;
  stars: number;
}

/**
 * Resolve once per mount: motion preference + low-end detection
 * (coarse pointer / small screen / few cores) for particle budgets.
 */
export function usePerformanceProfile(): PerformanceProfile {
  return useMemo(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const small = window.matchMedia('(max-width: 900px)').matches;
    const cores = navigator.hardwareConcurrency ?? 4;
    const lowEnd = small || cores <= 4;
    return {
      reducedMotion,
      lowEnd,
      particles: reducedMotion ? 120 : lowEnd ? 250 : 600,
      stars: reducedMotion ? 260 : lowEnd ? 200 : 500,
    };
  }, []);
}

/** Pause the WebGL frame loop while the tab is hidden. */
export function usePageVisible(): boolean {
  const [visible, setVisible] = useState(!document.hidden);
  useEffect(() => {
    const on = () => setVisible(!document.hidden);
    document.addEventListener('visibilitychange', on);
    return () => document.removeEventListener('visibilitychange', on);
  }, []);
  return visible;
}
