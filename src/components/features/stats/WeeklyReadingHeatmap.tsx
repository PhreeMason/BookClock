import { ThemedText, ThemedView } from '@/components/themed';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useDeadlines } from '@/contexts/DeadlineProvider';
import { useTheme } from '@/theme';
import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';

dayjs.extend(isoWeek);

interface DayData {
    date: string;
    dayOfWeek: number;
    weekNumber: number;
    readingCount: number;
    intensity: 0 | 1 | 2 | 3 | 4; // 0 = no reading, 1-4 = intensity levels
}

const WeeklyReadingHeatmap: React.FC = () => {
    const { theme } = useTheme();
    const { activeDeadlines, isLoading } = useDeadlines();

    // Process reading data
    const heatmapData = useMemo(() => {
        if (!activeDeadlines?.length) return null;

        // Collect all progress entries from all deadlines
        const allProgress: { date: string; count: number }[] = [];
        
        activeDeadlines.forEach(deadline => {
            if (deadline.progress && deadline.progress.length > 0) {
                deadline.progress.forEach(entry => {
                    const date = dayjs(entry.created_at).format('YYYY-MM-DD');
                    allProgress.push({ date, count: 1 });
                });
            }
        });

        // Group by date and count reading sessions
        const readingByDate = allProgress.reduce((acc, { date }) => {
            acc[date] = (acc[date] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        // Calculate date range (last 12 weeks)
        const endDate = dayjs();
        const startDate = endDate.subtract(11, 'week').startOf('week');
        
        // Generate all days in the range
        const days: DayData[] = [];
        let currentDate = startDate;

        while (currentDate.isBefore(endDate) || currentDate.isSame(endDate, 'day')) {
            const dateStr = currentDate.format('YYYY-MM-DD');
            const readingCount = readingByDate[dateStr] || 0;
            
            // Calculate intensity (0-4)
            let intensity: 0 | 1 | 2 | 3 | 4 = 0;
            if (readingCount > 0) intensity = 1;
            if (readingCount >= 2) intensity = 2;
            if (readingCount >= 4) intensity = 3;
            if (readingCount >= 6) intensity = 4;

            days.push({
                date: dateStr,
                dayOfWeek: currentDate.day(),
                weekNumber: currentDate.isoWeek(),
                readingCount,
                intensity
            });

            currentDate = currentDate.add(1, 'day');
        }

        return days;
    }, [activeDeadlines]);

    // Check if we have enough data
    const hasEnoughData = useMemo(() => {
        if (!heatmapData) return false;
        const daysWithReading = heatmapData.filter(day => day.readingCount > 0).length;
        return daysWithReading >= 14; // At least 14 days of reading in the period
    }, [heatmapData]);

    if (isLoading) {
        return (
            <ThemedView backgroundColor="card" borderColor="border" style={styles.container}>
                <View style={styles.header}>
                    <IconSymbol name="chart.bar.fill" size={24} color={theme.primary} />
                    <ThemedText type="semiBold" style={styles.title}>
                        Reading Activity Heatmap
                    </ThemedText>
                </View>
                <ThemedText color="textMuted" style={styles.loadingText}>
                    Loading...
                </ThemedText>
            </ThemedView>
        );
    }

    if (!hasEnoughData || !heatmapData) {
        return null; // Don't show if insufficient data
    }

    // Group days by week
    const weekGroups = heatmapData.reduce((acc, day) => {
        if (!acc[day.weekNumber]) {
            acc[day.weekNumber] = [];
        }
        acc[day.weekNumber].push(day);
        return acc;
    }, {} as Record<number, DayData[]>);

    // Get color for intensity level
    const getIntensityColor = (intensity: number) => {
        switch (intensity) {
            case 0: return theme.surface;
            case 1: return theme.primary + '40'; // 25% opacity
            case 2: return theme.primary + '80'; // 50% opacity
            case 3: return theme.primary + 'CC'; // 80% opacity
            case 4: return theme.primary;
            default: return theme.surface;
        }
    };

    const dayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    const monthsShown = new Set<string>();

    return (
        <ThemedView backgroundColor="card" borderColor="border" style={styles.container}>
            <View style={styles.header}>
                <IconSymbol name="chart.bar.fill" size={24} color={theme.primary} />
                <ThemedText type="semiBold" style={styles.title}>
                    Reading Activity Heatmap
                </ThemedText>
            </View>

            <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                style={styles.scrollView}
            >
                <View style={styles.heatmapContainer}>
                    {/* Day labels */}
                    <View style={styles.dayLabels}>
                        {dayLabels.map((label, index) => (
                            <ThemedText 
                                key={index} 
                                color="textMuted" 
                                style={styles.dayLabel}
                            >
                                {label}
                            </ThemedText>
                        ))}
                    </View>

                    {/* Heatmap grid */}
                    <View style={styles.weeksContainer}>
                        {Object.entries(weekGroups).map(([weekNum, days]) => {
                            // Check if this week starts a new month
                            const firstDay = days[0];
                            const monthStart = dayjs(firstDay.date).date() <= 7;
                            const monthName = dayjs(firstDay.date).format('MMM');
                            const showMonth = monthStart && !monthsShown.has(monthName);
                            if (showMonth) monthsShown.add(monthName);

                            return (
                                <View key={weekNum} style={styles.weekColumn}>
                                    {showMonth && (
                                        <ThemedText color="textMuted" style={styles.monthLabel}>
                                            {monthName}
                                        </ThemedText>
                                    )}
                                    <View style={styles.week}>
                                        {Array.from({ length: 7 }, (_, dayIndex) => {
                                            const day = days.find(d => d.dayOfWeek === dayIndex);
                                            if (!day) {
                                                return <View key={dayIndex} style={styles.emptyDay} />;
                                            }

                                            return (
                                                <View
                                                    key={day.date}
                                                    style={[
                                                        styles.day,
                                                        { 
                                                            backgroundColor: getIntensityColor(day.intensity),
                                                            borderColor: theme.border
                                                        }
                                                    ]}
                                                />
                                            );
                                        })}
                                    </View>
                                </View>
                            );
                        })}
                    </View>
                </View>
            </ScrollView>

            {/* Legend */}
            <View style={styles.legend}>
                <ThemedText color="textMuted" style={styles.legendLabel}>
                    Less
                </ThemedText>
                {[0, 1, 2, 3, 4].map(intensity => (
                    <View
                        key={intensity}
                        style={[
                            styles.legendBox,
                            { 
                                backgroundColor: getIntensityColor(intensity),
                                borderColor: theme.border
                            }
                        ]}
                    />
                ))}
                <ThemedText color="textMuted" style={styles.legendLabel}>
                    More
                </ThemedText>
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
        marginBottom: 16,
    },
    title: {
        fontSize: 18,
        marginLeft: 12,
    },
    loadingText: {
        fontSize: 14,
        textAlign: 'center',
        paddingVertical: 20,
    },
    scrollView: {
        marginBottom: 16,
    },
    heatmapContainer: {
        flexDirection: 'row',
    },
    dayLabels: {
        marginRight: 8,
        paddingTop: 20,
    },
    dayLabel: {
        fontSize: 10,
        height: 14,
        lineHeight: 14,
        marginBottom: 2,
        textAlign: 'center',
    },
    weeksContainer: {
        flexDirection: 'row',
    },
    weekColumn: {
        marginRight: 4,
    },
    monthLabel: {
        fontSize: 10,
        height: 16,
        marginBottom: 4,
    },
    week: {
        flexDirection: 'column',
    },
    day: {
        width: 12,
        height: 12,
        marginBottom: 2,
        borderRadius: 2,
        borderWidth: 1,
    },
    emptyDay: {
        width: 12,
        height: 12,
        marginBottom: 2,
    },
    legend: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
    },
    legendLabel: {
        fontSize: 12,
    },
    legendBox: {
        width: 12,
        height: 12,
        borderRadius: 2,
        borderWidth: 1,
    },
});

export default WeeklyReadingHeatmap;