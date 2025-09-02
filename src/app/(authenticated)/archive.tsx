import ArchivedDeadlines from '@/components/features/deadlines/ArchivedDeadlines';
import AppHeader from '@/components/shared/AppHeader';
import { ThemedView } from '@/components/themed';
import { useTheme } from '@/theme';
import { router } from 'expo-router';
import React from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ArchivedDeadlinesScreen() {
    const { theme } = useTheme();
    
    const handleBackPress = () => {
        router.back();
    };

    return (
        <SafeAreaView 
        edges={['bottom', 'left', 'right']}
        style={{ flex: 1, backgroundColor: theme.background }}>
            <ThemedView backgroundColor="background" style={styles.container}>
                <AppHeader title="Archived Deadlines" onBack={handleBackPress} />
                <ArchivedDeadlines />
            </ThemedView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});