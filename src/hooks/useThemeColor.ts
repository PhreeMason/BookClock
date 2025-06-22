/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import { Colors } from '@/constants/Colors';
import {
    PaletteColorValue,
    getPaletteColor,
    isPaletteColor
} from '@/constants/palette';
import { useColorScheme } from '@/hooks/useColorScheme';

// Theme color types
export type ThemeColorName = keyof typeof Colors.light & keyof typeof Colors.dark;

// Combined color type
export type ColorValue = ThemeColorName | PaletteColorValue | string;

// Re-export types for backward compatibility
export type { PaletteColorValue } from '@/constants/palette';

/**
 * Enhanced useThemeColor hook that supports palette colors
 */
export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: ColorValue
): string {
  const theme = useColorScheme() ?? 'light';
  const colorFromProps = props[theme];

  if (colorFromProps) {
    return colorFromProps;
  }

  // Handle palette colors
  if (isPaletteColor(colorName)) {
    return getPaletteColor(colorName);
  }

  // Handle theme colors
  if (typeof colorName === 'string' && colorName in Colors[theme]) {
    return Colors[theme][colorName as ThemeColorName];
  }

  // Fallback to the color value as-is (for direct hex values)
  return colorName;
}
