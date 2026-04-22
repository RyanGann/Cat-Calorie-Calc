import React from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { OnboardingFrame } from '@/components/onboarding/OnboardingFrame';
import { Input, Text, Card } from '@/components/primitives';
import { useOnboardingStore } from '@/state/onboarding';
import { useSettingsStore } from '@/state/settings';
import { resolveUnitSystem, lbsToKg, kgToLbs, weightUnitLabel } from '@/utils/units';

export default function WeightStep() {
  const { draft, update } = useOnboardingStore();
  const unitPref = useSettingsStore((s) => s.unitPref);
  const system = resolveUnitSystem(unitPref);
  const label = weightUnitLabel(system);

  const [value, setValue] = React.useState<string>(() => {
    if (draft.weightKg == null) return '';
    return system === 'imperial' ? kgToLbs(draft.weightKg).toFixed(1) : draft.weightKg.toFixed(1);
  });

  const parsed = parseFloat(value);
  const weightKg = Number.isFinite(parsed)
    ? system === 'imperial'
      ? lbsToKg(parsed)
      : parsed
    : null;

  const isPlausible = weightKg != null && weightKg >= 0.5 && weightKg <= 15;
  const tooLight = weightKg != null && weightKg < 0.5;
  const tooHeavy = weightKg != null && weightKg > 15;

  return (
    <OnboardingFrame
      step={4}
      totalSteps={9}
      title={`How much does ${draft.name || 'your cat'} weigh?`}
      subtitle="An accurate weight really matters — it drives the calorie math."
      onPrimary={() => {
        if (weightKg != null) update({ weightKg });
        router.push('/(onboarding)/sex');
      }}
      primaryDisabled={weightKg == null || weightKg <= 0}
    >
      <Input
        label={`Weight (${label})`}
        placeholder={system === 'imperial' ? 'e.g. 10.5' : 'e.g. 4.5'}
        keyboardType="decimal-pad"
        value={value}
        onChangeText={(v) => setValue(v.replace(/[^0-9.]/g, ''))}
        trailingUnit={label}
        autoFocus
        helper={
          tooLight
            ? 'Seems very light — double-check?'
            : tooHeavy
            ? 'Seems very heavy — double-check?'
            : undefined
        }
      />

      <Card style={{ marginTop: 20 }} elevation="none">
        <Text variant="label" style={{ marginBottom: 6 }}>
          No scale? No problem.
        </Text>
        <Text variant="bodySm" muted>
          1. Weigh yourself on a bathroom scale.{'\n'}
          2. Pick up your cat and weigh together.{'\n'}
          3. Subtract the difference.
        </Text>
      </Card>
    </OnboardingFrame>
  );
}
