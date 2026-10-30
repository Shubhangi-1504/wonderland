import { describe, expect, it } from 'vitest';
import { createRng, normal } from '../rng';

describe('createRng', () => {
  it('returns the same sequence for the same seed', () => {
    const a = createRng(42);
    const b = createRng(42);
    const seqA = Array.from({ length: 25 }, () => a());
    const seqB = Array.from({ length: 25 }, () => b());

    expect(seqA).toEqual(seqB);
  });

  it('returns different sequences for different seeds', () => {
    const a = createRng(1);
    const b = createRng(2);

    expect(a()).not.toBe(b());
  });

  it('only produces numbers in [0, 1)', () => {
    const rng = createRng(7);
    for (let i = 0; i < 5_000; i += 1) {
      const value = rng();
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    }
  });

  it('handles seed 0 and negative seeds deterministically', () => {
    expect(createRng(0)()).toBe(createRng(0)());
    expect(createRng(-9)()).toBe(createRng(-9)());
  });
});

describe('normal', () => {
  it('returns roughly standard-normal samples', () => {
    const rng = createRng(1234);
    const samples = Array.from({ length: 20_000 }, () => normal(rng));

    const mean = samples.reduce((sum, value) => sum + value, 0) / samples.length;
    const variance =
      samples.reduce((sum, value) => sum + (value - mean) ** 2, 0) / samples.length;

    expect(Math.abs(mean)).toBeLessThan(0.05);
    expect(Math.sqrt(variance)).toBeGreaterThan(0.9);
    expect(Math.sqrt(variance)).toBeLessThan(1.1);
  });

  it('is deterministic for a given seed', () => {
    expect(normal(createRng(5))).toBe(normal(createRng(5)));
  });
});
