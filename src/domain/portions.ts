import type { Food } from './types';

export function kcalToGrams(kcal: number, food: Pick<Food, 'kcalPerKg'>): number {
  if (food.kcalPerKg <= 0) return 0;
  return kcal / (food.kcalPerKg / 1000);
}

export function kcalToCans(kcal: number, food: Pick<Food, 'kcalPerCan'>): number | null {
  if (!food.kcalPerCan || food.kcalPerCan <= 0) return null;
  return kcal / food.kcalPerCan;
}

export function roundGrams(g: number): number {
  return Math.max(0, Math.round(g));
}

export function roundCans(c: number): number {
  return Math.round(c * 4) / 4;
}

export function roundCups(c: number): number {
  return Math.round(c * 8) / 8;
}

export type VisualPortion = {
  grams: number;
  primaryLabel: string;
  secondaryLabel?: string;
};

export function visualPortion(food: Pick<Food, 'type' | 'kcalPerKg' | 'kcalPerCan' | 'canSizeG'>, kcal: number): VisualPortion {
  const grams = roundGrams(kcalToGrams(kcal, food));

  if (food.type === 'wet' && food.kcalPerCan && food.canSizeG) {
    const cans = kcalToCans(kcal, food);
    if (cans !== null) {
      const rounded = roundCans(cans);
      return {
        grams,
        primaryLabel: formatCans(rounded),
        secondaryLabel: `≈ ${grams} g`,
      };
    }
  }

  if (food.type === 'dry') {
    const gramsPerCup = 110;
    const cups = grams / gramsPerCup;
    if (cups >= 0.125) {
      return {
        grams,
        primaryLabel: `${grams} g`,
        secondaryLabel: `≈ ${formatCups(roundCups(cups))}`,
      };
    }
  }

  return { grams, primaryLabel: `${grams} g` };
}

export function formatCans(cans: number): string {
  if (cans === 0) return '0 cans';
  const whole = Math.floor(cans);
  const frac = cans - whole;
  const fracLabel = frac === 0.25 ? '¼' : frac === 0.5 ? '½' : frac === 0.75 ? '¾' : '';
  if (whole === 0 && fracLabel) return `${fracLabel} can`;
  if (fracLabel) return `${whole}${fracLabel} cans`;
  return whole === 1 ? '1 can' : `${whole} cans`;
}

export function formatCups(cups: number): string {
  if (cups === 0) return '0';
  const whole = Math.floor(cups);
  const frac = cups - whole;
  const fracLabel =
    frac === 0.125 ? '⅛' : frac === 0.25 ? '¼' : frac === 0.375 ? '⅜' : frac === 0.5 ? '½' : frac === 0.625 ? '⅝' : frac === 0.75 ? '¾' : frac === 0.875 ? '⅞' : '';
  if (whole === 0 && fracLabel) return `${fracLabel} cup`;
  if (fracLabel) return `${whole}${fracLabel} cups`;
  return whole === 1 ? '1 cup' : `${whole} cups`;
}
