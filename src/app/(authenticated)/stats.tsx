import DailyListeningProgressChart from '@/components/charts/DailyListeningProgressChart';
import DailyPagesChart from '@/components/charts/DailyPagesChart';
import DailyReadingProgressChart from '@/components/charts/DailyReadingProgressChart';
import TotalProgressRingChart from '@/components/charts/TotalProgressRingChart';
import ReadingCalendar from '@/components/features/calendar/ReadingCalendar';
import FormatDistributionChart from '@/components/features/stats/FormatDistributionChart';
import ReadingListeningToggle, { FormatCategory } from '@/components/features/stats/ReadingListeningToggle';
import ReadingStatsCards from '@/components/features/stats/ReadingStatsCards';
import WeeklyReadingHeatmap from '@/components/features/stats/WeeklyReadingHeatmap';
import AppHeader from '@/components/shared/AppHeader';
import { ThemedScrollView, ThemedText, ThemedView } from '@/components/themed';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { usePace } from '@/contexts/PaceProvider';
import { formatListeningPaceDisplay, formatPaceDisplay } from '@/lib/paceCalculations';
import { useTheme } from '@/theme';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function StatsScreen() {
    const { theme } = useTheme();
    const { userPaceData, userListeningPaceData } = usePace();
    const [selectedCategory, setSelectedCategory] = useState<FormatCategory>('combined');
    const iconColor = theme.primary;

    const handleBackPress = () => {
        router.back();
    };

    // Format reading pace display (pages only, no time equivalents)
    const paceDisplay = userPaceData.isReliable
        ? formatPaceDisplay(userPaceData.averagePace, 'physical')
        : 'No pace data yet';

    const paceMethod = userPaceData.calculationMethod === 'recent_data'
        ? 'Based on recent reading activity'
        : 'Default estimate';

    // Format listening pace display
    const listeningPaceDisplay = userListeningPaceData.isReliable
        ? formatListeningPaceDisplay(userListeningPaceData.averagePace)
        : 'No listening data yet';

    const listeningPaceMethod = userListeningPaceData.calculationMethod === 'recent_data'
        ? 'Based on recent listening activity'
        : 'Default estimate';

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
            <ThemedView backgroundColor="background" style={styles.container}>
                <AppHeader title="Reading Stats" onBack={handleBackPress} />

                <ThemedScrollView backgroundColor="background" style={styles.content}>
                    {/* 1. Overall Progress Overview */}
                    <TotalProgressRingChart />

                    {/* 2. Key Stats Cards - Quick overview metrics */}
                    <ReadingStatsCards />

                    {/* 3. Category Selection */}
                    <ReadingListeningToggle
                        selectedCategory={selectedCategory}
                        onCategoryChange={setSelectedCategory}
                    />

                    {/* 4. Daily Progress Tracking - Format Specific */}
                    {selectedCategory === 'reading' && <DailyReadingProgressChart />}
                    {selectedCategory === 'listening' && <DailyListeningProgressChart />}
                    {selectedCategory === 'combined' && <DailyPagesChart />}

                    {/* 5. Activity Patterns */}
                    <WeeklyReadingHeatmap />

                    {/* 6. Reading Calendar - Daily reading history */}
                    <ReadingCalendar selectedCategory={selectedCategory} dateRange="90d" />

                    {/* 7. Format Distribution - Reading habits */}
                    <FormatDistributionChart />

                    {/* 8. Reading & Listening Pace Analysis */}
                    <ThemedView backgroundColor="card" borderColor="border" style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <IconSymbol name="speedometer" size={24} color={iconColor} />
                            <ThemedText type="semiBold" style={styles.sectionTitle}>
                                Reading & Listening Pace
                            </ThemedText>
                        </View>

                        <View style={styles.paceRow}>
                            {/* Reading Pace */}
                            <View style={styles.paceColumn}>
                                <View style={styles.paceHeader}>
                                    <IconSymbol name="book.fill" size={20} color={theme.primary} />
                                    <ThemedText type="semiBold" style={styles.paceColumnTitle}>
                                        Reading
                                    </ThemedText>
                                </View>
                                <ThemedText style={styles.paceValue}>
                                    {paceDisplay}
                                </ThemedText>
                                <ThemedText color="textMuted" style={styles.paceDescription}>
                                    {paceMethod}
                                </ThemedText>
                                {userPaceData.isReliable && (
                                    <ThemedText color="textMuted" style={styles.dataPointsTextSmall}>
                                        {userPaceData.readingDaysCount} reading days
                                    </ThemedText>
                                )}
                            </View>

                            {/* Listening Pace */}
                            <View style={[styles.paceColumn, styles.paceColumnRight]}>
                                <View style={styles.paceHeader}>
                                    <IconSymbol name="headphones" size={20} color={theme.accent} />
                                    <ThemedText type="semiBold" style={styles.paceColumnTitle}>
                                        Listening
                                    </ThemedText>
                                </View>
                                <ThemedText style={styles.paceValue}>
                                    {listeningPaceDisplay}
                                </ThemedText>
                                <ThemedText color="textMuted" style={styles.paceDescription}>
                                    {listeningPaceMethod}
                                </ThemedText>
                                {userListeningPaceData.isReliable && (
                                    <ThemedText color="textMuted" style={styles.dataPointsTextSmall}>
                                        {userListeningPaceData.listeningDaysCount} listening days
                                    </ThemedText>
                                )}
                            </View>
                        </View>
                    </ThemedView>

                    {/* 10. How Pace is Calculated - Educational info */}
                    <ThemedView backgroundColor="card" borderColor="border" style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <IconSymbol name="info.circle.fill" size={24} color={iconColor} />
                            <ThemedText type="semiBold" style={styles.sectionTitle}>
                                How Pace is Calculated
                            </ThemedText>
                        </View>

                        <View style={styles.infoContainer}>
                            <ThemedText color="textMuted" style={styles.infoText}>
                                Your reading pace is based on the average pages read per day within the last 14 days starting from your most recent logged day.
                            </ThemedText>
                            {/* example */}
                            <ThemedText color="textMuted" style={styles.infoText}>
                                If today is December 25th and the last progress update was December 15th, your pace is calculated based on your average from December 2nd - December 15th.
                            </ThemedText>
                        </View>
                    </ThemedView>
                </ThemedScrollView>
            </ThemedView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    section: {
        borderRadius: 12,
        borderWidth: 1,
        padding: 20,
        marginBottom: 20,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        marginLeft: 12,
    },
    statContainer: {
        alignItems: 'center',
    },
    statValue: {
        fontSize: 24,
        fontWeight: '600',
        textAlign: 'center',
        marginBottom: 8,
    },
    statDescription: {
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 12,
    },
    reliabilityContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
    },
    reliabilityText: {
        fontSize: 14,
        fontWeight: '500',
        marginLeft: 6,
    },
    dataPointsText: {
        fontSize: 12,
        textAlign: 'center',
    },
    paceRow: {
        flexDirection: 'row',
        gap: 16,
        paddingHorizontal: 4,
    },
    paceColumn: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 8,
    },
    paceColumnRight: {
        borderLeftWidth: 1,
        borderColor: '#E0E0E0',
        paddingLeft: 16,
        marginLeft: 4,
    },
    paceHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    paceColumnTitle: {
        fontSize: 15,
        marginLeft: 8,
        fontWeight: '600',
    },
    paceValue: {
        fontSize: 22,
        fontWeight: '700',
        textAlign: 'center',
        marginBottom: 8,
        lineHeight: 28,
    },
    paceDescription: {
        fontSize: 13,
        textAlign: 'center',
        marginBottom: 12,
        lineHeight: 18,
    },
    reliabilityTextSmall: {
        fontSize: 13,
        fontWeight: '500',
        marginLeft: 6,
        textAlign: 'center',
    },
    dataPointsTextSmall: {
        fontSize: 12,
        textAlign: 'center',
        marginTop: 8,
        lineHeight: 16,
    },
    infoContainer: {
        gap: 12,
    },
    infoText: {
        fontSize: 14,
        lineHeight: 20,
    },
    infoItem: {
        flexDirection: 'row',
        marginTop: 8,
    },
    infoTextContainer: {
        flex: 1,
        marginLeft: 12,
        marginTop: -2, // move it up slightly to align with the icon
    },
    infoItemTitle: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 4,
    },
    infoItemText: {
        fontSize: 14,
        lineHeight: 20,
    },
    infoNote: {
        fontSize: 13,
        lineHeight: 18,
        fontStyle: 'italic',
        marginTop: 8,
    },
    comingSoonContainer: {
        gap: 8,
    },
    comingSoonText: {
        fontSize: 14,
        marginBottom: 8,
    },
    comingSoonItem: {
        fontSize: 14,
        marginLeft: 8,
    },
});