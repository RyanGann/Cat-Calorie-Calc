export type Sex = 'male' | 'female' | 'unknown';
export type ActivityLevel = 'low' | 'moderate' | 'high';
export type LifeStage = 'kitten_young' | 'kitten' | 'adult' | 'senior';
export type FoodType = 'wet' | 'dry' | 'treat';
export type PlanMode = 'scheduled' | 'grazer';
export type EventStatus = 'fed' | 'skipped' | 'partial';

export type Cat = {
  id: string;
  name: string;
  photoUri?: string | null;
  sex: Sex;
  neutered: boolean;
  birthDate?: string | null;
  weightKg: number;
  bodyCondition: number;
  activityLevel: ActivityLevel;
  lifeStage: LifeStage;
  mealGoalKcal: number;
  createdAt: number;
  updatedAt: number;
};

export type Food = {
  id: string;
  source: 'curated' | 'custom';
  brand: string;
  name: string;
  type: FoodType;
  kcalPerKg: number;
  kcalPerCan?: number | null;
  canSizeG?: number | null;
  proteinPct?: number | null;
  fatPct?: number | null;
  moisturePct?: number | null;
  fiberPct?: number | null;
  ingredients?: string | null;
  barcode?: string | null;
  region?: string | null;
  lastVerifiedAt?: number | null;
};

export type FeedingPlan = {
  id: string;
  catId: string;
  isActive: boolean;
  mode: PlanMode;
  mealsPerDay: number | null;
  foods: Array<{ foodId: string; kcalSharePct: number }>;
  scheduledMeals: ScheduledMeal[];
};

export type ScheduledMeal = {
  id: string;
  planId: string;
  timeOfDayMin: number;
  kcalTarget: number;
  foodId?: string | null;
  notificationId?: string | null;
};

export type FeedingEvent = {
  id: string;
  catId: string;
  scheduledMealId?: string | null;
  foodId: string;
  amountG: number;
  kcal: number;
  fedAt: number;
  status: EventStatus;
  note?: string | null;
};
