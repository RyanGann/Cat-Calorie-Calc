import React from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { OnboardingFrame } from '@/components/onboarding/OnboardingFrame';
import { Card, Chip, Text } from '@/components/primitives';
import { ONBOARDING_TOTAL_STEPS, useOnboardingStore } from '@/state/onboarding';
import { useSettingsStore } from '@/state/settings';
import { getFoodsByIds } from '@/db/repositories/foods';
import { estimateDailyKcal } from '@/domain/calories';
import { minutesToTimeLabel } from '@/domain/schedule';
import { visualPortion } from '@/domain/portions';
import type { Food, PlanMode } from '@/domain/types';
import { buildScheduledMealDrafts } from '@/domain/feedingPlan';
import { formatPortion, resolveUnitSystem } from '@/utils/units';
import { useTheme } from '@/theme/ThemeProvider';

export default function ScheduleStep() {
  const { colors } = useTheme();
  const { draft, update } = useOnboardingStore();
  const unitPref = useSettingsStore((s) => s.unitPref);
  const unitSystem = resolveUnitSystem(unitPref);
  const [foods, setFoods] = React.useState<Food[]>([]);

  React.useEffect(() => {
    if (draft.foodIds.length === 0) {
      router.replace('/(onboarding)/done');
      return;
    }
    (async () => {
      setFoods(await getFoodsByIds(draft.foodIds));
    })();
  }, [draft.foodIds]);

  if (draft.weightKg == null || draft.foodIds.length === 0) {
    return null;
  }

  const result = estimateDailyKcal({
    weightKg: draft.weightKg,
    birthDate: draft.birthDate,
    sex: draft.sex,
    neutered: draft.neutered,
    bodyCondition: draft.bodyCondition,
    activityLevel: draft.activityLevel,
  });
  const meals = buildScheduledMealDrafts({
    dailyKcal: result.kcal,
    mode: draft.planMode,
    mealsPerDay: draft.mealsPerDay,
    foodIds: draft.foodIds,
  });
  const foodsById = new Map(foods.map((food) => [food.id, food]));

  return (
    <OnboardingFrame
      step={10}
      totalSteps={ONBOARDING_TOTAL_STEPS}
      title="Choose a meal rhythm"
      subtitle="We will start with gentle default times. You can tune every meal later."
      primaryLabel="Looks good"
      onPrimary={() => router.push('/(onboarding)/done')}
    >
      <View style={{ gap: 16 }}>
        <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
          <MealStyleChip
            label="2 meals"
            selected={draft.planMode === 'scheduled' && draft.mealsPerDay === 2}
            onPress={() => update({ planMode: 'scheduled', mealsPerDay: 2 })}
          />
          <MealStyleChip
            label="3 meals"
            selected={draft.planMode === 'scheduled' && draft.mealsPerDay === 3}
            onPress={() => update({ planMode: 'scheduled', mealsPerDay: 3 })}
          />
          <MealStyleChip
            label="4 meals"
            selected={draft.planMode === 'scheduled' && draft.mealsPerDay === 4}
            onPress={() => update({ planMode: 'scheduled', mealsPerDay: 4 })}
          />
          <MealStyleChip
            label="Grazer"
            selected={draft.planMode === 'grazer'}
            onPress={() => update({ planMode: 'grazer' })}
          />
        </View>

        <Card padded={false}>
          {meals.map((meal, index) => {
            const food = meal.foodId ? foodsById.get(meal.foodId) : null;
            const portion = food ? visualPortion(food, meal.kcalTarget) : null;
            const portionLabel =
              food && portion
                ? food.type === 'wet' && food.kcalPerCan
                  ? portion.primaryLabel
                  : formatPortion(portion.grams, unitSystem)
                : 'Pick food later';
            return (
              <View
                key={`${meal.timeOfDayMin}-${index}`}
                style={{
                  padding: 14,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 12,
                  borderBottomWidth: index < meals.length - 1 ? 1 : 0,
                  borderBottomColor: colors.hairline,
                }}
              >
                <Text variant="bodyL" tabular style={{ width: 88 }}>
                  {minutesToTimeLabel(meal.timeOfDayMin)}
                </Text>
                <View style={{ flex: 1 }}>
                  <Text variant="body" numberOfLines={1}>
                    {food ? `${food.brand} ${food.name}` : 'Food'}
                  </Text>
                  <Text variant="bodySm" subtle tabular style={{ marginTop: 2 }}>
                    {portionLabel} · {Math.round(meal.kcalTarget)} kcal
                  </Text>
                </View>
              </View>
            );
          })}
        </Card>

        <Text variant="bodySm" subtle>
          Real-world note: if your cat grazes from a bowl all day, use Grazer mode for one daily check-in instead of repeated meal alerts.
        </Text>
      </View>
    </OnboardingFrame>
  );
}

function MealStyleChip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return <Chip label={label} selected={selected} onPress={onPress} variant="accent" />;
}
