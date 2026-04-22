import { describe, it, expect } from 'vitest';
import {
  generateSchedule,
  defaultMealTimes,
  minutesToTimeLabel,
  parseTimeOfDay,
  snapToMinuteGrid,
} from '../../src/domain/schedule';

describe('defaultMealTimes', () => {
  it('returns expected defaults', () => {
    expect(defaultMealTimes(2)).toEqual([7 * 60, 18 * 60]);
    expect(defaultMealTimes(3).length).toBe(3);
    expect(defaultMealTimes(4).length).toBe(4);
  });
});

describe('generateSchedule', () => {
  const foodLookup = new Map([
    ['f1', { kcalPerKg: 4000 }],
    ['f2', { kcalPerKg: 1000 }],
  ]);

  it('splits kcal evenly across scheduled meals', () => {
    const plan = generateSchedule({
      dailyKcal: 240,
      mode: 'scheduled',
      mealsPerDay: 3,
      foods: [{ foodId: 'f1', kcalSharePct: 100 }],
      foodLookup,
    });
    expect(plan.length).toBe(3);
    expect(plan[0]!.kcalTarget).toBeCloseTo(80, 2);
    expect(plan[0]!.perFood[0]!.grams).toBe(20);
  });

  it('grazer mode returns single end-of-day target', () => {
    const plan = generateSchedule({
      dailyKcal: 240,
      mode: 'grazer',
      foods: [{ foodId: 'f1', kcalSharePct: 100 }],
      foodLookup,
    });
    expect(plan.length).toBe(1);
    expect(plan[0]!.kcalTarget).toBe(240);
    expect(plan[0]!.timeOfDayMin).toBe(20 * 60);
  });

  it('splits kcal across multiple foods by share', () => {
    const plan = generateSchedule({
      dailyKcal: 200,
      mode: 'scheduled',
      mealsPerDay: 2,
      foods: [
        { foodId: 'f1', kcalSharePct: 70 },
        { foodId: 'f2', kcalSharePct: 30 },
      ],
      foodLookup,
    });
    const meal = plan[0]!;
    expect(meal.perFood).toHaveLength(2);
    expect(meal.perFood[0]!.kcal).toBeCloseTo(70, 2);
    expect(meal.perFood[1]!.kcal).toBeCloseTo(30, 2);
  });
});

describe('minutesToTimeLabel', () => {
  it('formats 12-hour', () => {
    expect(minutesToTimeLabel(0)).toBe('12:00 AM');
    expect(minutesToTimeLabel(12 * 60)).toBe('12:00 PM');
    expect(minutesToTimeLabel(13 * 60 + 30)).toBe('1:30 PM');
    expect(minutesToTimeLabel(7 * 60)).toBe('7:00 AM');
  });
  it('formats 24-hour', () => {
    expect(minutesToTimeLabel(13 * 60 + 30, false)).toBe('13:30');
  });
});

describe('parseTimeOfDay', () => {
  it('parses HH:MM', () => {
    expect(parseTimeOfDay('07:00')).toBe(420);
    expect(parseTimeOfDay('24:00')).toBeNull();
    expect(parseTimeOfDay('not a time')).toBeNull();
  });
});

describe('snapToMinuteGrid', () => {
  it('snaps to 15m grid', () => {
    expect(snapToMinuteGrid(433)).toBe(435);
    expect(snapToMinuteGrid(422)).toBe(420);
  });
  it('wraps around midnight', () => {
    expect(snapToMinuteGrid(-5)).toBe(0);
    expect(snapToMinuteGrid(1445)).toBe(0);
  });
});
