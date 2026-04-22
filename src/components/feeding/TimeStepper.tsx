import React from 'react';
import { View, Pressable } from 'react-native';
import { Text } from '@/components/primitives/Text';
import { useTheme } from '@/theme/ThemeProvider';
import { radii } from '@/theme/spacing';
import { haptics } from '@/services/haptics';

type Props = {
  minutes: number;
  onChange: (minutes: number) => void;
};

export function TimeStepper({ minutes, onChange }: Props) {
  const { colors } = useTheme();

  const m = ((minutes % 1440) + 1440) % 1440;
  const h24 = Math.floor(m / 60);
  const mm = m % 60;
  const pm = h24 >= 12;
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;

  function stepHour(delta: number) {
    haptics.selection();
    const newH = (h24 + delta + 24) % 24;
    onChange(newH * 60 + mm);
  }
  function stepMinute(delta: number) {
    haptics.selection();
    const currentStep = Math.floor(mm / 15);
    const nextStep = (currentStep + delta + 4) % 4;
    onChange(h24 * 60 + nextStep * 15);
  }
  function togglePeriod() {
    haptics.selection();
    const newH = pm ? h24 - 12 : h24 + 12;
    onChange(((newH + 24) % 24) * 60 + mm);
  }

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surfaceAlt,
        borderRadius: radii.pill,
        padding: 4,
        gap: 2,
      }}
    >
      <StepBtn label="−" onPress={() => stepHour(-1)} />
      <Text variant="button" tabular style={{ minWidth: 26, textAlign: 'center' }}>
        {h12}
      </Text>
      <StepBtn label="+" onPress={() => stepHour(1)} />

      <Text variant="button" muted style={{ marginHorizontal: 4 }}>:</Text>

      <StepBtn label="−" onPress={() => stepMinute(-1)} />
      <Text variant="button" tabular style={{ minWidth: 32, textAlign: 'center' }}>
        {mm.toString().padStart(2, '0')}
      </Text>
      <StepBtn label="+" onPress={() => stepMinute(1)} />

      <Pressable
        onPress={togglePeriod}
        style={{
          marginLeft: 6,
          paddingHorizontal: 12,
          height: 32,
          borderRadius: radii.pill,
          backgroundColor: colors.surface,
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: 1,
          borderColor: colors.hairline,
        }}
      >
        <Text variant="label">{pm ? 'PM' : 'AM'}</Text>
      </Pressable>
    </View>
  );
}

function StepBtn({ label, onPress }: { label: string; onPress: () => void }) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      hitSlop={6}
      style={{
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: colors.surface,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: colors.hairline,
      }}
    >
      <Text variant="button" color={colors.text}>
        {label}
      </Text>
    </Pressable>
  );
}
