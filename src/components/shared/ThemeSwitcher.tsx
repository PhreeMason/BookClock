import { ThemedText, ThemedView } from '@/components/themed';
import { ThemeMode, themeNames, useTheme } from '@/theme';
import { themes } from '@/theme/themes';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { IconSymbol } from '@/components/ui/IconSymbol';

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
    const previewColors: Record<ThemeMode, Record<'primary' | 'secondary' | 'accent', string>> = Object.fromEntries(
        Object.entries(themes).map(([key, theme]) => [
            key, {
                primary: theme.primary,
                secondary: theme.secondary,
                accent: theme.accent,
            }        
        ])
    ) as Record<ThemeMode, Record<'primary' | 'secondary' | 'accent', string>>;

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
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    themeOption: {
        alignItems: 'center',
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: 'transparent',
        width: 90
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