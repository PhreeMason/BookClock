import { ThemedText, ThemedView } from '@/components/themed';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useDeadlines } from '@/contexts/DeadlineProvider';
import { useTheme } from '@/theme';
import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import dayjs from 'dayjs';

const ReadingStatsCards: React.FC = () => {
    const { theme } = useTheme();
    const { activeDeadlines, isLoading } = useDeadlines();

    const stats = useMemo(() => {
        if (!activeDeadlines?.length) {
            return null;
        }

        let totalPagesRead = 0;
        let totalMinutesRead = 0;
        let currentStreak = 0;
        let longestStreak = 0;
        
        // Collect all reading dates for streak calculation
        const readingDates = new Set<string>();
        
        activeDeadlines.forEach(deadline => {
            if (deadline.progress && deadline.progress.length > 0) {
                // Get current progress (total accumulated for this book)
                const latestProgress = deadline.progress[deadline.progress.length - 1];
                
                // Convert to pages for standardization
                if (deadline.format === 'physical' || deadline.format === 'ebook') {
                    // Both physical and ebook are measured in pages
                    totalPagesRead += latestProgress.current_progress;
                } else if (deadline.format === 'audio') {
                    // For audio books, current_progress is total minutes listened so far
                    totalMinutesRead += latestProgress.current_progress;
                    // Convert audio minutes to page equivalent (1.5 min per page)
                    totalPagesRead += Math.round(latestProgress.current_progress / 1.5);
                }
                
                // Collect dates for streak
                deadline.progress.forEach(entry => {
                    const date = dayjs(entry.created_at).format('YYYY-MM-DD');
                    readingDates.add(date);
                });
            }
        });

        // Calculate streaks
        const sortedDates = Array.from(readingDates).sort();
        let tempStreak = 0;
        const today = dayjs().format('YYYY-MM-DD');
        const yesterday = dayjs().subtract(1, 'day').format('YYYY-MM-DD');
        
        for (let i = 0; i < sortedDates.length; i++) {
            if (i === 0) {
                tempStreak = 1;
            } else {
                const prevDate = dayjs(sortedDates[i - 1]);
                const currDate = dayjs(sortedDates[i]);
                if (currDate.diff(prevDate, 'day') === 1) {
                    tempStreak++;
                } else {
                    longestStreak = Math.max(longestStreak, tempStreak);
                    tempStreak = 1;
                }
            }
        }
        longestStreak = Math.max(longestStreak, tempStreak);
        
        // Check if current streak is active
        if (readingDates.has(today) || readingDates.has(yesterday)) {
            currentStreak = tempStreak;
        }

        // Convert minutes to hours
        const totalHours = Math.floor(totalMinutesRead / 60);
        const remainingMinutes = totalMinutesRead % 60;

        return {
            totalPages: totalPagesRead,
            totalTime: totalHours > 0 ? `${totalHours}h ${remainingMinutes}m` : `${totalMinutesRead}m`,
            currentStreak,
            longestStreak,
            hasData: totalPagesRead > 0 || totalMinutesRead > 0
        };
    }, [activeDeadlines]);

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