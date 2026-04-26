import type { Cat, FeedingPlan, Food, PlanMode, ScheduledMeal } from '@/domain/types';
import { buildScheduledMealDrafts } from '@/domain/feedingPlan';
import { visualPortion } from '@/domain/portions';
import { formatPortion, type UnitSystem } from '@/utils/units';
import { getFoodsByIds } from '@/db/repositories/foods';
import {
  getActivePlan,
  replaceActivePlan,
  updateScheduledMealNotificationId,
} from '@/db/repositories/plans';
import {
  cancelNotification,
  ensurePermissions,
  rescheduleMealsForPlan,
} from '@/services/notifications';

export type FeedingPlanSelection = {
  cat: Pick<Cat, 'id' | 'name' | 'mealGoalKcal'>;
  foodIds: string[];
  mode: PlanMode;
  mealsPerDay: 2 | 3 | 4;
  mealEntries?: Array<{ timeOfDayMin: number; foodId: string | null }>;
  remindersOn: boolean;
  unitSystem: UnitSystem;
};

export async function saveFeedingPlanFromSelection({
  cat,
  foodIds,
  mode,
  mealsPerDay,
  mealEntries,
  remindersOn,
  unitSystem,
}: FeedingPlanSelection): Promise<FeedingPlan> {
  const dedupedFoodIds = Array.from(new Set(foodIds)).filter(Boolean);
  if (dedupedFoodIds.length === 0) {
    throw new Error('At least one food is required to save a feeding plan.');
  }

  const priorPlan = await getActivePlan(cat.id);
  const oldNotificationIds = priorPlan?.scheduledMeals
    .map((meal) => meal.notificationId)
    .filter((id): id is string => !!id) ?? [];

  const generatedMeals = buildScheduledMealDrafts({
    dailyKcal: cat.mealGoalKcal,
    mode,
    mealsPerDay,
    foodIds: dedupedFoodIds,
  });
  const scheduledMeals = mealEntries?.length
    ? mealEntries.map((meal) => ({
        timeOfDayMin: meal.timeOfDayMin,
        kcalTarget: cat.mealGoalKcal / mealEntries.length,
        foodId: meal.foodId ?? dedupedFoodIds[0] ?? null,
      }))
    : generatedMeals;

  const plan = await replaceActivePlan({
    catId: cat.id,
    mode,
    mealsPerDay: mode === 'grazer' ? null : mealsPerDay,
    foods: dedupedFoodIds.map((foodId) => ({
      foodId,
      kcalSharePct: 100 / dedupedFoodIds.length,
    })),
    scheduledMeals,
  });

  await Promise.all(oldNotificationIds.map((id) => cancelNotification(id)));

  if (remindersOn) {
    const granted = await ensurePermissions();
    if (granted) {
      await scheduleNotificationsForPlan({
        plan,
        cat,
        foodIds: dedupedFoodIds,
        unitSystem,
      });
    }
  }

  return plan;
}

async function scheduleNotificationsForPlan({
  plan,
  cat,
  foodIds,
  unitSystem,
}: {
  plan: FeedingPlan;
  cat: Pick<Cat, 'id' | 'name'>;
  foodIds: string[];
  unitSystem: UnitSystem;
}) {
  const foods = await getFoodsByIds(foodIds);
  const foodsById = new Map<string, Food>(foods.map((food) => [food.id, food]));
  const mealsById = new Map<string, ScheduledMeal>(plan.scheduledMeals.map((meal) => [meal.id, meal]));

  const results = await rescheduleMealsForPlan(plan.scheduledMeals, {
    catName: cat.name,
    catId: cat.id,
    foodNameForMeal(mealId) {
      const meal = mealsById.get(mealId);
      const food = meal?.foodId ? foodsById.get(meal.foodId) : null;
      return food ? `${food.brand} ${food.name}` : 'food';
    },
    portionForMeal(mealId) {
      const meal = mealsById.get(mealId);
      const food = meal?.foodId ? foodsById.get(meal.foodId) : null;
      if (!meal || !food) return '';
      const portion = visualPortion(food, meal.kcalTarget);
      return food.type === 'wet' && food.kcalPerCan
        ? portion.primaryLabel
        : formatPortion(portion.grams, unitSystem);
    },
  });

  for (const result of results) {
    await updateScheduledMealNotificationId(result.mealId, result.notificationId);
  }
}
