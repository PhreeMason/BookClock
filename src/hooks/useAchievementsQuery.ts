import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { AchievementService } from '@/services/achievementService';
import { useAuth } from '@clerk/clerk-expo';
import { useSupabase } from '@/lib/supabase';
import { useDeadlines } from '@/contexts/DeadlineProvider';
import Toast from 'react-native-toast-message';
import { Database } from '@/types/supabase';

type Achievement = Database['public']['Tables']['achievements']['Row'];
type AchievementCategory = Achievement['category'];

interface AchievementWithStatus extends Achievement {
    isUnlocked: boolean;
    progress?: number;
    maxProgress?: number;
    percentage?: number;
    unlockedAt?: string;
}

const ACHIEVEMENTS_QUERY_KEY = ['achievements'] as const;
const STALE_TIME = 5 * 60 * 1000; // 5 minutes
const CACHE_TIME = 30 * 60 * 1000; // 30 minutes

export function useAchievementsQuery() {
  const { userId } = useAuth();
  const queryClient = useQueryClient();
  const supabase = useSupabase();
  const { activeDeadlines } = useDeadlines();

  // Memoize the service instance
  const achievementService = useMemo(() => {
    return userId ? new AchievementService(supabase, userId, activeDeadlines) : null;
  }, [userId, supabase, activeDeadlines]);

  // Main query for fetching achievements with status
  const achievementsQuery = useQuery({
    queryKey: [...ACHIEVEMENTS_QUERY_KEY, userId],
    queryFn: async () => {
      if (!achievementService) {
        throw new Error('No user ID available');
      }
      return achievementService.getAchievementsWithStatus();
    },
    enabled: !!userId && !!achievementService,
    staleTime: STALE_TIME,
    gcTime: CACHE_TIME,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  // Mutation for unlocking achievements
  const unlockMutation = useMutation({
    mutationFn: async (achievementId: string) => {
      if (!achievementService) {
        throw new Error('No achievement service available');
      }
      // For now, we'll just mark it as unlocked in the database
      const { data, error } = await supabase
        .from('user_achievements')
        .insert({
          user_id: userId!,
          achievement_id: achievementId,
          unlocked_at: new Date().toISOString()
        })
        .select('*, achievements(*)')
        .single();
      
      if (error) throw error;
      return data.achievements;
    },
    onMutate: async (achievementId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: [...ACHIEVEMENTS_QUERY_KEY, userId] });

      // Snapshot the previous value
      const previousAchievements = queryClient.getQueryData<AchievementWithStatus[]>([
        ...ACHIEVEMENTS_QUERY_KEY,
        userId,
      ]);

      // Optimistically update the achievement
      if (previousAchievements) {
        queryClient.setQueryData<AchievementWithStatus[]>(
          [...ACHIEVEMENTS_QUERY_KEY, userId],
          (old) =>
            old?.map((achievement) =>
              achievement.id === achievementId
                ? { ...achievement, isUnlocked: true, unlockedAt: new Date().toISOString() }
                : achievement
            ) ?? []
        );
      }

      return { previousAchievements };
    },
    onError: (err, achievementId, context) => {
      // Revert to the previous state on error
      if (context?.previousAchievements) {
        queryClient.setQueryData(
          [...ACHIEVEMENTS_QUERY_KEY, userId],
          context.previousAchievements
        );
      }
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to unlock achievement'
      });
    },
    onSuccess: (data) => {
      Toast.show({
        type: 'success',
        text1: 'Achievement Unlocked!',
        text2: data.title
      });
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: [...ACHIEVEMENTS_QUERY_KEY, userId] });
    },
  });

  // Memoized data transformations
  const { achievementsByCategory, totalUnlocked, totalAchievements } = useMemo(() => {
    const achievements = achievementsQuery.data || [];
    
    const byCategory = achievements.reduce((acc, achievement) => {
      const category = achievement.category;
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(achievement);
      return acc;
    }, {} as Record<AchievementCategory, AchievementWithStatus[]>);

    // Sort achievements within each category
    Object.keys(byCategory).forEach((category) => {
      byCategory[category as AchievementCategory].sort((a, b) => {
        // Unlocked achievements first
        if (a.isUnlocked !== b.isUnlocked) {
          return a.isUnlocked ? -1 : 1;
        }
        // Then by progress percentage
        return (b.percentage ?? 0) - (a.percentage ?? 0);
      });
    });

    const unlocked = achievements.filter((a) => a.isUnlocked).length;
    const total = achievements.length;

    return {
      achievementsByCategory: byCategory,
      totalUnlocked: unlocked,
      totalAchievements: total,
    };
  }, [achievementsQuery.data]);

  return {
    achievements: achievementsQuery.data || [],
    achievementsByCategory,
    totalUnlocked,
    totalAchievements,
    isLoading: achievementsQuery.isLoading,
    isError: achievementsQuery.isError,
    error: achievementsQuery.error,
    refetch: achievementsQuery.refetch,
    unlockAchievement: unlockMutation.mutate,
    isUnlocking: unlockMutation.isPending,
  };
}