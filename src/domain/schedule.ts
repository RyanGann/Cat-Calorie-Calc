import type { Food, PlanMode } from './types';
import { kcalToGrams, roundGrams } from './portions';

export type PlanFoodRef = { foodId: string; kcalSharePct: number };

export type ScheduleInput = {
  dailyKcal: number;
  mode: PlanMode;
  mealsPerDay?: number | null;
  foods: PlanFoodRef[];
  foodLookup: Map<string, Pick<Food, 'kcalPerKg'>>;
};

export type ScheduledMealPlan = {
  timeOfDayMin: number;
  kcalTarget: number;
  perFood: Array<{ foodId: string; kcal: number; grams: number }>;
};

const DEFAULT_TIMES: Record<number, number[]> = {
  2: [7 * 60, 18 * 60],
  3: [7 * 60, 13 * 60, 19 * 60],
  4: [7 * 60, 12 * 60, 17 * 60, 21 * 60],
};

export function defaultMealTimes(mealsPerDay: number): number[] {
  return DEFAULT_TIMES[mealsPerDay] ?? DEFAULT_TIMES[3]!;
}

export function generateSchedule(input: ScheduleInput): ScheduledMealPlan[] {
  if (input.mode === 'grazer') {
    return [
      {
        timeOfDayMin: 20 * 60,
        kcalTarget: input.dailyKcal,
        perFood: splitPerFood(input.dailyKcal, input.foods, input.foodLookup),
      },
    ];
  }

  const mealsPerDay = Math.max(2, Math.min(4, input.mealsPerDay ?? 2));
  const times = defaultMealTimes(mealsPerDay);
  const perMealKcal = input.dailyKcal / mealsPerDay;

  return times.map((timeOfDayMin) => ({
    timeOfDayMin,
    kcalTarget: perMealKcal,
    perFood: splitPerFood(perMealKcal, input.foods, input.foodLookup),
  }));
}

function splitPerFood(
  kcal: number,
  foods: PlanFoodRef[],
  lookup: Map<string, Pick<Food, 'kcalPerKg'>>,
): Array<{ foodId: string; kcal: number; grams: number }> {
  if (foods.length === 0) return [];
  const totalPct = foods.reduce((acc, f) => acc + f.kcalSharePct, 0) || 100;
  return foods.map((f) => {
    const shareKcal = (kcal * f.kcalSharePct) / totalPct;
    const food = lookup.get(f.foodId);
    const grams = food ? roundGrams(kcalToGrams(shareKcal, food)) : 0;
    return { foodId: f.foodId, kcal: shareKcal, grams };
  });
}

export function minutesToTimeLabel(minutes: number, hour12 = true): string {
  const m = ((minutes % 1440) + 1440) % 1440;
  const h = Math.floor(m / 60);
  const mm = m % 60;
  if (hour12) {
    const period = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 === 0 ? 12 : h % 12;
    return `${h12}:${mm.toString().padStart(2, '0')} ${period}`;
  }
  return `${h.toString().padStart(2, '0')}:${mm.toString().padStart(2, '0')}`;
}

export function parseTimeOfDay(str: string): number | null {
  const m = str.match(/^(\d{1,2}):(\d{2})$/);
  if (!m) return null;
  const h = parseInt(m[1]!, 10);
  const mm = parseInt(m[2]!, 10);
  if (h < 0 || h > 23 || mm < 0 || mm > 59) return null;
  return h * 60 + mm;
}

export function snapToMinuteGrid(minutes: number, grid = 15): number {
  const m = ((Math.round(minutes / grid) * grid) + 1440) % 1440;
  return m;
}
