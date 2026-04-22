import React from 'react';
import { View, Pressable, Alert, ScrollView } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Screen, Text, Card, Button, Chip, IconButton, Input } from '@/components/primitives';
import { useTheme } from '@/theme/ThemeProvider';
import { useCatsStore } from '@/state/cats';
import { useSettingsStore } from '@/state/settings';
import {
  getActivePlan,
  replaceActivePlan,
  updateScheduledMealNotificationId,
} from '@/db/repositories/plans';
import { listFoods } from '@/db/repositories/foods';
import { defaultMealTimes, minutesToTimeLabel, snapToMinuteGrid } from '@/domain/schedule';
import { visualPortion, kcalToGrams, roundGrams } from '@/domain/portions';
import { formatPortion, resolveUnitSystem } from '@/utils/units';
import { summarizeFoodEnergy } from '@/utils/foodDisplay';
import type { Food, PlanMode } from '@/domain/types';
import {
  ensurePermissions,
  rescheduleMealsForPlan,
} from '@/services/notifications';
import { radii, spacing } from '@/theme/spacing';
import { haptics } from '@/services/haptics';
import { TimeStepper } from '@/components/feeding/TimeStepper';

type MealEntry = {
  timeOfDayMin: number;
  foodId: string | null;
};

const MAX_FOODS = 3;

