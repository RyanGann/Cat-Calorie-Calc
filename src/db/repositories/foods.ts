import { v4 as uuidv4 } from 'uuid';
import { getSqlite } from '../client';
import type { Food, FoodType } from '@/domain/types';

type Row = {
  id: string;
  source: string;
  brand: string;
  name: string;
  type: string;
  kcal_per_kg: number;
  kcal_per_can: number | null;
  can_size_g: number | null;
  protein_pct: number | null;
  fat_pct: number | null;
  moisture_pct: number | null;
  fiber_pct: number | null;
  ingredients: string | null;
  barcode: string | null;
  region: string | null;
  last_verified_at: number | null;
};

function rowToFood(r: Row): Food {
  return {
    id: r.id,
    source: r.source as 'curated' | 'custom',
    brand: r.brand,
    name: r.name,
    type: r.type as FoodType,
    kcalPerKg: r.kcal_per_kg,
    kcalPerCan: r.kcal_per_can,
    canSizeG: r.can_size_g,
    proteinPct: r.protein_pct,
    fatPct: r.fat_pct,
    moisturePct: r.moisture_pct,
    fiberPct: r.fiber_pct,
    ingredients: r.ingredients,
    barcode: r.barcode,
    region: r.region,
    lastVerifiedAt: r.last_verified_at,
  };
}

export async function listFoods(filter?: { type?: FoodType; query?: string }): Promise<Food[]> {
  const sqlite = getSqlite();
  const where: string[] = [];
  const params: (string | number)[] = [];
  if (filter?.type) {
    where.push('type = ?');
    params.push(filter.type);
  }
  if (filter?.query && filter.query.trim().length > 0) {
    where.push('(brand LIKE ? OR name LIKE ?)');
    const q = `%${filter.query.trim()}%`;
    params.push(q, q);
  }
  const sql = `SELECT * FROM foods ${where.length ? 'WHERE ' + where.join(' AND ') : ''} ORDER BY brand, name`;
  const rows = await sqlite.getAllAsync<Row>(sql, params);
  return rows.map(rowToFood);
}

export async function getFood(id: string): Promise<Food | null> {
  const sqlite = getSqlite();
  const row = await sqlite.getFirstAsync<Row>('SELECT * FROM foods WHERE id = ?', [id]);
  return row ? rowToFood(row) : null;
}

export async function getFoodsByIds(ids: string[]): Promise<Food[]> {
  if (ids.length === 0) return [];
  const sqlite = getSqlite();
  const placeholders = ids.map(() => '?').join(',');
  const rows = await sqlite.getAllAsync<Row>(
    `SELECT * FROM foods WHERE id IN (${placeholders})`,
    ids,
  );
  return rows.map(rowToFood);
}

export type FoodDraft = {
  brand: string;
  name: string;
  type: FoodType;
  kcalPerKg: number;
  kcalPerCan?: number | null;
  canSizeG?: number | null;
  proteinPct?: number | null;
  fatPct?: number | null;
  moisturePct?: number | null;
};

export async function insertCustomFood(draft: FoodDraft): Promise<Food> {
  const sqlite = getSqlite();
  const id = uuidv4();
  const now = Date.now();
  await sqlite.runAsync(
    `INSERT INTO foods (id, source, brand, name, type, kcal_per_kg, kcal_per_can, can_size_g, protein_pct, fat_pct, moisture_pct, fiber_pct, ingredients, barcode, region, last_verified_at, created_at, updated_at)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    [
      id,
      'custom',
      draft.brand,
      draft.name,
      draft.type,
      draft.kcalPerKg,
      draft.kcalPerCan ?? null,
      draft.canSizeG ?? null,
      draft.proteinPct ?? null,
      draft.fatPct ?? null,
      draft.moisturePct ?? null,
      null,
      null,
      null,
      null,
      null,
      now,
      now,
    ],
  );
  return {
    id,
    source: 'custom',
    brand: draft.brand,
    name: draft.name,
    type: draft.type,
    kcalPerKg: draft.kcalPerKg,
    kcalPerCan: draft.kcalPerCan ?? null,
    canSizeG: draft.canSizeG ?? null,
    proteinPct: draft.proteinPct ?? null,
    fatPct: draft.fatPct ?? null,
    moisturePct: draft.moisturePct ?? null,
    fiberPct: null,
    ingredients: null,
    barcode: null,
    region: null,
    lastVerifiedAt: null,
  };
}
