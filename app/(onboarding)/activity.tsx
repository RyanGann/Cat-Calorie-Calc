import React from 'react';
import { View, Pressable } from 'react-native';
import { MotiView } from 'moti';
import { router } from 'expo-router';
import { OnboardingFrame } from '@/components/onboarding/OnboardingFrame';
import { Text } from '@/components/primitives';
import { ONBOARDING_TOTAL_STEPS, useOnboardingStore } from '@/state/onboarding';
import { useTheme } from '@/theme/ThemeProvider';
import { radii } from '@/theme/spacing';
import { haptics } from '@/services/haptics';
import type { ActivityLevel } from '@/domain/types';

const OPTIONS: Array<{ value: ActivityLevel; label: string; description: string; emoji: string }> = [
  { value: 'low', label: 'Couch loaf', description: 'Mostly sleeps, rarely plays', emoji: '🛋️' },
  { value: 'moderate', label: 'Plays a few times a day', description: 'Normal indoor activity', emoji: '🧶' },
  { value: 'high', label: 'Zoomies champion', description: 'Very active, outdoor access', emoji: '💨' },
];

export default function ActivityStep() {
  const { draft, update } = useOnboardingStore();
  const { colors } = useTheme();

  return (
    <OnboardingFrame
      step={7}
      totalSteps={ONBOARDING_TOTAL_STEPS}
      title="How active are they?"
      onPrimary={() => router.push('/(onboarding)/reveal')}
    >
      <View style={{ gap: 12 }}>
        {OPTIONS.map((o) => {
          const selected = draft.activityLevel === o.value;
          return (
            <Pressable
              key={o.value}
              onPress={() => {
                haptics.selection();
                update({ activityLevel: o.value });
              }}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
            >
              <MotiView
                animate={{
                  backgroundColor: selected ? colors.accentSoft : colors.surface,
                  borderColor: selected ? colors.accent : colors.hairline,
                }}
                transition={{ type: 'timing', duration: 180 }}
                style={{
                  padding: 20,
                  borderRadius: radii.xxl,
                  borderWidth: 1.5,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 16,
                }}
              >
                <Text variant="displayM">{o.emoji}</Text>
                <View style={{ flex: 1 }}>
                  <Text variant="displayS">{o.label}</Text>
                  <Text variant="bodySm" muted style={{ marginTop: 2 }}>
                    {o.description}
                  </Text>
                </View>
              </MotiView>
            </Pressable>
          );
        })}
      </View>
    </OnboardingFrame>
  );
}
