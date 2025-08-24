import { useSupabase } from '@/lib/supabase';
import * as achievementCalculators from '@/services/achievements/achievementCalculator';
import { ACHIEVEMENT_CONFIGS } from '@/services/achievements/achievementConfigs';
import { Database } from '@/types/supabase';
import { useAuth } from '@clerk/clerk-expo';
import { useQuery } from '@tanstack/react-query';

type Achievement = Database['public']['Tables']['achievements']['Row'];
type UserAchievement = Database['public']['Tables']['user_achievements']['Row'];

interface AchievementWithProgress extends Achievement {
    isUnlocked: boolean;
    progress?: number;
    percentage?: number;
    unlockedAt?: string;
}

const ACHIEVEMENTS_QUERY_KEY = ['achievements'] as const;
const STALE_TIME = 5 * 60 * 1000; // 5 minutes

/**
 * Fetch all active achievements from database
 */
async function fetchAchievements(supabase: ReturnType<typeof useSupabase>): Promise<Achievement[]> {
    const { data, error } = await supabase
        .from('achievements')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');
    
    if (error) throw error;
    return data || [];
}

/**
 * Fetch user's achievement progress
 */
async function fetchUserAchievements(supabase: ReturnType<typeof useSupabase>, userId: string): Promise<UserAchievement[]> {
    const { data, error } = await supabase
        .from('user_achievements')
        .select('*')
        .eq('user_id', userId);
    
    if (error) throw error;
    return data || [];
}

/**
 * Main query function that combines achievements with progress calculation
 */
async function fetchAchievementsWithProgress(
    supabase: ReturnType<typeof useSupabase>,
    userId: string
): Promise<AchievementWithProgress[]> {
    // Fetch base data in parallel
    const [achievements, userAchievements] = await Promise.all([
        fetchAchievements(supabase),
        fetchUserAchievements(supabase, userId)
    ]);

    // Create lookup map for user achievements
    const userAchievementMap = new Map(
        userAchievements.map(ua => [ua.achievement_id, ua])
    );

    // Process each achievement with progress calculation
    const achievementsWithProgress = await Promise.all(
        achievements.map(async (achievement) => {
            const userAchievement = userAchievementMap.get(achievement.id);
            const config = ACHIEVEMENT_CONFIGS.find(c => c.id === achievement.id);
            
            let progress = 0;
            let percentage: number | undefined;
            
            // Calculate current progress using calculator functions
            if (config?.calculatorFunction) {
                try {
                    const calculatorFn = (achievementCalculators as any)[config.calculatorFunction];
                    if (calculatorFn) {
                        progress = await calculatorFn(userId, config);
                        percentage = config.targetValue > 0 ? Math.min((progress / config.targetValue) * 100, 100) : 0;
                    }
                } catch (error) {
                    console.warn(`Failed to calculate progress for ${achievement.id}:`, error);
                }
            }

            // Determine if achievement is unlocked
            const isUnlocked = userAchievement?.unlocked_at !== null || 
                              (config?.targetValue && progress >= config.targetValue) || 
                              false;

            return {
                ...achievement,
                isUnlocked,
                progress,
                percentage,
                unlockedAt: userAchievement?.unlocked_at || undefined
            } as AchievementWithProgress;
        })
    );

    // Sort achievements: unlocked first, then by progress percentage
    return achievementsWithProgress.sort((a, b) => {
        if (a.isUnlocked !== b.isUnlocked) {
            return a.isUnlocked ? -1 : 1;
        }
        return (b.percentage ?? 0) - (a.percentage ?? 0);
    });
}

export function useAchievementsQuery() {
    const supabase = useSupabase();
    const { userId } = useAuth();

    const { data, isLoading, isError } = useQuery({
        queryKey: [...ACHIEVEMENTS_QUERY_KEY, userId],
        queryFn: () => fetchAchievementsWithProgress(supabase, userId!),
        enabled: !!userId,
        staleTime: STALE_TIME,
    });

    const achievements = data || [];
    const totalUnlocked = achievements.filter(a => a.isUnlocked).length;
    const totalAchievements = achievements.length;

    return {
        achievements,
        totalUnlocked,
        totalAchievements,
        isLoading,
        isError
    };
}