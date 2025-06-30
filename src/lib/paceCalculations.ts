import { ReadingDeadlineWithProgress } from '@/types/deadline';

export interface ReadingDay {
  date: string;
  pagesRead: number;
  format: 'physical' | 'ebook' | 'audio';
}

export interface ListeningDay {
  date: string;
  minutesListened: number;
  format: 'audio';
}

export interface UserPaceData {
  averagePace: number;
  readingDaysCount: number;
  isReliable: boolean;
  calculationMethod: 'recent_data' | 'default_fallback';
}

export interface UserListeningPaceData {
  averagePace: number; // minutes per day
  listeningDaysCount: number;
  isReliable: boolean;
  calculationMethod: 'recent_data' | 'default_fallback';
}

export interface PaceBasedStatus {
  color: 'green' | 'orange' | 'red';
  level: 'good' | 'approaching' | 'urgent' | 'overdue' | 'impossible';
  message: string;
}

/**
 * Gets reading days from the last 7 days for physical and ebook deadlines only.
 * No format mixing - only page-based reading data (physical + ebook).
 */
export const getRecentReadingDays = (
  deadlines: ReadingDeadlineWithProgress[]
): ReadingDay[] => {
  const DAYS_TO_CONSIDER = 7;
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - DAYS_TO_CONSIDER);
  const cutoffTime = cutoffDate.getTime();
  
  let dailyProgress: { [date: string]: number } = {};

  // Filter to only physical and ebook deadlines (no audio mixing)
  const readingDeadlines = deadlines.filter(d => d.format === 'physical' || d.format === 'ebook');

  readingDeadlines.forEach(book => {
    // Sort progress updates by date
    if (!book.progress || !Array.isArray(book.progress)) return;
    
    let progress = book.progress.slice().sort(
      (a, b) => new Date(a.created_at!).getTime() - new Date(b.created_at!).getTime()
    );

    if (progress.length === 0) return;

    // Only count first progress if it's very small (likely represents actual reading that day)
    // Large initial progress values represent "I'm already X pages into this book" not "I read X pages today"
    const firstProgress = progress[0];
    const firstDate = new Date(firstProgress.created_at);
    const INITIAL_PROGRESS_THRESHOLD = 50; // Only count if less than 50 pages
    
    if (firstDate.getTime() >= cutoffTime && 
        firstProgress.current_progress > 0 && 
        firstProgress.current_progress <= INITIAL_PROGRESS_THRESHOLD) {
      const dateStr = firstDate.toISOString().slice(0, 10);
      // Both physical and ebook are already in pages
      const pagesRead = firstProgress.current_progress;
      
      dailyProgress[dateStr] = (dailyProgress[dateStr] || 0) + pagesRead;
    }

    // Calculate differences between consecutive progress entries
    for (let i = 1; i < progress.length; i++) {
      let prev = progress[i - 1];
      let curr = progress[i];

      let endDate = new Date(curr.created_at).getTime();
      
      // Skip if the end date is before the cutoff
      if (endDate < cutoffTime) continue;
      
      let progressDiff = curr.current_progress - prev.current_progress;

      // Both physical and ebook are already in pages (no conversion needed)

      // Only assign the progress to the end date (when progress was recorded)
      let endDateObj = new Date(endDate);
      if (endDateObj.getTime() >= cutoffTime) {
        let dateStr = endDateObj.toISOString().slice(0, 10);
        dailyProgress[dateStr] = (dailyProgress[dateStr] || 0) + progressDiff;
      }
    }
  });

  // Convert dictionary to sorted array
  return Object.entries(dailyProgress)
    .map(([date, pagesRead]) => ({
      date,
      pagesRead: Number(pagesRead.toFixed(2)),
      format: 'physical' as const
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
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

/**
 * Formats pace with both page equivalent and time equivalent for mixed reading display.
 */
export const formatCombinedPaceDisplay = (pace: number): string => {
  const AUDIO_MINUTES_PER_PAGE = 1.5;
  const pages = Math.round(pace);
  const minutes = Math.round(pace * AUDIO_MINUTES_PER_PAGE);
  
  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (remainingMinutes > 0) {
      return `${pages} pages/day ~${hours}h${remainingMinutes}m/day`;
    }
    return `${pages} pages/day ~${hours}h/day`;
  }
  
  return `${pages} pages/day ~${minutes}m/day`;
};

/**
 * Gets listening days from the last 7 days for audio deadlines only.
 * Returns minutes listened per day.
 */
export const getRecentListeningDays = (
  deadlines: ReadingDeadlineWithProgress[]
): ListeningDay[] => {
  const DAYS_TO_CONSIDER = 7;
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - DAYS_TO_CONSIDER);
  const cutoffTime = cutoffDate.getTime();
  
  let dailyProgress: { [date: string]: number } = {};

  // Filter to only audio deadlines
  const audioDeadlines = deadlines.filter(d => d.format === 'audio');

  audioDeadlines.forEach(book => {
    // Sort progress updates by date
    if (!book.progress || !Array.isArray(book.progress)) return;
    
    let progress = book.progress.slice().sort(
      (a, b) => new Date(a.created_at!).getTime() - new Date(b.created_at!).getTime()
    );

    if (progress.length === 0) return;

    // Only count first progress if it's reasonable for a single day
    const firstProgress = progress[0];
    const firstDate = new Date(firstProgress.created_at);
    const INITIAL_LISTENING_THRESHOLD = 300; // 5 hours max for initial listening
    
    if (firstDate.getTime() >= cutoffTime && 
        firstProgress.current_progress > 0 && 
        firstProgress.current_progress <= INITIAL_LISTENING_THRESHOLD) {
      const dateStr = firstDate.toISOString().slice(0, 10);
      const minutesListened = firstProgress.current_progress;
      
      dailyProgress[dateStr] = (dailyProgress[dateStr] || 0) + minutesListened;
    }

    // Calculate differences between consecutive progress entries
    for (let i = 1; i < progress.length; i++) {
      let prev = progress[i - 1];
      let curr = progress[i];

      let endDate = new Date(curr.created_at).getTime();
      
      // Skip if the end date is before the cutoff
      if (endDate < cutoffTime) continue;
      
      let progressDiff = curr.current_progress - prev.current_progress;

      // Only positive progress (minutes listened)
      if (progressDiff > 0) {
        let endDateObj = new Date(endDate);
        if (endDateObj.getTime() >= cutoffTime) {
          let dateStr = endDateObj.toISOString().slice(0, 10);
          dailyProgress[dateStr] = (dailyProgress[dateStr] || 0) + progressDiff;
        }
      }
    }
  });

  // Convert dictionary to sorted array
  return Object.entries(dailyProgress)
    .map(([date, minutesListened]) => ({
      date,
      minutesListened: Number(minutesListened.toFixed(2)),
      format: 'audio' as const
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
};

/**
 * Calculates user's listening pace based on recent audio book activity.
 * Tier 1: ≥3 listening days in past 7 days - use rolling 7-day average
 * Tier 2: <3 listening days - use 30 minutes/day default
 */
export const calculateUserListeningPace = (deadlines: ReadingDeadlineWithProgress[]): UserListeningPaceData => {
  const recentDays = getRecentListeningDays(deadlines);
  const listeningDaysCount = recentDays.length;

  if (listeningDaysCount >= 3) {
    // Tier 1: Recent data available
    const totalMinutes = recentDays.reduce((sum, day) => sum + day.minutesListened, 0);
    const averagePace = totalMinutes / listeningDaysCount;
    
    return {
      averagePace,
      listeningDaysCount,
      isReliable: true,
      calculationMethod: 'recent_data'
    };
  }

  // Tier 2: Insufficient recent data - use default (30 minutes/day)
  return {
    averagePace: 30,
    listeningDaysCount,
    isReliable: false,
    calculationMethod: 'default_fallback'
  };
};

/**
 * Formats listening pace for display.
 */
export const formatListeningPaceDisplay = (pace: number): string => {
  const minutes = Math.round(pace);
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (hours > 0) {
    return `${hours}h ${remainingMinutes}m/day`;
  }
  return `${minutes}m/day`;
};