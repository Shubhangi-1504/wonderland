/**
 * Deterministic random numbers so the demo replays identically for everyone.
 *
 * No `Math.random()` anywhere in `src/sim`: every random draw comes from a seeded
 * generator that is passed in as an argument. Same seed -> same price path.
 */

/**
 * Create a seeded pseudo-random number generator (mulberry32).
 *
 * - returns numbers in `[0, 1)` (same contract as `Math.random`)
 * - the same seed always produces the same sequence
 * - stateful: each call advances the sequence
 *
 * @param seed Any integer seed; `0` and negatives work (normalised to uint32).
 */
export function createRng(seed: number): () => number {
  // `>>> 0` maps any number (including negatives/decimals) onto a uint32.
  let state = seed >>> 0;

  return function next(): number {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * One standard-normal sample (mean 0, standard deviation 1) from any `[0, 1)` rng,
 * using the Box-Muller transform.
 *
 * `1 - rng()` keeps the log argument in `(0, 1]`, so `Math.log` never sees 0.
 * Deterministic: the same rng sequence yields the same sample.
 */
export function normal(rng: () => number): number {
  const u1 = 1 - rng();
  const u2 = rng();
  return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}
