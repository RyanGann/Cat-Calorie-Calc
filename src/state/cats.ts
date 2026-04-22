import { create } from 'zustand';
import type { Cat } from '@/domain/types';
import { listCats } from '@/db/repositories/cats';

type CatsState = {
  cats: Cat[];
  activeCatId: string | null;
  loaded: boolean;
  hydrate: () => Promise<void>;
  setActiveCatId: (id: string | null) => void;
  upsertLocal: (cat: Cat) => void;
  removeLocal: (id: string) => void;
};

export const useCatsStore = create<CatsState>((set, get) => ({
  cats: [],
  activeCatId: null,
  loaded: false,

  async hydrate() {
    const cats = await listCats();
    set((prev) => ({
      cats,
      activeCatId: prev.activeCatId ?? cats[0]?.id ?? null,
      loaded: true,
    }));
  },

  setActiveCatId(id) {
    set({ activeCatId: id });
  },

  upsertLocal(cat) {
    set((prev) => {
      const idx = prev.cats.findIndex((c) => c.id === cat.id);
      const next = idx >= 0 ? [...prev.cats] : [...prev.cats, cat];
      if (idx >= 0) next[idx] = cat;
      return {
        cats: next,
        activeCatId: prev.activeCatId ?? cat.id,
      };
    });
  },

  removeLocal(id) {
    set((prev) => {
      const next = prev.cats.filter((c) => c.id !== id);
      return {
        cats: next,
        activeCatId: prev.activeCatId === id ? next[0]?.id ?? null : prev.activeCatId,
      };
    });
  },
}));
