import AchievementsCard from '@/components/AchievementsCard';
import DailyListeningProgressChart from '@/components/DailyListeningProgressChart';
import DailyPagesChart from '@/components/DailyPagesChart';
import DailyReadingProgressChart from '@/components/DailyReadingProgressChart';
import FormatDistributionChart from '@/components/FormatDistributionChart';
import ReadingCalendar from '@/components/ReadingCalendar';
import ReadingListeningToggle, { FormatCategory } from '@/components/ReadingListeningToggle';
import ReadingStatsCards from '@/components/ReadingStatsCards';
import { ThemedScrollView, ThemedText, ThemedView } from '@/components/themed';
import TotalProgressRingChart from '@/components/TotalProgressRingChart';
import { IconSymbol } from '@/components/ui/IconSymbol';
import WeeklyReadingHeatmap from '@/components/WeeklyReadingHeatmap';
import { usePace } from '@/contexts/PaceProvider';
import { formatListeningPaceDisplay, formatPaceDisplay } from '@/lib/paceCalculations';
import { useTheme } from '@/theme';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Platform, StyleSheet, TouchableOpacity, View } from 'react-native';

export default function StatsScreen() {
    const { theme } = useTheme();
    const { userPaceData, userListeningPaceData } = usePace();
    const [selectedCategory, setSelectedCategory] = useState<FormatCategory>('combined');
    const borderColor = theme.border;
    const iconColor = theme.primary;
    const successColor = theme.success;
    const warningColor = theme.warning;

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

    const reliabilityText = userPaceData.isReliable 
        ? 'Reliable (≥3 reading days)' 
        : 'Estimate (insufficient data)';

    const reliabilityColor = userPaceData.isReliable ? successColor : warningColor;

    // Format listening pace display
    const listeningPaceDisplay = userListeningPaceData.isReliable
        ? formatListeningPaceDisplay(userListeningPaceData.averagePace)
        : 'No listening data yet';

    const listeningPaceMethod = userListeningPaceData.calculationMethod === 'recent_data' 
        ? 'Based on recent listening activity' 
        : 'Default estimate';

    const listeningReliabilityText = userListeningPaceData.isReliable 
        ? 'Reliable (≥3 listening days)' 
        : 'Estimate (insufficient data)';

    const listeningReliabilityColor = userListeningPaceData.isReliable ? successColor : warningColor;

    return (
        <ThemedView backgroundColor="background" style={styles.container}>
            {/* Header */}
            <View style={[styles.header, { borderBottomColor: borderColor }]}>
                <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
                    <IconSymbol name="chevron.left" size={Platform.OS === 'ios' ? 24 : 40} color={iconColor} />
                </TouchableOpacity>
                <ThemedText type="semiBold" style={styles.headerTitle}>
                    Reading Stats
                </ThemedText>
                <View style={styles.headerSpacer} />
            </View>

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

                {/* 8. Achievements - Motivational and goal-oriented */}
                <AchievementsCard />

                {/* 9. Reading & Listening Pace Analysis */}
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
                            <View style={styles.reliabilityContainer}>
                                <IconSymbol 
                                    name={userPaceData.isReliable ? "checkmark.circle.fill" : "exclamationmark.triangle.fill"} 
                                    size={14} 
                                    color={reliabilityColor} 
                                />
                                <ThemedText style={[styles.reliabilityTextSmall, { color: reliabilityColor }]}>
                                    {reliabilityText}
                                </ThemedText>
                            </View>
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
                            <View style={styles.reliabilityContainer}>
                                <IconSymbol 
                                    name={userListeningPaceData.isReliable ? "checkmark.circle.fill" : "exclamationmark.triangle.fill"} 
                                    size={14} 
                                    color={listeningReliabilityColor} 
                                />
                                <ThemedText style={[styles.reliabilityTextSmall, { color: listeningReliabilityColor }]}>
                                    {listeningReliabilityText}
                                </ThemedText>
                            </View>
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
                            Your reading pace is calculated using a two-tier system:
                        </ThemedText>
                        
                        <View style={styles.infoItem}>
                            <IconSymbol name="1.circle.fill" size={20} color={successColor} />
                            <View style={styles.infoTextContainer}>
                                <ThemedText style={styles.infoItemTitle}>Reliable Calculation</ThemedText>
                                <ThemedText color="textMuted" style={styles.infoItemText}>
                                    When you have ≥3 reading days in the last 7 days, we use your actual reading activity.
                                </ThemedText>
                            </View>
                        </View>
                        
                        <View style={styles.infoItem}>
                            <IconSymbol name="2.circle.fill" size={20} color={warningColor} />
                            <View style={styles.infoTextContainer}>
                                <ThemedText style={styles.infoItemTitle}>Default Estimate</ThemedText>
                                <ThemedText color="textMuted" style={styles.infoItemText}>
                                    When insufficient data is available, we use a default estimate of 25 pages/day.
                                </ThemedText>
                            </View>
                        </View>
                        
                        <ThemedText color="textMuted" style={styles.infoNote}>
                            Reading pace is based only on physical books and ebooks (measured in pages). Audiobook listening pace is tracked separately.
                        </ThemedText>
                    </View>
                </ThemedView>
            </ThemedScrollView>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 15,
        borderBottomWidth: 1,
    },
    backButton: {
        marginRight: 8,
    },
    headerTitle: {
        fontSize: 18,
        flex: 1,
        textAlign: 'center',
    },
    headerSpacer: {
        width: 40,
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