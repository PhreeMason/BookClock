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
 * Gets reading days from the last 7 days across all deadlines for a user.
 * Already filters and converts to page equivalents in extractReadingDays.
 */
export const getRecentReadingDays = (
  deadlines: ReadingDeadlineWithProgress[]
): ReadingDay[] => {
  const MS_PER_DAY = 24 * 60 * 60 * 1000;
  const AUDIO_MINUTES_PER_PAGE = 1.5;
  let dailyProgress: { [date: string]: number } = {};

  deadlines.forEach(book => {
    // Sort progress updates by date
    let progress = book.progress.slice().sort(
      (a, b) => new Date(a.created_at!).getTime() - new Date(b.created_at!).getTime()
    );

    for (let i = 1; i < progress.length; i++) {
      let prev = progress[i - 1];
      let curr = progress[i];

      let startDate = new Date(prev.created_at).getTime();
      let endDate = new Date(curr.created_at).getTime();
      let days = Math.max(1, Math.round((endDate - startDate) / MS_PER_DAY));

      let progressDiff = curr.current_progress - prev.current_progress;

      // For audio books, convert minutes to pages
      if (book.format === "audio") {
        progressDiff = progressDiff / AUDIO_MINUTES_PER_PAGE;
      }

      // Distribute progress evenly across days
      for (let d = 0; d < days; d++) {
        let date = new Date(startDate + d * MS_PER_DAY)
          .toISOString()
          .slice(0, 10); // YYYY-MM-DD

        dailyProgress[date] = (dailyProgress[date] || 0) + progressDiff / days;
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