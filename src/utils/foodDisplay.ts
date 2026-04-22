import type { Food } from '@/domain/types';

// ~110 g per US cup is the standard cat food rule-of-thumb.
const GRAMS_PER_CUP = 110;

export function summarizeFoodEnergy(food: Pick<Food, 'type' | 'kcalPerKg' | 'kcalPerCan' | 'canSizeG'>): string {
  if (food.type === 'wet' && food.kcalPerCan && food.canSizeG) {
    const sizeOz = (food.canSizeG * 0.0352739619).toFixed(1);
    return `${Math.round(food.kcalPerCan)} kcal per ${sizeOz} oz can`;
  }
  if (food.type === 'dry') {
    const kcalPerCup = (food.kcalPerKg / 1000) * GRAMS_PER_CUP;
    return `${Math.round(kcalPerCup)} kcal per cup`;
  }
  if (food.type === 'treat' && food.kcalPerCan) {
    return `${Math.round(food.kcalPerCan)} kcal per piece`;
  }
  // Fallback: kcal per oz for dry/unknown
  const kcalPerOz = (food.kcalPerKg / 1000) * 28.3495231;
  return `${Math.round(kcalPerOz)} kcal per oz`;
}
