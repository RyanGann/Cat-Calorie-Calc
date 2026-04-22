import type { ActivityLevel, LifeStage, Sex } from './types';

export type CalorieInput = {
  weightKg: number;
  birthDate?: string | null;
  sex: Sex;
  neutered: boolean;
  bodyCondition: number;
  activityLevel: ActivityLevel;
  now?: Date;
};

export type CalorieResult = {
  kcal: number;
  lifeStage: LifeStage;
  ageMonths: number | null;
  rer: number;
  factor: number;
  confidence: 'high' | 'medium' | 'low';
  rationale: string[];
};

export function ageInMonths(birthDate: string | null | undefined, now: Date = new Date()): number | null {
  if (!birthDate) return null;
  const dob = new Date(birthDate);
  if (Number.isNaN(dob.getTime())) return null;
  const ms = now.getTime() - dob.getTime();
  if (ms < 0) return 0;
  return Math.floor(ms / (1000 * 60 * 60 * 24 * 30.4375));
}

export function deriveLifeStage(ageMonths: number | null): LifeStage {
  if (ageMonths === null) return 'adult';
  if (ageMonths < 4) return 'kitten_young';
  if (ageMonths < 12) return 'kitten';
  if (ageMonths >= 132) return 'senior';
  return 'adult';
}

export function rer(weightKg: number): number {
  const kg = Math.max(0.1, weightKg);
  return 70 * Math.pow(kg, 0.75);
}

function baseFactor(stage: LifeStage, neutered: boolean): number {
  switch (stage) {
    case 'kitten_young':
      return 2.5;
    case 'kitten':
      return 2.0;
    case 'senior':
      return 1.1;
    case 'adult':
    default:
      return neutered ? 1.2 : 1.4;
  }
}

function activityAdjustment(stage: LifeStage, activity: ActivityLevel): number {
  if (stage === 'kitten_young' || stage === 'kitten') return 0;
  if (activity === 'low') return -0.1;
  if (activity === 'high') return 0.2;
  return 0;
}

function bcsAdjustment(bcs: number): { delta: number; note?: string } {
  if (bcs <= 3) return { delta: 0.2, note: 'Increased to support healthy weight gain.' };
  if (bcs >= 7) return { delta: -0.2, note: 'Reduced to support healthy weight loss.' };
  return { delta: 0 };
}

export function estimateDailyKcal(input: CalorieInput): CalorieResult {
  const ageMonths = ageInMonths(input.birthDate, input.now);
  const lifeStage = deriveLifeStage(ageMonths);
  const rerValue = rer(input.weightKg);

  const base = baseFactor(lifeStage, input.neutered);
  const activityDelta = activityAdjustment(lifeStage, input.activityLevel);
  const bcs = bcsAdjustment(input.bodyCondition);

  const factor = Math.max(0.6, base + activityDelta + bcs.delta);
  const kcal = Math.round(rerValue * factor);

  const rationale: string[] = [];
  rationale.push(`Resting energy (RER): 70 × ${input.weightKg.toFixed(1)}^0.75 ≈ ${rerValue.toFixed(0)} kcal`);
  rationale.push(
    `Life stage: ${lifeStage.replace('_', ' ')}${ageMonths !== null ? ` (${ageMonths} months)` : ''}`,
  );
  rationale.push(
    `Base multiplier: ${base.toFixed(2)}${
      lifeStage === 'adult' ? (input.neutered ? ' (neutered adult)' : ' (intact adult)') : ''
    }`,
  );
  if (activityDelta !== 0) {
    rationale.push(
      `Activity adjustment: ${activityDelta > 0 ? '+' : ''}${activityDelta.toFixed(2)} (${input.activityLevel})`,
    );
  }
  if (bcs.delta !== 0) {
    rationale.push(`Body condition adjustment: ${bcs.delta > 0 ? '+' : ''}${bcs.delta.toFixed(2)}${bcs.note ? ' — ' + bcs.note : ''}`);
  }
  rationale.push(`Daily energy (MER) = RER × ${factor.toFixed(2)} ≈ ${kcal} kcal`);

  const confidence =
    input.birthDate && input.bodyCondition >= 1 && input.bodyCondition <= 9
      ? 'high'
      : input.birthDate
      ? 'medium'
      : 'low';

  return {
    kcal,
    lifeStage,
    ageMonths,
    rer: rerValue,
    factor,
    confidence,
    rationale,
  };
}

export const VET_DISCLAIMER =
  'Whiskr is not a substitute for veterinary advice. Always consult your vet for your cat’s specific needs.';
