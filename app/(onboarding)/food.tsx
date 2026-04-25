import React from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { router } from 'expo-router';
import { OnboardingFrame } from '@/components/onboarding/OnboardingFrame';
import { Card, Chip, Input, Text } from '@/components/primitives';
import { ONBOARDING_TOTAL_STEPS, useOnboardingStore } from '@/state/onboarding';
import { listFoods } from '@/db/repositories/foods';
import type { Food } from '@/domain/types';
import { summarizeFoodEnergy } from '@/utils/foodDisplay';
import { radii } from '@/theme/spacing';
import { useTheme } from '@/theme/ThemeProvider';
import { haptics } from '@/services/haptics';

const MAX_ONBOARDING_FOODS = 2;

export default function FoodStep() {
  const { colors } = useTheme();
  const { draft, update } = useOnboardingStore();
  const [query, setQuery] = React.useState('');
  const [foods, setFoods] = React.useState<Food[]>([]);

  React.useEffect(() => {
    let active = true;
    (async () => {
      const results = await listFoods({ query });
      if (active) setFoods(results.slice(0, query.trim() ? 24 : 12));
    })();
    return () => {
      active = false;
    };
  }, [query]);

  function toggleFood(foodId: string) {
    haptics.selection();
    update({
      foodIds: draft.foodIds.includes(foodId)
        ? draft.foodIds.filter((id) => id !== foodId)
        : [...draft.foodIds, foodId].slice(0, MAX_ONBOARDING_FOODS),
    });
  }

  return (
    <OnboardingFrame
      step={9}
      totalSteps={ONBOARDING_TOTAL_STEPS}
      title={`What does ${draft.name || 'your cat'} eat?`}
      subtitle="Pick one or two foods now, or skip and set it up later."
      primaryLabel="Build schedule"
      primaryDisabled={draft.foodIds.length === 0}
      onPrimary={() => router.push('/(onboarding)/schedule')}
      secondaryLabel="I'll do this later"
      onSecondary={() => {
        update({ foodIds: [] });
        router.push('/(onboarding)/done');
      }}
    >
      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ gap: 12, paddingBottom: 16 }}
      >
        <Input
          placeholder="Search Fancy Feast, Purina, Royal Canin..."
          value={query}
          onChangeText={setQuery}
          autoCorrect={false}
          returnKeyType="search"
        />

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <Chip label={`${draft.foodIds.length}/${MAX_ONBOARDING_FOODS} selected`} selected />
          <Text variant="bodySm" subtle>
            You can edit portions later.
          </Text>
        </View>

        {foods.length === 0 ? (
          <Card>
            <Text variant="label">No foods matched.</Text>
            <Text variant="bodySm" muted style={{ marginTop: 4 }}>
              Custom food entry is available after setup from the Foods tab.
            </Text>
          </Card>
        ) : (
          <View style={{ gap: 10 }}>
            {foods.map((food) => {
              const selected = draft.foodIds.includes(food.id);
              return (
                <Pressable
                  key={food.id}
                  onPress={() => toggleFood(food.id)}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: selected }}
                  accessibilityLabel={`${selected ? 'Remove' : 'Select'} ${food.brand} ${food.name}`}
                >
                  <View
                    style={{
                      padding: 14,
                      borderRadius: radii.xl,
                      backgroundColor: selected ? colors.accentSoft : colors.surface,
                      borderWidth: 1.5,
                      borderColor: selected ? colors.accent : colors.hairline,
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 12,
                    }}
                  >
                    <View style={{ flex: 1 }}>
                      <Text variant="overline" subtle>{food.brand.toUpperCase()}</Text>
                      <Text variant="body" numberOfLines={2} style={{ marginTop: 2 }}>
                        {food.name}
                      </Text>
                      <Text variant="bodySm" subtle tabular style={{ marginTop: 4 }}>
                        {summarizeFoodEnergy(food)}
                      </Text>
                    </View>
                    <Text variant="displayS" color={selected ? colors.accentDeep : colors.textSubtle}>
                      {selected ? '✓' : '+'}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
        )}
      </ScrollView>
    </OnboardingFrame>
  );
}
