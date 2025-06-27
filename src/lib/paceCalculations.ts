import { ReadingDeadlineWithProgress } from '@/types/deadline';

export interface ReadingDay {
  date: string;
  pagesRead: number;
  format: 'physical' | 'ebook' | 'audio';
}

export interface UserPaceData {
  averagePace: number;
  readingDaysCount: number;
  isReliable: boolean;
  calculationMethod: 'recent_data' | 'default_fallback';
}

export interface PaceBasedStatus {
  color: 'green' | 'orange' | 'red';
  level: 'good' | 'approaching' | 'urgent' | 'overdue' | 'impossible';
  message: string;
}

/**
 * Extracts daily reading progress from progress history entries from the last 7 days.
 * Calculates the difference between consecutive progress entries to determine daily reading amounts.
 * Converts everything to "page equivalents" for consistent pace calculation.
 */
export const extractReadingDays = (deadline: ReadingDeadlineWithProgress): ReadingDay[] => {
  if (!deadline.progress || deadline.progress.length === 0) {
    return [];
  }

  // Get cutoff date for last 7 days
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - 7);

  // Sort progress entries by date and filter to last 7 days
  const recentProgress = deadline.progress
    .filter(entry => {
      const entryDate = new Date(entry.created_at || entry.updated_at || '');
      return entryDate >= cutoffDate;
    })
    .sort((a, b) => 
      new Date(a.created_at || a.updated_at || '').getTime() - 
      new Date(b.created_at || b.updated_at || '').getTime()
    );

  if (recentProgress.length === 0) {
    return [];
  }

  const readingDays: ReadingDay[] = [];
  let previousProgress = 0;

  // Find the baseline progress (what progress was 7 days ago)
  // We need to get the progress value from just before our 7-day window
  const allProgress = [...deadline.progress].sort((a, b) => 
    new Date(a.created_at || a.updated_at || '').getTime() - 
    new Date(b.created_at || b.updated_at || '').getTime()
  );

  // Find the last progress entry before our 7-day window
  const baselineProgress = allProgress.find(entry => {
    const entryDate = new Date(entry.created_at || entry.updated_at || '');
    return entryDate < cutoffDate;
  });

  if (baselineProgress) {
    previousProgress = baselineProgress.current_progress || 0;
  }

  recentProgress.forEach((entry) => {
    const currentProgress = entry.current_progress || 0;
    const dailyProgress = currentProgress - previousProgress;
    
    if (dailyProgress > 0) {
      // Convert to page equivalents for consistent calculation
      let pageEquivalent = dailyProgress;
      if (deadline.format === 'audio') {
        // Convert audio minutes to page equivalents (1.5 minutes = 1 page)
        pageEquivalent = dailyProgress / 1.5;
      }
      
      readingDays.push({
        date: new Date(entry.created_at || entry.updated_at || '').toISOString().split('T')[0],
        pagesRead: pageEquivalent,
        format: deadline.format
      });
    }
    
    previousProgress = currentProgress;
  });

  return readingDays;
};

/**
 * Gets reading days from the last 7 days across all deadlines for a user.
 * Already filters and converts to page equivalents in extractReadingDays.
 */
export const getRecentReadingDays = (
  deadlines: ReadingDeadlineWithProgress[]
): ReadingDay[] => {
  const allReadingDays: ReadingDay[] = [];
  
  // Extract reading days from all deadlines (already filtered to last 7 days)
  deadlines.forEach(deadline => {
    const readingDays = extractReadingDays(deadline);
    allReadingDays.push(...readingDays);
  });

  // Group by date and sum page equivalents read per day
  const dayGroups = new Map<string, number>();
  allReadingDays.forEach(day => {
    const existing = dayGroups.get(day.date) || 0;
    // day.pagesRead is already converted to page equivalents in extractReadingDays
    dayGroups.set(day.date, existing + day.pagesRead);
  });

  // Convert back to ReadingDay array
  return Array.from(dayGroups.entries()).map(([date, pages]) => ({
    date,
    pagesRead: pages,
    format: 'physical' as const // All normalized to page equivalents
  }));
};

