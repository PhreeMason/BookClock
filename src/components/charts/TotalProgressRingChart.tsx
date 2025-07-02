import { ThemedText, ThemedView } from '@/components/themed';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useDeadlines } from '@/contexts/DeadlineProvider';
import { useTheme } from '@/theme';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { PieChart } from 'react-native-gifted-charts';

const TotalProgressRingChart: React.FC = () => {
    const { theme } = useTheme();
    const { activeDeadlines, getDeadlineCalculations, isLoading } = useDeadlines();

    // Data validation - need at least 1 active deadline with progress
    if (isLoading) {
        return (
            <ThemedView backgroundColor="card" borderColor="border" style={styles.container}>
                <View style={styles.header}>
                    <IconSymbol name="chart.bar.fill" size={24} color={theme.primary} />
                    <ThemedText type="semiBold" style={styles.title}>
                        Overall Reading Progress
                    </ThemedText>
                </View>
                <ThemedText color="textMuted" style={styles.loadingText}>
                    Loading...
                </ThemedText>
            </ThemedView>
        );
    }

    if (!activeDeadlines?.length) {
        return null; // Don't show if no data
    }

    // Calculate total progress across all books (convert to page equivalents)
    let totalProgress = 0;
    let totalTarget = 0;
    let booksWithProgress = 0;

    activeDeadlines.forEach(deadline => {
        const calculations = getDeadlineCalculations(deadline);
        if (calculations && calculations.currentProgress > 0) {
            // Convert to page equivalents for consistent comparison
            let progressInPages = calculations.currentProgress;
            let targetInPages = calculations.totalQuantity;
            
            if (deadline.format === 'audio') {
                // Convert minutes to page equivalent (1.5 minutes per page)
                progressInPages = calculations.currentProgress / 1.5;
                targetInPages = calculations.totalQuantity / 1.5;
            }
            // physical books and ebooks are already in pages
            
            totalProgress += progressInPages;
            totalTarget += targetInPages;
            booksWithProgress++;
        }
    });

    // Don't show if no books have progress
    if (booksWithProgress === 0 || totalTarget === 0) {
        return null;
    }

    const overallPercentage = Math.round((totalProgress / totalTarget) * 100);
    const remainingPercentage = 100 - overallPercentage;

    // Prepare data for ring chart
    const ringData = [
        {
            value: overallPercentage,
            color: theme.primary,
            label: 'Completed',
        },
        {
            value: remainingPercentage,
            color: theme.textMuted,
            label: 'Remaining',
        }
    ];

    // Calculate reading stats
    const averageBookProgress = Math.round((overallPercentage / activeDeadlines.length));

    return (
        <ThemedView backgroundColor="card" borderColor="border" style={styles.container}>
            <View style={styles.header}>
                <IconSymbol name="chart.bar.fill" size={24} color={theme.primary} />
                <ThemedText type="semiBold" style={styles.title}>
                    Overall Reading Progress
                </ThemedText>
            </View>

            <View style={styles.content}>
                <View style={styles.chartContainer}>
                    <PieChart
                        data={ringData}
                        donut
                        radius={80}
                        innerRadius={60}
                        centerLabelComponent={() => (
                            <View style={styles.centerLabel}>
                                <ThemedText style={styles.centerNumber}>
                                    {overallPercentage}%
                                </ThemedText>
                                <ThemedText color="textMuted" style={styles.centerText}>
                                    complete
                                </ThemedText>
                            </View>
                        )}
                        strokeColor={theme.background}
                        strokeWidth={2}
                        animationDuration={800}
                        showText={false}
                    />
                </View>

                <View style={styles.statsContainer}>
                    <View style={styles.statRow}>
                        <View style={styles.statItem}>
                            <ThemedText style={styles.statValue}>
                                {booksWithProgress}
                            </ThemedText>
                            <ThemedText color="textMuted" style={styles.statLabel}>
                                books in progress
                            </ThemedText>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}>
                            <ThemedText style={styles.statValue}>
                                {averageBookProgress}%
                            </ThemedText>
                            <ThemedText color="textMuted" style={styles.statLabel}>
                                avg. per book
                            </ThemedText>
                        </View>
                    </View>
                </View>

                <View style={styles.legend}>
                    <View style={styles.legendItem}>
                        <View style={[styles.legendDot, { backgroundColor: theme.primary }]} />
                        <ThemedText style={styles.legendLabel}>
                            Progress completed
                        </ThemedText>
                        <ThemedText style={styles.legendValue}>
                            {Math.round(totalProgress)}
                        </ThemedText>
                    </View>
                    <View style={styles.legendItem}>
                        <View style={[styles.legendDot, { backgroundColor: theme.textMuted }]} />
                        <ThemedText style={styles.legendLabel}>
                            Progress remaining
                        </ThemedText>
                        <ThemedText style={styles.legendValue}>
                            {Math.round(totalTarget - totalProgress)}
                        </ThemedText>
                    </View>
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
        paddingHorizontal: 24, // Extra horizontal padding for numbers
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
    content: {
        alignItems: 'center',
    },
    chartContainer: {
        marginBottom: 24,
    },
    centerLabel: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    centerNumber: {
        paddingTop: 10,
        fontSize: 28,
        fontWeight: '700',
    },
    centerText: {
        fontSize: 14,
        marginTop: 2,
    },
    statsContainer: {
        width: '100%',
        marginBottom: 20,
    },
    statRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    statItem: {
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    statDivider: {
        width: 1,
        height: 40,
        backgroundColor: '#E0E0E0',
        opacity: 0.3,
    },
    statValue: {
        fontSize: 24,
        fontWeight: '600',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        textAlign: 'center',
    },
    legend: {
        width: '100%',
        gap: 12,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 6,
        paddingHorizontal: 4,
    },
    legendDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginRight: 12,
    },
    legendLabel: {
        flex: 1,
        fontSize: 14,
    },
    legendValue: {
        fontSize: 14,
        fontWeight: '600',
        minWidth: 50, // Ensure minimum width for numbers
        textAlign: 'right',
    },
});

export default TotalProgressRingChart;