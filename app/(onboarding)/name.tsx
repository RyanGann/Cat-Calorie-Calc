import React from 'react';
import { router } from 'expo-router';
import { Input } from '@/components/primitives';
import { OnboardingFrame } from '@/components/onboarding/OnboardingFrame';
import { ONBOARDING_TOTAL_STEPS, useOnboardingStore } from '@/state/onboarding';

export default function NameStep() {
  const name = useOnboardingStore((s) => s.draft.name);
  const update = useOnboardingStore((s) => s.update);

  return (
    <OnboardingFrame
      step={1}
      totalSteps={ONBOARDING_TOTAL_STEPS}
      title="What's your cat's name?"
      primaryLabel="Continue"
      primaryDisabled={name.trim().length === 0}
      onPrimary={() => router.push('/(onboarding)/photo')}
      showBack={false}
    >
      <Input
        placeholder="e.g. Mochi"
        value={name}
        onChangeText={(v) => update({ name: v })}
        autoFocus
        autoCapitalize="words"
        returnKeyType="next"
        maxLength={40}
      />
    </OnboardingFrame>
  );
}
