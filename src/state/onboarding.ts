import { create } from 'zustand';
import type { ActivityLevel, Sex } from '@/domain/types';

export type OnboardingDraft = {
  name: string;
  photoUri: string | null;
  birthDate: string | null;
  ageUnknown: boolean;
  weightKg: number | null;
  sex: Sex;
  neutered: boolean;
  bodyCondition: number;
  activityLevel: ActivityLevel;
};

type OnboardingState = {
  draft: OnboardingDraft;
  update: (patch: Partial<OnboardingDraft>) => void;
  reset: () => void;
};

const defaultDraft: OnboardingDraft = {
  name: '',
  photoUri: null,
  birthDate: null,
  ageUnknown: false,
  weightKg: null,
  sex: 'unknown',
  neutered: true,
  bodyCondition: 5,
  activityLevel: 'moderate',
};

export const useOnboardingStore = create<OnboardingState>((set) => ({
  draft: defaultDraft,
  update(patch) {
    set((prev) => ({ draft: { ...prev.draft, ...patch } }));
  },
  reset() {
    set({ draft: defaultDraft });
  },
}));
