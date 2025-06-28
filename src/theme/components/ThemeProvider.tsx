import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useEffect, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';
import { themes } from '../themes';
import { ThemeContextValue, ThemeMode } from '../types';
import { createTheme } from '../utils/themeUtils';

const THEME_STORAGE_KEY = '@app_theme_mode';

export const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeMode] = useState<ThemeMode>('light');
  const [isLoading, setIsLoading] = useState(true);

  // Load saved theme preference
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        const isSystemDark = systemColorScheme === 'dark';
        
        if (savedTheme && savedTheme in themes) {
          const savedThemeData = themes[savedTheme as ThemeMode];
          // Check if saved theme matches system dark/light mode
          if (savedThemeData.isDark === isSystemDark) {
            setThemeMode(savedTheme as ThemeMode);
          } else {
            // Switch to appropriate default theme for system mode
            setThemeMode(isSystemDark ? 'dark' : 'light');
          }
        } else {
          // No saved theme, use system default
          setThemeMode(isSystemDark ? 'dark' : 'light');
        }
      } catch (error) {
        console.error('Error loading theme:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadTheme();
  }, [systemColorScheme]);

  // Save theme preference
  const handleSetThemeMode = async (mode: ThemeMode) => {
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
      setThemeMode(mode);
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  // Create theme object
  const theme = useMemo(() => {
    const baseTheme = themes[themeMode];
    const isDark = themes[themeMode].isDark
    return createTheme(baseTheme, isDark);
  }, [themeMode]);

  // Filter available themes based on system color scheme
  const availableThemes = useMemo(() => {
    const allThemes = Object.keys(themes) as ThemeMode[];
    const isSystemDark = systemColorScheme === 'dark';
    
    return allThemes.filter(themeName => {
      const themeData = themes[themeName];
      return themeData.isDark === isSystemDark;
    });
  }, [systemColorScheme]);

  const value: ThemeContextValue = {
    theme,
    themeMode,
    setThemeMode: handleSetThemeMode,
    availableThemes,
  };

  if (isLoading) {
    return null; // Or a loading component
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}