import { describe, it, expect } from 'vitest';
import {
  kcalFedToday,
  adherence7d,
  averageDailyKcal,
  groupByDay,
  vetExportSummary,
  startOfLocalDay,
} from '../../src/domain/history';
import type { FeedingEvent, ScheduledMeal } from '../../src/domain/types';

function ev(partial: Partial<FeedingEvent>): FeedingEvent {
  return {
    id: 'e',
    catId: 'c1',
    foodId: 'f1',
    amountG: 50,
    kcal: 100,
    fedAt: Date.now(),
    status: 'fed',
    ...partial,
  };
}

describe('kcalFedToday', () => {
  it('sums kcal since local midnight, excludes skipped', () => {
    const now = new Date('2026-04-18T15:00:00');
    const today = startOfLocalDay(now);
    const events = [
      ev({ fedAt: today + 1000, kcal: 80 }),
      ev({ fedAt: today + 2000, kcal: 60, status: 'skipped' }),
      ev({ fedAt: today - 1000, kcal: 999 }),
    ];
    expect(kcalFedToday(events, now)).toBe(80);
  });
});

describe('adherence7d', () => {
  it('returns 0 with no scheduled meals', () => {
    expect(adherence7d([], [], new Date())).toBe(0);
  });

  it('computes fraction of scheduled meals fed', () => {
    const now = new Date('2026-04-18T22:00:00');
    const meals: ScheduledMeal[] = [
      { id: 'm1', planId: 'p1', timeOfDayMin: 420, kcalTarget: 100 },
      { id: 'm2', planId: 'p1', timeOfDayMin: 1080, kcalTarget: 100 },
    ];
    const dayMs = 86400000;
    const events: FeedingEvent[] = [];
    for (let i = 0; i < 7; i++) {
      events.push(ev({ fedAt: now.getTime() - i * dayMs - 3600000, status: 'fed' }));
    }
    const result = adherence7d(events, meals, now);
    expect(result).toBeCloseTo(0.5, 2);
  });
});

describe('averageDailyKcal', () => {
  it('averages over given days', () => {
    const now = new Date('2026-04-18T15:00:00');
    const dayMs = 86400000;
    const events: FeedingEvent[] = [
      ev({ fedAt: now.getTime(), kcal: 200 }),
      ev({ fedAt: now.getTime() - dayMs, kcal: 200 }),
      ev({ fedAt: now.getTime() - 2 * dayMs, kcal: 200 }),
    ];
    expect(averageDailyKcal(events, 3, now)).toBeCloseTo(200, 1);
  });
});

describe('groupByDay', () => {
  it('buckets events into per-day groups', () => {
    const now = new Date('2026-04-18T20:00:00');
    const groups = groupByDay(
      [
        ev({ fedAt: startOfLocalDay(now) + 1000, kcal: 100 }),
        ev({ fedAt: startOfLocalDay(now) - 86400000 + 1000, kcal: 150 }),
      ],
      3,
      now,
    );
    expect(groups.length).toBe(3);
    expect(groups[0]!.kcal).toBe(100);
    expect(groups[1]!.kcal).toBe(150);
    expect(groups[2]!.kcal).toBe(0);
  });
});

describe('vetExportSummary', () => {
  it('produces a 30-day summary with counts + averages', () => {
    const now = new Date('2026-04-18T15:00:00');
    const events: FeedingEvent[] = [
      ev({ fedAt: now.getTime() - 86400000, kcal: 200, status: 'fed' }),
      ev({ fedAt: now.getTime() - 2 * 86400000, kcal: 0, status: 'skipped' }),
    ];
    const sum = vetExportSummary(events, 30, now);
    expect(sum.days).toBe(30);
    expect(sum.totalEvents).toBe(2);
    expect(sum.missedCount).toBe(1);
    expect(sum.totalKcal).toBe(200);
  });
});
