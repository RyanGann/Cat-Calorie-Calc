import 'react-native-get-random-values';
import React from 'react';
import { Stack, SplashScreen } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import {
  Fraunces_400Regular,
  Fraunces_500Medium,
  Fraunces_600SemiBold,
} from '@expo-google-fonts/fraunces';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import { ThemeProvider } from '@/theme/ThemeProvider';
import { initDb } from '@/db/client';
import { seedFoodsIfNeeded } from '@/db/seed';
import { useSettingsStore } from '@/state/settings';
import { useCatsStore } from '@/state/cats';
import { configureNotificationCategories } from '@/services/notifications';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Fraunces_400Regular,
    Fraunces_500Medium,
    Fraunces_600SemiBold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  const [dbReady, setDbReady] = React.useState(false);
  const hydrateSettings = useSettingsStore((s) => s.hydrate);
  const hydrateCats = useCatsStore((s) => s.hydrate);

  React.useEffect(() => {
    (async () => {
      try {
        await initDb();
        await seedFoodsIfNeeded();
        await hydrateSettings();
        await hydrateCats();
        await configureNotificationCategories();
        setDbReady(true);
      } catch (err) {
        console.error('[init] failed', err);
        setDbReady(true);
      }
    })();
  }, [hydrateSettings, hydrateCats]);

  React.useEffect(() => {
    if (fontsLoaded && dbReady) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded, dbReady]);

  if (!fontsLoaded || !dbReady) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <StatusBar style="auto" />
          <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="(onboarding)" />
            <Stack.Screen name="(tabs)" />
          </Stack>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
