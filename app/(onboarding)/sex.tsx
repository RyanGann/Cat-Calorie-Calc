import React from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { OnboardingFrame } from '@/components/onboarding/OnboardingFrame';
import { Chip, Text } from '@/components/primitives';
import { ONBOARDING_TOTAL_STEPS, useOnboardingStore } from '@/state/onboarding';

export default function SexStep() {
  const { draft, update } = useOnboardingStore();

  return (
    <OnboardingFrame
      step={5}
      totalSteps={ONBOARDING_TOTAL_STEPS}
      title="A few more details"
      subtitle="Neutering and sex change calorie needs."
      onPrimary={() => router.push('/(onboarding)/bcs')}
    >
      <View style={{ gap: 20 }}>
        <View>
          <Text variant="label" muted style={{ marginBottom: 10 }}>Sex</Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Chip label="Male" selected={draft.sex === 'male'} onPress={() => update({ sex: 'male' })} />
            <Chip label="Female" selected={draft.sex === 'female'} onPress={() => update({ sex: 'female' })} />
            <Chip label="Not sure" selected={draft.sex === 'unknown'} onPress={() => update({ sex: 'unknown' })} />
          </View>
        </View>
        <View>
          <Text variant="label" muted style={{ marginBottom: 10 }}>Neutered / spayed?</Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Chip label="Yes" selected={draft.neutered === true} onPress={() => update({ neutered: true })} />
            <Chip label="No" selected={draft.neutered === false} onPress={() => update({ neutered: false })} />
          </View>
        </View>
      </View>
    </OnboardingFrame>
  );
}
