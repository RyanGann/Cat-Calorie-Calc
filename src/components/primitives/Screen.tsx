import React from 'react';
import { View, ScrollView, KeyboardAvoidingView, Platform, type ViewStyle, type StyleProp } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/theme/ThemeProvider';

type Props = {
  children: React.ReactNode;
  scroll?: boolean;
  padded?: boolean;
  keyboardAvoid?: boolean;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
};

export function Screen({
  children,
  scroll,
  padded = true,
  keyboardAvoid,
  style,
  contentStyle,
  edges = ['top', 'bottom'],
}: Props) {
  const { colors } = useTheme();
  const basePadding = padded ? { paddingHorizontal: 20, paddingBottom: 24 } : null;
  const content = scroll ? (
    <ScrollView
      contentContainerStyle={[basePadding, contentStyle]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[{ flex: 1 }, basePadding, contentStyle]}>{children}</View>
  );

  const wrapped = keyboardAvoid ? (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1 }}
    >
      {content}
    </KeyboardAvoidingView>
  ) : (
    content
  );

  return (
    <SafeAreaView edges={edges} style={[{ flex: 1, backgroundColor: colors.canvas }, style]}>
      {wrapped}
    </SafeAreaView>
  );
}
