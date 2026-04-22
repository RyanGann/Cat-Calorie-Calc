import React from 'react';
import { ScrollView, Pressable, View } from 'react-native';
import { MotiView } from 'moti';
import { Avatar } from '@/components/primitives/Avatar';
import { Text } from '@/components/primitives/Text';
import { useTheme } from '@/theme/ThemeProvider';
import { haptics } from '@/services/haptics';
import type { Cat } from '@/domain/types';

type Props = {
  cats: Cat[];
  activeCatId: string | null;
  onSelect: (id: string) => void;
  onAdd?: () => void;
};

export function CatCarousel({ cats, activeCatId, onSelect, onAdd }: Props) {
  const { colors } = useTheme();
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 10, gap: 18 }}
    >
      {cats.map((cat) => {
        const active = cat.id === activeCatId;
        return (
          <Pressable
            key={cat.id}
            onPress={() => {
              haptics.selection();
              onSelect(cat.id);
            }}
            accessibilityRole="button"
            accessibilityLabel={`Switch to ${cat.name}`}
            accessibilityState={{ selected: active }}
            style={{ alignItems: 'center', gap: 6 }}
          >
            <MotiView
              animate={{ scale: active ? 1.05 : 0.94, opacity: active ? 1 : 0.55 }}
              transition={{ type: 'spring', damping: 18, stiffness: 220 }}
            >
              <View
                style={{
                  borderWidth: 2,
                  borderColor: active ? colors.accent : 'transparent',
                  borderRadius: 100,
                  padding: 3,
                }}
              >
                <Avatar name={cat.name} uri={cat.photoUri} size={56} />
              </View>
            </MotiView>
            <Text variant="bodySm" muted={!active}>
              {cat.name}
            </Text>
          </Pressable>
        );
      })}
      {onAdd && cats.length < 3 ? (
        <Pressable
          onPress={() => {
            haptics.selection();
            onAdd();
          }}
          accessibilityRole="button"
          accessibilityLabel="Add another cat"
          style={{ alignItems: 'center', gap: 6 }}
        >
          <View
            style={{
              width: 62,
              height: 62,
              borderRadius: 31,
              backgroundColor: colors.surfaceAlt,
              alignItems: 'center',
              justifyContent: 'center',
              borderStyle: 'dashed',
              borderWidth: 1.5,
              borderColor: colors.hairline,
            }}
          >
            <Text variant="displayS" color={colors.textMuted}>＋</Text>
          </View>
          <Text variant="bodySm" subtle>Add</Text>
        </Pressable>
      ) : null}
    </ScrollView>
  );
}
