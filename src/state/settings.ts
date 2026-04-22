import { create } from 'zustand';
import type { AppSettingsRow } from '@/db/repositories/settings';
import { getSettings, updateSettings } from '@/db/repositories/settings';

type SettingsState = AppSettingsRow & {
  loaded: boolean;
  hydrate: () => Promise<void>;
  set: (patch: Partial<AppSettingsRow>) => Promise<void>;
};

export const useSettingsStore = create<SettingsState>((set, get) => ({
  unitPref: 'auto',
  theme: 'system',
  remindersOn: true,
  hasOnboarded: false,
  proUnlocked: false,
  locale: null,
  schemaVersion: 1,
  loaded: false,

  async hydrate() {
    const s = await getSettings();
    set({ ...s, loaded: true });
  },

  async set(patch) {
    set((prev) => ({ ...prev, ...patch }));
    await updateSettings(patch);
  },
}));
