import { useSupabase } from '@/lib/supabase';
import dayjs from 'dayjs';

/**
 * Shared streak calculation function
 * Plan: Query all reading_deadline_progress for user, group by date, calculate consecutive streaks
 * Data Source: Supabase query to reading_deadline_progress via reading_deadlines user_id
 * Returns: { currentStreak: number, maxStreak: number }
 */
const calculateReadingStreaks = async (userId: string): Promise<{ currentStreak: number; maxStreak: number }> => {
    const supabase = useSupabase();
    
    // Get all progress entries for user
    const { data: progressData, error } = await supabase
        .from('reading_deadline_progress')
        .select(`
            created_at,
            reading_deadline:reading_deadlines!inner(user_id)
        `)
        .eq('reading_deadline.user_id', userId);
    
    if (error || !progressData) {
        return { currentStreak: 0, maxStreak: 0 };
    }
    
    // Get unique reading dates
    const readingDates = new Set<string>();
    progressData.forEach(entry => {
        const date = dayjs(entry.created_at).format('YYYY-MM-DD');
        readingDates.add(date);
    });
    
    const sortedDates = Array.from(readingDates).sort();
    
    // Calculate current streak (from today backwards)
    let currentStreak = 0;
    const today = dayjs();
    for (let i = 0; i <= 1095; i++) {
        const checkDate = today.subtract(i, 'day').format('YYYY-MM-DD');
        if (readingDates.has(checkDate)) {
            if (i === 0 || currentStreak > 0) {
                currentStreak++;
            }
        } else if (i > 0) {
            break;
        }
    }
    
    // Calculate max historical streak
    let maxStreak = 0;
    let tempStreak = 0;
    let previousDate: dayjs.Dayjs | null = null;
    
    for (const dateStr of sortedDates) {
        const currentDate = dayjs(dateStr);
        if (previousDate && currentDate.diff(previousDate, 'day') === 1) {
            tempStreak++;
        } else {
            maxStreak = Math.max(maxStreak, tempStreak);
            tempStreak = 1;
        }
        previousDate = currentDate;
    }
    maxStreak = Math.max(maxStreak, tempStreak);
    
    return { currentStreak, maxStreak };
};

/**
 * Ambitious Reader Achievement Calculator
 * Plan: Count active reading deadlines for the user
 * Data Source: Supabase query to reading_deadlines where user_id matches and latest status is 'reading'
 * Hooks/Context: None needed - direct DB query
 */
export const calculateAmbitiousReader = async (recordId: string, config: any): Promise<number> => {
    const supabase = useSupabase();
    
    // Get user ID from the record (could be deadline ID or user ID)
    let userId = recordId;
    
    // If recordId is a deadline ID, get the user_id
    if (recordId.startsWith('rd_')) {
        const { data: deadline } = await supabase
            .from('reading_deadlines')
            .select('user_id')
            .eq('id', recordId)
            .single();
        userId = deadline?.user_id || recordId;
    }
    
    // Count active deadlines
    const { data: deadlines, error } = await supabase
        .from('reading_deadlines')
        .select(`
            id,
            status:reading_deadline_status(status, created_at)
        `)
        .eq('user_id', userId);
    
    if (error || !deadlines) return 0;
    
    // Filter for active deadlines (latest status is 'reading' or no status)
    const activeCount = deadlines.filter(deadline => {
        const latestStatus = deadline.status?.[deadline.status.length - 1]?.status;
        return !latestStatus || latestStatus === 'reading';
    }).length;
    
    return activeCount;
};

/**
 * Format Explorer Achievement Calculator  
 * Plan: Count unique book formats (physical, ebook, audio) the user has started reading
 * Data Source: Supabase query to reading_deadlines for distinct format types with progress
 * Hooks/Context: None needed - direct DB query
 */
