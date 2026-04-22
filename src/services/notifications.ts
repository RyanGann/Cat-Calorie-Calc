import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import type { ScheduledMeal } from '@/domain/types';

export const NOTIFICATION_CATEGORY = 'WHISKR_MEAL';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function configureNotificationCategories(): Promise<void> {
  try {
    await Notifications.setNotificationCategoryAsync(NOTIFICATION_CATEGORY, [
      { identifier: 'FED', buttonTitle: 'Fed', options: { opensAppToForeground: true } },
      { identifier: 'SNOOZE', buttonTitle: 'Snooze 15m', options: { opensAppToForeground: false } },
      { identifier: 'SKIP', buttonTitle: 'Skip', options: { opensAppToForeground: false } },
    ]);
  } catch {
    // no-op on platforms that don't support
  }
}

export async function ensurePermissions(): Promise<boolean> {
  const { status } = await Notifications.getPermissionsAsync();
  if (status === 'granted') return true;
  const req = await Notifications.requestPermissionsAsync();
  return req.status === 'granted';
}

export async function cancelNotification(id: string | null | undefined): Promise<void> {
  if (!id) return;
  try {
    await Notifications.cancelScheduledNotificationAsync(id);
  } catch {
    // ignore
  }
}

export async function cancelAll(): Promise<void> {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch {}
}

export type MealNotificationInput = {
  catName: string;
  foodName: string;
  portionText: string;
  timeOfDayMin: number;
  catId: string;
  mealId: string;
};

export async function scheduleMealNotification(input: MealNotificationInput): Promise<string | null> {
  if (Platform.OS === 'web') return null;
  const hour = Math.floor(input.timeOfDayMin / 60);
  const minute = input.timeOfDayMin % 60;

  try {
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: `Time to feed ${input.catName}`,
        body: `${input.portionText} of ${input.foodName}`,
        categoryIdentifier: NOTIFICATION_CATEGORY,
        data: { catId: input.catId, mealId: input.mealId },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
        hour,
        minute,
        repeats: true,
      } as Notifications.CalendarTriggerInput,
    });
    return id;
  } catch (err) {
    console.warn('[notifications] schedule failed', err);
    return null;
  }
}

export async function rescheduleMealsForPlan(
  meals: ScheduledMeal[],
  ctx: {
    catName: string;
    catId: string;
    foodNameForMeal: (mealId: string) => string;
    portionForMeal: (mealId: string) => string;
  },
): Promise<Array<{ mealId: string; notificationId: string | null }>> {
  const results: Array<{ mealId: string; notificationId: string | null }> = [];
  for (const meal of meals) {
    await cancelNotification(meal.notificationId);
    const id = await scheduleMealNotification({
      catName: ctx.catName,
      foodName: ctx.foodNameForMeal(meal.id),
      portionText: ctx.portionForMeal(meal.id),
      timeOfDayMin: meal.timeOfDayMin,
      catId: ctx.catId,
      mealId: meal.id,
    });
    results.push({ mealId: meal.id, notificationId: id });
  }
  return results;
}
