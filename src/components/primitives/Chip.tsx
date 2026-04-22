import React from 'react';
import { Pressable, View, type StyleProp, type ViewStyle } from 'react-native';
import { MotiView } from 'moti';
import { Text } from './Text';
import { useTheme } from '@/theme/ThemeProvider';
import { radii } from '@/theme/spacing';
import { spring } from '@/theme/motion';
import { haptics } from '@/services/haptics';

type Props = {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  leading?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  variant?: 'neutral' | 'accent';
};

export function Chip({ label, selected, onPress, leading, style, variant = 'neutral' }: Props) {
  const { colors } = useTheme();
  const bg = selected
    ? variant === 'accent'
      ? colors.accent
      : colors.text
    : colors.surfaceAlt;
  const fg = selected
    ? variant === 'accent'
      ? colors.onAccent
      : colors.surface
    : colors.text;
  const border = selected ? 'transparent' : colors.hairline;

  return (
    <Pressable
      onPress={() => {
        haptics.selection();
        onPress?.();
      }}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected: !!selected }}
      style={style}
    >
      <MotiView
        animate={{ backgroundColor: bg }}
        transition={{ type: 'timing', duration: 180 }}
        style={{
          paddingHorizontal: 16,
          height: 40,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 6,
          borderRadius: radii.pill,
          borderWidth: 1,
          borderColor: border,
        }}
      >
        {leading}
        <Text variant="label" color={fg}>{label}</Text>
      </MotiView>
    </Pressable>
  );
}
