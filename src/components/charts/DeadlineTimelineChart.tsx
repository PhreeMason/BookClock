import { ThemedText, ThemedView } from '@/components/themed';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useDeadlines } from '@/contexts/DeadlineProvider';
import { useTheme } from '@/theme';
import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import dayjs from 'dayjs';

const DeadlineTimelineChart: React.FC = () => {
    const { theme } = useTheme();
    const { activeDeadlines, getDeadlineCalculations, isLoading } = useDeadlines();

    if (isLoading) {
        return (
            <ThemedView backgroundColor="card" borderColor="border" style={styles.container}>
                <View style={styles.header}>
                    <IconSymbol name="clock.fill" size={24} color={theme.primary} />
                    <ThemedText type="semiBold" style={styles.title}>
                        Deadline Timeline
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

    // Sort deadlines by date
    const sortedDeadlines = [...activeDeadlines].sort((a, b) => 
        new Date(a.deadline_date).getTime() - new Date(b.deadline_date).getTime()
    );

    // Calculate timeline range
    const now = dayjs();
    const lastDeadline = dayjs(sortedDeadlines[sortedDeadlines.length - 1].deadline_date);
    const totalDays = lastDeadline.diff(now, 'day');
    
    // Ensure minimum timeline width
    const timelineWidth = Math.max(totalDays * 3, 300);

    return (
        <ThemedView backgroundColor="card" borderColor="border" style={styles.container}>
            <View style={styles.header}>
                <IconSymbol name="clock.fill" size={24} color={theme.primary} />
                <ThemedText type="semiBold" style={styles.title}>
                    Deadline Timeline
                </ThemedText>
            </View>

            <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
            >
                <View style={[styles.timeline, { width: timelineWidth }]}>
                    {/* Timeline line */}
                    <View style={[styles.timelineLine, { backgroundColor: theme.border }]} />
                    
                    {/* Today marker */}
                    <View style={styles.todayMarker}>
                        <View style={[styles.todayDot, { backgroundColor: theme.primary }]} />
                        <ThemedText style={styles.todayText}>Today</ThemedText>
                    </View>

                    {/* Deadline markers */}
                    {sortedDeadlines.map((deadline) => {
                        const calculations = getDeadlineCalculations(deadline);
                        const deadlineDate = dayjs(deadline.deadline_date);
                        const daysFromToday = deadlineDate.diff(now, 'day');
                        const position = Math.max(0, (daysFromToday / totalDays) * (timelineWidth - 100));
                        
                        // Get urgency color
                        let markerColor = theme.success;
                        if (calculations.urgencyLevel === 'overdue') {
                            markerColor = theme.danger;
                        } else if (calculations.urgencyLevel === 'urgent') {
                            markerColor = theme.warning;
                        } else if (calculations.urgencyLevel === 'approaching') {
                            markerColor = theme.info;
                        }

                        return (
                            <View 
                                key={deadline.id} 
                                style={[styles.deadlineMarker, { left: position }]}
                            >
                                <View style={styles.markerContent}>
                                    <View style={[styles.markerDot, { backgroundColor: markerColor }]} />
                                    <View style={[styles.markerLine, { backgroundColor: markerColor }]} />
                                    <View style={styles.markerInfo}>
                                        <ThemedText numberOfLines={1} style={styles.bookTitle}>
                                            {deadline.book_title}
                                        </ThemedText>
                                        <ThemedText color="textMuted" style={styles.deadlineDate}>
                                            {deadlineDate.format('MMM D')}
                                        </ThemedText>
                                        <ThemedText style={[styles.daysLeft, { color: markerColor }]}>
                                            {calculations.urgencyLevel === 'overdue' 
                                                ? `${Math.abs(daysFromToday)}d overdue`
                                                : `${daysFromToday}d left`}
                                        </ThemedText>
                                        <View style={[styles.progressBar, { backgroundColor: theme.surface }]}>
                                            <View 
                                                style={[
                                                    styles.progressFill, 
                                                    { 
                                                        backgroundColor: markerColor,
                                                        width: `${calculations.progressPercentage}%`
                                                    }
                                                ]} 
                                            />
                                        </View>
                                    </View>
                                </View>
                            </View>
                        );
                    })}
                </View>
            </ScrollView>

            {/* Legend */}
            <View style={styles.legend}>
                <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: theme.success }]} />
                    <ThemedText color="textMuted" style={styles.legendText}>On track</ThemedText>
                </View>
                <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: theme.info }]} />
                    <ThemedText color="textMuted" style={styles.legendText}>Approaching</ThemedText>
                </View>
                <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: theme.warning }]} />
                    <ThemedText color="textMuted" style={styles.legendText}>Urgent</ThemedText>
                </View>
                <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: theme.danger }]} />
                    <ThemedText color="textMuted" style={styles.legendText}>Overdue</ThemedText>
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
    scrollView: {
        height: 160,
        marginBottom: 16,
    },
    scrollContent: {
        paddingHorizontal: 20,
    },
    timeline: {
        height: 160,
        position: 'relative',
    },
    timelineLine: {
        position: 'absolute',
        top: 80,
        left: 0,
        right: 0,
        height: 2,
    },
    todayMarker: {
        position: 'absolute',
        top: 70,
        left: 0,
        alignItems: 'center',
    },
    todayDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginBottom: 4,
    },
    todayText: {
        fontSize: 12,
        fontWeight: '600',
    },
    deadlineMarker: {
        position: 'absolute',
        top: 0,
        width: 100,
    },
    markerContent: {
        alignItems: 'center',
    },
    markerDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginBottom: 2,
    },
    markerLine: {
        width: 2,
        height: 20,
    },
    markerInfo: {
        backgroundColor: 'transparent',
        paddingTop: 4,
        alignItems: 'center',
        width: 100,
    },
    bookTitle: {
        fontSize: 12,
        fontWeight: '600',
        marginBottom: 2,
        textAlign: 'center',
    },
    deadlineDate: {
        fontSize: 11,
        marginBottom: 2,
    },
    daysLeft: {
        fontSize: 11,
        fontWeight: '600',
        marginBottom: 4,
    },
    progressBar: {
        width: 60,
        height: 4,
        borderRadius: 2,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
    },
    legend: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 16,
        justifyContent: 'center',
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    legendDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 6,
    },
    legendText: {
        fontSize: 12,
    },
});

export default DeadlineTimelineChart;