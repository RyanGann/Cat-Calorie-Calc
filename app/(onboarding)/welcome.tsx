import React from 'react';
import { View } from 'react-native';
import { MotiView } from 'moti';
import { router } from 'expo-router';
import { Screen, Text, Button } from '@/components/primitives';
import { useTheme } from '@/theme/ThemeProvider';
import { useOnboardingStore } from '@/state/onboarding';

export default function Welcome() {
  const { colors } = useTheme();
  const reset = useOnboardingStore((s) => s.reset);

  return (
    <Screen padded>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <MotiView
          from={{ opacity: 0, scale: 0.9, translateY: 20 }}
          animate={{ opacity: 1, scale: 1, translateY: 0 }}
          transition={{ type: 'spring', damping: 14, stiffness: 140 }}
          style={{
            width: 160,
            height: 160,
            borderRadius: 80,
            backgroundColor: colors.accentSoft,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 32,
          }}
        >
          <Text variant="displayXL">🐈</Text>
        </MotiView>
        <Text variant="displayXL" align="center">
          Hi, I'm Whiskr.
        </Text>
        <Text variant="bodyL" muted align="center" style={{ marginTop: 16, paddingHorizontal: 16 }}>
          I'll help you feed your cat the right amount, at the right times — so they can live a long, happy life.
        </Text>
      </View>
      <Button
        label="Let's get started"
        size="lg"
        fullWidth
        onPress={() => {
          reset();
          router.push('/(onboarding)/name');
        }}
      />
    </Screen>
  );
}
