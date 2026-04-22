import React from 'react';
import { ScrollView, View, Pressable, useWindowDimensions } from 'react-native';
import { MotiView } from 'moti';
import { useTheme } from '@/theme/ThemeProvider';
import { Text } from '@/components/primitives/Text';
import { haptics } from '@/services/haptics';
import { radii } from '@/theme/spacing';
import { shadow } from '@/theme/shadows';

type Props = {
  value: number;
  onChange: (v: number) => void;
};

const BCS_OPTIONS = [
  { score: 1, label: 'Emaciated', body: '▁', description: 'Ribs very visible' },
  { score: 2, label: 'Very thin', body: '▂', description: 'Ribs visible, little fat' },
  { score: 3, label: 'Thin', body: '▃', description: 'Ribs easily felt' },
  { score: 4, label: 'Lean', body: '▄', description: 'Slight waist' },
  { score: 5, label: 'Ideal', body: '▅', description: 'Balanced, clear waist' },
  { score: 6, label: 'Soft', body: '▆', description: 'Slight padding' },
  { score: 7, label: 'Heavy', body: '▇', description: 'Hard to feel ribs' },
  { score: 8, label: 'Obese', body: '█', description: 'Rounded abdomen' },
  { score: 9, label: 'Very obese', body: '█', description: 'Fat deposits visible' },
];

const CARD_WIDTH = 150;
const GAP = 14;

export function BodyConditionPicker({ value, onChange }: Props) {
  const { colors } = useTheme();
  const scrollRef = React.useRef<ScrollView>(null);
  const { width } = useWindowDimensions();
  const sidePadding = Math.max(24, (width - CARD_WIDTH) / 2);

  React.useEffect(() => {
    const idx = value - 1;
    const x = idx * (CARD_WIDTH + GAP);
    scrollRef.current?.scrollTo({ x, animated: true });
  }, [value]);

  return (
    <View>
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={CARD_WIDTH + GAP}
        decelerationRate="fast"
        contentContainerStyle={{ paddingHorizontal: sidePadding, paddingVertical: 12, gap: GAP }}
      >
        {BCS_OPTIONS.map((o) => {
          const selected = o.score === value;
          return (
            <Pressable
              key={o.score}
              onPress={() => {
                haptics.selection();
                onChange(o.score);
              }}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              accessibilityLabel={`Body condition ${o.score}: ${o.label}`}
            >
              <MotiView
                animate={{
                  scale: selected ? 1 : 0.92,
                  opacity: selected ? 1 : 0.65,
                }}
                transition={{ type: 'spring', damping: 18, stiffness: 220 }}
                style={[
                  {
                    width: CARD_WIDTH,
                    height: 200,
                    borderRadius: radii.xxl,
                    backgroundColor: selected ? colors.surface : colors.surfaceAlt,
                    borderWidth: selected ? 2 : 1,
                    borderColor: selected ? colors.accent : colors.hairline,
                    padding: 16,
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  },
                  selected && shadow.md,
                ]}
              >
                <View
                  style={{
                    width: 72,
                    height: 72,
                    borderRadius: 36,
                    backgroundColor: colors.accentSoft,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginTop: 8,
                  }}
                >
                  <Text variant="displayL" color={colors.accentDeep}>
                    {o.score}
                  </Text>
                </View>
                <View style={{ alignItems: 'center', gap: 2 }}>
                  <Text variant="label" align="center">
                    {o.label}
                  </Text>
                  <Text variant="bodySm" subtle align="center">
                    {o.description}
                  </Text>
                </View>
              </MotiView>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}
