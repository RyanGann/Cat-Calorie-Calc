import { getSqlite } from '../client';

export type AppSettingsRow = {
  unitPref: 'auto' | 'metric' | 'imperial';
  theme: 'system' | 'light' | 'dark' | 'seasonal';
  remindersOn: boolean;
  hasOnboarded: boolean;
  proUnlocked: boolean;
  locale: string | null;
  schemaVersion: number;
};

type Row = {
  unit_pref: string;
  theme: string;
  reminders_on: number;
  has_onboarded: number;
  pro_unlocked: number;
  locale: string | null;
  schema_version: number;
};

export async function getSettings(): Promise<AppSettingsRow> {
  const sqlite = getSqlite();
  const row = await sqlite.getFirstAsync<Row>('SELECT * FROM app_settings WHERE id = 1');
  return {
    unitPref: (row?.unit_pref as AppSettingsRow['unitPref']) ?? 'auto',
    theme: (row?.theme as AppSettingsRow['theme']) ?? 'system',
    remindersOn: !!(row?.reminders_on ?? 1),
    hasOnboarded: !!(row?.has_onboarded ?? 0),
    proUnlocked: !!(row?.pro_unlocked ?? 0),
    locale: row?.locale ?? null,
    schemaVersion: row?.schema_version ?? 1,
  };
}

export async function updateSettings(patch: Partial<AppSettingsRow>): Promise<void> {
  const sqlite = getSqlite();
  const fields: string[] = [];
  const vals: (string | number | null)[] = [];
  const map: Record<string, [string, 'bool' | 'raw']> = {
    unitPref: ['unit_pref', 'raw'],
    theme: ['theme', 'raw'],
    remindersOn: ['reminders_on', 'bool'],
    hasOnboarded: ['has_onboarded', 'bool'],
    proUnlocked: ['pro_unlocked', 'bool'],
    locale: ['locale', 'raw'],
    schemaVersion: ['schema_version', 'raw'],
  };
  for (const [k, [col, kind]] of Object.entries(map)) {
    if (k in patch) {
      fields.push(`${col} = ?`);
      const v = (patch as Record<string, unknown>)[k];
      if (kind === 'bool') vals.push(v ? 1 : 0);
      else vals.push(v == null ? null : (v as string | number));
    }
  }
  if (fields.length === 0) return;
  await sqlite.runAsync(`UPDATE app_settings SET ${fields.join(', ')} WHERE id = 1`, vals);
}
