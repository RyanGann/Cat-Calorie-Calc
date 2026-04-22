import { describe, it, expect } from 'vitest';
import {
  kcalToGrams,
  kcalToCans,
  roundGrams,
  roundCans,
  visualPortion,
  formatCans,
  formatCups,
} from '../../src/domain/portions';

describe('kcalToGrams', () => {
  it('200 kcal of a 4000 kcal/kg food = 50g', () => {
    expect(kcalToGrams(200, { kcalPerKg: 4000 })).toBeCloseTo(50, 1);
  });
  it('returns 0 for invalid foods', () => {
    expect(kcalToGrams(100, { kcalPerKg: 0 })).toBe(0);
  });
});

describe('kcalToCans', () => {
  it('returns cans count', () => {
    expect(kcalToCans(100, { kcalPerCan: 80 })).toBeCloseTo(1.25, 2);
  });
  it('returns null when no kcalPerCan', () => {
    expect(kcalToCans(100, { kcalPerCan: null })).toBeNull();
  });
});

describe('roundGrams', () => {
  it('rounds to nearest gram, clamps to 0', () => {
    expect(roundGrams(27.4)).toBe(27);
    expect(roundGrams(27.5)).toBe(28);
    expect(roundGrams(-5)).toBe(0);
  });
});

describe('roundCans', () => {
  it('rounds to nearest quarter', () => {
    expect(roundCans(0.15)).toBe(0.25);
    expect(roundCans(0.38)).toBe(0.5);
    expect(roundCans(0.9)).toBe(1);
    expect(roundCans(0.05)).toBe(0);
  });
});

describe('visualPortion', () => {
  it('gives can-based label for wet food', () => {
    const vp = visualPortion(
      { type: 'wet', kcalPerKg: 880, kcalPerCan: 75, canSizeG: 85 },
      100,
    );
    expect(vp.primaryLabel).toMatch(/can/);
    expect(vp.secondaryLabel).toMatch(/g/);
  });

  it('gives gram-based label for dry food with cup hint', () => {
    const vp = visualPortion(
      { type: 'dry', kcalPerKg: 4000, kcalPerCan: null, canSizeG: null },
      200,
    );
    expect(vp.primaryLabel).toMatch(/g/);
    expect(vp.secondaryLabel).toMatch(/cup/);
  });
});

describe('formatCans', () => {
  it('formats fractions with unicode glyphs', () => {
    expect(formatCans(0.25)).toBe('¼ can');
    expect(formatCans(0.5)).toBe('½ can');
    expect(formatCans(1)).toBe('1 can');
    expect(formatCans(1.5)).toBe('1½ cans');
    expect(formatCans(2)).toBe('2 cans');
  });
});

describe('formatCups', () => {
  it('formats cup fractions', () => {
    expect(formatCups(0.25)).toBe('¼ cup');
    expect(formatCups(0.5)).toBe('½ cup');
    expect(formatCups(1)).toBe('1 cup');
  });
});
