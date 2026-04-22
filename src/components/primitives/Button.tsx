import React from 'react';
import { Pressable, View, ActivityIndicator, type ViewStyle, type StyleProp } from 'react-native';
import { MotiView } from 'moti';
import { Text } from './Text';
import { useTheme } from '@/theme/ThemeProvider';
import { haptics } from '@/services/haptics';
import { radii } from '@/theme/spacing';
import { spring } from '@/theme/motion';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'md' | 'lg' | 'xl';

type Props = {
  onPress?: () => void;
  label: string;
  variant?: Variant;
  size?: Size;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
  haptic?: 'selection' | 'light' | 'medium' | 'success' | null;
  style?: StyleProp<ViewStyle>;
  accessibilityHint?: string;
  testID?: string;
};

export function Button({
  onPress,
  label,
  variant = 'primary',
  size = 'md',
  disabled,
  loading,
  fullWidth,
  leading,
  trailing,
  haptic = 'selection',
  style,
  accessibilityHint,
  testID,
}: Props) {
  const { colors } = useTheme();
  const [pressed, setPressed] = React.useState(false);

  const heights: Record<Size, number> = { md: 48, lg: 56, xl: 64 };
  const paddingsH: Record<Size, number> = { md: 20, lg: 24, xl: 28 };
  const radius = size === 'xl' ? radii.xxl : radii.xl;

  const bg =
    variant === 'primary' ? colors.accent :
    variant === 'danger' ? colors.error :
    variant === 'secondary' ? colors.surface :
    'transparent';
  const fg =
    variant === 'primary' ? colors.onAccent :
    variant === 'danger' ? '#FFFFFF' :
    variant === 'secondary' ? colors.text :
    colors.accent;
  const border = variant === 'secondary' ? colors.hairline : 'transparent';

  const handle = () => {
    if (disabled || loading) return;
    if (haptic === 'selection') haptics.selection();
    else if (haptic === 'success') haptics.success();
    else if (haptic) haptics.impact(haptic);
    onPress?.();
  };

  return (
    <Pressable
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      onPress={handle}
      disabled={disabled || loading}
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled, busy: !!loading }}
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      testID={testID}
      style={[{ alignSelf: fullWidth ? 'stretch' : 'auto' }, style]}
    >
      <MotiView
        animate={{ scale: pressed ? 0.97 : 1, opacity: disabled ? 0.5 : 1 }}
        transition={{ type: 'spring', ...spring.snap }}
        style={{
          height: heights[size],
          paddingHorizontal: paddingsH[size],
          borderRadius: radius,
          backgroundColor: bg,
          borderWidth: variant === 'secondary' ? 1 : 0,
          borderColor: border,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
        }}
      >
        {loading ? (
          <ActivityIndicator color={fg} />
        ) : (
          <>
            {leading}
            <Text variant="button" color={fg}>{label}</Text>
            {trailing}
          </>
        )}
      </MotiView>
    </Pressable>
  );
}

export function IconButton({
  onPress,
  children,
  accessibilityLabel,
  disabled,
  size = 44,
  style,
}: {
  onPress?: () => void;
  children: React.ReactNode;
  accessibilityLabel: string;
  disabled?: boolean;
  size?: number;
  style?: StyleProp<ViewStyle>;
}) {
  const { colors } = useTheme();
  const [pressed, setPressed] = React.useState(false);
  return (
    <Pressable
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      onPress={() => {
        if (disabled) return;
        haptics.selection();
        onPress?.();
      }}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      hitSlop={8}
      style={style}
    >
      <MotiView
        animate={{ scale: pressed ? 0.92 : 1, opacity: disabled ? 0.4 : 1 }}
        transition={{ type: 'spring', ...spring.snap }}
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: colors.surfaceAlt,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {children}
      </MotiView>
    </Pressable>
  );
}
