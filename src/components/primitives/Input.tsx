import React from 'react';
import {
  View,
  TextInput,
  type TextInputProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { Text } from './Text';
import { useTheme } from '@/theme/ThemeProvider';
import { radii } from '@/theme/spacing';
import { fontFamilies } from '@/theme/typography';

type Props = TextInputProps & {
  label?: string;
  helper?: string;
  error?: string;
  trailingUnit?: string;
  containerStyle?: StyleProp<ViewStyle>;
};

export const Input = React.forwardRef<TextInput, Props>(function Input(
  { label, helper, error, trailingUnit, containerStyle, ...rest },
  ref,
) {
  const { colors } = useTheme();
  const [focused, setFocused] = React.useState(false);
  return (
    <View style={containerStyle}>
      {label ? (
        <Text variant="label" muted style={{ marginBottom: 6 }}>
          {label}
        </Text>
      ) : null}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: colors.surface,
          borderRadius: radii.xl,
          borderWidth: 1.5,
          borderColor: error ? colors.error : focused ? colors.accent : colors.hairline,
          paddingHorizontal: 16,
          paddingVertical: 14,
        }}
      >
        <TextInput
          ref={ref}
          placeholderTextColor={colors.textSubtle}
          onFocus={(e) => {
            setFocused(true);
            rest.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            rest.onBlur?.(e);
          }}
          style={{
            flex: 1,
            color: colors.text,
            fontFamily: fontFamilies.body,
            fontSize: 17,
            padding: 0,
          }}
          {...rest}
        />
        {trailingUnit ? (
          <Text variant="label" muted style={{ marginLeft: 8 }}>
            {trailingUnit}
          </Text>
        ) : null}
      </View>
      {error ? (
        <Text variant="bodySm" color={colors.error} style={{ marginTop: 6 }}>
          {error}
        </Text>
      ) : helper ? (
        <Text variant="bodySm" subtle style={{ marginTop: 6 }}>
          {helper}
        </Text>
      ) : null}
    </View>
  );
});
