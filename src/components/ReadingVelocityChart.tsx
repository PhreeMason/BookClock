import { ThemedText, ThemedView } from '@/components/themed';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useDeadlines } from '@/contexts/DeadlineProvider';
import { useTheme } from '@/theme';
import { Database } from '@/types/supabase';
import dayjs from 'dayjs';
import React, { useMemo } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import { BarChart } from 'react-native-gifted-charts';

type BookFormat = Database['public']['Enums']['book_format_enum'];

interface FormatVelocity {
    format: BookFormat;
    label: string;
    totalProgress: number;
    totalDays: number;
    avgPerDay: number;
    unit: string;
    bookCount: number;
    color: string;
    displayValue: string; // Formatted display value (e.g., "3h 47m" for audio)
}

const ReadingVelocityChart: React.FC = () => {
    const { theme } = useTheme();
    const { activeDeadlines, isLoading } = useDeadlines();
    const screenWidth = Dimensions.get('window').width;
    const chartWidth = screenWidth - 80;

    const velocityData = useMemo(() => {
        if (!activeDeadlines?.length) {
            return null;
        }

        // Track progress and days for each format
        const formatData: Record<BookFormat, {
            totalProgress: number;
            totalDays: number;
            bookCount: number;
        }> = {
            physical: { totalProgress: 0, totalDays: 0, bookCount: 0 },
            ebook: { totalProgress: 0, totalDays: 0, bookCount: 0 },
            audio: { totalProgress: 0, totalDays: 0, bookCount: 0 }
        };

        activeDeadlines.forEach(deadline => {
            if (!deadline.progress || deadline.progress.length === 0) return;

            // Get date range for this book
            const firstEntry = deadline.progress[0];
            const lastEntry = deadline.progress[deadline.progress.length - 1];
            const startDate = dayjs(firstEntry.created_at);
            const endDate = dayjs(lastEntry.created_at);
            const daysDiff = Math.max(1, endDate.diff(startDate, 'day') + 1); // +1 to include both start and end days

            // Get current progress
            const currentProgress = lastEntry.current_progress;

            if (currentProgress > 0) {
                formatData[deadline.format].totalProgress += currentProgress;
                formatData[deadline.format].totalDays += daysDiff;
                formatData[deadline.format].bookCount += 1;
            }
        });

        // Helper function to format audio time
        const formatAudioTime = (minutes: number): string => {
            const hours = Math.floor(minutes / 60);
            const mins = Math.round(minutes % 60);
            if (hours > 0) {
                return `${hours}h ${mins}m`;
            }
            return `${mins}m`;
        };

        // Filter formats with data and calculate velocities
        const velocities: FormatVelocity[] = [];

        Object.entries(formatData).forEach(([format, data]) => {
            if (data.bookCount >= 1 && data.totalProgress > 0) {
                const formatKey = format as BookFormat;
                let avgPerDay = data.totalProgress / data.totalDays;
                let unit = '';
                let label = '';
                let color = theme.primary;
                let displayValue = '';

                switch (formatKey) {
                    case 'physical':
                        unit = 'pages/day';
                        label = 'Physical';
                        color = theme.primary;
                        avgPerDay = Math.round(avgPerDay * 10) / 10;
                        displayValue = `${avgPerDay} ${unit}`;
                        break;
                    case 'ebook':
                        unit = '%/day';
                        label = 'E-book';
                        color = theme.accent;
                        // Convert to more readable percentage
                        avgPerDay = Math.round(avgPerDay * 100) / 100;
                        displayValue = `${avgPerDay} ${unit}`;
                        break;
                    case 'audio':
                        unit = '/day';
                        label = 'Audiobook';
                        color = theme.success;
                        displayValue = `${formatAudioTime(avgPerDay)}${unit}`;
                        // Keep avgPerDay as minutes for chart scaling
                        avgPerDay = Math.round(avgPerDay * 10) / 10;
                        break;
                }

                velocities.push({
                    format: formatKey,
                    label,
                    totalProgress: data.totalProgress,
                    totalDays: data.totalDays,
                    avgPerDay,
                    unit,
                    bookCount: data.bookCount,
                    color,
                    displayValue
                });
            }
        });

        return velocities.length >= 2 ? velocities : null; // Need at least 2 formats for comparison
    }, [activeDeadlines, theme]);

    if (isLoading) {
        return (
            <ThemedView backgroundColor="card" borderColor="border" style={styles.container}>
                <View style={styles.header}>
                    <IconSymbol name="speedometer" size={24} color={theme.primary} />
                    <ThemedText type="semiBold" style={styles.title}>
                        Reading Velocity by Format
                    </ThemedText>
                </View>
                <ThemedText color="textMuted" style={styles.loadingText}>
                    Loading...
                </ThemedText>
            </ThemedView>
        );
    }

    if (!velocityData) {
        return null; // Don't show if insufficient data
    }

    // Prepare data for bar chart (normalize to show relative performance)
    const maxVelocity = Math.max(...velocityData.map(v => v.avgPerDay));
    const chartData = velocityData.map(velocity => ({
        value: velocity.avgPerDay,
        label: velocity.label,
        frontColor: velocity.color,
        labelTextStyle: { color: theme.textMuted, fontSize: 12 },
    }));

    return (
        <ThemedView backgroundColor="card" borderColor="border" style={styles.container}>
            <View style={styles.header}>
                <IconSymbol name="speedometer" size={24} color={theme.primary} />
                <ThemedText type="semiBold" style={styles.title}>
                    Reading Velocity by Format
                </ThemedText>
            </View>

            <View style={styles.chartContainer}>
                <BarChart
                    data={chartData}
                    width={chartWidth}
                    height={180}
                    barWidth={60}
                    spacing={40}
                    initialSpacing={20}
                    endSpacing={20}
                    yAxisThickness={1}
                    xAxisThickness={1}
                    yAxisColor={theme.border}
                    xAxisColor={theme.border}
                    yAxisTextStyle={{ color: theme.textMuted, fontSize: 10 }}
                    xAxisLabelTextStyle={{ color: theme.textMuted, fontSize: 12 }}
                    noOfSections={4}
                    maxValue={Math.ceil(maxVelocity * 1.1)}
                    rulesType="solid"
                    rulesColor={theme.border + '40'}
                    showGradient
                    gradientColor={theme.surface}
                />
            </View>

            {/* Stats breakdown */}
            <View style={styles.statsContainer}>
                {velocityData.map((velocity) => (
                    <View key={velocity.format} style={styles.statItem}>
                        <View style={styles.statHeader}>
                            <View style={[styles.colorDot, { backgroundColor: velocity.color }]} />
                            <ThemedText style={styles.formatLabel}>
                                {velocity.label}
                            </ThemedText>
                        </View>
                        <ThemedText style={styles.velocityValue}>
                            {velocity.displayValue}
                        </ThemedText>
                        <ThemedText color="textMuted" style={styles.bookCount}>
                            {velocity.bookCount} book{velocity.bookCount !== 1 ? 's' : ''} • {velocity.totalDays} days
                        </ThemedText>
                    </View>
                ))}
            </View>

            {/* Cross-format comparison note */}
            {velocityData.some(v => v.format === 'audio') && velocityData.some(v => v.format === 'physical') && (
                <View style={styles.comparisonNote}>
                    <ThemedText color="textMuted" style={styles.noteText}>
                        📖 Reading pace comparison: ~1.5 minutes of audio equals 1 page
                    </ThemedText>
                </View>
            )}
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
    chartContainer: {
        marginLeft: -20,
        marginRight: -20,
        paddingLeft: 10,
        marginBottom: 20,
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        gap: 20,
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
    },
    statHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 4,
    },
    colorDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 8,
    },
    formatLabel: {
        fontSize: 14,
        fontWeight: '600',
    },
    velocityValue: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 2,
        textAlign: 'center',
    },
    bookCount: {
        fontSize: 12,
        textAlign: 'center',
    },
    comparisonNote: {
        marginTop: 16,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#E0E0E0',
    },
    noteText: {
        fontSize: 12,
        textAlign: 'center',
        fontStyle: 'italic',
    },
});

export default ReadingVelocityChart;