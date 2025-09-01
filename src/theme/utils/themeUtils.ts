import { designTokens } from '../tokens';
import { ComputedColors, SimpleTheme, Theme } from '../types';
import { darken, lighten, mix, opacity } from './colorUtils';

export function computeColors(base: SimpleTheme, isDark: boolean): ComputedColors {
  return {
    // Text variations
    textMuted: opacity(base.text, 0.7),
    textSubtle: opacity(base.text, 0.5),
    
    // Surface variations
    surface: mix(base.background, base.text, 0.05),
    surfaceHover: mix(base.background, base.text, 0.08),
    surfacePressed: mix(base.background, base.text, 0.12),
    
    // Border variations
    border: opacity(base.text, 0.15),
    borderHover: opacity(base.text, 0.25),
    
    // Semantic colors
    danger: '#E8B4B8',
    dangerHover: darken('#E8B4B8', 0.1),
    success: '#B8A9D9',
    successHover: darken('#B8A9D9', 0.1),
    warning: '#E8B4A0',
    warningHover: darken('#E8B4A0', 0.1),
    info: base.primary,
    infoHover: isDark ? lighten(base.primary, 0.1) : darken(base.primary, 0.1),
  };
}

export function createTheme(base: SimpleTheme, isDark: boolean): Theme {
  return {
    ...base,
    ...computeColors(base, isDark),
    tokens: designTokens,
    isDark,
  };
}