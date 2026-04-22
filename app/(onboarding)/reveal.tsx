import React from 'react';
import { View, Pressable } from 'react-native';
import { MotiView } from 'moti';
import { router } from 'expo-router';
import { OnboardingFrame } from '@/components/onboarding/OnboardingFrame';
import { Card, Text } from '@/components/primitives';
import { useOnboardingStore } from '@/state/onboarding';
import { estimateDailyKcal, deriveLifeStage, ageInMonths, VET_DISCLAIMER } from '@/domain/calories';
import { useTheme } from '@/theme/ThemeProvider';
import { radii } from '@/theme/spacing';

export default function RevealStep() {
  const { draft, update } = useOnboardingStore();
  const { colors } = useTheme();
  const [showWhy, setShowWhy] = React.useState(false);

  React.useEffect(() => {
    if (draft.weightKg == null) {
      router.replace('/(onboarding)/weight');
    }
  }, [draft.weightKg]);

  if (draft.weightKg == null) {
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

  return (
    <OnboardingFrame
      step={8}
      totalSteps={9}
      title={`${draft.name || 'Your cat'} needs`}
      onPrimary={() => router.push('/(onboarding)/done')}
      primaryLabel="Looks good"
    >
      <View style={{ alignItems: 'center', marginVertical: 16 }}>
        <MotiView
          from={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', damping: 12, stiffness: 140 }}
        >
          <Text variant="displayXL" color={colors.accent}>
            {result.kcal}
          </Text>
        </MotiView>
        <Text variant="bodyL" muted>kcal per day</Text>
      </View>

      <Pressable onPress={() => setShowWhy((v) => !v)}>
        <Card elevation="none" padded>
          <Text variant="label">
            {showWhy ? '▾ Why this number' : '▸ Why this number'}
          </Text>
          {showWhy ? (
            <View style={{ marginTop: 10, gap: 6 }}>
              {result.rationale.map((r, i) => (
                <Text key={i} variant="bodySm" muted>• {r}</Text>
              ))}
            </View>
          ) : null}
        </Card>
      </Pressable>

      <View
        style={{
          marginTop: 12,
          padding: 14,
          borderRadius: radii.lg,
          backgroundColor: colors.surfaceAlt,
        }}
      >
        <Text variant="bodySm" muted>
          ⚠︎ {VET_DISCLAIMER}
        </Text>
      </View>
    </OnboardingFrame>
  );
}
