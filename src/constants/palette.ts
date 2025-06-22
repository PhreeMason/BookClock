/**
 * Shared color palette definitions
 * This file contains the base color palette that is used throughout the app
 */

// Palette color types
export type PaletteColorName = 
  | 'chryslerBlue' | 'amethyst' | 'celadon' | 'teaGreen' | 'honeydew' | 'red'
  | 'slate' | 'gray' | 'white' | 'black' | 'blue' | 'orange' | 'green';

export type PaletteVariant = 'DEFAULT' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900';

export type PaletteColorValue = `${PaletteColorName}.${PaletteVariant}`;

// Combined color type (ThemeColorName will be defined in useThemeColor.ts)
export type ColorValue = string | PaletteColorValue;

// Base palette object
export const palette: Record<PaletteColorName, Record<string, string>> = {
  chryslerBlue: {
    DEFAULT: '#5c2eb8',
    '100': '#0a0119',
    '200': '#1e0443',
    '300': '#341275',
    '400': '#4821a0',
    '500': '#5c2eb8',
    '600': '#7954c8',
    '700': '#9679d8',
    '800': '#b89ee8',
    '900': '#dbc4f7',
  },
  amethyst: {
    DEFAULT: '#8063c5',
    '100': '#160c28',
    '200': '#2d1955',
    '300': '#442682',
    '400': '#5b33af',
    '500': '#8063c5',
    '600': '#9983d1',
    '700': '#b2a3dd',
    '800': '#cbc3e9',
    '900': '#e4e3f5',
  },
  celadon: {
    DEFAULT: '#7bc598',
    '100': '#0c2918',
    '200': '#1a5232',
    '300': '#297b4c',
    '400': '#49a366',
    '500': '#7bc598',
    '600': '#95d0ab',
    '700': '#afdbbe',
    '800': '#c9e6d1',
    '900': '#e3f1e4',
  },
  teaGreen: {
    DEFAULT: '#6dd388',
    '100': '#0b3b17',
    '200': '#17762e',
    '300': '#23b145',
    '400': '#46c264',
    '500': '#6dd388',
    '600': '#89dba0',
    '700': '#a5e3b8',
    '800': '#c1ebd0',
    '900': '#ddf3e8',
  },
  honeydew: {
    DEFAULT: '#b3f5b9',
    '100': '#003d05',
    '200': '#007a0a',
    '300': '#1fb725',
    '400': '#5ae863',
    '500': '#b3f5b9',
    '600': '#c2f7c7',
    '700': '#d1f9d5',
    '800': '#e0fbe3',
    '900': '#f0fdf1',
  },
  red: {
    DEFAULT: '#ef4444',
    '100': '#f87171',
    '200': '#ef4444',
    '300': '#dc2626',
    '400': '#b91c1c',
    '500': '#991b1b',
  },
  // Additional colors for magic strings
  slate: {
    DEFAULT: '#64748b',
    '100': '#f1f5f9',
    '200': '#e2e8f0',
    '300': '#cbd5e1',
    '400': '#94a3b8',
    '500': '#64748b',
    '600': '#475569',
    '700': '#334155',
    '800': '#1e293b',
    '900': '#0f172a',
  },
  gray: {
    DEFAULT: '#6b7280',
    '100': '#f3f4f6',
    '200': '#e5e7eb',
    '300': '#d1d5db',
    '400': '#9ca3af',
    '500': '#6b7280',
    '600': '#4b5563',
    '700': '#374151',
    '800': '#1f2937',
    '900': '#111827',
  },
  white: {
    DEFAULT: '#ffffff',
    '100': '#ffffff',
    '200': '#ffffff',
    '300': '#ffffff',
    '400': '#ffffff',
    '500': '#ffffff',
    '600': '#ffffff',
    '700': '#ffffff',
    '800': '#ffffff',
    '900': '#ffffff',
  },
  black: {
    DEFAULT: '#000000',
    '100': '#000000',
    '200': '#000000',
    '300': '#000000',
    '400': '#000000',
    '500': '#000000',
    '600': '#000000',
    '700': '#000000',
    '800': '#000000',
    '900': '#000000',
  },
  blue: {
    DEFAULT: '#0a7ea4',
    '100': '#0a7ea4',
    '200': '#0a7ea4',
    '300': '#0a7ea4',
    '400': '#0a7ea4',
    '500': '#0a7ea4',
    '600': '#0a7ea4',
    '700': '#0a7ea4',
    '800': '#0a7ea4',
    '900': '#0a7ea4',
  },
  orange: {
    DEFAULT: '#fb923c',
    '100': '#fb923c',
    '200': '#fb923c',
    '300': '#fb923c',
    '400': '#fb923c',
    '500': '#fb923c',
    '600': '#fb923c',
    '700': '#fb923c',
    '800': '#fb923c',
    '900': '#fb923c',
  },
  green: {
    DEFAULT: '#4ade80',
    '100': '#4ade80',
    '200': '#4ade80',
    '300': '#4ade80',
    '400': '#4ade80',
    '500': '#4ade80',
    '600': '#4ade80',
    '700': '#4ade80',
    '800': '#4ade80',
    '900': '#4ade80',
  },
};

/**
 * Get a palette color value
 */
export function getPaletteColor(colorValue: PaletteColorValue): string {
  const [colorName, variant] = colorValue.split('.') as [PaletteColorName, string];
  const colorPalette = palette[colorName];
  
  if (!colorPalette) {
    throw new Error(`Unknown palette color: ${colorName}`);
  }
  
  const color = colorPalette[variant];
  if (!color) {
    throw new Error(`Unknown palette variant: ${colorName}.${variant}`);
  }
  
  return color;
}

/**
 * Check if a color value is a palette color
 */
export function isPaletteColor(colorValue: ColorValue): colorValue is PaletteColorValue {
  return typeof colorValue === 'string' && colorValue.includes('.');
} 