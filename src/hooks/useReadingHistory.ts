import { useSupabase } from '@/lib/supabase';
import { useUser } from '@clerk/clerk-expo';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { utcToLocalDate } from '@/lib/dateUtils';

export interface DailyDeadlineEntry {
  date: string;
  deadlines: {
    id: string;
    book_title: string;
    author?: string;
    format: 'physical' | 'ebook' | 'audio';
    progress_made: number; // progress made on this specific day
    total_progress: number; // cumulative progress as of this day
    total_quantity: number; // total pages/minutes to read
    deadline_date: string;
    source: string;
    flexibility: string;
  }[];
  totalProgressMade: number; // total progress made across all deadlines this day
}

export interface DeadlineHistoryData {
  entries: DailyDeadlineEntry[];
  summary: {
    totalDays: number;
    totalProgressMade: number;
    averageProgressPerDay: number;
    activeDeadlines: number;
    ArchivedDeadlines: number;
  };
}

export type DateRange = '7d' | '30d' | '90d' | '1y' | 'all';
export type FormatFilter = 'reading' | 'listening' | 'combined' | 'all';

interface UseReadingHistoryOptions {
  dateRange?: DateRange;
  formatFilter?: FormatFilter;
}

const getDateRangeStart = (range: DateRange): Date | null => {
  const now = new Date();
  switch (range) {
    case '7d':
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    case '30d':
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    case '90d':
      return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    case '1y':
      return new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
    case 'all':
    default:
      return null;
  }
};

// Helper to convert UTC date string to local date string (YYYY-MM-DD)
const getLocalDateString = (utcDateString: string): string => {
  return utcToLocalDate(utcDateString);
};

const getFormatFilter = (filter: FormatFilter): string[] => {
  switch (filter) {
    case 'reading':
      return ['physical', 'ebook'];
    case 'listening':
      return ['audio'];
    case 'combined':
    case 'all':
    default:
      return ['physical', 'ebook', 'audio'];
  }
};

