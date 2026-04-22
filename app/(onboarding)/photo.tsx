import React from 'react';
import { View, Pressable, Alert } from 'react-native';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import { OnboardingFrame } from '@/components/onboarding/OnboardingFrame';
import { Text } from '@/components/primitives';
import { useOnboardingStore } from '@/state/onboarding';
import { useTheme } from '@/theme/ThemeProvider';
import { radii } from '@/theme/spacing';
import { haptics } from '@/services/haptics';

export default function PhotoStep() {
  const photoUri = useOnboardingStore((s) => s.draft.photoUri);
  const name = useOnboardingStore((s) => s.draft.name);
  const update = useOnboardingStore((s) => s.update);
  const { colors } = useTheme();

  async function pick(from: 'library' | 'camera') {
    const perm =
      from === 'camera'
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permission needed', `Whiskr needs access to your ${from === 'camera' ? 'camera' : 'photos'} to pick a picture.`);
      return;
    }
    const result =
      from === 'camera'
        ? await ImagePicker.launchCameraAsync({ allowsEditing: true, aspect: [1, 1], quality: 0.7 })
        : await ImagePicker.launchImageLibraryAsync({ allowsEditing: true, aspect: [1, 1], quality: 0.7 });
    if (!result.canceled && result.assets[0]?.uri) {
      haptics.success();
      update({ photoUri: result.assets[0].uri });
    }
  }

  return (
    <OnboardingFrame
      step={2}
      totalSteps={9}
      title={`Let's see ${name || 'your cat'}`}
      subtitle="Adding a photo makes reminders cozier. You can skip for now."
      onPrimary={() => router.push('/(onboarding)/age')}
      secondaryLabel="Skip"
      onSecondary={() => router.push('/(onboarding)/age')}
    >
      <View style={{ alignItems: 'center', gap: 16, marginTop: 12 }}>
        <Pressable onPress={() => pick('library')}>
          <View
            style={{
              width: 180,
              height: 180,
              borderRadius: 90,
              backgroundColor: colors.accentSoft,
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              borderWidth: photoUri ? 0 : 2,
              borderColor: colors.hairline,
              borderStyle: 'dashed',
            }}
          >
            {photoUri ? (
              <Image source={{ uri: photoUri }} style={{ width: 180, height: 180 }} contentFit="cover" />
            ) : (
              <Text variant="displayXL">📸</Text>
            )}
          </View>
        </Pressable>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <Pressable
            onPress={() => pick('library')}
            style={{
              paddingHorizontal: 20,
              paddingVertical: 12,
              borderRadius: radii.pill,
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: colors.hairline,
            }}
          >
            <Text variant="label">From library</Text>
          </Pressable>
          <Pressable
            onPress={() => pick('camera')}
            style={{
              paddingHorizontal: 20,
              paddingVertical: 12,
              borderRadius: radii.pill,
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: colors.hairline,
            }}
          >
            <Text variant="label">Take photo</Text>
          </Pressable>
        </View>
      </View>
    </OnboardingFrame>
  );
}
