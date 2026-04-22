import React from 'react';
import { View } from 'react-native';
import { MotiView } from 'moti';
import { Screen, Text, Button, IconButton } from '@/components/primitives';
import { useTheme } from '@/theme/ThemeProvider';
import { router } from 'expo-router';

type Props = {
  step: number;
  totalSteps: number;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  primaryLabel?: string;
  onPrimary?: () => void;
  primaryDisabled?: boolean;
  primaryLoading?: boolean;
  secondaryLabel?: string;
  onSecondary?: () => void;
  showBack?: boolean;
};

export function OnboardingFrame({
  step,
  totalSteps,
  title,
  subtitle,
  children,
  primaryLabel = 'Continue',
  onPrimary,
  primaryDisabled,
  primaryLoading,
  secondaryLabel,
  onSecondary,
  showBack = true,
}: Props) {
  const { colors } = useTheme();
  return (
    <Screen padded>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4, marginBottom: 24 }}>
        {showBack && step > 1 ? (
          <IconButton onPress={() => router.back()} accessibilityLabel="Back">
            <Text variant="displayS" color={colors.text}>‹</Text>
          </IconButton>
        ) : (
          <View style={{ width: 44, height: 44 }} />
        )}
        <View style={{ flex: 1, flexDirection: 'row', gap: 6, justifyContent: 'center' }}>
          {Array.from({ length: totalSteps }).map((_, i) => (
            <View
              key={i}
              style={{
                height: 4,
                width: 18,
                borderRadius: 2,
                backgroundColor: i < step ? colors.accent : colors.hairline,
              }}
            />
          ))}
        </View>
        <View style={{ width: 44, height: 44 }} />
      </View>

      <MotiView
        from={{ opacity: 0, translateY: 8 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'timing', duration: 300 }}
        style={{ marginBottom: 24 }}
      >
        <Text variant="displayL">{title}</Text>
        {subtitle ? (
          <Text variant="bodyL" muted style={{ marginTop: 8 }}>
            {subtitle}
          </Text>
        ) : null}
      </MotiView>

      <View style={{ flex: 1 }}>{children}</View>

      <View style={{ gap: 10, paddingTop: 16 }}>
        <Button
          label={primaryLabel}
          onPress={onPrimary}
          disabled={primaryDisabled}
          loading={primaryLoading}
          size="lg"
          fullWidth
        />
        {secondaryLabel ? (
          <Button
            label={secondaryLabel}
            onPress={onSecondary}
            variant="ghost"
            size="md"
            fullWidth
            haptic={null}
          />
        ) : null}
      </View>
    </Screen>
  );
}
