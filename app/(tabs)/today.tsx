import React from 'react';
import { View, ScrollView, Pressable, RefreshControl } from 'react-native';
import { MotiView } from 'moti';
import { router, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Button, Card, IconButton } from '@/components/primitives';
import { ProgressRing } from '@/components/feeding/ProgressRing';
import { CatCarousel } from '@/components/cats/CatCarousel';
import { useCatsStore } from '@/state/cats';
import { useSettingsStore } from '@/state/settings';
import { useTheme } from '@/theme/ThemeProvider';
import { getActivePlan } from '@/db/repositories/plans';
import { getFoodsByIds } from '@/db/repositories/foods';
import { logEvent, eventsSince } from '@/db/repositories/events';
import { startOfLocalDay, kcalFedToday } from '@/domain/history';
import { generateSchedule, minutesToTimeLabel } from '@/domain/schedule';
import { visualPortion } from '@/domain/portions';
import { resolveUnitSystem, formatPortion } from '@/utils/units';
import { haptics } from '@/services/haptics';
import type { FeedingPlan, FeedingEvent, Food } from '@/domain/types';

type MealRow = {
  mealId: string;
  timeOfDayMin: number;
  foodId: string;
  foodName: string;
  kcal: number;
  grams: number;
  portionLabel: string;
  fed: boolean;
};

