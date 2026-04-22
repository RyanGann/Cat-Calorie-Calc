import type { FeedingEvent, ScheduledMeal } from './types';

export function startOfLocalDay(now: Date = new Date()): number {
  const d = new Date(now);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

export function startOfDayUtcFromLocal(daysAgo: number, now: Date = new Date()): number {
  const d = new Date(now);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - daysAgo);
  return d.getTime();
}

export function kcalFedToday(events: FeedingEvent[], now: Date = new Date()): number {
  const todayStart = startOfLocalDay(now);
  return events
    .filter((e) => e.fedAt >= todayStart && e.status !== 'skipped')
    .reduce((sum, e) => sum + e.kcal, 0);
}

export function eventsOnDay(events: FeedingEvent[], daysAgo: number, now: Date = new Date()): FeedingEvent[] {
  const start = startOfDayUtcFromLocal(daysAgo, now);
  const end = startOfDayUtcFromLocal(daysAgo - 1, now);
  return events.filter((e) => e.fedAt >= start && e.fedAt < end);
}

export function adherence7d(
  events: FeedingEvent[],
  scheduledMeals: ScheduledMeal[],
  now: Date = new Date(),
): number {
  const scheduledCount = scheduledMeals.length * 7;
  if (scheduledCount === 0) return 0;
  const weekStart = startOfDayUtcFromLocal(6, now);
  const fedCount = events.filter((e) => e.fedAt >= weekStart && e.status === 'fed').length;
  return Math.min(1, fedCount / scheduledCount);
}

export function averageDailyKcal(events: FeedingEvent[], days: number, now: Date = new Date()): number {
  if (days <= 0) return 0;
  const start = startOfDayUtcFromLocal(days - 1, now);
  const total = events
    .filter((e) => e.fedAt >= start && e.status !== 'skipped')
    .reduce((sum, e) => sum + e.kcal, 0);
  return total / days;
}

export function groupByDay(
  events: FeedingEvent[],
  days: number,
  now: Date = new Date(),
): Array<{ dayStart: number; events: FeedingEvent[]; kcal: number }> {
  const groups: Array<{ dayStart: number; events: FeedingEvent[]; kcal: number }> = [];
  for (let i = 0; i < days; i++) {
    const dayStart = startOfDayUtcFromLocal(i, now);
    const dayEnd = startOfDayUtcFromLocal(i - 1, now);
    const dayEvents = events.filter((e) => e.fedAt >= dayStart && e.fedAt < dayEnd);
    const kcal = dayEvents.filter((e) => e.status !== 'skipped').reduce((s, e) => s + e.kcal, 0);
    groups.push({ dayStart, events: dayEvents, kcal });
  }
  return groups;
}

export type VetExportSummary = {
  generatedAt: number;
  days: number;
  totalEvents: number;
  totalKcal: number;
  averageDailyKcal: number;
  missedCount: number;
  events: FeedingEvent[];
};

export function vetExportSummary(events: FeedingEvent[], days = 30, now: Date = new Date()): VetExportSummary {
  const start = startOfDayUtcFromLocal(days - 1, now);
  const filtered = events.filter((e) => e.fedAt >= start);
  const fed = filtered.filter((e) => e.status !== 'skipped');
  const missed = filtered.filter((e) => e.status === 'skipped').length;
  const totalKcal = fed.reduce((s, e) => s + e.kcal, 0);
  return {
    generatedAt: now.getTime(),
    days,
    totalEvents: filtered.length,
    totalKcal,
    averageDailyKcal: totalKcal / days,
    missedCount: missed,
    events: filtered.sort((a, b) => a.fedAt - b.fedAt),
  };
}
