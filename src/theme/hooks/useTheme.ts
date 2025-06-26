import { useContext } from 'react';
import { ThemeContext } from '../components/ThemeProvider';

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

export function useThemeColor() {
  const { theme } = useTheme();
  
  return (colorName: keyof typeof theme | string): string => {
    // Check if it's a theme color
    if (colorName in theme) {
      return theme[colorName as keyof typeof theme] as string;
    }
    
    // Return as-is if it's a hex color or other value
    return colorName;
  };
}