import React from 'react';
import { View, Pressable } from 'react-native';
import { router } from 'expo-router';
import { OnboardingFrame } from '@/components/onboarding/OnboardingFrame';
import { Chip, Input, Text } from '@/components/primitives';
import { useOnboardingStore } from '@/state/onboarding';
import { useTheme } from '@/theme/ThemeProvider';
import { radii } from '@/theme/spacing';

export default function AgeStep() {
  const { draft, update } = useOnboardingStore();
  const { colors } = useTheme();

  const [years, setYears] = React.useState<string>('');
  const [months, setMonths] = React.useState<string>('');

  React.useEffect(() => {
    if (draft.birthDate) {
      const now = new Date();
      const dob = new Date(draft.birthDate);
      const totalMonths = Math.max(0, Math.floor((now.getTime() - dob.getTime()) / (1000 * 60 * 60 * 24 * 30.4375)));
      setYears(Math.floor(totalMonths / 12).toString());
      setMonths((totalMonths % 12).toString());
    }
  }, []);

  const canContinue = draft.ageUnknown || years.trim().length > 0 || months.trim().length > 0;

  function handleContinue() {
    if (draft.ageUnknown) {
      update({ birthDate: null });
    } else {
      const y = parseInt(years || '0', 10);
      const m = parseInt(months || '0', 10);
      const now = new Date();
      const dob = new Date(now.getFullYear() - y, now.getMonth() - m, now.getDate());
      update({ birthDate: dob.toISOString(), ageUnknown: false });
    }
    router.push('/(onboarding)/weight');
  }

  return (
    <OnboardingFrame
      step={3}
      totalSteps={9}
      title={`How old is ${draft.name || 'your cat'}?`}
      subtitle="A rough guess is fine — it helps us pick the right calorie target."
      onPrimary={handleContinue}
      primaryDisabled={!canContinue}
    >
      <View style={{ flexDirection: 'row', gap: 12, marginBottom: 20 }}>
        <View style={{ flex: 1 }}>
          <Input
            label="Years"
            placeholder="e.g. 3"
            keyboardType="number-pad"
            value={years}
            onChangeText={(v) => {
              setYears(v.replace(/[^0-9]/g, ''));
              if (draft.ageUnknown) update({ ageUnknown: false });
            }}
            maxLength={2}
          />
        </View>
        <View style={{ flex: 1 }}>
          <Input
            label="Months"
            placeholder="e.g. 6"
            keyboardType="number-pad"
            value={months}
            onChangeText={(v) => {
              setMonths(v.replace(/[^0-9]/g, ''));
              if (draft.ageUnknown) update({ ageUnknown: false });
            }}
            maxLength={2}
          />
        </View>
      </View>

      <Pressable
        onPress={() => {
          update({ ageUnknown: !draft.ageUnknown });
          if (!draft.ageUnknown) {
            setYears('');
            setMonths('');
          }
        }}
        style={{
          padding: 16,
          backgroundColor: draft.ageUnknown ? colors.accentSoft : colors.surface,
          borderRadius: radii.xl,
          borderWidth: 1,
          borderColor: draft.ageUnknown ? colors.accent : colors.hairline,
        }}
      >
        <Text variant="label">
          {draft.ageUnknown ? '✓ I don\'t know — treat as adult' : "I don't know"}
        </Text>
        <Text variant="bodySm" subtle style={{ marginTop: 4 }}>
          We'll assume your cat is a healthy adult.
        </Text>
      </Pressable>
    </OnboardingFrame>
  );
}
