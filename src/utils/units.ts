import { getLocales } from 'expo-localization';

export type UnitSystem = 'metric' | 'imperial';
export type UnitPref = 'auto' | UnitSystem;

const IMPERIAL_COUNTRIES = new Set(['US', 'LR', 'MM']);

export function resolveUnitSystem(pref: UnitPref): UnitSystem {
  if (pref !== 'auto') return pref;
  try {
    const locales = getLocales();
    const region = locales[0]?.regionCode ?? '';
    return IMPERIAL_COUNTRIES.has(region) ? 'imperial' : 'metric';
  } catch {
    return 'metric';
  }
}

export function kgToLbs(kg: number): number {
  return kg * 2.2046226218;
}

export function lbsToKg(lbs: number): number {
  return lbs / 2.2046226218;
}

export function gramsToOz(g: number): number {
  return g * 0.0352739619;
}

export function ozToGrams(oz: number): number {
  return oz * 28.3495231;
}

export function formatWeight(kg: number, system: UnitSystem, opts: { digits?: number } = {}): string {
  const digits = opts.digits ?? 1;
  if (system === 'imperial') {
    return `${kgToLbs(kg).toFixed(digits)} lb`;
  }
  return `${kg.toFixed(digits)} kg`;
}

export function formatPortion(grams: number, system: UnitSystem): string {
  if (system === 'imperial') {
    const oz = gramsToOz(grams);
    if (oz < 1) return `${Math.round(oz * 16) / 16} oz`;
    return `${oz.toFixed(1)} oz`;
  }
  return `${Math.round(grams)} g`;
}

export function weightUnitLabel(system: UnitSystem): string {
  return system === 'imperial' ? 'lb' : 'kg';
}

export function portionUnitLabel(system: UnitSystem): string {
  return system === 'imperial' ? 'oz' : 'g';
}