export const calculateFormatExplorer = async (recordId: string, config: any): Promise<number> => {
    const supabase = useSupabase();
    
    // Get user ID
    let userId = recordId;
    if (recordId.startsWith('rd_')) {
        const { data: deadline } = await supabase
            .from('reading_deadlines')
            .select('user_id')
            .eq('id', recordId)
            .single();
        userId = deadline?.user_id || recordId;
    }
    
    // Get unique formats with progress
    const { data: deadlines, error } = await supabase
        .from('reading_deadlines')
        .select(`
            format,
            progress:reading_deadline_progress(id)
        `)
        .eq('user_id', userId);
    
    if (error || !deadlines) return 0;
    
    // Count unique formats that have progress
    const formatsWithProgress = new Set<string>();
    deadlines.forEach(deadline => {
        if (deadline.progress && deadline.progress.length > 0) {
            formatsWithProgress.add(deadline.format);
        }
    });
    
    return formatsWithProgress.size;
};

/**
 * Consistency Champion Achievement Calculator
 * Plan: Calculate current reading streak (consecutive days with progress)
 * Data Source: Uses shared streak calculation function
 * Hooks/Context: None needed - uses calculateReadingStreaks helper
 */
export const calculateConsistencyChampion = async (recordId: string, config: any): Promise<number> => {
    // Get user ID
    let userId = recordId;
    if (recordId.startsWith('rd_')) {
        const supabase = useSupabase();
        const { data: deadline } = await supabase
            .from('reading_deadlines')
            .select('user_id')
            .eq('id', recordId)
            .single();
        userId = deadline?.user_id || recordId;
    }
    
    const { currentStreak } = await calculateReadingStreaks(userId);
    return currentStreak;
};

/**
 * Dedicated Reader Achievement Calculator
 * Plan: Calculate maximum historical reading streak (25+ days)
 * Data Source: Uses shared streak calculation function
 * Hooks/Context: None needed - uses calculateReadingStreaks helper
 */
export const calculateDedicatedReader = async (recordId: string, config: any): Promise<number> => {
    let userId = recordId;
    if (recordId.startsWith('rd_')) {
        const supabase = useSupabase();
        const { data: deadline } = await supabase
            .from('reading_deadlines')
            .select('user_id')
            .eq('id', recordId)
            .single();
        userId = deadline?.user_id || recordId;
    }
    
    const { maxStreak } = await calculateReadingStreaks(userId);
    return maxStreak;
};

/**
 * Reading Habit Master Achievement Calculator
 * Plan: Calculate maximum reading streak (50+ days)
 * Data Source: Uses shared streak calculation function
 * Hooks/Context: None needed - uses calculateReadingStreaks helper
 */
export const calculateReadingHabitMaster = async (recordId: string, config: any): Promise<number> => {
    let userId = recordId;
    if (recordId.startsWith('rd_')) {
        const supabase = useSupabase();
        const { data: deadline } = await supabase
            .from('reading_deadlines')
            .select('user_id')
            .eq('id', recordId)
            .single();
        userId = deadline?.user_id || recordId;
    }
    
    const { maxStreak } = await calculateReadingStreaks(userId);
    return maxStreak;
};

/**
 * Reading Champion Achievement Calculator
 * Plan: Calculate maximum reading streak (75+ days)
 * Data Source: Uses shared streak calculation function
 * Hooks/Context: None needed - uses calculateReadingStreaks helper
 */
export const calculateReadingChampion = async (recordId: string, config: any): Promise<number> => {
    let userId = recordId;
    if (recordId.startsWith('rd_')) {
        const supabase = useSupabase();
        const { data: deadline } = await supabase
            .from('reading_deadlines')
            .select('user_id')
            .eq('id', recordId)
            .single();
        userId = deadline?.user_id || recordId;
    }
    
    const { maxStreak } = await calculateReadingStreaks(userId);
    return maxStreak;
};

