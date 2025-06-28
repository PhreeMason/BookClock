import { ThemedText, ThemedView } from '@/components/themed';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useTheme } from '@/theme';
import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useAchievements } from '@/services/achievementService';

interface AchievementWithStatus {
    id: string;
    title: string;
    description: string;
    icon: string;
    color: string;
    isUnlocked: boolean;
    progress?: number;
    maxProgress?: number;
    percentage?: number;
    unlockedAt?: string;
}

const AchievementsCard: React.FC = () => {
    const { theme } = useTheme();
    const { getAchievements, checkAndUnlock, updateProgress, isReady } = useAchievements();
    const [achievements, setAchievements] = useState<AchievementWithStatus[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!isReady) {
            setIsLoading(false);
            return;
        }

        let isCancelled = false;

        const loadAchievements = async () => {
            try {
                setIsLoading(true);
                
                // Update progress first
                await updateProgress?.();
                
                // Check for new unlocks
                await checkAndUnlock?.();
                
                // Get updated achievements
                const achievementsData = await getAchievements?.();
                
                if (!isCancelled) {
                    if (achievementsData) {
                        setAchievements(achievementsData);
                    }
                }
            } catch (error) {
                if (!isCancelled) {
                    console.error('Failed to load achievements:', error);
                }
            } finally {
                if (!isCancelled) {
                    setIsLoading(false);
                }
            }
        };

        loadAchievements();

        return () => {
            isCancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isReady]); // Only depend on isReady to prevent infinite loop

    if (isLoading) {
        return (
            <ThemedView backgroundColor="card" borderColor="border" style={styles.container}>
                <View style={styles.header}>
                    <IconSymbol name="checkmark.circle.fill" size={24} color={theme.primary} />
                    <ThemedText type="semiBold" style={styles.title}>
                        Achievements
                    </ThemedText>
                </View>
                <ThemedText color="textMuted" style={styles.loadingText}>
                    Loading achievements...
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

    // Helper function to get theme color
    const getThemeColor = (colorName: string): string => {
        switch (colorName) {
            case 'primary': return theme.primary;
            case 'accent': return theme.accent;
            case 'success': return theme.success;
            case 'warning': return theme.warning;
            case 'info': return theme.info;
            default: return theme.primary;
        }
    };

    return (
        <ThemedView backgroundColor="card" borderColor="border" style={styles.container}>
            <View style={styles.header}>
                <IconSymbol name="checkmark.circle.fill" size={24} color={theme.primary} />
                <ThemedText type="semiBold" style={styles.title}>
                    Achievements
                </ThemedText>
            </View>

            <View style={styles.achievementsList}>
                {achievements
                    .sort((a, b) => {
                        // Sort by unlocked status first (unlocked first), then by title
                        if (a.isUnlocked !== b.isUnlocked) {
                            return a.isUnlocked ? -1 : 1;
                        }
                        return a.title.localeCompare(b.title);
                    })
                    .map((achievement) => (
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
                                size={20} 
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
                                        <IconSymbol name="checkmark.circle.fill" size={16} color={theme.success} />
                                    </View>
                                )}
                            </View>
                            
                            <ThemedText color="textMuted" style={styles.achievementDescription}>
                                {achievement.description}
                            </ThemedText>
                            
                            {achievement.progress !== undefined && achievement.maxProgress && (
                                <View style={styles.progressContainer}>
                                    <View style={styles.progressBar}>
                                        <View 
                                            style={[
                                                styles.progressFill,
                                                { 
                                                    width: `${(achievement.progress / achievement.maxProgress) * 100}%`,
                                                    backgroundColor: achievement.isUnlocked 
                                                        ? getThemeColor(achievement.color) 
                                                        : theme.textMuted
                                                }
                                            ]}
                                        />
                                    </View>
                                    <ThemedText color="textMuted" style={styles.progressText}>
                                        {achievement.progress}/{achievement.maxProgress}
                                    </ThemedText>
                                </View>
                            )}
                        </View>
                    </View>
                ))}
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
    achievementsList: {
        gap: 16,
    },
    achievementItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
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
        fontSize: 16,
        fontWeight: '600',
        flex: 1,
    },
    unlockedBadge: {
        marginLeft: 8,
    },
    achievementDescription: {
        fontSize: 14,
        marginBottom: 8,
        lineHeight: 20,
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
    loadingText: {
        fontSize: 14,
        textAlign: 'center',
        padding: 20,
    },
    emptyText: {
        fontSize: 14,
        textAlign: 'center',
        padding: 20,
        lineHeight: 20,
    },
});

export default AchievementsCard;