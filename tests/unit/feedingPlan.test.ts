import { describe, expect, it } from 'vitest';
import { buildScheduledMealDrafts } from '../../src/domain/feedingPlan';

describe('buildScheduledMealDrafts', () => {
  it('builds default scheduled meals and rotates selected foods', () => {
    const meals = buildScheduledMealDrafts({
      dailyKcal: 240,
      mode: 'scheduled',
      mealsPerDay: 3,
      foodIds: ['wet', 'dry'],
    });

    expect(meals).toEqual([
      { timeOfDayMin: 7 * 60, kcalTarget: 80, foodId: 'wet' },
      { timeOfDayMin: 13 * 60, kcalTarget: 80, foodId: 'dry' },
      { timeOfDayMin: 19 * 60, kcalTarget: 80, foodId: 'wet' },
    ]);
  });

  it('builds a grazer check-in with the full daily target', () => {
    const meals = buildScheduledMealDrafts({
      dailyKcal: 210,
      mode: 'grazer',
      mealsPerDay: 4,
      foodIds: ['dry'],
    });

    expect(meals).toEqual([
      { timeOfDayMin: 20 * 60, kcalTarget: 210, foodId: 'dry' },
    ]);
  });
});