/**
 * Century Reader Achievement Calculator
 * Plan: Calculate maximum reading streak (100+ days)
 * Data Source: Uses shared streak calculation function
 * Hooks/Context: None needed - uses calculateReadingStreaks helper
 */
export const calculateCenturyReader = async (recordId: string, config: any): Promise<number> => {
    let userId = recordId;
    if (recordId.startsWith('rd_')) {
        const supabase = useSupabase();
        const { data: deadline } = await supabase
            .from('reading_deadlines')
            .select('user_id')
            .eq('id', recordId)
            .single();
        userId = deadline?.user_id || recordId;
    }
    
    const { maxStreak } = await calculateReadingStreaks(userId);
    return maxStreak;
};

/**
 * Half Year Scholar Achievement Calculator
 * Plan: Calculate maximum reading streak (180+ days)
 * Data Source: Uses shared streak calculation function
 * Hooks/Context: None needed - uses calculateReadingStreaks helper
 */
export const calculateHalfYearScholar = async (recordId: string, config: any): Promise<number> => {
    let userId = recordId;
    if (recordId.startsWith('rd_')) {
        const supabase = useSupabase();
        const { data: deadline } = await supabase
            .from('reading_deadlines')
            .select('user_id')
            .eq('id', recordId)
            .single();
        userId = deadline?.user_id || recordId;
    }
    
    const { maxStreak } = await calculateReadingStreaks(userId);
    return maxStreak;
};

/**
 * Year Long Scholar Achievement Calculator
 * Plan: Calculate maximum reading streak (365+ days)
 * Data Source: Uses shared streak calculation function
 * Hooks/Context: None needed - uses calculateReadingStreaks helper
 */
export const calculateYearLongScholar = async (recordId: string, config: any): Promise<number> => {
    let userId = recordId;
    if (recordId.startsWith('rd_')) {
        const supabase = useSupabase();
        const { data: deadline } = await supabase
            .from('reading_deadlines')
            .select('user_id')
            .eq('id', recordId)
            .single();
        userId = deadline?.user_id || recordId;
    }
    
    const { maxStreak } = await calculateReadingStreaks(userId);
    return maxStreak;
};

/**
 * Reading Hero Achievement Calculator
 * Plan: Calculate maximum reading streak (500+ days)
 * Data Source: Uses shared streak calculation function
 * Hooks/Context: None needed - uses calculateReadingStreaks helper
 */
export const calculateReadingHero = async (recordId: string, config: any): Promise<number> => {
    let userId = recordId;
    if (recordId.startsWith('rd_')) {
        const supabase = useSupabase();
        const { data: deadline } = await supabase
            .from('reading_deadlines')
            .select('user_id')
            .eq('id', recordId)
            .single();
        userId = deadline?.user_id || recordId;
    }
    
    const { maxStreak } = await calculateReadingStreaks(userId);
    return maxStreak;
};

/**
 * Reading Myth Achievement Calculator
 * Plan: Calculate maximum reading streak (750+ days)
 * Data Source: Uses shared streak calculation function
 * Hooks/Context: None needed - uses calculateReadingStreaks helper
 */
export const calculateReadingMyth = async (recordId: string, config: any): Promise<number> => {
    let userId = recordId;
    if (recordId.startsWith('rd_')) {
        const supabase = useSupabase();
        const { data: deadline } = await supabase
            .from('reading_deadlines')
            .select('user_id')
            .eq('id', recordId)
            .single();
        userId = deadline?.user_id || recordId;
    }
    
    const { maxStreak } = await calculateReadingStreaks(userId);
    return maxStreak;
};

/**
 * Reading Legend Achievement Calculator
 * Plan: Calculate maximum reading streak (1000+ days)
 * Data Source: Uses shared streak calculation function
 * Hooks/Context: None needed - uses calculateReadingStreaks helper
 */
