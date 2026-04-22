import { getSqlite } from './client';
import seedFoods from './seeds/foods.json';

const SEED_VERSION = 1;

export async function seedFoodsIfNeeded(): Promise<void> {
  const sqlite = getSqlite();
  const settings = await sqlite.getFirstAsync<{ schema_version: number }>(
    'SELECT schema_version FROM app_settings WHERE id = 1',
  );
  const existing = await sqlite.getFirstAsync<{ count: number }>(
    "SELECT COUNT(*) as count FROM foods WHERE source = 'curated'",
  );
  if (existing && existing.count > 0 && (settings?.schema_version ?? 0) >= SEED_VERSION) {
    return;
  }

  const now = Date.now();
  await sqlite.withTransactionAsync(async () => {
    for (const f of seedFoods as Array<Record<string, unknown>>) {
      await sqlite.runAsync(
        `INSERT OR REPLACE INTO foods (id, source, brand, name, type, kcal_per_kg, kcal_per_can, can_size_g, protein_pct, fat_pct, moisture_pct, fiber_pct, ingredients, barcode, region, last_verified_at, created_at, updated_at)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [
          f.id as string,
          'curated',
          f.brand as string,
          f.name as string,
          f.type as string,
          f.kcalPerKg as number,
          (f.kcalPerCan as number | undefined) ?? null,
          (f.canSizeG as number | undefined) ?? null,
          (f.proteinPct as number | undefined) ?? null,
          (f.fatPct as number | undefined) ?? null,
          (f.moisturePct as number | undefined) ?? null,
          (f.fiberPct as number | undefined) ?? null,
          (f.ingredients as string | undefined) ?? null,
          (f.barcode as string | undefined) ?? null,
          (f.region as string | undefined) ?? null,
          now,
          now,
          now,
        ],
      );
    }
    await sqlite.runAsync(
      'UPDATE app_settings SET schema_version = ? WHERE id = 1',
      [SEED_VERSION],
    );
  });
}