export default function PlanEditorScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useTheme();
  const cat = useCatsStore((s) => s.cats.find((c) => c.id === id) ?? null);
  const unitPref = useSettingsStore((s) => s.unitPref);
  const system = resolveUnitSystem(unitPref);
  const remindersOn = useSettingsStore((s) => s.remindersOn);

  const [allFoods, setAllFoods] = React.useState<Food[]>([]);
  const [query, setQuery] = React.useState('');
  const [selectedFoodIds, setSelectedFoodIds] = React.useState<string[]>([]);
  const [mode, setMode] = React.useState<PlanMode>('scheduled');
  const [mealsPerDay, setMealsPerDay] = React.useState<2 | 3 | 4>(3);
  const [meals, setMeals] = React.useState<MealEntry[]>([]);
  const [openTimeIdx, setOpenTimeIdx] = React.useState<number | null>(null);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    (async () => {
      const foods = await listFoods();
      setAllFoods(foods);
      if (!id) return;
      const existing = await getActivePlan(id);
      if (existing) {
        setMode(existing.mode);
        if (existing.mealsPerDay === 2 || existing.mealsPerDay === 3 || existing.mealsPerDay === 4) {
          setMealsPerDay(existing.mealsPerDay);
        }
        setSelectedFoodIds(existing.foods.map((f) => f.foodId));
        setMeals(
          existing.scheduledMeals.map((m) => ({
            timeOfDayMin: m.timeOfDayMin,
            foodId: m.foodId ?? existing.foods[0]?.foodId ?? null,
          })),
        );
      } else {
        // Defaults for a new plan
        setMeals(
          defaultMealTimes(3).map((t) => ({ timeOfDayMin: t, foodId: null })),
        );
      }
    })();
  }, [id]);

  // Keep meals array length in sync with meal style
  React.useEffect(() => {
    if (mode === 'grazer') {
      setMeals((prev) => {
        if (prev.length === 1 && prev[0]!.timeOfDayMin === 20 * 60) return prev;
        const foodId = prev[0]?.foodId ?? selectedFoodIds[0] ?? null;
        return [{ timeOfDayMin: 20 * 60, foodId }];
      });
      return;
    }
    setMeals((prev) => {
      if (prev.length === mealsPerDay && prev.every((m) => m.timeOfDayMin < 1440)) return prev;
      const defaults = defaultMealTimes(mealsPerDay);
      return defaults.map((t, i) => {
        const existing = prev[i];
        const foodId = existing?.foodId ?? selectedFoodIds[i % Math.max(1, selectedFoodIds.length)] ?? null;
        return {
          timeOfDayMin: existing?.timeOfDayMin ?? t,
          foodId,
        };
      });
    });
  }, [mode, mealsPerDay, selectedFoodIds]);

  if (!cat) {
    return (
      <Screen>
        <Text>Cat not found.</Text>
      </Screen>
    );
  }

  const selectedFoods = selectedFoodIds
    .map((fid) => allFoods.find((f) => f.id === fid))
    .filter(Boolean) as Food[];

  const searchResults = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q.length === 0) return [] as Food[];
    return allFoods
      .filter((f) => `${f.brand} ${f.name}`.toLowerCase().includes(q))
      .slice(0, 20);
  }, [allFoods, query]);

  function toggleFood(foodId: string) {
    haptics.selection();
    setSelectedFoodIds((prev) => {
      if (prev.includes(foodId)) {
        const next = prev.filter((id) => id !== foodId);
        setMeals((ms) => ms.map((m) => (m.foodId === foodId ? { ...m, foodId: next[0] ?? null } : m)));
        return next;
      }
      if (prev.length >= MAX_FOODS) {
        Alert.alert('Up to 3 foods', 'Remove one first to add another.');
        return prev;
      }
      const next = [...prev, foodId];
      setMeals((ms) => ms.map((m) => (m.foodId == null ? { ...m, foodId } : m)));
      return next;
    });
  }

  function setMealFood(idx: number, foodId: string) {
    haptics.selection();
    setMeals((ms) => ms.map((m, i) => (i === idx ? { ...m, foodId } : m)));
  }

  function setMealTime(idx: number, timeOfDayMin: number) {
    setMeals((ms) => ms.map((m, i) => (i === idx ? { ...m, timeOfDayMin: snapToMinuteGrid(timeOfDayMin, 5) } : m)));
  }

  const perMealKcal = cat.mealGoalKcal / Math.max(1, meals.length);

  async function save() {
    if (!cat) return;
    if (selectedFoodIds.length === 0) {
      Alert.alert('Pick at least one food', 'Choose a food to feed — you can add more later.');
      return;
    }
    if (meals.some((m) => !m.foodId)) {
      Alert.alert('Assign a food to every meal', 'Each meal needs a food from your list.');
      return;
    }
    setSaving(true);
    try {
      const plan = await replaceActivePlan({
        catId: cat.id,
        mode,
        mealsPerDay: mode === 'grazer' ? null : mealsPerDay,
        foods: selectedFoodIds.map((foodId, i, arr) => ({ foodId, kcalSharePct: 100 / arr.length })),
        scheduledMeals: meals.map((m) => ({
          timeOfDayMin: m.timeOfDayMin,
          kcalTarget: perMealKcal,
          foodId: m.foodId,
        })),
      });

      if (remindersOn) {
        const ok = await ensurePermissions();
        if (ok) {
          const foodsById = new Map(selectedFoods.map((f) => [f.id, f]));
          const mealById = new Map(plan.scheduledMeals.map((m) => [m.id, m]));
          const foodNameForMeal = (mealId: string): string => {
            const sm = mealById.get(mealId);
            const food = sm?.foodId ? foodsById.get(sm.foodId) : null;
            return food ? `${food.brand} ${food.name}` : 'food';
          };
          const portionForMeal = (mealId: string): string => {
            const sm = mealById.get(mealId);
            if (!sm) return '';
            const food = sm.foodId ? foodsById.get(sm.foodId) : null;
            if (!food) return '';
            const vp = visualPortion(food, sm.kcalTarget);
            return food.type === 'wet' && food.kcalPerCan ? vp.primaryLabel : formatPortion(vp.grams, system);
          };
          const results = await rescheduleMealsForPlan(plan.scheduledMeals, {
            catName: cat.name,
            catId: cat.id,
            foodNameForMeal,
            portionForMeal,
          });
          for (const r of results) {
            await updateScheduledMealNotificationId(r.mealId, r.notificationId);
          }
        }
      }

      haptics.success();
      router.back();
    } catch (err) {
      console.error('[plan] save failed', err);
      Alert.alert('Something went wrong', 'Please try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Screen scroll padded>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <IconButton onPress={() => router.back()} accessibilityLabel="Back">
          <Text variant="displayS" color={colors.text}>‹</Text>
        </IconButton>
        <Text variant="displayM">Feeding plan</Text>
      </View>

      <Text variant="body" muted>
        {cat.name} needs <Text style={{ fontFamily: 'Inter_600SemiBold' }}>{Math.round(cat.mealGoalKcal)} kcal/day</Text>.
      </Text>

      {/* FOODS */}
      <Text variant="overline" subtle style={{ marginTop: 24, marginBottom: 8 }}>
        FOODS ({selectedFoodIds.length}/{MAX_FOODS})
      </Text>
      {selectedFoods.length > 0 ? (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
          {selectedFoods.map((f) => (
            <Pressable key={f.id} onPress={() => toggleFood(f.id)}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 6,
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  borderRadius: radii.pill,
                  backgroundColor: colors.accentSoft,
                  borderWidth: 1,
                  borderColor: colors.accent,
                }}
              >
                <Text variant="label" color={colors.accentDeep} numberOfLines={1}>
                  {f.brand} {f.name}
                </Text>
                <Text variant="label" color={colors.accentDeep}>×</Text>
              </View>
            </Pressable>
          ))}
        </View>
      ) : null}

      <Input
        placeholder="Search brand or food…"
        value={query}
        onChangeText={setQuery}
        autoCorrect={false}
      />
      {searchResults.length > 0 ? (
        <Card padded={false} style={{ marginTop: 10 }}>
          {searchResults.map((f, i) => {
            const selected = selectedFoodIds.includes(f.id);
            return (
              <Pressable key={f.id} onPress={() => toggleFood(f.id)}>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 12,
                    padding: 14,
                    borderBottomWidth: i < searchResults.length - 1 ? 1 : 0,
                    borderBottomColor: colors.hairline,
                    backgroundColor: selected ? colors.accentSoft : 'transparent',
                  }}
                >
                  <View
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: 6,
                      borderWidth: 2,
                      borderColor: selected ? colors.accent : colors.hairline,
                      backgroundColor: selected ? colors.accent : 'transparent',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {selected ? <Text variant="bodySm" color={colors.onAccent}>✓</Text> : null}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text variant="body" numberOfLines={1}>{f.brand} {f.name}</Text>
                    <Text variant="bodySm" subtle tabular>{summarizeFoodEnergy(f)}</Text>
                  </View>
                </View>
              </Pressable>
            );
          })}
        </Card>
      ) : query.length > 0 ? (
        <Text variant="bodySm" subtle style={{ marginTop: 10 }}>No foods matched.</Text>
      ) : (
        <Text variant="bodySm" subtle style={{ marginTop: 10 }}>
          Type to search — Fancy Feast, Purina, Hill's, Royal Canin, and more.
        </Text>
      )}

      {/* MEAL STYLE */}
      <Text variant="overline" subtle style={{ marginTop: 28, marginBottom: 8 }}>
        MEAL STYLE
      </Text>
      <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
        <Chip label="2 meals" selected={mode === 'scheduled' && mealsPerDay === 2} onPress={() => { setMode('scheduled'); setMealsPerDay(2); }} />
        <Chip label="3 meals" selected={mode === 'scheduled' && mealsPerDay === 3} onPress={() => { setMode('scheduled'); setMealsPerDay(3); }} />
        <Chip label="4 meals" selected={mode === 'scheduled' && mealsPerDay === 4} onPress={() => { setMode('scheduled'); setMealsPerDay(4); }} />
        <Chip label="Grazer" selected={mode === 'grazer'} onPress={() => setMode('grazer')} />
      </View>

      {/* MEALS */}
      <Text variant="overline" subtle style={{ marginTop: 28, marginBottom: 8 }}>
        SCHEDULE
      </Text>
      {selectedFoods.length === 0 ? (
        <Card>
          <Text variant="bodySm" subtle>
            Pick a food above to see the schedule.
          </Text>
        </Card>
      ) : (
        <Card padded={false}>
          {meals.map((m, idx) => {
            const food = m.foodId ? selectedFoods.find((f) => f.id === m.foodId) : null;
            const kcal = perMealKcal;
            const grams = food ? roundGrams(kcalToGrams(kcal, food)) : 0;
            const vp = food ? visualPortion(food, kcal) : null;
            const portionLabel =
              vp && food?.type === 'wet' && food.kcalPerCan
                ? vp.primaryLabel
                : formatPortion(grams, system);
            const isOpen = openTimeIdx === idx;
            return (
              <View
                key={idx}
                style={{
                  padding: 14,
                  gap: 12,
                  borderBottomWidth: idx < meals.length - 1 ? 1 : 0,
                  borderBottomColor: colors.hairline,
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <Pressable
                    onPress={() => setOpenTimeIdx(isOpen ? null : idx)}
                    style={{
                      paddingHorizontal: 14,
                      paddingVertical: 8,
                      borderRadius: radii.pill,
                      backgroundColor: isOpen ? colors.accentSoft : colors.surfaceAlt,
                      borderWidth: 1,
                      borderColor: isOpen ? colors.accent : colors.hairline,
                    }}
                  >
                    <Text variant="bodyL" tabular color={isOpen ? colors.accentDeep : colors.text}>
                      {minutesToTimeLabel(m.timeOfDayMin)}
                    </Text>
                  </Pressable>
                  <View style={{ flex: 1 }}>
                    <Text variant="body" numberOfLines={1}>
                      {food ? `${food.brand} ${food.name}` : 'Pick a food ↓'}
                    </Text>
                    {food ? (
                      <Text variant="bodySm" subtle tabular>
                        {portionLabel} · {Math.round(kcal)} kcal
                      </Text>
                    ) : null}
                  </View>
                </View>

                {isOpen ? (
                  <View style={{ alignItems: 'center', paddingVertical: 4 }}>
                    <TimeStepper minutes={m.timeOfDayMin} onChange={(v) => setMealTime(idx, v)} />
                  </View>
                ) : null}

                {selectedFoods.length > 1 ? (
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ gap: 6, paddingVertical: 2 }}
                  >
                    {selectedFoods.map((f) => (
                      <Chip
                        key={f.id}
                        label={`${f.brand} ${f.name}`.length > 26 ? `${f.brand}` : `${f.brand} ${f.name}`}
                        selected={m.foodId === f.id}
                        onPress={() => setMealFood(idx, f.id)}
                        variant="accent"
                      />
                    ))}
                  </ScrollView>
                ) : null}
              </View>
            );
          })}
        </Card>
      )}

      <Button
        label="Save plan"
        onPress={save}
        loading={saving}
        size="lg"
        fullWidth
        style={{ marginTop: 28 }}
      />
    </Screen>
  );
}