export const calculateReadingLegend = async (recordId: string, config: any): Promise<number> => {
    let userId = recordId;
    if (recordId.startsWith('rd_')) {
        const supabase = useSupabase();
        const { data: deadline } = await supabase
            .from('reading_deadlines')
            .select('user_id')
            .eq('id', recordId)
            .single();
        userId = deadline?.user_id || recordId;
    }
    
    const { maxStreak } = await calculateReadingStreaks(userId);
    return maxStreak;
};

/**
 * Speed Reader Achievement Calculator
 * Plan: Calculate maximum pages read in a single day
 * Data Source: Supabase query to reading_deadline_progress, group by date, calculate page equivalents
 * Hooks/Context: None needed - direct DB query with format-specific page calculations
 * Page Conversion: physical=1:1, ebook=(progress/100)*300, audio=progress/1.5
 */
export const calculateSpeedReader = async (recordId: string, config: any): Promise<number> => {
    const supabase = useSupabase();
    
    // Get user ID
    let userId = recordId;
    if (recordId.startsWith('rd_')) {
        const { data: deadline } = await supabase
            .from('reading_deadlines')
            .select('user_id')
            .eq('id', recordId)
            .single();
        userId = deadline?.user_id || recordId;
    }
    
    // Get all progress with deadline format
    const { data: progressData, error } = await supabase
        .from('reading_deadline_progress')
        .select(`
            created_at,
            current_progress,
            reading_deadline:reading_deadlines!inner(user_id, format)
        `)
        .eq('reading_deadline.user_id', userId)
        .order('created_at');
    
    if (error || !progressData) return 0;
    
    // Calculate daily page totals directly
    const dailyPages: Record<string, number> = {};
    
    // Group by deadline first
    const deadlineGroups = new Map<string, any[]>();
    progressData.forEach(entry => {
        const key = `${entry.reading_deadline.user_id}_${entry.reading_deadline.format}`;
        if (!deadlineGroups.has(key)) {
            deadlineGroups.set(key, []);
        }
        deadlineGroups.get(key)!.push(entry);
    });
    
    deadlineGroups.forEach((progress) => {
        const deadline = progress[0]?.reading_deadline;
        if (!deadline) return;
        
        let previousProgress = 0;
        progress.forEach(entry => {
            const date = dayjs(entry.created_at).format('YYYY-MM-DD');
            const progressDelta = Math.max(0, entry.current_progress - previousProgress);
            
            // Convert to page equivalents
            let pagesRead = 0;
            if (deadline.format === 'physical') {
                pagesRead = progressDelta;
            } else if (deadline.format === 'ebook') {
                pagesRead = (progressDelta / 100) * 300;
            } else if (deadline.format === 'audio') {
                pagesRead = progressDelta / 1.5;
            }
            
            dailyPages[date] = (dailyPages[date] || 0) + pagesRead;
            previousProgress = entry.current_progress;
        });
    });
    
    return Math.max(0, ...Object.values(dailyPages));
};

/**
 * Marathon Listener Achievement Calculator
 * Plan: Calculate maximum audio listening time in a single day (8+ hours = 480+ minutes)
 * Data Source: Supabase query to reading_deadline_progress for audio format only
 * Hooks/Context: None needed - direct DB query filtering for audio format
 * Time Calculation: Sum daily progress deltas for audio books
 */