export const useDeadlineHistory = (options: UseReadingHistoryOptions = {}) => {
  const { user } = useUser();
  const supabase = useSupabase();
  const { dateRange = '90d', formatFilter = 'all' } = options;

  const query = useQuery({
    queryKey: ['deadlineHistory', user?.id, dateRange, formatFilter],
    queryFn: async (): Promise<DeadlineHistoryData> => {
      if (!user?.id) throw new Error('User not authenticated');

      const startDate = getDateRangeStart(dateRange);
      const formats = getFormatFilter(formatFilter);

      // Query reading deadlines with their progress
      let deadlineQuery = supabase
        .from('reading_deadlines')
        .select(`
          id,
          book_title,
          author,
          format,
          total_quantity,
          deadline_date,
          source,
          flexibility,
          created_at,
          reading_deadline_progress (
            id,
            current_progress,
            created_at,
            updated_at
          )
        `)
        .eq('user_id', user.id)
        .in('format', formats)
        .order('created_at', { ascending: false });

      const { data: deadlines, error } = await deadlineQuery;

      if (error) throw error;

      // Process deadline progress data to extract daily activity
      const dailyEntries: { [date: string]: DailyDeadlineEntry } = {};

      deadlines?.forEach((deadline: any) => {
        const progress = deadline.reading_deadline_progress || [];
        const deadlineCreatedDate = getLocalDateString(deadline.created_at);
        
        // Check if deadline creation date is within our date range
        if (!startDate || new Date(deadlineCreatedDate) >= startDate) {
          // If deadline has no progress entries, still show it on creation date
          if (progress.length === 0) {
            if (!dailyEntries[deadlineCreatedDate]) {
              dailyEntries[deadlineCreatedDate] = {
                date: deadlineCreatedDate,
                deadlines: [],
                totalProgressMade: 0,
              };
            }
            
            dailyEntries[deadlineCreatedDate].deadlines.push({
              id: deadline.id,
              book_title: deadline.book_title,
              author: deadline.author,
              format: deadline.format,
              progress_made: 0,
              total_progress: 0,
              total_quantity: deadline.total_quantity,
              deadline_date: deadline.deadline_date,
              source: deadline.source,
              flexibility: deadline.flexibility,
            });
          }
        }
        
        // Sort progress by date to calculate daily differences
        const sortedProgress = progress.sort(
          (a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );

        // Group progress entries by date to handle same-day updates properly
        const progressByDate: { [date: string]: any[] } = {};
        sortedProgress.forEach((prog: any) => {
          const date = getLocalDateString(prog.created_at);
          if (!progressByDate[date]) progressByDate[date] = [];
          progressByDate[date].push(prog);
        });

        // Check if deadline was created on the same day as first progress
        const firstProgressDate = sortedProgress.length > 0 
          ? getLocalDateString(sortedProgress[0].created_at)
          : null;
        
        const showDeadlineCreation = deadlineCreatedDate === firstProgressDate;

        // Process each date for this deadline
        const dates = Object.keys(progressByDate).sort();
        for (let dateIndex = 0; dateIndex < dates.length; dateIndex++) {
          const date = dates[dateIndex];
          
          // Apply date filter
          if (startDate && new Date(date) < startDate) continue;

          const dayProgress = progressByDate[date];
          // Use the last (most recent) progress entry for the day
          const currentProgress = dayProgress[dayProgress.length - 1];
          
          let progressMade = 0;
          
          if (dateIndex === 0) {
            // First date - if deadline was created this day, apply progress threshold logic
            if (showDeadlineCreation) {
              // For deadline creation day, apply progress threshold logic:
              // If initial progress > 50, treat as starting point (progress made = 0)
              // If initial progress <= 50, count it as progress made
              progressMade = currentProgress.current_progress > 50 ? 0 : currentProgress.current_progress;
            } else {
              // If first entry is not on creation date, it means progress was made
              progressMade = currentProgress.current_progress;
            }
          } else {
            // Subsequent dates - difference from previous day's final progress
            const prevDate = dates[dateIndex - 1];
            const prevDayProgress = progressByDate[prevDate];
            const prevProgress = prevDayProgress[prevDayProgress.length - 1];
            progressMade = Math.max(0, currentProgress.current_progress - prevProgress.current_progress);
          }

          // Add entries only where actual progress was made
          if (progressMade > 0) {
            if (!dailyEntries[date]) {
              dailyEntries[date] = {
                date,
                deadlines: [],
                totalProgressMade: 0,
              };
            }

            dailyEntries[date].deadlines.push({
              id: deadline.id,
              book_title: deadline.book_title,
              author: deadline.author,
              format: deadline.format,
              progress_made: progressMade,
              total_progress: currentProgress.current_progress,
              total_quantity: deadline.total_quantity,
              deadline_date: deadline.deadline_date,
              source: deadline.source,
              flexibility: deadline.flexibility,
            });

            dailyEntries[date].totalProgressMade += progressMade;
          }
        }
      });

      // Convert to array and sort by date
      const entries = Object.values(dailyEntries).sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );

      // Calculate summary stats
      const totalDays = entries.length;
      const totalProgressMade = entries.reduce((sum, entry) => sum + entry.totalProgressMade, 0);
      
      // Count active vs completed deadlines
      const activeDeadlines = deadlines?.filter(d => {
        const progress = d.reading_deadline_progress || [];
        if (progress.length === 0) return true; // No progress yet, so it's active
        const latestProgress = progress[progress.length - 1];
        return latestProgress.current_progress < d.total_quantity;
      }).length || 0;
      
      const ArchivedDeadlines = (deadlines?.length || 0) - activeDeadlines;

      return {
        entries,
        summary: {
          totalDays,
          totalProgressMade,
          averageProgressPerDay: totalDays > 0 ? totalProgressMade / totalDays : 0,
          activeDeadlines,
          ArchivedDeadlines,
        },
      };
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  // Memoize calendar data for performance
  const calendarData = useMemo(() => {
    if (!query.data?.entries) return {};

    const markedDates: { [date: string]: any } = {};

    query.data.entries.forEach((entry: DailyDeadlineEntry) => {
      const hasReadingDeadlines = entry.deadlines.some(d => d.format === 'physical' || d.format === 'ebook');
      const hasListeningDeadlines = entry.deadlines.some(d => d.format === 'audio');

      let color = '#8E8E93';
      if (hasReadingDeadlines && hasListeningDeadlines) {
        color = '#AF52DE'; // Both reading and listening deadlines
      } else if (hasReadingDeadlines) {
        color = '#007AFF'; // Reading deadlines only
      } else if (hasListeningDeadlines) {
        color = '#FF9500'; // Listening deadlines only
      }

      markedDates[entry.date] = {
        marked: true,
        dotColor: color,
        selectedColor: color,
        selectedTextColor: 'white',
      };
    });

    return markedDates;
  }, [query.data?.entries]);

  return {
    ...query,
    calendarData,
  };
};