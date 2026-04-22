import React from 'react';
import { Redirect } from 'expo-router';
import { useSettingsStore } from '@/state/settings';
import { useCatsStore } from '@/state/cats';

export default function IndexRoute() {
  const hasOnboarded = useSettingsStore((s) => s.hasOnboarded);
  const cats = useCatsStore((s) => s.cats);

  if (!hasOnboarded || cats.length === 0) {
    return <Redirect href="/(onboarding)/welcome" />;
  }
  return <Redirect href="/(tabs)/today" />;
}
