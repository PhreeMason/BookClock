import { SimpleTheme, Theme, ComputedColors } from '../types';
import { designTokens } from '../tokens';
import { opacity, mix, lighten, darken } from './colorUtils';

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
    danger: '#ef4444',
    dangerHover: darken('#ef4444', 0.1),
    success: '#10b981',
    successHover: darken('#10b981', 0.1),
    warning: '#f59e0b',
    warningHover: darken('#f59e0b', 0.1),
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