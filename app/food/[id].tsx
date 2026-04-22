import React from 'react';
import { View, ScrollView } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Screen, Text, Card, Button, IconButton } from '@/components/primitives';
import { useTheme } from '@/theme/ThemeProvider';
import { getFood } from '@/db/repositories/foods';
import type { Food } from '@/domain/types';
import { radii } from '@/theme/spacing';

export default function FoodDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useTheme();
  const [food, setFood] = React.useState<Food | null>(null);

  React.useEffect(() => {
    if (!id) return;
    (async () => {
      const f = await getFood(id);
      setFood(f);
    })();
  }, [id]);

  if (!food) {
    return (
      <Screen>
        <Text>Loading…</Text>
      </Screen>
    );
  }

  const tag = food.type === 'wet' ? 'Wet' : food.type === 'dry' ? 'Dry' : 'Treat';
  const tagBg = food.type === 'wet' ? colors.wetSoft : food.type === 'dry' ? colors.accentSoft : colors.successSoft;
  const tagFg = food.type === 'wet' ? colors.wet : food.type === 'dry' ? colors.accentDeep : colors.success;

  const dryMatterProtein =
    food.proteinPct != null && food.moisturePct != null
      ? (food.proteinPct * 100) / (100 - food.moisturePct)
      : null;

  return (
    <Screen scroll padded>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <IconButton onPress={() => router.back()} accessibilityLabel="Back">
          <Text variant="displayS" color={colors.text}>‹</Text>
        </IconButton>
      </View>

      <View style={{ marginTop: 8 }}>
        <Text variant="overline" subtle>{food.brand.toUpperCase()}</Text>
        <Text variant="displayL" style={{ marginTop: 4 }}>{food.name}</Text>
        <View style={{ marginTop: 10 }}>
          <View
            style={{
              alignSelf: 'flex-start',
              paddingHorizontal: 12,
              paddingVertical: 5,
              borderRadius: radii.pill,
              backgroundColor: tagBg,
            }}
          >
            <Text variant="overline" color={tagFg}>{tag.toUpperCase()}</Text>
          </View>
        </View>
      </View>

      <Card style={{ marginTop: 20 }} padded={false}>
        <View style={{ flexDirection: 'row', padding: 20 }}>
          <Stat label="kcal / kg" value={Math.round(food.kcalPerKg).toString()} />
          {food.kcalPerCan ? <Stat label="kcal / can" value={Math.round(food.kcalPerCan).toString()} /> : null}
          {food.canSizeG ? <Stat label="can size" value={`${Math.round(food.canSizeG)} g`} /> : null}
        </View>
      </Card>

      <Text variant="overline" subtle style={{ marginTop: 24, marginBottom: 8 }}>
        NUTRITION
      </Text>
      <Card padded={false}>
        {food.proteinPct != null ? <NutRow label="Protein" value={`${food.proteinPct}%`} /> : null}
        {food.fatPct != null ? <NutRow label="Fat" value={`${food.fatPct}%`} /> : null}
        {food.moisturePct != null ? <NutRow label="Moisture" value={`${food.moisturePct}%`} /> : null}
        {food.fiberPct != null ? <NutRow label="Fiber" value={`${food.fiberPct}%`} /> : null}
        {dryMatterProtein != null ? (
          <NutRow label="Dry-matter protein" value={`${dryMatterProtein.toFixed(1)}%`} subtle />
        ) : null}
      </Card>

      <Button
        label="Add to plan"
        onPress={() => router.back()}
        size="lg"
        fullWidth
        style={{ marginTop: 28 }}
      />

      <Text variant="bodySm" subtle align="center" style={{ marginTop: 14 }}>
        Values from manufacturer spec sheets. Report issues in Settings.
      </Text>
    </Screen>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flex: 1, alignItems: 'center' }}>
      <Text variant="displayM" tabular>{value}</Text>
      <Text variant="bodySm" subtle style={{ marginTop: 2 }}>{label}</Text>
    </View>
  );
}

function NutRow({ label, value, subtle }: { label: string; value: string; subtle?: boolean }) {
  const { colors } = useTheme();
  return (
    <View
      style={{
        paddingHorizontal: 16,
        paddingVertical: 14,
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderBottomWidth: 1,
        borderBottomColor: colors.hairline,
      }}
    >
      <Text variant="body" muted={subtle}>{label}</Text>
      <Text variant="body" tabular>{value}</Text>
    </View>
  );
}
