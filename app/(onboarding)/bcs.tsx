import React from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { OnboardingFrame } from '@/components/onboarding/OnboardingFrame';
import { BodyConditionPicker } from '@/components/cats/BodyConditionPicker';
import { Text } from '@/components/primitives';
import { useOnboardingStore } from '@/state/onboarding';

export default function BcsStep() {
  const { draft, update } = useOnboardingStore();

  return (
    <OnboardingFrame
      step={6}
      totalSteps={9}
      title="How does their body look?"
      subtitle="Pick the shape that best matches your cat. 5 is ideal."
      onPrimary={() => router.push('/(onboarding)/activity')}
    >
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <BodyConditionPicker
          value={draft.bodyCondition}
          onChange={(v) => update({ bodyCondition: v })}
        />
        <View style={{ alignItems: 'center', marginTop: 24 }}>
          <Text variant="bodySm" subtle align="center" style={{ paddingHorizontal: 24 }}>
            Tip: you should be able to feel their ribs with a light touch, and see a slight waist from above.
          </Text>
        </View>
      </View>
    </OnboardingFrame>
  );
}
