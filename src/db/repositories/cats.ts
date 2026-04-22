import { v4 as uuidv4 } from 'uuid';
import { getSqlite } from '../client';
import type { Cat, ActivityLevel, LifeStage, Sex } from '@/domain/types';

type Row = {
  id: string;
  name: string;
  photo_uri: string | null;
  sex: string;
  neutered: number;
  birth_date: string | null;
  weight_kg: number;
  body_condition: number;
  activity_level: string;
  life_stage: string;
  meal_goal_kcal: number;
  created_at: number;
  updated_at: number;
  deleted_at: number | null;
};

function rowToCat(r: Row): Cat {
  return {
    id: r.id,
    name: r.name,
    photoUri: r.photo_uri,
    sex: r.sex as Sex,
    neutered: !!r.neutered,
    birthDate: r.birth_date,
    weightKg: r.weight_kg,
    bodyCondition: r.body_condition,
    activityLevel: r.activity_level as ActivityLevel,
    lifeStage: r.life_stage as LifeStage,
    mealGoalKcal: r.meal_goal_kcal,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

export async function listCats(): Promise<Cat[]> {
  const sqlite = getSqlite();
  const rows = await sqlite.getAllAsync<Row>(
    'SELECT * FROM cats WHERE deleted_at IS NULL ORDER BY created_at ASC',
  );
  return rows.map(rowToCat);
}

export async function getCat(id: string): Promise<Cat | null> {
  const sqlite = getSqlite();
  const row = await sqlite.getFirstAsync<Row>('SELECT * FROM cats WHERE id = ?', [id]);
  return row ? rowToCat(row) : null;
}

export type CatDraft = {
  name: string;
  photoUri?: string | null;
  sex: Sex;
  neutered: boolean;
  birthDate?: string | null;
  weightKg: number;
  bodyCondition: number;
  activityLevel: ActivityLevel;
  lifeStage: LifeStage;
  mealGoalKcal: number;
};

export async function insertCat(draft: CatDraft): Promise<Cat> {
  const sqlite = getSqlite();
  const id = uuidv4();
  const now = Date.now();
  await sqlite.runAsync(
    `INSERT INTO cats (id, name, photo_uri, sex, neutered, birth_date, weight_kg, body_condition, activity_level, life_stage, meal_goal_kcal, created_at, updated_at)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    [
      id,
      draft.name,
      draft.photoUri ?? null,
      draft.sex,
      draft.neutered ? 1 : 0,
      draft.birthDate ?? null,
      draft.weightKg,
      draft.bodyCondition,
      draft.activityLevel,
      draft.lifeStage,
      draft.mealGoalKcal,
      now,
      now,
    ],
  );
  return {
    id,
    ...draft,
    photoUri: draft.photoUri ?? null,
    birthDate: draft.birthDate ?? null,
    createdAt: now,
    updatedAt: now,
  };
}

export async function updateCat(id: string, patch: Partial<CatDraft>): Promise<void> {
  const sqlite = getSqlite();
  const fields: string[] = [];
  const vals: (string | number | null)[] = [];
  const map: Record<string, string> = {
    name: 'name',
    photoUri: 'photo_uri',
    sex: 'sex',
    birthDate: 'birth_date',
    weightKg: 'weight_kg',
    bodyCondition: 'body_condition',
    activityLevel: 'activity_level',
    lifeStage: 'life_stage',
    mealGoalKcal: 'meal_goal_kcal',
  };
  for (const [k, col] of Object.entries(map)) {
    if (k in patch) {
      fields.push(`${col} = ?`);
      const v = (patch as Record<string, unknown>)[k];
      vals.push(v == null ? null : (v as string | number));
    }
  }
  if ('neutered' in patch) {
    fields.push('neutered = ?');
    vals.push(patch.neutered ? 1 : 0);
  }
  if (fields.length === 0) return;
  fields.push('updated_at = ?');
  vals.push(Date.now());
  vals.push(id);
  await sqlite.runAsync(`UPDATE cats SET ${fields.join(', ')} WHERE id = ?`, vals);
}

export async function softDeleteCat(id: string): Promise<void> {
  const sqlite = getSqlite();
  await sqlite.runAsync('UPDATE cats SET deleted_at = ? WHERE id = ?', [Date.now(), id]);
}
