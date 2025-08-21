import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { ThemedView } from '@/components/themed';
import AchievementsCard from '@/components/features/achievements/AchievementsCard';

export default function AchievementsScreen() {
    return (
        <ThemedView style={styles.container}>
            <ScrollView 
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <AchievementsCard />
            </ScrollView>
        </ThemedView>
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