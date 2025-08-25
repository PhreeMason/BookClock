import AppHeader from '@/components/shared/AppHeader';
import { ThemeSwitcher } from '@/components/shared/ThemeSwitcher';
import { ThemedView } from '@/components/themed';
import { useTheme } from '@/theme';
import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ThemeScreen() {
    const { theme } = useTheme();
    
    const handleBackPress = () => {
        router.back();
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
            <ThemedView backgroundColor="background" style={styles.container}>
                <AppHeader title="Appearance" onBack={handleBackPress} />
                
                <View style={styles.content}>
                    <ThemeSwitcher />
                </View>
            </ThemedView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 20,
    },
});