export const calculateMarathonListener = async (recordId: string, config: any): Promise<number> => {
    const supabase = useSupabase();
    
    // Get user ID
    let userId = recordId;
    if (recordId.startsWith('rd_')) {
        const { data: deadline } = await supabase
            .from('reading_deadlines')
            .select('user_id')
            .eq('id', recordId)
            .single();
        userId = deadline?.user_id || recordId;
    }
    
    // Get audio book progress only
    const { data: progressData, error } = await supabase
        .from('reading_deadline_progress')
        .select(`
            created_at,
            current_progress,
            reading_deadline:reading_deadlines!inner(user_id, format)
        `)
        .eq('reading_deadline.user_id', userId)
        .eq('reading_deadline.format', 'audio')
        .order('created_at');
    
    if (error || !progressData) return 0;
    
    // Calculate daily audio totals directly
    const dailyAudio: Record<string, number> = {};
    
    // Group by user/format key
    const audioGroups = new Map<string, any[]>();
    progressData.forEach(entry => {
        const key = `${entry.reading_deadline.user_id}_audio`;
        if (!audioGroups.has(key)) {
            audioGroups.set(key, []);
        }
        audioGroups.get(key)!.push(entry);
    });
    
    audioGroups.forEach((progress) => {
        let previousProgress = 0;
        progress.forEach(entry => {
            const date = dayjs(entry.created_at).format('YYYY-MM-DD');
            const minutesListened = Math.max(0, entry.current_progress - previousProgress);
            
            dailyAudio[date] = (dailyAudio[date] || 0) + minutesListened;
            previousProgress = entry.current_progress;
        });
    });
    
    return Math.max(0, ...Object.values(dailyAudio));
};

/**
 * Library Warrior Achievement Calculator
 * Plan: Count books from library source with reading progress
 * Data Source: Supabase query to reading_deadlines where source='library' and has progress
 * Hooks/Context: None needed - direct DB query with source filtering
 */
export const calculateLibraryWarrior = async (recordId: string, config: any): Promise<number> => {
    const supabase = useSupabase();
    
    // Get user ID
    let userId = recordId;
    if (recordId.startsWith('rd_')) {
        const { data: deadline } = await supabase
            .from('reading_deadlines')
            .select('user_id')
            .eq('id', recordId)
            .single();
        userId = deadline?.user_id || recordId;
    }
    
    // Count library books with progress
    const { data: deadlines, error } = await supabase
        .from('reading_deadlines')
        .select(`
            id,
            source,
            progress:reading_deadline_progress(id)
        `)
        .eq('user_id', userId)
        .eq('source', 'library');
    
    if (error || !deadlines) return 0;
    
    // Count deadlines with progress
    return deadlines.filter(deadline => 
        deadline.progress && deadline.progress.length > 0
    ).length;
};

/**
 * Early Finisher Achievement Calculator
 * Plan: Count books finished significantly before deadline (7+ days early)
 * Data Source: Supabase query to reading_deadlines with status='complete' and comparison of completion vs deadline dates
 * Hooks/Context: None needed - direct DB query with date comparisons
 * Logic: Check reading_deadline_status for 'complete' status and compare created_at with deadline_date
 */
export const calculateEarlyFinisher = async (recordId: string, config: any): Promise<number> => {
    const supabase = useSupabase();
    
    // Get user ID
    let userId = recordId;
    if (recordId.startsWith('rd_')) {
        const { data: deadline } = await supabase
            .from('reading_deadlines')
            .select('user_id')
            .eq('id', recordId)
            .single();
        userId = deadline?.user_id || recordId;
    }
    
    // Get completed deadlines with completion dates
    const { data: deadlines, error } = await supabase
        .from('reading_deadlines')
        .select(`
            deadline_date,
            status:reading_deadline_status(status, created_at)
        `)
        .eq('user_id', userId);
    
    if (error || !deadlines) return 0;
    
    // Count early finishes (completed 7+ days before deadline)
    let earlyFinishes = 0;
    deadlines.forEach(deadline => {
        const completionStatus = deadline.status?.find(s => s.status === 'complete');
        if (completionStatus) {
            const completionDate = dayjs(completionStatus.created_at);
            const deadlineDate = dayjs(deadline.deadline_date);
            const daysEarly = deadlineDate.diff(completionDate, 'day');
            if (daysEarly >= 7) {
                earlyFinishes++;
            }
        }
    });
    
    return earlyFinishes;
};

// Remove Page Turner - it will be hidden in the UI
// export const calculatePageTurner = async (recordId: string, config: any): Promise<number> => {
//     return 0; // Hidden achievement
// };