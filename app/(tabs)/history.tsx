import React from 'react';
import { View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Card } from '@/components/primitives';
import { useCatsStore } from '@/state/cats';
import { useSettingsStore } from '@/state/settings';
import { useTheme } from '@/theme/ThemeProvider';
import { recentEvents } from '@/db/repositories/events';
import { getFoodsByIds } from '@/db/repositories/foods';
import { groupByDay, averageDailyKcal } from '@/domain/history';
import { formatPortion, resolveUnitSystem } from '@/utils/units';
import { minutesToTimeLabel } from '@/domain/schedule';
import type { FeedingEvent, Food } from '@/domain/types';

export default function HistoryScreen() {
  const { colors } = useTheme();
  const { cats, activeCatId } = useCatsStore();
  const unitPref = useSettingsStore((s) => s.unitPref);
  const system = resolveUnitSystem(unitPref);
  const activeCat = cats.find((c) => c.id === activeCatId) ?? null;

  const [events, setEvents] = React.useState<FeedingEvent[]>([]);
  const [foods, setFoods] = React.useState<Record<string, Food>>({});

  React.useEffect(() => {
    if (!activeCatId) return;
    (async () => {
      const recent = await recentEvents(activeCatId, 200);
      setEvents(recent);
      const foodIds = Array.from(new Set(recent.map((e) => e.foodId)));
      const flist = await getFoodsByIds(foodIds);
      const map: Record<string, Food> = {};
      flist.forEach((f) => (map[f.id] = f));
      setFoods(map);
    })();
  }, [activeCatId]);

  const groups = groupByDay(events, 14);
  const avg = averageDailyKcal(events, 7);
  const target = activeCat?.mealGoalKcal ?? 0;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.canvas }}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        <Text variant="displayL">History</Text>
        <Text variant="body" muted style={{ marginTop: 4 }}>
          {activeCat?.name ?? 'Your cat'}'s last 14 days
        </Text>

        <Card style={{ marginTop: 16 }}>
          <Text variant="overline" subtle>7-DAY AVERAGE</Text>
          <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8, marginTop: 6 }}>
            <Text variant="displayL" tabular>{Math.round(avg)}</Text>
            <Text variant="body" muted tabular>/ {Math.round(target)} kcal/day</Text>
          </View>
          <SparkBar groups={groups.slice(0, 7).reverse()} target={target} />
        </Card>

        <View style={{ marginTop: 20, gap: 14 }}>
          {groups.map((g) => {
            const dayLabel = formatDayLabel(g.dayStart);
            return (
              <View key={g.dayStart}>
                <Text variant="overline" subtle style={{ marginBottom: 8 }}>
                  {dayLabel.toUpperCase()} · {Math.round(g.kcal)} KCAL
                </Text>
                {g.events.length === 0 ? (
                  <Card elevation="none">
                    <Text variant="bodySm" subtle>No meals logged.</Text>
                  </Card>
                ) : (
                  <Card elevation="sm" padded={false}>
                    {g.events
                      .sort((a, b) => a.fedAt - b.fedAt)
                      .map((e, idx, arr) => {
                        const d = new Date(e.fedAt);
                        const min = d.getHours() * 60 + d.getMinutes();
                        const food = foods[e.foodId];
                        return (
                          <View
                            key={e.id}
                            style={{
                              padding: 14,
                              flexDirection: 'row',
                              alignItems: 'center',
                              gap: 12,
                              borderBottomWidth: idx < arr.length - 1 ? 1 : 0,
                              borderBottomColor: colors.hairline,
                            }}
                          >
                            <Text variant="bodyL" tabular style={{ width: 80 }}>
                              {minutesToTimeLabel(min)}
                            </Text>
                            <View style={{ flex: 1 }}>
                              <Text variant="body">
                                {food ? `${food.brand} ${food.name}` : 'Food removed'}
                              </Text>
                              <Text variant="bodySm" subtle tabular>
                                {formatPortion(e.amountG, system)} · {Math.round(e.kcal)} kcal
                              </Text>
                            </View>
                            <Text variant="bodySm" subtle>
                              {e.status === 'fed' ? '✓' : e.status === 'skipped' ? '✕' : '◐'}
                            </Text>
                          </View>
                        );
                      })}
                  </Card>
                )}
              </View>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function formatDayLabel(dayStart: number): string {
  const d = new Date(dayStart);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffDays = Math.round((today.getTime() - dayStart) / 86400000);
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  return d.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' });
}

function SparkBar({ groups, target }: { groups: { dayStart: number; kcal: number }[]; target: number }) {
  const { colors } = useTheme();
  const max = Math.max(target, ...groups.map((g) => g.kcal), 1);
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 6, height: 64, marginTop: 14 }}>
      {groups.map((g) => {
        const h = Math.max(4, Math.round((g.kcal / max) * 60));
        const over = target > 0 && g.kcal > target * 1.1;
        return (
          <View key={g.dayStart} style={{ flex: 1, alignItems: 'center', gap: 4 }}>
            <View
              style={{
                height: h,
                width: '70%',
                borderRadius: 6,
                backgroundColor: over ? colors.warn : colors.accent,
                opacity: g.kcal === 0 ? 0.25 : 1,
              }}
            />
          </View>
        );
      })}
    </View>
  );
}
