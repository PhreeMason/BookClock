import { ThemedText, ThemedView } from '@/components/themed';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useDeadlines } from '@/contexts/DeadlineProvider';
import { useTheme } from '@/theme';
import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import dayjs from 'dayjs';

const ReadingStatsCards: React.FC = () => {
    const { theme } = useTheme();
    const { activeDeadlines, completedDeadlines, isLoading } = useDeadlines();

    const stats = useMemo(() => {
        const allDeadlines = [...(activeDeadlines || []), ...(completedDeadlines || [])];

        if (!allDeadlines.length) {
            return null;
        }

        let totalPagesRead = 0;
        let totalMinutesRead = 0;
        let longestStreak = 0;
        
        const readingDates = new Set<string>();
        
        allDeadlines.forEach(deadline => {
            if (deadline.progress && deadline.progress.length > 0) {
                const latestProgress = deadline.progress[deadline.progress.length - 1];
                
                if (deadline.format === 'physical' || deadline.format === 'ebook') {
                    totalPagesRead += latestProgress.current_progress;
                } else if (deadline.format === 'audio') {
                    totalMinutesRead += latestProgress.current_progress;
                    totalPagesRead += Math.round(latestProgress.current_progress / 1.5);
                }
                
                deadline.progress.forEach(entry => {
                    const date = dayjs(entry.created_at).format('YYYY-MM-DD');
                    readingDates.add(date);
                });
            }
        });

        const sortedDates = Array.from(readingDates).sort();
        let currentStreak = 0;
        let tempStreak = 0;

        if (sortedDates.length > 0) {
            const today = dayjs().format('YYYY-MM-DD');
            const yesterday = dayjs().subtract(1, 'day').format('YYYY-MM-DD');

            // Check if the streak is current
            const lastReadingDate = sortedDates[sortedDates.length - 1];
            if (lastReadingDate === today || lastReadingDate === yesterday) {
                // Calculate current streak by going backwards
                currentStreak = 1;
                for (let i = sortedDates.length - 1; i > 0; i--) {
                    const curr = dayjs(sortedDates[i]);
                    const prev = dayjs(sortedDates[i - 1]);
                    if (curr.diff(prev, 'day') === 1) {
                        currentStreak++;
                    } else {
                        break;
                    }
                }
            }

            // Calculate the longest streak
            tempStreak = 1;
            longestStreak = 1;
            for (let i = 1; i < sortedDates.length; i++) {
                const curr = dayjs(sortedDates[i]);
                const prev = dayjs(sortedDates[i - 1]);
                if (curr.diff(prev, 'day') === 1) {
                    tempStreak++;
                } else {
                    longestStreak = Math.max(longestStreak, tempStreak);
                    tempStreak = 1;
                }
            }
            longestStreak = Math.max(longestStreak, tempStreak);
        }

        const totalHours = Math.floor(totalMinutesRead / 60);
        const remainingMinutes = totalMinutesRead % 60;

        return {
            totalPages: totalPagesRead,
            totalTime: totalHours > 0 ? `${totalHours}h ${remainingMinutes}m` : `${totalMinutesRead}m`,
            currentStreak,
            longestStreak,
            hasData: totalPagesRead > 0 || totalMinutesRead > 0
        };
    }, [activeDeadlines, completedDeadlines]);

    if (isLoading || !stats?.hasData) {
        return null;
    }

    return (
        <ThemedView backgroundColor="card" borderColor="border" style={styles.container}>
            <View style={styles.header}>
                <IconSymbol name="chart.bar.fill" size={24} color={theme.primary} />
                <ThemedText type="semiBold" style={styles.title}>
                    Reading Statistics
                </ThemedText>
            </View>

            <View style={styles.statsGrid}>
                <View style={styles.statCard}>
                    <IconSymbol name="books.vertical" size={20} color={theme.primary} />
                    <ThemedText style={styles.statValue}>
                        {stats.totalPages.toLocaleString()}
                    </ThemedText>
                    <ThemedText color="textMuted" style={styles.statLabel}>
                        Total pages
                    </ThemedText>
                </View>

                <View style={styles.statCard}>
                    <IconSymbol name="clock.fill" size={20} color={theme.primary} />
                    <ThemedText style={styles.statValue}>
                        {stats.totalTime}
                    </ThemedText>
                    <ThemedText color="textMuted" style={styles.statLabel}>
                        Audio time
                    </ThemedText>
                </View>

                <View style={styles.statCard}>
                    <IconSymbol name="chart.bar.fill" size={20} color={theme.primary} />
                    <ThemedText style={styles.statValue}>
                        {stats.currentStreak}
                    </ThemedText>
                    <ThemedText color="textMuted" style={styles.statLabel}>
                        Current streak
                    </ThemedText>
                </View>

                <View style={styles.statCard}>
                    <IconSymbol name="checkmark.circle.fill" size={20} color={theme.primary} />
                    <ThemedText style={styles.statValue}>
                        {stats.longestStreak}
                    </ThemedText>
                    <ThemedText color="textMuted" style={styles.statLabel}>
                        Best streak
                    </ThemedText>
                </View>
            </View>
        </ThemedView>
    );
};

const styles = StyleSheet.create({
    container: {
        borderRadius: 12,
        borderWidth: 1,
        padding: 20,
        marginBottom: 20,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 18,
        marginLeft: 12,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginHorizontal: -8,
    },
    statCard: {
        width: '50%',
        paddingHorizontal: 8,
        marginBottom: 16,
        alignItems: 'center',
    },
    statValue: {
        fontSize: 24,
        fontWeight: '700',
        marginVertical: 4,
    },
    statLabel: {
        fontSize: 12,
        textAlign: 'center',
    },
});

export default ReadingStatsCards;