import { describe, it, expect } from 'vitest';
import { estimateDailyKcal, rer, deriveLifeStage, ageInMonths } from '../../src/domain/calories';

describe('rer', () => {
  it('computes 70 * kg^0.75', () => {
    expect(rer(4)).toBeCloseTo(198, 0);
    expect(rer(5)).toBeCloseTo(234, 0);
    expect(rer(1)).toBeCloseTo(70, 1);
    expect(rer(10)).toBeCloseTo(393.6, 0);
  });
  it('handles zero/tiny weights gracefully', () => {
    expect(rer(0)).toBeGreaterThan(0);
  });
});

describe('ageInMonths', () => {
  it('returns null for missing date', () => {
    expect(ageInMonths(null)).toBeNull();
  });
  it('returns zero for future dates', () => {
    const future = new Date();
    future.setFullYear(future.getFullYear() + 1);
    expect(ageInMonths(future.toISOString())).toBe(0);
  });
  it('computes months correctly', () => {
    const now = new Date('2026-04-18');
    const dob = new Date('2024-04-18');
    expect(ageInMonths(dob.toISOString(), now)).toBeGreaterThanOrEqual(23);
    expect(ageInMonths(dob.toISOString(), now)).toBeLessThanOrEqual(24);
  });
});

describe('deriveLifeStage', () => {
  it('classifies correctly', () => {
    expect(deriveLifeStage(2)).toBe('kitten_young');
    expect(deriveLifeStage(8)).toBe('kitten');
    expect(deriveLifeStage(36)).toBe('adult');
    expect(deriveLifeStage(140)).toBe('senior');
    expect(deriveLifeStage(null)).toBe('adult');
  });
});

describe('estimateDailyKcal', () => {
  const baseInput = {
    weightKg: 4.5,
    birthDate: null,
    sex: 'unknown' as const,
    neutered: true,
    bodyCondition: 5,
    activityLevel: 'moderate' as const,
  };

  it('produces a reasonable number for a neutered 4.5kg adult', () => {
    const result = estimateDailyKcal(baseInput);
    expect(result.kcal).toBeGreaterThan(180);
    expect(result.kcal).toBeLessThan(280);
    expect(result.lifeStage).toBe('adult');
    expect(result.rationale.length).toBeGreaterThan(3);
  });

  it('kittens get higher factor', () => {
    const now = new Date('2026-04-18');
    const youngKitten = {
      ...baseInput,
      weightKg: 1.5,
      birthDate: new Date('2026-02-18').toISOString(),
      now,
    };
    const result = estimateDailyKcal(youngKitten);
    expect(result.lifeStage).toBe('kitten_young');
    expect(result.factor).toBeGreaterThan(2);
  });

  it('overweight cats (BCS 8) get reduced factor', () => {
    const lean = estimateDailyKcal({ ...baseInput, bodyCondition: 5 });
    const heavy = estimateDailyKcal({ ...baseInput, bodyCondition: 8 });
    expect(heavy.kcal).toBeLessThan(lean.kcal);
    expect(heavy.rationale.some((r) => r.toLowerCase().includes('weight loss'))).toBe(true);
  });

  it('underweight cats (BCS 2) get increased factor', () => {
    const lean = estimateDailyKcal({ ...baseInput, bodyCondition: 5 });
    const thin = estimateDailyKcal({ ...baseInput, bodyCondition: 2 });
    expect(thin.kcal).toBeGreaterThan(lean.kcal);
  });

  it('low activity reduces calories, high activity increases', () => {
    const mod = estimateDailyKcal(baseInput);
    const low = estimateDailyKcal({ ...baseInput, activityLevel: 'low' });
    const high = estimateDailyKcal({ ...baseInput, activityLevel: 'high' });
    expect(low.kcal).toBeLessThan(mod.kcal);
    expect(high.kcal).toBeGreaterThan(mod.kcal);
  });

  it('intact adult > neutered adult', () => {
    const neutered = estimateDailyKcal({ ...baseInput, neutered: true });
    const intact = estimateDailyKcal({ ...baseInput, neutered: false });
    expect(intact.kcal).toBeGreaterThan(neutered.kcal);
  });

  it('enforces minimum factor of 0.6', () => {
    const extreme = estimateDailyKcal({
      ...baseInput,
      bodyCondition: 9,
      activityLevel: 'low',
    });
    expect(extreme.factor).toBeGreaterThanOrEqual(0.6);
    expect(extreme.kcal).toBeGreaterThan(0);
  });
});
