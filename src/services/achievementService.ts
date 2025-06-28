import { useSupabase } from '@/lib/supabase';
import { useUser } from '@clerk/clerk-expo';
import { useDeadlines } from '@/contexts/DeadlineProvider';
import { Database } from '@/types/supabase';
import { AchievementCalculator, CalculatorContext } from './achievementCalculator';

type Achievement = Database['public']['Tables']['achievements']['Row'];
type UserAchievement = Database['public']['Tables']['user_achievements']['Row'];

interface AchievementWithStatus extends Achievement {
    isUnlocked: boolean;
    progress?: number;
    maxProgress?: number;
    percentage?: number;
    unlockedAt?: string;
}

export class AchievementService {
    private calculator: AchievementCalculator;

    constructor(
        private supabase: any,
        private userId: string,
        private activeDeadlines: any[]
    ) {
        // Initialize calculator with context
        const context: CalculatorContext = {
            activeDeadlines: this.activeDeadlines,
            userId: this.userId
        };
        this.calculator = new AchievementCalculator(context);
    }

    // Calculate current progress for an achievement using centralized calculator
    private calculateProgress(achievement: Achievement) {
        return this.calculator.calculateProgress(achievement);
    }

    // Check if achievement criteria is met
    private isAchievementMet(achievement: Achievement): boolean {
        const progress = this.calculateProgress(achievement);
        return progress.achieved;
    }

    // Get all achievements with their current status
    async getAchievementsWithStatus(): Promise<AchievementWithStatus[]> {
        // Fetch all achievements
        const { data: achievements, error: achievementsError } = await this.supabase
            .from('achievements')
            .select('*')
            .eq('is_active', true)
            .order('sort_order', { ascending: true });

        if (achievementsError) throw achievementsError;

        // Fetch user's unlocked achievements
        const { data: userAchievements, error: userError } = await this.supabase
            .from('user_achievements')
            .select('*')
            .eq('user_id', this.userId);

        if (userError) throw userError;

        const unlockedMap = new Map(
            userAchievements.map((ua: UserAchievement) => [ua.achievement_id, ua])
        );

        // Combine achievements with user status
        return achievements.map((achievement: Achievement) => {
            const userAchievement = unlockedMap.get(achievement.id) as UserAchievement | undefined;
            const progressData = this.calculateProgress(achievement);
            
            return {
                ...achievement,
                isUnlocked: !!userAchievement,
                progress: progressData.current,
                maxProgress: progressData.max,
                percentage: progressData.percentage,
                unlockedAt: userAchievement?.unlocked_at
            };
        });
    }

    // Check for new achievements and unlock them
    async checkAndUnlockAchievements(): Promise<string[]> {
        const achievements = await this.getAchievementsWithStatus();
        const newlyUnlocked: string[] = [];

        for (const achievement of achievements) {
            if (!achievement.isUnlocked && this.isAchievementMet(achievement)) {
                try {
                    // Unlock the achievement
                    const { error } = await this.supabase
                        .from('user_achievements')
                        .insert({
                            user_id: this.userId,
                            achievement_id: achievement.id,
                            progress_data: {
                                progress: achievement.progress,
                                maxProgress: achievement.maxProgress,
                                percentage: achievement.percentage,
                                unlockedValue: achievement.progress
                            }
                        });

                    if (!error) {
                        newlyUnlocked.push(achievement.id);
                        
                        // Also update/insert progress tracking
                        await this.supabase
                            .from('achievement_progress')
                            .upsert({
                                user_id: this.userId,
                                achievement_id: achievement.id,
                                current_value: achievement.progress || 0,
                                max_value: achievement.maxProgress || 1,
                                metadata: {
                                    type: achievement.type,
                                    criteria: achievement.criteria
                                }
                            });
                    }
                } catch (error) {
                    console.error(`Failed to unlock achievement ${achievement.id}:`, error);
                }
            }
        }

        return newlyUnlocked;
    }

    // Update progress for all achievements (called when user data changes)
    async updateProgress(): Promise<void> {
        const achievements = await this.getAchievementsWithStatus();

        for (const achievement of achievements) {
            try {
                await this.supabase
                    .from('achievement_progress')
                    .upsert({
                        user_id: this.userId,
                        achievement_id: achievement.id,
                        current_value: achievement.progress || 0,
                        max_value: achievement.maxProgress || 1,
                        metadata: {
                            type: achievement.type,
                            criteria: achievement.criteria,
                            lastChecked: new Date().toISOString()
                        }
                    });
            } catch (error) {
                console.error(`Failed to update progress for ${achievement.id}:`, error);
            }
        }
    }
}

// Hook to use the achievement service
export const useAchievements = () => {
    const supabase = useSupabase();
    const { user } = useUser();
    const { activeDeadlines } = useDeadlines();
    const userId = user?.id;

    const achievementService = userId 
        ? new AchievementService(supabase, userId, activeDeadlines || [])
        : null;

    return {
        getAchievements: () => achievementService?.getAchievementsWithStatus(),
        checkAndUnlock: () => achievementService?.checkAndUnlockAchievements(),
        updateProgress: () => achievementService?.updateProgress(),
        isReady: !!achievementService
    };
};