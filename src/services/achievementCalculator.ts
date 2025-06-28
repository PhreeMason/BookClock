import { Database } from '@/types/supabase';
import dayjs from 'dayjs';

type Achievement = Database['public']['Tables']['achievements']['Row'];

export interface AchievementProgress {
    current: number;
    max: number;
    percentage: number;
    achieved: boolean;
}

export interface CalculatorContext {
    activeDeadlines: any[];
    completedBooks?: any[];
    dailyReadingData?: any[];
    userId?: string;
}

/**
 * Centralized achievement progress calculator
 * Handles all achievement types with custom logic for each
 */
export class AchievementCalculator {
    constructor(private context: CalculatorContext) {}

    /**
     * Calculate progress for a specific achievement
     */
    calculateProgress(achievement: Achievement): AchievementProgress {
        const criteria = achievement.criteria as any;
        
        switch (achievement.id) {
            case 'ambitious_reader':
                return this.calculateAmbitiousReader(criteria);
            
            case 'format_explorer':
                return this.calculateFormatExplorer(criteria);
            
            case 'consistency_champion':
                return this.calculateConsistencyChampion(criteria);
            
            case 'speed_reader':
                return this.calculateSpeedReader(criteria);
            
            case 'marathon_listener':
                return this.calculateMarathonListener(criteria);
            
            case 'library_warrior':
                return this.calculateLibraryWarrior(criteria);
            
            case 'early_finisher':
                return this.calculateEarlyFinisher(criteria);
            
            case 'page_turner':
                return this.calculatePageTurner(criteria);
            
            default:
                return { current: 0, max: 1, percentage: 0, achieved: false };
        }
    }

    private calculateAmbitiousReader(criteria: any): AchievementProgress {
        const target = criteria.target || 5;
        const current = this.context.activeDeadlines?.length || 0;
        
        return {
            current,
            max: target,
            percentage: Math.min((current / target) * 100, 100),
            achieved: current >= target
        };
    }

    private calculateFormatExplorer(criteria: any): AchievementProgress {
        const target = criteria.target || 2;
        const formatTypes = new Set(this.context.activeDeadlines?.map(d => d.format) || []);
        const current = formatTypes.size;
        
        return {
            current,
            max: target,
            percentage: Math.min((current / target) * 100, 100),
            achieved: current >= target
        };
    }

    private calculateConsistencyChampion(criteria: any): AchievementProgress {
        const target = criteria.target || 7;
        
        // Get all unique reading dates from progress data
        const readingDates = new Set<string>();
        this.context.activeDeadlines?.forEach(deadline => {
            if (deadline.progress && deadline.progress.length > 0) {
                deadline.progress.forEach((entry: any) => {
                    const date = dayjs(entry.created_at).format('YYYY-MM-DD');
                    readingDates.add(date);
                });
            }
        });

        // Calculate current streak (consecutive days from today backwards)
        let currentStreak = 0;
        const today = dayjs();
        
        for (let i = 0; i < 30; i++) { // Check last 30 days max
            const checkDate = today.subtract(i, 'day').format('YYYY-MM-DD');
            if (readingDates.has(checkDate)) {
                currentStreak++;
            } else if (i > 0) { // Don't break on first day (today might not have reading yet)
                break;
            }
        }
        
        const current = Math.min(currentStreak, target);
        
        return {
            current,
            max: target,
            percentage: Math.min((current / target) * 100, 100),
            achieved: current >= target
        };
    }

