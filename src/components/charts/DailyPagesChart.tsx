import { ThemedText, ThemedView } from '@/components/themed';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useDeadlines } from '@/contexts/DeadlineProvider';
import { useTheme } from '@/theme';
import dayjs from 'dayjs';
import React, { useMemo } from 'react';
import { Dimensions, ScrollView, StyleSheet, View } from 'react-native';
import { BarChart } from 'react-native-gifted-charts';

interface DailyReading {
    date: string;
    totalPagesRead: number;
    sessionCount: number;
}

const DailyPagesChart: React.FC = () => {
    const { theme } = useTheme();
    const { activeDeadlines, isLoading } = useDeadlines();
    const screenWidth = Dimensions.get('window').width;

    const dailyData = useMemo(() => {
        if (!activeDeadlines?.length) {
            return null;
        }

        // Collect all progress entries with their deltas
        const dailyProgress: Record<string, number> = {};
        const dailySessions: Record<string, number> = {};

        activeDeadlines.forEach(deadline => {
            if (!deadline.progress || deadline.progress.length === 0) return;

            // Sort progress entries by date
            const sortedProgress = [...deadline.progress].sort((a, b) => 
                new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
            );

            // Group progress entries by date first
            const progressByDate: Record<string, number[]> = {};
            sortedProgress.forEach(entry => {
                const date = dayjs(entry.created_at).format('YYYY-MM-DD');
                if (!progressByDate[date]) {
                    progressByDate[date] = [];
                }
                progressByDate[date].push(entry.current_progress);
            });

            // Calculate daily progress deltas including ALL initial progress
            const dates = Object.keys(progressByDate).sort();
            let previousDayProgress = 0;

            dates.forEach((date, index) => {
                const dayProgress = progressByDate[date];
                // Take the highest progress value for that day
                const maxProgressThatDay = Math.max(...dayProgress);
                
                let progressDelta = 0;
                if (index === 0) {
                    // For first day, count ALL initial progress
                    progressDelta = maxProgressThatDay;
                    previousDayProgress = maxProgressThatDay;
                } else {
                    // Calculate the delta from the previous day's end progress
                    progressDelta = Math.max(0, maxProgressThatDay - previousDayProgress);
                    previousDayProgress = maxProgressThatDay;
                }

                // Convert to page equivalents
                let pagesRead = 0;
                if (deadline.format === 'physical' || deadline.format === 'ebook') {
                    // Both physical and ebook are measured in pages
                    pagesRead = progressDelta;
                } else if (deadline.format === 'audio') {
                    // Convert minutes to page equivalent (1.5 minutes per page)
                    pagesRead = progressDelta / 1.5;
                }

                // Only count positive progress (avoid negative deltas from corrections)
                if (pagesRead > 0) {
                    dailyProgress[date] = (dailyProgress[date] || 0) + pagesRead;
                    dailySessions[date] = (dailySessions[date] || 0) + 1;
                }
            });
        });

        // Create daily reading data starting from earliest progress date
        // Find the earliest progress date
        const allProgressDates: string[] = [];
        activeDeadlines.forEach(deadline => {
            if (deadline.progress?.length) {
                deadline.progress.forEach(entry => {
                    allProgressDates.push(dayjs(entry.created_at).format('YYYY-MM-DD'));
                });
            }
        });
        
        const endDate = dayjs();
        let startDate: dayjs.Dayjs;
        
        if (allProgressDates.length > 0) {
            // Start from the earliest progress date (no padding)
            const earliestProgressDate = dayjs(Math.min(...allProgressDates.map(d => new Date(d).getTime())));
            startDate = earliestProgressDate;
        } else {
            // Default to 7 days ago if no progress
            startDate = endDate.subtract(6, 'day');
        }
        const dailyReadingData: DailyReading[] = [];

        let currentDate = startDate;
        while (currentDate.isBefore(endDate) || currentDate.isSame(endDate, 'day')) {
            const dateStr = currentDate.format('YYYY-MM-DD');
            const pagesRead = dailyProgress[dateStr] || 0;
            const sessions = dailySessions[dateStr] || 0;

            dailyReadingData.push({
                date: dateStr,
                totalPagesRead: Math.round(pagesRead * 10) / 10, // Round to 1 decimal
                sessionCount: sessions
            });

            currentDate = currentDate.add(1, 'day');
        }

        // Check if we have any reading data
        const daysWithReading = dailyReadingData.filter(d => d.totalPagesRead > 0).length;
        
        if (daysWithReading >= 1) {
            return dailyReadingData;
        } else {
            return null;
        }
    }, [activeDeadlines]);

    if (isLoading) {
        return (
            <ThemedView backgroundColor="card" borderColor="border" style={styles.container}>
                <View style={styles.header}>
                    <IconSymbol name="chart.bar.fill" size={24} color={theme.primary} />
                    <ThemedText type="semiBold" style={styles.title}>
                        Daily Combined Progress
                    </ThemedText>
                </View>
                <ThemedText color="textMuted" style={styles.loadingText}>
                    Loading...
                </ThemedText>
            </ThemedView>
        );
    }

    if (!dailyData) {
        return (
            <ThemedView backgroundColor="card" borderColor="border" style={styles.container}>
                <View style={styles.header}>
                    <IconSymbol name="chart.bar.fill" size={24} color={theme.primary} />
                    <ThemedText type="semiBold" style={styles.title}>
                        Daily Combined Progress
                    </ThemedText>
                </View>
                <View style={styles.emptyContent}>
                    <ThemedText color="textMuted" style={styles.emptyText}>
                        No reading or listening activity found
                    </ThemedText>
                    <ThemedText color="textMuted" style={styles.emptySubtext}>
                        Start logging your reading or listening progress to see daily charts
                    </ThemedText>
                </View>
            </ThemedView>
        );
    }

    // Calculate stats
    const totalPages = dailyData.reduce((sum, day) => sum + day.totalPagesRead, 0);
    const daysWithReading = dailyData.filter(d => d.totalPagesRead > 0).length;
    const averagePages = daysWithReading > 0 ? totalPages / daysWithReading : 0;
    const maxPages = Math.max(...dailyData.map(d => d.totalPagesRead));

    // Calculate optimal chart width for scrollable view
    const barWidth = 20;
    const spacing = 10;
    const totalBars = dailyData.length;
    const calculatedChartWidth = (barWidth + spacing) * totalBars + 60; // 60 for padding
    const scrollableChartWidth = Math.max(calculatedChartWidth, screenWidth - 40);

    // Prepare data for bar chart with better labels for scrollable view
    const chartData = dailyData.map((day, index) => {
        // Show labels every 3 days for scrollable view
        const shouldShowLabel = index % 3 === 0 || index === dailyData.length - 1;
        
        return {
            value: day.totalPagesRead,
            label: shouldShowLabel ? dayjs(day.date).format('M/D') : '',
            frontColor: day.totalPagesRead > 0 ? theme.primary : theme.surface,
            labelTextStyle: { color: theme.textMuted, fontSize: 11 },
        };
    });
    
    return (
        <ThemedView backgroundColor="card" borderColor="border" style={styles.container}>
            <View style={styles.header}>
                <IconSymbol name="chart.bar.fill" size={24} color={theme.primary} />
                <ThemedText type="semiBold" style={styles.title}>
                    Daily Reading Progress
                </ThemedText>
            </View>

            {/* Stats summary */}
            <View style={styles.statsRow}>
                <View style={styles.statBox}>
                    <ThemedText style={styles.statNumber}>
                        {Math.round(totalPages)}
                    </ThemedText>
                    <ThemedText color="textMuted" style={styles.statLabel}>
                        Total combined
                    </ThemedText>
                </View>
                <View style={[styles.statBox, styles.statBoxCenter]}>
                    <ThemedText style={styles.statNumber}>
                        {Math.round(averagePages * 10) / 10}
                    </ThemedText>
                    <ThemedText color="textMuted" style={styles.statLabel}>
                        Avg per day
                    </ThemedText>
                </View>
                <View style={styles.statBox}>
                    <ThemedText style={styles.statNumber}>
                        {daysWithReading}
                    </ThemedText>
                    <ThemedText color="textMuted" style={styles.statLabel}>
                        Active days (30d)
                    </ThemedText>
                </View>
            </View>

            <View style={styles.chartContainer}>
                <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={true}
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                >
                    <BarChart
                        data={chartData}
                        width={scrollableChartWidth}
                        height={180} // Reduced from 200 to 180
                        barWidth={barWidth}
                        spacing={spacing}
                        initialSpacing={20}
                        endSpacing={20}
                        yAxisThickness={1}
                        xAxisThickness={1}
                        yAxisColor={theme.border}
                        xAxisColor={theme.border}
                        yAxisTextStyle={{ color: theme.textMuted, fontSize: 11 }}
                        xAxisLabelTextStyle={{ color: theme.textMuted, fontSize: 11 }}
                        noOfSections={4}
                        maxValue={Math.ceil(maxPages * 1.1) || 10}
                        rulesType="solid"
                        rulesColor={theme.border + '40'}
                        showGradient
                        gradientColor={theme.surface}
                    />
                </ScrollView>
            </View>

            {/* Legend */}
            <View style={styles.legend}>
                <View style={styles.legendItem}>
                    <View style={[styles.legendBar, { backgroundColor: theme.primary }]} />
                    <ThemedText color="textMuted" style={styles.legendText}>
                        Combined reading & listening activity • Scroll to see all data
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
        fontSize: 20,
        fontWeight: '700',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 11,
        textAlign: 'center',
    },
    chartContainer: {
        marginLeft: -5,
        marginRight: -5,
        marginBottom: 16,
        height: 220, // Explicit height for chart + padding
    },
    scrollView: {
        height: 220, // Match container height
    },
    scrollContent: {
        paddingHorizontal: 0,
    },
    legend: {
        alignItems: 'center',
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 10,
    },
    legendBar: {
        width: 16,
        height: 4,
        borderRadius: 2,
        marginRight: 8,
    },
    legendText: {
        fontSize: 12,
        textAlign: 'center',
        flexShrink: 1,
    },
    emptyContent: {
        alignItems: 'center',
        paddingVertical: 40,
        paddingHorizontal: 20,
    },
    emptyText: {
        fontSize: 16,
        marginBottom: 8,
        textAlign: 'center',
    },
    emptySubtext: {
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 20,
    },
});

export default DailyPagesChart;