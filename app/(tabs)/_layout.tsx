import React from 'react';
import { Tabs } from 'expo-router';
import { Platform, View } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { Text } from '@/components/primitives';

function TabIcon({ label, focused, color }: { label: string; focused: boolean; color: string }) {
  return (
    <View style={{ alignItems: 'center', width: 48 }}>
      <Text variant="displayS" color={color}>
        {label}
      </Text>
    </View>
  );
}

export default function TabsLayout() {
  const { colors } = useTheme();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.hairline,
          height: Platform.OS === 'ios' ? 86 : 70,
          paddingTop: 6,
        },
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textSubtle,
        tabBarLabelStyle: { fontSize: 11, fontFamily: 'Inter_500Medium' },
      }}
    >
      <Tabs.Screen
        name="today"
        options={{
          title: 'Today',
          tabBarIcon: ({ focused, color }) => <TabIcon label="◐" focused={focused} color={color} />,
        }}
      />
      <Tabs.Screen
        name="foods"
        options={{
          title: 'Foods',
          tabBarIcon: ({ focused, color }) => <TabIcon label="◆" focused={focused} color={color} />,
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          tabBarIcon: ({ focused, color }) => <TabIcon label="≡" focused={focused} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ focused, color }) => <TabIcon label="☰" focused={focused} color={color} />,
        }}
      />
    </Tabs>
  );
}
