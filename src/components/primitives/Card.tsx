import React from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { radii } from '@/theme/spacing';
import { shadow } from '@/theme/shadows';

type Elevation = 'none' | 'sm' | 'md' | 'lg';

export function Card({
  children,
  elevation = 'sm',
  padded = true,
  style,
}: {
  children: React.ReactNode;
  elevation?: Elevation;
  padded?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const { colors } = useTheme();
  return (
    <View
      style={[
        {
          backgroundColor: colors.surface,
          borderRadius: radii.xxl,
          padding: padded ? 20 : 0,
          borderWidth: 1,
          borderColor: colors.hairline,
        },
        elevation !== 'none' && shadow[elevation],
        style,
      ]}
    >
      {children}
    </View>
  );
}