export default function TodayScreen() {
  const { colors } = useTheme();
  const { cats, activeCatId, setActiveCatId } = useCatsStore();
  const unitPref = useSettingsStore((s) => s.unitPref);
  const system = resolveUnitSystem(unitPref);

  const activeCat = cats.find((c) => c.id === activeCatId) ?? null;

  const [plan, setPlan] = React.useState<FeedingPlan | null>(null);
  const [foods, setFoods] = React.useState<Record<string, Food>>({});
  const [events, setEvents] = React.useState<FeedingEvent[]>([]);
  const [refreshing, setRefreshing] = React.useState(false);

  const load = React.useCallback(async () => {
    if (!activeCatId) {
      setPlan(null);
      setEvents([]);
      return;
    }
    const [p, todayEvents] = await Promise.all([
      getActivePlan(activeCatId),
      eventsSince(activeCatId, startOfLocalDay()),
    ]);
    setPlan(p);
    setEvents(todayEvents);
    if (p) {
      const ids = Array.from(
        new Set([
          ...p.foods.map((f) => f.foodId),
          ...p.scheduledMeals.map((m) => m.foodId).filter((x): x is string => !!x),
        ]),
      );
      const foodList = await getFoodsByIds(ids);
      const map: Record<string, Food> = {};
      foodList.forEach((f) => (map[f.id] = f));
      setFoods(map);
    }
  }, [activeCatId]);

  React.useEffect(() => {
    load();
  }, [load]);

  useFocusEffect(
    React.useCallback(() => {
      load();
    }, [load]),
  );

  const kcalFed = kcalFedToday(events);
  const target = activeCat?.mealGoalKcal ?? 0;
  const pct = target > 0 ? Math.min(1, kcalFed / target) : 0;

  const rows: MealRow[] = React.useMemo(() => {
    if (!plan || !activeCat || Object.keys(foods).length === 0) return [];
    return plan.scheduledMeals
      .slice()
      .sort((a, b) => a.timeOfDayMin - b.timeOfDayMin)
      .map((meal) => {
        const food = meal.foodId ? foods[meal.foodId] : undefined;
        const kcal = meal.kcalTarget;
        const vp = food ? visualPortion(food, kcal) : { grams: 0, primaryLabel: '—' };
        const fed = events.some((e) => e.scheduledMealId === meal.id && e.status === 'fed');
        return {
          mealId: meal.id,
          timeOfDayMin: meal.timeOfDayMin,
          foodId: food?.id ?? '',
          foodName: food ? `${food.brand} ${food.name}` : 'Select a food',
          kcal,
          grams: vp.grams,
          portionLabel:
            food?.type === 'wet' && food.kcalPerCan
              ? vp.primaryLabel
              : formatPortion(vp.grams, system),
          fed,
        };
      });
  }, [plan, foods, events, activeCat, system]);

  function nextUnfedRow() {
    return rows.find((r) => !r.fed);
  }

  async function feed(row: MealRow) {
    if (!activeCat || !row.foodId) return;
    haptics.success();
    await logEvent({
      catId: activeCat.id,
      scheduledMealId: row.mealId,
      foodId: row.foodId,
      amountG: row.grams,
      kcal: row.kcal,
      status: 'fed',
    });
    await load();
  }

  if (cats.length === 0) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.canvas, padding: 20 }}>
        <Text variant="displayL">No cats yet</Text>
        <Button
          label="Add your cat"
          onPress={() => router.push('/(onboarding)/welcome')}
          style={{ marginTop: 20 }}
          fullWidth
        />
      </SafeAreaView>
    );
  }

  const nextRow = nextUnfedRow();
  const greeting =
    new Date().getHours() < 12 ? 'Good morning' : new Date().getHours() < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.canvas }}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 40 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async () => {
          setRefreshing(true);
          await load();
          setRefreshing(false);
        }} />}
      >
        <View style={{ paddingHorizontal: 20, paddingTop: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View>
            <Text variant="overline" subtle>{greeting.toUpperCase()}</Text>
            <Text variant="displayM">{activeCat?.name ?? 'Your cat'}</Text>
          </View>
          <IconButton
            onPress={() => router.navigate('/(tabs)/settings')}
            accessibilityLabel="Settings"
          >
            <Text variant="displayS" color={colors.text}>⚙</Text>
          </IconButton>
        </View>

        <View style={{ marginTop: 12, marginBottom: 16 }}>
          <CatCarousel
            cats={cats}
            activeCatId={activeCatId}
            onSelect={setActiveCatId}
            onAdd={() => router.push('/(onboarding)/welcome')}
          />
        </View>

        <View style={{ alignItems: 'center', marginVertical: 20 }}>
          <ProgressRing
            kcalFed={kcalFed}
            kcalTarget={target}
            photoUri={activeCat?.photoUri}
            catName={activeCat?.name}
            size={260}
          />
          <View style={{ alignItems: 'center', marginTop: 20 }}>
            <Text variant="displayL" tabular>
              {Math.round(kcalFed)}
              <Text variant="displayM" muted tabular> / {Math.round(target)} kcal</Text>
            </Text>
            <Text variant="bodySm" subtle>
              {Math.round(pct * 100)}% of today's target
            </Text>
          </View>
        </View>

        {plan ? (
          <View style={{ paddingHorizontal: 20, gap: 12 }}>
            {nextRow ? (
              <MotiView
                from={{ opacity: 0, translateY: 8 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ type: 'timing', duration: 300 }}
              >
                <Card>
                  <Text variant="overline" subtle>NEXT MEAL</Text>
                  <Text variant="displayS" style={{ marginTop: 4 }}>
                    {minutesToTimeLabel(nextRow.timeOfDayMin)}
                  </Text>
                  <Text variant="body" muted style={{ marginTop: 6 }}>
                    {nextRow.portionLabel} of {nextRow.foodName}
                  </Text>
                  <Button
                    label="Fed!"
                    onPress={() => feed(nextRow)}
                    haptic="success"
                    size="lg"
                    fullWidth
                    style={{ marginTop: 16 }}
                  />
                </Card>
              </MotiView>
            ) : (
              <Card>
                <Text variant="displayS" align="center">All done today ✨</Text>
                <Text variant="body" muted align="center" style={{ marginTop: 6 }}>
                  Nicely done, {activeCat?.name}.
                </Text>
              </Card>
            )}

            <Card padded>
              <Text variant="overline" subtle>TODAY'S MEALS</Text>
              <View style={{ marginTop: 10, gap: 2 }}>
                {rows.map((r, i) => (
                  <View key={r.mealId} style={{ paddingVertical: 10, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <View
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: 5,
                        backgroundColor: r.fed ? colors.success : colors.surfaceAlt,
                        borderWidth: 1,
                        borderColor: r.fed ? colors.success : colors.hairline,
                      }}
                    />
                    <Text variant="bodyL" tabular style={{ width: 90 }}>
                      {minutesToTimeLabel(r.timeOfDayMin)}
                    </Text>
                    <View style={{ flex: 1 }}>
                      <Text variant="body" muted={r.fed} numberOfLines={1}>
                        {r.portionLabel} · {r.foodName}
                      </Text>
                    </View>
                    {!r.fed ? (
                      <Pressable
                        onPress={() => feed(r)}
                        style={{
                          paddingHorizontal: 14,
                          paddingVertical: 8,
                          borderRadius: 999,
                          backgroundColor: colors.accentSoft,
                        }}
                      >
                        <Text variant="label" color={colors.accentDeep}>Fed</Text>
                      </Pressable>
                    ) : (
                      <Text variant="bodySm" subtle>✓</Text>
                    )}
                  </View>
                ))}
              </View>
            </Card>
          </View>
        ) : (
          <View style={{ paddingHorizontal: 20, marginTop: 4 }}>
            <Card>
              <Text variant="displayS">No feeding plan yet</Text>
              <Text variant="body" muted style={{ marginTop: 6 }}>
                Choose a food and we'll split {activeCat?.name}'s daily {Math.round(target)} kcal into meals.
              </Text>
              <Button
                label="Set up feeding plan"
                onPress={() => router.push(`/cat/${activeCatId}/plan`)}
                style={{ marginTop: 16 }}
                fullWidth
              />
            </Card>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
