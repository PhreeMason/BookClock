import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedView } from '@/components/themed';
import AppHeader from '@/components/shared/AppHeader';
import AchievementsCard from '@/components/features/achievements/AchievementsCard';
import { router } from 'expo-router';
import { useTheme } from '@/theme';

export default function AchievementsScreen() {
    const { theme } = useTheme();
    
    const handleBackPress = () => {
        router.back();
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
            <ThemedView style={styles.container}>
                <AppHeader title="Achievements" onBack={handleBackPress} />
                
                <ScrollView 
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    <AchievementsCard />
                </ScrollView>
            </ThemedView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 16,
    },
});