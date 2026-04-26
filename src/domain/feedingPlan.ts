import type { PlanMode } from './types';
import { defaultMealTimes } from './schedule';

export function buildScheduledMealDrafts({
  dailyKcal,
  mode,
  mealsPerDay,
  foodIds,
}: {
  dailyKcal: number;
  mode: PlanMode;
  mealsPerDay: 2 | 3 | 4;
  foodIds: string[];
}): Array<{ timeOfDayMin: number; kcalTarget: number; foodId: string | null }> {
  const times = mode === 'grazer' ? [20 * 60] : defaultMealTimes(mealsPerDay);
  const kcalTarget = dailyKcal / Math.max(1, times.length);

  return times.map((timeOfDayMin, index) => ({
    timeOfDayMin,
    kcalTarget,
    foodId: foodIds[index % Math.max(1, foodIds.length)] ?? null,
  }));
}
