import * as SQLite from 'expo-sqlite';
import { drizzle } from 'drizzle-orm/expo-sqlite';
import * as schema from './schema';

const DB_NAME = 'whiskr.db';

let _db: ReturnType<typeof drizzle<typeof schema>> | null = null;
let _sqlite: SQLite.SQLiteDatabase | null = null;

export function getSqlite(): SQLite.SQLiteDatabase {
  if (!_sqlite) {
    _sqlite = SQLite.openDatabaseSync(DB_NAME);
  }
  return _sqlite;
}

export function getDb() {
  if (!_db) {
    _db = drizzle(getSqlite(), { schema });
  }
  return _db;
}

const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS cats (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  photo_uri TEXT,
  sex TEXT NOT NULL DEFAULT 'unknown',
  neutered INTEGER NOT NULL DEFAULT 0,
  birth_date TEXT,
  weight_kg REAL NOT NULL,
  body_condition INTEGER NOT NULL DEFAULT 5,
  activity_level TEXT NOT NULL DEFAULT 'moderate',
  life_stage TEXT NOT NULL DEFAULT 'adult',
  meal_goal_kcal REAL NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  deleted_at INTEGER
);

CREATE TABLE IF NOT EXISTS foods (
  id TEXT PRIMARY KEY,
  source TEXT NOT NULL DEFAULT 'curated',
  brand TEXT NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  kcal_per_kg REAL NOT NULL,
  kcal_per_can REAL,
  can_size_g REAL,
  protein_pct REAL,
  fat_pct REAL,
  moisture_pct REAL,
  fiber_pct REAL,
  ingredients TEXT,
  barcode TEXT,
  region TEXT,
  last_verified_at INTEGER,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS foods_brand_name_idx ON foods(brand, name);

CREATE TABLE IF NOT EXISTS feeding_plans (
  id TEXT PRIMARY KEY,
  cat_id TEXT NOT NULL,
  is_active INTEGER NOT NULL DEFAULT 1,
  mode TEXT NOT NULL DEFAULT 'scheduled',
  meals_per_day INTEGER,
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS plans_cat_active_idx ON feeding_plans(cat_id, is_active);

CREATE TABLE IF NOT EXISTS feeding_plan_foods (
  id TEXT PRIMARY KEY,
  plan_id TEXT NOT NULL,
  food_id TEXT NOT NULL,
  kcal_share_pct REAL NOT NULL DEFAULT 100
);

CREATE TABLE IF NOT EXISTS scheduled_meals (
  id TEXT PRIMARY KEY,
  plan_id TEXT NOT NULL,
  time_of_day_min INTEGER NOT NULL,
  kcal_target REAL NOT NULL,
  notification_id TEXT,
  food_id TEXT
);
CREATE INDEX IF NOT EXISTS scheduled_plan_idx ON scheduled_meals(plan_id);

CREATE TABLE IF NOT EXISTS feeding_events (
  id TEXT PRIMARY KEY,
  cat_id TEXT NOT NULL,
  scheduled_meal_id TEXT,
  food_id TEXT NOT NULL,
  amount_g REAL NOT NULL,
  kcal REAL NOT NULL,
  fed_at INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'fed',
  note TEXT,
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS events_cat_fed_idx ON feeding_events(cat_id, fed_at);

CREATE TABLE IF NOT EXISTS weight_history (
  id TEXT PRIMARY KEY,
  cat_id TEXT NOT NULL,
  weight_kg REAL NOT NULL,
  measured_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS app_settings (
  id INTEGER PRIMARY KEY,
  unit_pref TEXT NOT NULL DEFAULT 'auto',
  theme TEXT NOT NULL DEFAULT 'system',
  reminders_on INTEGER NOT NULL DEFAULT 1,
  has_onboarded INTEGER NOT NULL DEFAULT 0,
  pro_unlocked INTEGER NOT NULL DEFAULT 0,
  locale TEXT,
  schema_version INTEGER NOT NULL DEFAULT 1
);
`;

export async function initDb(): Promise<void> {
  const sqlite = getSqlite();
  await sqlite.execAsync('PRAGMA journal_mode = WAL;');
  await sqlite.execAsync('PRAGMA foreign_keys = ON;');
  await sqlite.execAsync(SCHEMA_SQL);

  // Migration: add scheduled_meals.food_id for existing installs.
  const cols = await sqlite.getAllAsync<{ name: string }>(
    "PRAGMA table_info(scheduled_meals)",
  );
  if (!cols.some((c) => c.name === 'food_id')) {
    await sqlite.execAsync('ALTER TABLE scheduled_meals ADD COLUMN food_id TEXT');
  }

  const existing = await sqlite.getFirstAsync<{ id: number }>(
    'SELECT id FROM app_settings WHERE id = 1',
  );
  if (!existing) {
    await sqlite.runAsync(
      'INSERT INTO app_settings (id, unit_pref, theme, reminders_on, has_onboarded, pro_unlocked, schema_version) VALUES (1, ?, ?, 1, 0, 0, 1)',
      ['auto', 'system'],
    );
  }
}
