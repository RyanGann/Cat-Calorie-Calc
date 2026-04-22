import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

export const haptics = {
  selection() {
    if (Platform.OS === 'web') return;
    Haptics.selectionAsync().catch(() => {});
  },
  impact(style: 'light' | 'medium' | 'heavy' = 'light') {
    if (Platform.OS === 'web') return;
    const map = {
      light: Haptics.ImpactFeedbackStyle.Light,
      medium: Haptics.ImpactFeedbackStyle.Medium,
      heavy: Haptics.ImpactFeedbackStyle.Heavy,
    };
    Haptics.impactAsync(map[style]).catch(() => {});
  },
  success() {
    if (Platform.OS === 'web') return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
  },
  warning() {
    if (Platform.OS === 'web') return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
  },
};
