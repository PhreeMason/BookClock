import BookDetailsSection from '@/components/features/deadlines/BookDetailsSection';
import DeadlineActionButtons from '@/components/features/deadlines/DeadlineActionButtons';
import DeadlineHeroSection from '@/components/features/deadlines/DeadlineHeroSection';
import DeadlineViewHeader from '@/components/features/deadlines/DeadlineViewHeader';
import ReadingProgress from '@/components/shared/ReadingProgress';
import SwipeableCharts from '@/components/features/stats/SwipeableCharts';
import { ThemedScrollView, ThemedText, ThemedView } from '@/components/themed';
import { useDeadlines } from '@/contexts/DeadlineProvider';
import { useTheme } from '@/theme';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const DeadlineView = () => {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const { deadlines } = useDeadlines();
    const { theme } = useTheme();
    const backgroundColor = theme.surfaceHover;

    const deadline = deadlines.find(d => d.id === id);
    if (!deadline) {
        return (
            <ThemedView style={styles.container}>
                <ThemedText>Deadline not found</ThemedText>
            </ThemedView>
        );
    }

    const handleEdit = () => {
        router.push(`/deadline/${id}/edit`);
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor }]}>
            <DeadlineViewHeader
                onBack={() => router.push('/')}
                onEdit={handleEdit}
            />

            <ThemedScrollView style={styles.content}>
                <DeadlineHeroSection deadline={deadline} />
                
                <ReadingProgress deadline={deadline} />

                <SwipeableCharts deadline={deadline} />


                <BookDetailsSection deadline={deadline} />

                <DeadlineActionButtons
                    deadline={deadline}
                />
            </ThemedScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        padding: 20,
    },
});

export default DeadlineView;