import { ThemedText, ThemedView } from '@/components/themed';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useDeadlines } from '@/contexts/DeadlineProvider';
import { useTheme } from '@/theme';
import React, { useMemo } from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import dayjs from 'dayjs';

interface StreakData {
    date: string;
    streakLength: number;
    isActive: boolean;
}

const ReadingStreaksChart: React.FC = () => {
    const { theme } = useTheme();
    const { activeDeadlines, isLoading } = useDeadlines();
    const screenWidth = Dimensions.get('window').width;
    const chartWidth = screenWidth - 80; // Account for padding

    // Process streak data
    const { streakData, currentStreak, longestStreak, hasEnoughData } = useMemo(() => {
        if (!activeDeadlines?.length) {
            return { streakData: [], currentStreak: 0, longestStreak: 0, hasEnoughData: false };
        }

        // Collect all reading dates
        const readingDates = new Set<string>();
        
        activeDeadlines.forEach(deadline => {
            if (deadline.progress && deadline.progress.length > 0) {
                deadline.progress.forEach(entry => {
                    const date = dayjs(entry.created_at).format('YYYY-MM-DD');
                    readingDates.add(date);
                });
            }
        });

        // Convert to sorted array
        const sortedDates = Array.from(readingDates).sort();
        
        if (sortedDates.length < 7) {
            return { streakData: [], currentStreak: 0, longestStreak: 0, hasEnoughData: false };
        }

        // Calculate streaks
        const streaks: StreakData[] = [];
        let currentStreakLength = 0;
        let maxStreak = 0;
        let activeStreak = 0;
        const today = dayjs().format('YYYY-MM-DD');
        const yesterday = dayjs().subtract(1, 'day').format('YYYY-MM-DD');

        // Process last 30 days for the chart
        const endDate = dayjs();
        const startDate = endDate.subtract(29, 'day');
        let currentDate = startDate;
        
        while (currentDate.isBefore(endDate) || currentDate.isSame(endDate, 'day')) {
            const dateStr = currentDate.format('YYYY-MM-DD');
            const hasReading = readingDates.has(dateStr);
            
            if (hasReading) {
                currentStreakLength++;
                maxStreak = Math.max(maxStreak, currentStreakLength);
                
                // Check if this is part of the current active streak
                if (dateStr === today || dateStr === yesterday) {
                    activeStreak = currentStreakLength;
                }
            } else {
                // Reset streak but keep tracking
                if (currentStreakLength > 0 && activeStreak === 0) {
                    // The active streak was broken before today
                    activeStreak = 0;
                }
                currentStreakLength = 0;
            }
            
            streaks.push({
                date: dateStr,
                streakLength: currentStreakLength,
                isActive: currentStreakLength > 0
            });
            
            currentDate = currentDate.add(1, 'day');
        }

        // If today has no reading but yesterday did, active streak is 0
        if (!readingDates.has(today) && readingDates.has(yesterday)) {
            activeStreak = 0;
        }

        return { 
            streakData: streaks, 
            currentStreak: activeStreak, 
            longestStreak: maxStreak,
            hasEnoughData: true
        };
    }, [activeDeadlines]);

    if (isLoading) {
        return (
            <ThemedView backgroundColor="card" borderColor="border" style={styles.container}>
                <View style={styles.header}>
                    <IconSymbol name="chart.bar.fill" size={24} color={theme.primary} />
                    <ThemedText type="semiBold" style={styles.title}>
                        Reading Streaks
                    </ThemedText>
                </View>
                <ThemedText color="textMuted" style={styles.loadingText}>
                    Loading...
                </ThemedText>
            </ThemedView>
        );
    }

    if (!hasEnoughData) {
        return null; // Don't show if insufficient data
    }

    // Prepare data for line chart
    const chartData = streakData.map((item, index) => ({
        value: item.streakLength,
        label: index % 5 === 0 ? dayjs(item.date).format('D') : '',
        labelTextStyle: { color: theme.textMuted, fontSize: 10 },
        dataPointColor: item.isActive ? theme.primary : theme.surface,
        showDataPoint: item.isActive,
    }));

    return (
        <ThemedView backgroundColor="card" borderColor="border" style={styles.container}>
            <View style={styles.header}>
                <IconSymbol name="chart.bar.fill" size={24} color={theme.primary} />
                <ThemedText type="semiBold" style={styles.title}>
                    Reading Streaks
                </ThemedText>
            </View>

            <View style={styles.statsRow}>
                <View style={styles.statBox}>
                    <ThemedText style={styles.statNumber}>
                        {currentStreak}
                    </ThemedText>
                    <ThemedText color="textMuted" style={styles.statLabel}>
                        Current streak
                    </ThemedText>
                </View>
                <View style={[styles.statBox, styles.statBoxCenter]}>
                    <ThemedText style={styles.statNumber}>
                        {longestStreak}
                    </ThemedText>
                    <ThemedText color="textMuted" style={styles.statLabel}>
                        Longest streak
                    </ThemedText>
                </View>
                <View style={styles.statBox}>
                    <ThemedText style={styles.statNumber}>
                        {streakData.filter(d => d.isActive).length}
                    </ThemedText>
                    <ThemedText color="textMuted" style={styles.statLabel}>
                        Days read (30d)
                    </ThemedText>
                </View>
            </View>

            <View style={styles.chartContainer}>
                <LineChart
                    data={chartData}
                    width={chartWidth}
                    height={180}
                    color={theme.primary}
                    thickness={2}
                    startFillColor={theme.primary}
                    endFillColor={theme.primary + '20'}
                    startOpacity={0.3}
                    endOpacity={0.1}
                    initialSpacing={10}
                    noOfSections={4}
                    maxValue={Math.max(10, Math.ceil(longestStreak / 5) * 5)}
                    yAxisColor={theme.border}
                    xAxisColor={theme.border}
                    yAxisTextStyle={{ color: theme.textMuted, fontSize: 10 }}
                    rulesType="solid"
                    rulesColor={theme.border + '40'}
                    areaChart
                    curved
                    curvature={0.2}
                    hideDataPoints={false}
                    dataPointsHeight={6}
                    dataPointsWidth={6}
                    dataPointsColor={theme.primary}
                    xAxisLabelTextStyle={{ color: theme.textMuted, fontSize: 10 }}
                    pointerConfig={{
                        pointerStripHeight: 180,
                        pointerStripColor: theme.primary,
                        pointerStripWidth: 2,
                        pointerColor: theme.primary,
                        radius: 6,
                        activatePointersOnLongPress: true,
                        autoAdjustPointerLabelPosition: true,
                        pointerLabelComponent: (items: any) => {
                            const item = items[0];
                            if (!item) return null;
                            
                            return (
                                <View style={[styles.pointerLabel, { backgroundColor: theme.background }]}>
                                    <ThemedText style={styles.pointerText}>
                                        {item.value} day{item.value !== 1 ? 's' : ''}
                                    </ThemedText>
                                </View>
                            );
                        },
                    }}
                />
            </View>

            <View style={styles.legend}>
                <View style={styles.legendItem}>
                    <View style={[styles.legendLine, { backgroundColor: theme.primary }]} />
                    <ThemedText color="textMuted" style={styles.legendText}>
                        Consecutive reading days
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
    statsRow: {
        flexDirection: 'row',
        marginBottom: 20,
    },
    statBox: {
        flex: 1,
        alignItems: 'center',
    },
    statBoxCenter: {
        borderLeftWidth: 1,
        borderRightWidth: 1,
        borderColor: '#E0E0E0',
    },
    statNumber: {
        fontSize: 24,
        fontWeight: '700',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        textAlign: 'center',
    },
    chartContainer: {
        marginLeft: -20,
        marginRight: -20,
        paddingLeft: 10,
        marginBottom: 16,
    },
    legend: {
        alignItems: 'center',
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    legendLine: {
        width: 20,
        height: 3,
        borderRadius: 1.5,
        marginRight: 8,
    },
    legendText: {
        fontSize: 12,
    },
    pointerLabel: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
    },
    pointerText: {
        fontSize: 12,
        fontWeight: '600',
    },
});

export default ReadingStreaksChart;