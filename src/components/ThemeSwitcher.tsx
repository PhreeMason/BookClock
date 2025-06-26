import { ThemeMode, themeNames, useTheme } from '@/theme';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { ThemedText, ThemedView } from './themed';
import { IconSymbol } from './ui/IconSymbol';

export function ThemeSwitcher() {
  const { theme, themeMode, setThemeMode, availableThemes } = useTheme();

  return (
    <ThemedView backgroundColor="card" borderColor="border" style={styles.container}>
      <ThemedText type="semiBold" style={styles.title}>
        Choose Theme
      </ThemedText>
      
        <View style={styles.themesContainer}>
          {availableThemes.map((mode) => {
            const isSelected = themeMode === mode;
            return (
              <TouchableOpacity
                key={mode}
                onPress={() => setThemeMode(mode)}
                style={[
                  styles.themeOption,
                  isSelected && { borderColor: theme.primary, borderWidth: 2 }
                ]}
              >
                <View style={styles.colorPreview}>
                  <View style={[styles.colorCircle, { backgroundColor: getThemePreviewColor(mode, 'primary') }]} />
                  <View style={[styles.colorCircle, { backgroundColor: getThemePreviewColor(mode, 'secondary') }]} />
                  <View style={[styles.colorCircle, { backgroundColor: getThemePreviewColor(mode, 'accent') }]} />
                </View>
                
                <ThemedText 
                  style={[styles.themeName, isSelected && { color: theme.primary }]}
                  type={isSelected ? 'semiBold' : 'default'}
                >
                  {themeNames[mode]}
                </ThemedText>
                
                {isSelected && (
                  <IconSymbol 
                    name="checkmark.circle.fill" 
                    size={20} 
                    color={theme.primary} 
                    style={styles.checkIcon}
                  />
                )}
              </TouchableOpacity>
            );
          })}
        </View>
    </ThemedView>
  );
}

// Helper function to get preview colors for each theme
function getThemePreviewColor(mode: ThemeMode, colorType: 'primary' | 'secondary' | 'accent'): string {
  const previewColors: Record<ThemeMode, Record<'primary' | 'secondary' | 'accent', string>> = {
    light: {
      primary: '#5c2eb8',
      secondary: '#8063c5',
      accent: '#7bc598',
    },
    dark: {
      primary: '#8063c5',
      secondary: '#5c2eb8',
      accent: '#6dd388',
    },
    nature: {
      primary: '#2d6a4f',
      secondary: '#74a892',
      accent: '#ff8c42',
    },
    ocean: {
      primary: '#0080ff',
      secondary: '#60a3bc',
      accent: '#ff6b6b',
    },
    sunset: {
      primary: '#ff6b6b',
      secondary: '#ff9a76',
      accent: '#4ecdc4',
    },
    cyberpunk: {
      primary: '#ff0080',
      secondary: '#00ffff',
      accent: '#ffff00',
    },
    neon: {
      primary: '#e94560',
      secondary: '#f39c12',
      accent: '#16213e',
    },
    volcano: {
      primary: '#ff6b35',
      secondary: '#f7931e',
      accent: '#c5392b',
    },
    galaxy: {
      primary: '#7b68ee',
      secondary: '#9370db',
      accent: '#ff69b4',
    },
    retro: {
      primary: '#d2691e',
      secondary: '#cd853f',
      accent: '#8b4513',
    },
    toxic: {
      primary: '#ccff00',
      secondary: '#76ff03',
      accent: '#64dd17',
    },
    midnight: {
      primary: '#58a6ff',
      secondary: '#79c0ff',
      accent: '#f85149',
    },
    cherry: {
      primary: '#dc143c',
      secondary: '#ff69b4',
      accent: '#ff1493',
    },
    forest: {
      primary: '#228b22',
      secondary: '#32cd32',
      accent: '#7fff00',
    },
    desert: {
      primary: '#daa520',
      secondary: '#cd853f',
      accent: '#d2691e',
    },
  };
  
  return previewColors[mode][colorType];
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 20,
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    marginBottom: 16,
  },
  themesContainer: {
    flexDirection: 'row',
    paddingHorizontal: 8,
    flexWrap: 'wrap',
  },
  themeOption: {
    alignItems: 'center',
    marginRight: 16,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'transparent',
    minWidth: 80,
  },
  colorPreview: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  colorCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginHorizontal: 2,
  },
  themeName: {
    fontSize: 14,
    marginTop: 4,
  },
  checkIcon: {
    marginTop: 4,
  },
});