/**
 * Calculates user's reading pace based on the two-tier system from README.
 * Tier 1: ≥3 reading days in past 7 days - use rolling 7-day average
 * Tier 2: <3 reading days - use 25 pages/day default
 */
export const calculateUserPace = (deadlines: ReadingDeadlineWithProgress[]): UserPaceData => {
  const recentDays = getRecentReadingDays(deadlines);
  const readingDaysCount = recentDays.length;

  if (readingDaysCount >= 3) {
    // Tier 1: Recent data available
    const totalPages = recentDays.reduce((sum, day) => sum + day.pagesRead, 0);
    const averagePace = totalPages / readingDaysCount;
    
    return {
      averagePace,
      readingDaysCount,
      isReliable: true,
      calculationMethod: 'recent_data'
    };
  }

  // Tier 2: Insufficient recent data - use default
  return {
    averagePace: 25,
    readingDaysCount,
    isReliable: false,
    calculationMethod: 'default_fallback'
  };
};

/**
 * Calculates the required daily pace to finish a deadline on time.
 */
export const calculateRequiredPace = (
  totalQuantity: number,
  currentProgress: number,
  daysLeft: number,
  format: 'physical' | 'ebook' | 'audio'
): number => {
  const remaining = totalQuantity - currentProgress;
  
  if (daysLeft <= 0) return remaining;
  
  // Convert audio minutes to page equivalents for comparison
  const remainingPageEquivalent = format === 'audio' ? remaining / 1.5 : remaining;
  
  return Math.ceil(remainingPageEquivalent / daysLeft);
};

/**
 * Determines status color and level based on pace comparison and README criteria.
 * Green: Current pace ≥ required pace AND >0 days remaining
 * Orange: Current pace < required pace AND gap ≤100% current pace AND >0 days remaining
 * Red: Overdue OR impossible pace (>100% increase needed) OR 0% progress with <3 days remaining
 */
export const getPaceBasedStatus = (
  userPace: number,
  requiredPace: number,
  daysLeft: number,
  progressPercentage: number
): PaceBasedStatus => {
  // Red conditions from README
  if (daysLeft <= 0) {
    return {
      color: 'red',
      level: 'overdue',
      message: 'Return or renew'
    };
  }

  if (progressPercentage === 0 && daysLeft < 3) {
    return {
      color: 'red',
      level: 'impossible',
      message: 'Start reading now'
    };
  }

  if (userPace < requiredPace) {
    const paceGap = requiredPace - userPace;
    const increaseNeeded = (paceGap / userPace) * 100;
    
    if (increaseNeeded > 100) {
      return {
        color: 'red',
        level: 'impossible',
        message: 'Pace too slow'
      };
    }
    
    // Orange: gap ≤100% current pace
    return {
      color: 'orange',
      level: 'approaching',
      message: 'Pick up the pace'
    };
  }

  // Green: current pace ≥ required pace AND >0 days remaining
  return {
    color: 'green',
    level: 'good',
    message: "You're on track"
  };
};

/**
 * Gets a detailed status message based on pace calculations.
 */
export const getPaceStatusMessage = (
  userPaceData: UserPaceData,
  requiredPace: number,
  status: PaceBasedStatus
): string => {
  if (status.level === 'overdue') {
    return 'Return or renew';
  }

  if (status.level === 'impossible') {
    if (userPaceData.calculationMethod === 'default_fallback') {
      return 'Start reading to track pace';
    }
    return 'Pace too ambitious';
  }

  if (status.color === 'green') {
    if (userPaceData.isReliable) {
      return `On track at ${Math.round(userPaceData.averagePace)} pages/day`;
    }
    return "You're doing great";
  }

  if (status.color === 'orange') {
    const paceIncrease = Math.round(requiredPace - userPaceData.averagePace);
    return `Need ${paceIncrease} more pages/day`;
  }

  return status.message;
};

/**
 * Formats pace for display, handling different book formats.
 */
export const formatPaceDisplay = (pace: number, format: 'physical' | 'ebook' | 'audio'): string => {
  if (format === 'audio') {
    // Convert page equivalents back to minutes for display
    const minutes = Math.round(pace * 1.5);
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${remainingMinutes}m/day`;
    }
    return `${minutes}m/day`;
  }
  
  return `${Math.round(pace)} pages/day`;
};