    private calculateSpeedReader(criteria: any): AchievementProgress {
        const target = criteria.target || 50; // 50 pages in a single day
        
        // Calculate daily reading from deadline progress
        const dailyProgress: Record<string, number> = {};
        
        this.context.activeDeadlines?.forEach(deadline => {
            if (!deadline.progress || deadline.progress.length === 0) return;

            const sortedProgress = [...deadline.progress].sort((a, b) => 
                new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
            );

            let previousProgress = 0;
            sortedProgress.forEach(entry => {
                const date = dayjs(entry.created_at).format('YYYY-MM-DD');
                const progressDelta = Math.max(0, entry.current_progress - previousProgress);
                
                // Convert to page equivalents
                let pagesRead = 0;
                if (deadline.format === 'physical') {
                    pagesRead = progressDelta;
                } else if (deadline.format === 'ebook') {
                    pagesRead = (progressDelta / 100) * 300; // Assume 300 pages average
                } else if (deadline.format === 'audio') {
                    pagesRead = progressDelta / 1.5; // 1.5 minutes per page
                }
                
                dailyProgress[date] = (dailyProgress[date] || 0) + pagesRead;
                previousProgress = entry.current_progress;
            });
        });
        
        const maxDailyPages = Math.max(0, ...Object.values(dailyProgress));
        const current = Math.min(maxDailyPages, target);
        
        return {
            current: Math.round(current),
            max: target,
            percentage: Math.min((current / target) * 100, 100),
            achieved: current >= target
        };
    }

    private calculateMarathonListener(criteria: any): AchievementProgress {
        const target = criteria.target || 480; // 8 hours = 480 minutes
        
        // Calculate daily audio listening
        const dailyAudio: Record<string, number> = {};
        
        this.context.activeDeadlines?.forEach(deadline => {
            if (deadline.format !== 'audio' || !deadline.progress?.length) return;

            const sortedProgress = [...deadline.progress].sort((a, b) => 
                new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
            );

            let previousProgress = 0;
            sortedProgress.forEach(entry => {
                const date = dayjs(entry.created_at).format('YYYY-MM-DD');
                const minutesListened = Math.max(0, entry.current_progress - previousProgress);
                
                dailyAudio[date] = (dailyAudio[date] || 0) + minutesListened;
                previousProgress = entry.current_progress;
            });
        });
        
        const maxDailyAudio = Math.max(0, ...Object.values(dailyAudio));
        const current = Math.min(maxDailyAudio, target);
        
        return {
            current: Math.round(current),
            max: target,
            percentage: Math.min((current / target) * 100, 100),
            achieved: current >= target
        };
    }

    private calculateLibraryWarrior(criteria: any): AchievementProgress {
        const target = criteria.target || 10;
        
        // Count completed library books
        const libraryBooksCount = this.context.activeDeadlines?.filter(deadline => 
            deadline.source === 'library' && 
            deadline.progress?.length > 0
        ).length || 0;
        
        const current = Math.min(libraryBooksCount, target);
        
        return {
            current,
            max: target,
            percentage: Math.min((current / target) * 100, 100),
            achieved: current >= target
        };
    }

    private calculateEarlyFinisher(criteria: any): AchievementProgress {
        // Check if any book was finished significantly ahead of deadline
        // This is complex and would need completion tracking
        // For now, return 0 as this requires completion data we don't have
        
        return {
            current: 0,
            max: 1,
            percentage: 0,
            achieved: false
        };
    }

    private calculatePageTurner(criteria: any): AchievementProgress {
        const target = criteria.target || 1000;
        
        // Calculate total page equivalents read
        let totalPages = 0;
        
        this.context.activeDeadlines?.forEach(deadline => {
            if (!deadline.progress?.length) return;
            
            const latestProgress = deadline.progress[deadline.progress.length - 1];
            let pagesRead = 0;
            
            if (deadline.format === 'physical') {
                pagesRead = latestProgress.current_progress;
            } else if (deadline.format === 'ebook') {
                pagesRead = (latestProgress.current_progress / 100) * 300;
            } else if (deadline.format === 'audio') {
                pagesRead = latestProgress.current_progress / 1.5;
            }
            
            totalPages += pagesRead;
        });
        
        const current = Math.min(totalPages, target);
        
        return {
            current: Math.round(current),
            max: target,
            percentage: Math.min((current / target) * 100, 100),
            achieved: current >= target
        };
    }
}