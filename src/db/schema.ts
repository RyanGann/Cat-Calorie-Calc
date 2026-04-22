import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

export const cats = sqliteTable('cats', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  photoUri: text('photo_uri'),
  sex: text('sex').notNull().default('unknown'),
  neutered: integer('neutered', { mode: 'boolean' }).notNull().default(false),
  birthDate: text('birth_date'),
  weightKg: real('weight_kg').notNull(),
  bodyCondition: integer('body_condition').notNull().default(5),
  activityLevel: text('activity_level').notNull().default('moderate'),
  lifeStage: text('life_stage').notNull().default('adult'),
  mealGoalKcal: real('meal_goal_kcal').notNull().default(0),
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
  deletedAt: integer('deleted_at'),
});

export const foods = sqliteTable('foods', {
  id: text('id').primaryKey(),
  source: text('source').notNull().default('curated'),
  brand: text('brand').notNull(),
  name: text('name').notNull(),
  type: text('type').notNull(),
  kcalPerKg: real('kcal_per_kg').notNull(),
  kcalPerCan: real('kcal_per_can'),
  canSizeG: real('can_size_g'),
  proteinPct: real('protein_pct'),
  fatPct: real('fat_pct'),
  moisturePct: real('moisture_pct'),
  fiberPct: real('fiber_pct'),
  ingredients: text('ingredients'),
  barcode: text('barcode'),
  region: text('region'),
  lastVerifiedAt: integer('last_verified_at'),
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
});

export const feedingPlans = sqliteTable('feeding_plans', {
  id: text('id').primaryKey(),
  catId: text('cat_id').notNull(),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  mode: text('mode').notNull().default('scheduled'),
  mealsPerDay: integer('meals_per_day'),
  createdAt: integer('created_at').notNull(),
});

export const feedingPlanFoods = sqliteTable('feeding_plan_foods', {
  id: text('id').primaryKey(),
  planId: text('plan_id').notNull(),
  foodId: text('food_id').notNull(),
  kcalSharePct: real('kcal_share_pct').notNull().default(100),
});

export const scheduledMeals = sqliteTable('scheduled_meals', {
  id: text('id').primaryKey(),
  planId: text('plan_id').notNull(),
  timeOfDayMin: integer('time_of_day_min').notNull(),
  kcalTarget: real('kcal_target').notNull(),
  notificationId: text('notification_id'),
  foodId: text('food_id'),
});

export const feedingEvents = sqliteTable('feeding_events', {
  id: text('id').primaryKey(),
  catId: text('cat_id').notNull(),
  scheduledMealId: text('scheduled_meal_id'),
  foodId: text('food_id').notNull(),
  amountG: real('amount_g').notNull(),
  kcal: real('kcal').notNull(),
  fedAt: integer('fed_at').notNull(),
  status: text('status').notNull().default('fed'),
  note: text('note'),
  createdAt: integer('created_at').notNull(),
});

export const weightHistory = sqliteTable('weight_history', {
  id: text('id').primaryKey(),
  catId: text('cat_id').notNull(),
  weightKg: real('weight_kg').notNull(),
  measuredAt: integer('measured_at').notNull(),
});

export const appSettings = sqliteTable('app_settings', {
  id: integer('id').primaryKey(),
  unitPref: text('unit_pref').notNull().default('auto'),
  theme: text('theme').notNull().default('system'),
  remindersOn: integer('reminders_on', { mode: 'boolean' }).notNull().default(true),
  hasOnboarded: integer('has_onboarded', { mode: 'boolean' }).notNull().default(false),
  proUnlocked: integer('pro_unlocked', { mode: 'boolean' }).notNull().default(false),
  locale: text('locale'),
  schemaVersion: integer('schema_version').notNull().default(1),
});

export type DbCat = typeof cats.$inferSelect;
export type DbFood = typeof foods.$inferSelect;
export type DbFeedingEvent = typeof feedingEvents.$inferSelect;
export type DbFeedingPlan = typeof feedingPlans.$inferSelect;
export type DbScheduledMeal = typeof scheduledMeals.$inferSelect;
