import React from 'react';
import { View } from 'react-native';
import { Image } from 'expo-image';
import { Text } from './Text';
import { useTheme } from '@/theme/ThemeProvider';

type Props = {
  name?: string;
  uri?: string | null;
  size?: number;
};

export function Avatar({ name, uri, size = 48 }: Props) {
  const { colors } = useTheme();
  const initials = name ? name.trim().slice(0, 1).toUpperCase() : '🐾';
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: colors.accentSoft,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        borderWidth: 2,
        borderColor: colors.surface,
      }}
    >
      {uri ? (
        <Image source={{ uri }} style={{ width: size, height: size }} contentFit="cover" />
      ) : (
        <Text variant="displayS" color={colors.accentDeep}>
          {initials}
        </Text>
      )}
    </View>
  );
}
