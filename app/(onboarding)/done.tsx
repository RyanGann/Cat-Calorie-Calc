import React from 'react';
import { View, Alert } from 'react-native';
import { router } from 'expo-router';
import { MotiView } from 'moti';
import { Button, Screen, Text } from '@/components/primitives';
import { useOnboardingStore } from '@/state/onboarding';
import { useCatsStore } from '@/state/cats';
import { useSettingsStore } from '@/state/settings';
import { insertCat } from '@/db/repositories/cats';
import { estimateDailyKcal, deriveLifeStage, ageInMonths } from '@/domain/calories';
import { ensurePermissions } from '@/services/notifications';
import { useTheme } from '@/theme/ThemeProvider';
import { haptics } from '@/services/haptics';

export default function DoneStep() {
  const { draft, reset } = useOnboardingStore();
  const upsert = useCatsStore((s) => s.upsertLocal);
  const setActive = useCatsStore((s) => s.setActiveCatId);
  const setSettings = useSettingsStore((s) => s.set);
  const remindersOn = useSettingsStore((s) => s.remindersOn);
  const { colors } = useTheme();
  const [saving, setSaving] = React.useState(false);

  async function finish(enableReminders: boolean) {
    if (draft.weightKg == null || draft.name.trim().length === 0) {
      Alert.alert('Oops', 'Missing required info.');
      return;
    }
    setSaving(true);
    try {
      const months = ageInMonths(draft.birthDate);
      const lifeStage = deriveLifeStage(months);
      const calc = estimateDailyKcal({
        weightKg: draft.weightKg,
        birthDate: draft.birthDate,
        sex: draft.sex,
        neutered: draft.neutered,
        bodyCondition: draft.bodyCondition,
        activityLevel: draft.activityLevel,
      });
      const cat = await insertCat({
        name: draft.name.trim(),
        photoUri: draft.photoUri,
        sex: draft.sex,
        neutered: draft.neutered,
        birthDate: draft.birthDate,
        weightKg: draft.weightKg,
        bodyCondition: draft.bodyCondition,
        activityLevel: draft.activityLevel,
        lifeStage,
        mealGoalKcal: calc.kcal,
      });
      upsert(cat);
      setActive(cat.id);

      if (enableReminders) {
        const granted = await ensurePermissions();
        await setSettings({ remindersOn: granted });
      } else {
        await setSettings({ remindersOn: false });
      }
      await setSettings({ hasOnboarded: true });
      reset();
      haptics.success();
      router.replace('/(tabs)/today');
    } catch (err) {
      console.error('[onboarding] save failed', err);
      Alert.alert('Something went wrong', 'Please try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Screen padded>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 }}>
        <MotiView
          from={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', damping: 12, stiffness: 140 }}
          style={{
            width: 140,
            height: 140,
            borderRadius: 70,
            backgroundColor: colors.accentSoft,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text variant="displayXL">🎉</Text>
        </MotiView>
        <Text variant="displayL" align="center" style={{ marginTop: 20 }}>
          You're all set.
        </Text>
        <Text variant="bodyL" muted align="center" style={{ paddingHorizontal: 16 }}>
          Want us to remind you when it's time to feed {draft.name || 'your cat'}?
        </Text>
      </View>
      <View style={{ gap: 10 }}>
        <Button
          label="Yes, send me reminders"
          size="lg"
          fullWidth
          loading={saving}
          onPress={() => finish(true)}
        />
        <Button
          label="Not now"
          variant="ghost"
          size="md"
          fullWidth
          haptic={null}
          onPress={() => finish(false)}
        />
      </View>
    </Screen>
  );
}
