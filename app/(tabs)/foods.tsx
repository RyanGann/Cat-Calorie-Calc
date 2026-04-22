import React from 'react';
import { View, Pressable } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Input, Chip, Card } from '@/components/primitives';
import { useTheme } from '@/theme/ThemeProvider';
import { listFoods } from '@/db/repositories/foods';
import type { Food, FoodType } from '@/domain/types';
import { radii } from '@/theme/spacing';
import { summarizeFoodEnergy } from '@/utils/foodDisplay';

type Filter = 'all' | FoodType;

export default function FoodsScreen() {
  const { colors } = useTheme();
  const [query, setQuery] = React.useState('');
  const [filter, setFilter] = React.useState<Filter>('all');
  const [foods, setFoods] = React.useState<Food[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      const all = await listFoods({
        query,
        type: filter === 'all' ? undefined : filter,
      });
      if (active) {
        setFoods(all);
        setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [query, filter]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.canvas }}>
      <View style={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 8 }}>
        <Text variant="displayL">Foods</Text>
        <Text variant="body" muted style={{ marginTop: 4 }}>
          {foods.length} foods · tap to add to a plan
        </Text>
      </View>
      <View style={{ paddingHorizontal: 20, gap: 10 }}>
        <Input
          placeholder="Search brand or food…"
          value={query}
          onChangeText={setQuery}
          returnKeyType="search"
          autoCorrect={false}
        />
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Chip label="All" selected={filter === 'all'} onPress={() => setFilter('all')} />
          <Chip label="Wet" selected={filter === 'wet'} onPress={() => setFilter('wet')} />
          <Chip label="Dry" selected={filter === 'dry'} onPress={() => setFilter('dry')} />
          <Chip label="Treats" selected={filter === 'treat'} onPress={() => setFilter('treat')} />
        </View>
      </View>
      <View style={{ flex: 1, marginTop: 12, paddingHorizontal: 20 }}>
        <FlashList
          data={foods}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <FoodCard food={item} />}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
          ListEmptyComponent={
            !loading ? (
              <Card>
                <Text variant="label">No foods matched.</Text>
                <Text variant="bodySm" muted style={{ marginTop: 4 }}>
                  Try a different brand or add your own — custom foods are coming soon.
                </Text>
              </Card>
            ) : null
          }
        />
      </View>
    </SafeAreaView>
  );
}

function FoodCard({ food }: { food: Food }) {
  const { colors } = useTheme();
  const tag = food.type === 'wet' ? 'Wet' : food.type === 'dry' ? 'Dry' : 'Treat';
  const tagBg = food.type === 'wet' ? colors.wetSoft : food.type === 'dry' ? colors.accentSoft : colors.successSoft;
  const tagFg = food.type === 'wet' ? colors.wet : food.type === 'dry' ? colors.accentDeep : colors.success;
  return (
    <Pressable
      onPress={() => router.push(`/food/${food.id}`)}
      accessibilityRole="button"
      accessibilityLabel={`${food.brand} ${food.name}`}
    >
      <Card elevation="sm">
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <View style={{ flex: 1 }}>
            <Text variant="overline" subtle>{food.brand.toUpperCase()}</Text>
            <Text variant="displayS" numberOfLines={2} style={{ marginTop: 2 }}>
              {food.name}
            </Text>
            <View style={{ flexDirection: 'row', gap: 6, marginTop: 10, alignItems: 'center' }}>
              <View
                style={{
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                  borderRadius: radii.pill,
                  backgroundColor: tagBg,
                }}
              >
                <Text variant="overline" color={tagFg}>{tag.toUpperCase()}</Text>
              </View>
              <Text variant="bodySm" muted tabular>
                {summarizeFoodEnergy(food)}
              </Text>
            </View>
          </View>
        </View>
      </Card>
    </Pressable>
  );
}
