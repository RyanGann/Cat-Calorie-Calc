import React from 'react';
import { Text as RNText, type TextProps as RNTextProps, type StyleProp, type TextStyle } from 'react-native';
import { type, type TypeVariant } from '@/theme/typography';
import { useTheme } from '@/theme/ThemeProvider';

export type TextProps = RNTextProps & {
  variant?: TypeVariant;
  color?: string;
  muted?: boolean;
  subtle?: boolean;
  align?: 'left' | 'center' | 'right';
  tabular?: boolean;
};

export function Text({
  variant = 'body',
  color,
  muted,
  subtle,
  align,
  tabular,
  style,
  allowFontScaling,
  ...rest
}: TextProps) {
  const { colors } = useTheme();
  const t = type[variant] as { family: string; size: number; lineHeight: number; letterSpacing?: number };
  const resolvedColor = color ?? (subtle ? colors.textSubtle : muted ? colors.textMuted : colors.text);

  const styleObj: StyleProp<TextStyle> = [
    {
      fontFamily: t.family,
      fontSize: t.size,
      lineHeight: t.lineHeight,
      letterSpacing: t.letterSpacing ?? 0,
      color: resolvedColor,
      textAlign: align,
      fontVariant: tabular ? (['tabular-nums'] as const) : undefined,
    },
    style,
  ];

  return <RNText allowFontScaling={allowFontScaling ?? true} style={styleObj} {...rest} />;
}
