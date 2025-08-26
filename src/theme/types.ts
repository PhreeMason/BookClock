export interface SimpleTheme {
  text: string;
  background: string;
  primary: string;
  secondary: string;
  accent: string;
  isDark: boolean;
}

export interface DesignTokens {
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
  };
  radius: {
    sm: number;
    md: number;
    lg: number;
    xl: number;
    full: number;
  };
  fontSize: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
  };
  fontWeight: {
    normal: string;
    medium: string;
    semibold: string;
    bold: string;
  };
  lineHeight: {
    tight: number;
    normal: number;
    relaxed: number;
  };
  shadow: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
}

export interface ComputedColors {
  textMuted: string;
  textSubtle: string;
  surface: string;
  surfaceHover: string;
  surfacePressed: string;
  border: string;
  borderHover: string;
  danger: string;
  dangerHover: string;
  success: string;
  successHover: string;
  warning: string;
  warningHover: string;
  info: string;
  infoHover: string;
}

export interface Theme extends SimpleTheme, ComputedColors {
  tokens: DesignTokens;
  isDark: boolean;
}

export type ThemeMode = 'light' | 'dark' | 'nature' | 'ocean' 
| 'sunset' | 'cyberpunk' | 'neon' | 'volcano' | 'galaxy' | 'retro' 
| 'toxic' | 'midnight' | 'cherry' | 'forest' | 'desert' | 'bae' | 'bookish' 
| 'twilightRead' | 'cozyLibrary' | 'sunsetPage' | 'dreamyRead' | 'neonTokyo' 
| 'copperPunk' | 'acidDream' | 'velvetRebellion' | 'holographic' | 'biomechanical' 
| 'plasmaStorm' | 'rustPunk' | 'quantumFlux' | 'viralGreen' | 'blushNavy' | 'corporate' 
| 'engineering' | 'vibrant'| 'deepPlum';

export interface ThemeContextValue {
  theme: Theme;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  availableThemes: ThemeMode[];
}