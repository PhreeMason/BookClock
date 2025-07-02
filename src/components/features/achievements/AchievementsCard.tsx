import { AchievementsSkeleton } from '@/components/features/achievements/AchievementsSkeleton';
import { ThemedText, ThemedView } from '@/components/themed';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useAchievementsQuery } from '@/hooks/useAchievementsQuery';
import { useTheme } from '@/theme';
import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';


const AchievementsCard: React.FC = () => {
    const { theme } = useTheme();
    const { 
        achievements, 
        totalUnlocked, 
        totalAchievements, 
        isLoading,
        isError
    } = useAchievementsQuery();

    // Memoize sorted achievements
    const sortedAchievements = useMemo(() => {
        return [...achievements].sort((a, b) => {
            // Sort by unlocked status first (unlocked first), then by progress
            if (a.isUnlocked !== b.isUnlocked) {
                return a.isUnlocked ? -1 : 1;
            }
            // Then by progress percentage
            return (b.progress ?? 0) - (a.progress ?? 0);
        });
    }, [achievements]);

    // Helper function to get theme color - memoized
    const getThemeColor = useMemo(() => {
        return (colorName: string): string => {
            switch (colorName) {
                case 'primary': return theme.primary;
                case 'accent': return theme.accent;
                case 'success': return theme.success;
                case 'warning': return theme.warning;
                case 'info': return theme.info;
                default: return theme.primary;
            }
        };
    }, [theme]);

    if (isLoading) {
        return <AchievementsSkeleton />;
    }

    if (isError) {
        return (
            <ThemedView backgroundColor="card" borderColor="border" style={styles.container}>
                <View style={styles.header}>
                    <IconSymbol name="exclamationmark.triangle" size={24} color={theme.warning} />
                    <ThemedText type="semiBold" style={styles.title}>
                        Achievements
                    </ThemedText>
                </View>
                <ThemedText color="textMuted" style={styles.errorText}>
                    Failed to load achievements. Please try again later.
                </ThemedText>
            </ThemedView>
        );
    }

    if (achievements.length === 0) {
        return (
            <ThemedView backgroundColor="card" borderColor="border" style={styles.container}>
                <View style={styles.header}>
                    <IconSymbol name="checkmark.circle.fill" size={24} color={theme.primary} />
                    <ThemedText type="semiBold" style={styles.title}>
                        Achievements
                    </ThemedText>
                </View>
                <ThemedText color="textMuted" style={styles.emptyText}>
                    No achievements available yet. Start reading to unlock achievements!
                </ThemedText>
            </ThemedView>
        );
    }


    return (
        <ThemedView backgroundColor="card" borderColor="border" style={styles.container}>
            <View style={styles.header}>
                <IconSymbol name="checkmark.circle.fill" size={24} color={theme.primary} />
                <ThemedText type="semiBold" style={styles.title}>
                    Achievements
                </ThemedText>
            </View>

            <View style={styles.progressHeader}>
                <ThemedText color="textMuted" style={styles.progressText}>
                    {totalUnlocked} of {totalAchievements} unlocked
                </ThemedText>
            </View>

            <ScrollView 
                style={styles.achievementsScrollView}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.achievementsList}
            >
                {sortedAchievements.map((achievement) => (
                    <View key={achievement.id} style={styles.achievementItem}>
                        <View style={[
                            styles.iconContainer,
                            { 
                                backgroundColor: achievement.isUnlocked 
                                    ? getThemeColor(achievement.color) + '20' 
                                    : theme.surface 
                            }
                        ]}>
                            <IconSymbol 
                                name={achievement.icon as any} 
                                size={18} 
                                color={achievement.isUnlocked ? getThemeColor(achievement.color) : theme.textMuted} 
                            />
                        </View>
                        
                        <View style={styles.achievementContent}>
                            <View style={styles.achievementHeader}>
                                <ThemedText style={[
                                    styles.achievementTitle,
                                    { opacity: achievement.isUnlocked ? 1 : 0.7 }
                                ]}>
                                    {achievement.title}
                                </ThemedText>
                                {achievement.isUnlocked && (
                                    <View style={styles.unlockedBadge}>
                                        <IconSymbol name="checkmark.circle.fill" size={14} color={theme.success} />
                                    </View>
                                )}
                            </View>
                            
                            <ThemedText color="textMuted" style={styles.achievementDescription}>
                                {achievement.description}
                            </ThemedText>
                            
                            {achievement.progress !== undefined && achievement.progress < 100 && (
                                <View style={styles.progressContainer}>
                                    <View style={styles.progressBar}>
                                        <View 
                                            style={[
                                                styles.progressFill,
                                                { 
                                                    width: `${achievement.progress}%`,
                                                    backgroundColor: achievement.isUnlocked 
                                                        ? getThemeColor(achievement.color) 
                                                        : theme.textMuted
                                                }
                                            ]}
                                        />
                                    </View>
                                    <ThemedText color="textMuted" style={styles.progressPercent}>
                                        {Math.round(achievement.progress)}%
                                    </ThemedText>
                                </View>
                            )}
                        </View>
                    </View>
                ))}
            </ScrollView>
        </ThemedView>
    );
};

const styles = StyleSheet.create({
    container: {
        borderRadius: 12,
        borderWidth: 1,
        padding: 16,
        marginBottom: 20,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    title: {
        fontSize: 18,
        marginLeft: 12,
    },
    achievementsScrollView: {
        maxHeight: 320,
    },
    achievementsList: {
        gap: 12,
    },
    achievementItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    iconContainer: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
    },
    achievementContent: {
        flex: 1,
    },
    achievementHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    achievementTitle: {
        fontSize: 15,
        fontWeight: '600',
        flex: 1,
    },
    unlockedBadge: {
        marginLeft: 6,
    },
    achievementDescription: {
        fontSize: 13,
        marginBottom: 6,
        lineHeight: 18,
    },
    progressContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    progressBar: {
        flex: 1,
        height: 6,
        backgroundColor: '#E0E0E0',
        borderRadius: 3,
        overflow: 'hidden',
        marginRight: 8,
    },
    progressFill: {
        height: '100%',
        borderRadius: 3,
    },
    progressText: {
        fontSize: 12,
        fontWeight: '600',
        minWidth: 30,
    },
    emptyText: {
        fontSize: 14,
        textAlign: 'center',
        padding: 20,
        lineHeight: 20,
    },
    errorText: {
        fontSize: 14,
        textAlign: 'center',
        padding: 20,
        lineHeight: 20,
    },
    progressHeader: {
        marginBottom: 12,
    },
    progressPercent: {
        fontSize: 12,
        fontWeight: '600',
        minWidth: 40,
        textAlign: 'right',
    },
});

export default AchievementsCard;