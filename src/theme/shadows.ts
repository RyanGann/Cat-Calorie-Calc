import type { ViewStyle } from 'react-native';

export const shadow = {
  none: {} as ViewStyle,
  sm: {
    shadowColor: '#1C1916',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  } as ViewStyle,
  md: {
    shadowColor: '#1C1916',
    shadowOpacity: 0.1,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 5,
  } as ViewStyle,
  lg: {
    shadowColor: '#1C1916',
    shadowOpacity: 0.14,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 14 },
    elevation: 10,
  } as ViewStyle,
} as const;
