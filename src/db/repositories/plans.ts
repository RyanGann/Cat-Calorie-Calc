import { v4 as uuidv4 } from 'uuid';
import { getSqlite } from '../client';
import type { FeedingPlan, PlanMode, ScheduledMeal } from '@/domain/types';

export type PlanDraft = {
  catId: string;
  mode: PlanMode;
  mealsPerDay: number | null;
  foods: Array<{ foodId: string; kcalSharePct: number }>;
  scheduledMeals: Array<{
    timeOfDayMin: number;
    kcalTarget: number;
    foodId?: string | null;
    notificationId?: string | null;
  }>;
};

export async function getActivePlan(catId: string): Promise<FeedingPlan | null> {
  const sqlite = getSqlite();
  const plan = await sqlite.getFirstAsync<{
    id: string;
    cat_id: string;
    is_active: number;
    mode: string;
    meals_per_day: number | null;
  }>('SELECT * FROM feeding_plans WHERE cat_id = ? AND is_active = 1 LIMIT 1', [catId]);
  if (!plan) return null;
  const foods = await sqlite.getAllAsync<{ food_id: string; kcal_share_pct: number }>(
    'SELECT * FROM feeding_plan_foods WHERE plan_id = ?',
    [plan.id],
  );
  const meals = await sqlite.getAllAsync<{
    id: string;
    plan_id: string;
    time_of_day_min: number;
    kcal_target: number;
    notification_id: string | null;
    food_id: string | null;
  }>('SELECT * FROM scheduled_meals WHERE plan_id = ? ORDER BY time_of_day_min ASC', [plan.id]);
  return {
    id: plan.id,
    catId: plan.cat_id,
    isActive: !!plan.is_active,
    mode: plan.mode as PlanMode,
    mealsPerDay: plan.meals_per_day,
    foods: foods.map((f) => ({ foodId: f.food_id, kcalSharePct: f.kcal_share_pct })),
    scheduledMeals: meals.map<ScheduledMeal>((m) => ({
      id: m.id,
      planId: m.plan_id,
      timeOfDayMin: m.time_of_day_min,
      kcalTarget: m.kcal_target,
      foodId: m.food_id,
      notificationId: m.notification_id,
    })),
  };
}

export async function replaceActivePlan(draft: PlanDraft): Promise<FeedingPlan> {
  const sqlite = getSqlite();
  const planId = uuidv4();
  const now = Date.now();
  const scheduledMeals: ScheduledMeal[] = [];

  await sqlite.withTransactionAsync(async () => {
    const priorPlans = await sqlite.getAllAsync<{ id: string }>(
      'SELECT id FROM feeding_plans WHERE cat_id = ? AND is_active = 1',
      [draft.catId],
    );
    for (const p of priorPlans) {
      await sqlite.runAsync('UPDATE feeding_plans SET is_active = 0 WHERE id = ?', [p.id]);
      await sqlite.runAsync('DELETE FROM feeding_plan_foods WHERE plan_id = ?', [p.id]);
      await sqlite.runAsync('DELETE FROM scheduled_meals WHERE plan_id = ?', [p.id]);
    }

    await sqlite.runAsync(
      'INSERT INTO feeding_plans (id, cat_id, is_active, mode, meals_per_day, created_at) VALUES (?,?,1,?,?,?)',
      [planId, draft.catId, draft.mode, draft.mealsPerDay, now],
    );

    for (const f of draft.foods) {
      await sqlite.runAsync(
        'INSERT INTO feeding_plan_foods (id, plan_id, food_id, kcal_share_pct) VALUES (?,?,?,?)',
        [uuidv4(), planId, f.foodId, f.kcalSharePct],
      );
    }

    for (const m of draft.scheduledMeals) {
      const mealId = uuidv4();
      await sqlite.runAsync(
        'INSERT INTO scheduled_meals (id, plan_id, time_of_day_min, kcal_target, notification_id, food_id) VALUES (?,?,?,?,?,?)',
        [mealId, planId, m.timeOfDayMin, m.kcalTarget, m.notificationId ?? null, m.foodId ?? null],
      );
      scheduledMeals.push({
        id: mealId,
        planId,
        timeOfDayMin: m.timeOfDayMin,
        kcalTarget: m.kcalTarget,
        foodId: m.foodId ?? null,
        notificationId: m.notificationId ?? null,
      });
    }
  });

  return {
    id: planId,
    catId: draft.catId,
    isActive: true,
    mode: draft.mode,
    mealsPerDay: draft.mealsPerDay,
    foods: draft.foods,
    scheduledMeals,
  };
}

export async function updateScheduledMealNotificationId(mealId: string, notificationId: string | null): Promise<void> {
  const sqlite = getSqlite();
  await sqlite.runAsync('UPDATE scheduled_meals SET notification_id = ? WHERE id = ?', [notificationId, mealId]);
}
