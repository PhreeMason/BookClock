import { ThemedScrollView, ThemedText, ThemedView } from '@/components/themed';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { usePace } from '@/contexts/PaceProvider';
import { formatCombinedPaceDisplay } from '@/lib/paceCalculations';
import { useTheme } from '@/theme';
import { router } from 'expo-router';
import React from 'react';
import { Platform, StyleSheet, TouchableOpacity, View } from 'react-native';
import FormatDistributionChart from '@/components/FormatDistributionChart';
import TotalProgressRingChart from '@/components/TotalProgressRingChart';
import WeeklyReadingHeatmap from '@/components/WeeklyReadingHeatmap';
import ReadingStatsCards from '@/components/ReadingStatsCards';
import ReadingVelocityChart from '@/components/ReadingVelocityChart';
import DailyPagesChart from '@/components/DailyPagesChart';
import AchievementsCard from '@/components/AchievementsCard';

export default function StatsScreen() {
    const { theme } = useTheme();
    const { userPaceData } = usePace();
    const borderColor = theme.border;
    const iconColor = theme.primary;
    const successColor = theme.success;
    const warningColor = theme.warning;

    const handleBackPress = () => {
        router.back();
    };

    // Format reading pace display
    const paceDisplay = userPaceData.isReliable
        ? formatCombinedPaceDisplay(userPaceData.averagePace)
        : 'No pace data yet';

    const paceMethod = userPaceData.calculationMethod === 'recent_data' 
        ? 'Based on recent reading activity' 
        : 'Default estimate';

    const reliabilityText = userPaceData.isReliable 
        ? 'Reliable (≥3 reading days)' 
        : 'Estimate (insufficient data)';

    const reliabilityColor = userPaceData.isReliable ? successColor : warningColor;

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

                {/* 2. Achievements - Motivational and goal-oriented */}
                <AchievementsCard />

                {/* 3. Key Stats Cards - Quick overview metrics */}
                <ReadingStatsCards />

                {/* 4. Daily Progress Tracking */}
                <DailyPagesChart />

                {/* 5. Reading Velocity - Performance over time */}
                <ReadingVelocityChart />

                {/* 6. Activity Patterns */}
                <WeeklyReadingHeatmap />

                {/* 7. Format Distribution - Reading habits */}
                <FormatDistributionChart />

                {/* 8. Reading Pace Analysis */}
                <ThemedView backgroundColor="card" borderColor="border" style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <IconSymbol name="speedometer" size={24} color={iconColor} />
                        <ThemedText type="semiBold" style={styles.sectionTitle}>
                            Reading Pace
                        </ThemedText>
                    </View>
                    
                    <View style={styles.statContainer}>
                        <ThemedText style={styles.statValue}>
                            {paceDisplay}
                        </ThemedText>
                        <ThemedText color="textMuted" style={styles.statDescription}>
                            {paceMethod}
                        </ThemedText>
                        <View style={styles.reliabilityContainer}>
                            <IconSymbol 
                                name={userPaceData.isReliable ? "checkmark.circle.fill" : "exclamationmark.triangle.fill"} 
                                size={16} 
                                color={reliabilityColor} 
                            />
                            <ThemedText style={[styles.reliabilityText, { color: reliabilityColor }]}>
                                {reliabilityText}
                            </ThemedText>
                        </View>
                        
                        {userPaceData.isReliable && (
                            <ThemedText color="textMuted" style={styles.dataPointsText}>
                                Based on {userPaceData.readingDaysCount} reading days
                            </ThemedText>
                        )}
                    </View>
                </ThemedView>

                {/* 9. How Pace is Calculated - Educational info */}
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
                            Time equivalents are calculated using 1.5 minutes per page, which matches audiobook conversion rates.
                        </ThemedText>
                    </View>
                </ThemedView>

                {/* Coming Soon Section */}
                <ThemedView backgroundColor="card" borderColor="border" style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <IconSymbol name="clock.fill" size={24} color={iconColor} />
                        <ThemedText type="semiBold" style={styles.sectionTitle}>
                            Coming Soon
                        </ThemedText>
                    </View>
                    
                    <View style={styles.comingSoonContainer}>
                        <ThemedText color="textMuted" style={styles.comingSoonText}>
                            More stats coming soon:
                        </ThemedText>
                        <ThemedText color="textMuted" style={styles.comingSoonItem}>
                            • Reading streaks and consistency
                        </ThemedText>
                        <ThemedText color="textMuted" style={styles.comingSoonItem}>
                            • Books completed over time
                        </ThemedText>
                        <ThemedText color="textMuted" style={styles.comingSoonItem}>
                            • Average reading speed by format
                        </ThemedText>
                        <ThemedText color="textMuted" style={styles.comingSoonItem}>
                            • Progress towards reading goals
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