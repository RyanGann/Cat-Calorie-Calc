import { v4 as uuidv4 } from 'uuid';
import { getSqlite } from '../client';
import type { FeedingEvent, EventStatus } from '@/domain/types';

type Row = {
  id: string;
  cat_id: string;
  scheduled_meal_id: string | null;
  food_id: string;
  amount_g: number;
  kcal: number;
  fed_at: number;
  status: string;
  note: string | null;
  created_at: number;
};

function rowToEvent(r: Row): FeedingEvent {
  return {
    id: r.id,
    catId: r.cat_id,
    scheduledMealId: r.scheduled_meal_id,
    foodId: r.food_id,
    amountG: r.amount_g,
    kcal: r.kcal,
    fedAt: r.fed_at,
    status: r.status as EventStatus,
    note: r.note,
  };
}

export type EventDraft = {
  catId: string;
  scheduledMealId?: string | null;
  foodId: string;
  amountG: number;
  kcal: number;
  fedAt?: number;
  status?: EventStatus;
  note?: string | null;
};

export async function logEvent(draft: EventDraft): Promise<FeedingEvent> {
  const sqlite = getSqlite();
  const id = uuidv4();
  const now = Date.now();
  const fedAt = draft.fedAt ?? now;
  const status = draft.status ?? 'fed';
  await sqlite.runAsync(
    `INSERT INTO feeding_events (id, cat_id, scheduled_meal_id, food_id, amount_g, kcal, fed_at, status, note, created_at)
     VALUES (?,?,?,?,?,?,?,?,?,?)`,
    [
      id,
      draft.catId,
      draft.scheduledMealId ?? null,
      draft.foodId,
      draft.amountG,
      draft.kcal,
      fedAt,
      status,
      draft.note ?? null,
      now,
    ],
  );
  return {
    id,
    catId: draft.catId,
    scheduledMealId: draft.scheduledMealId ?? null,
    foodId: draft.foodId,
    amountG: draft.amountG,
    kcal: draft.kcal,
    fedAt,
    status,
    note: draft.note ?? null,
  };
}

export async function eventsSince(catId: string, sinceEpochMs: number): Promise<FeedingEvent[]> {
  const sqlite = getSqlite();
  const rows = await sqlite.getAllAsync<Row>(
    'SELECT * FROM feeding_events WHERE cat_id = ? AND fed_at >= ? ORDER BY fed_at DESC',
    [catId, sinceEpochMs],
  );
  return rows.map(rowToEvent);
}

export async function recentEvents(catId: string, limit = 50): Promise<FeedingEvent[]> {
  const sqlite = getSqlite();
  const rows = await sqlite.getAllAsync<Row>(
    'SELECT * FROM feeding_events WHERE cat_id = ? ORDER BY fed_at DESC LIMIT ?',
    [catId, limit],
  );
  return rows.map(rowToEvent);
}

export async function deleteEvent(id: string): Promise<void> {
  const sqlite = getSqlite();
  await sqlite.runAsync('DELETE FROM feeding_events WHERE id = ?', [id]);
}
