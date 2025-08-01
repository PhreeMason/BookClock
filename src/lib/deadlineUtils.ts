import { ReadingDeadlineWithProgress } from '@/types/deadline';
import { calculateTotalQuantity } from './deadlineCalculations';
import { isDateBefore, calculateDaysLeft as calculateDaysLeftUtil } from './dateUtils';

/**
 * Sorts deadlines by priority: first by due date (earliest first), then by updated_at (most recent first), 
 * and finally by created_at (most recent first).
 * @param a - First deadline to compare
 * @param b - Second deadline to compare
 * @returns A negative value if a should come before b, positive if a should come after b, or 0 if equal
 */
export const sortDeadlines = (a: ReadingDeadlineWithProgress, b: ReadingDeadlineWithProgress) => {
    // First sort by due date (deadline_date)
    const aDueDate = new Date(a.deadline_date);
    const bDueDate = new Date(b.deadline_date);
    if (aDueDate.getTime() !== bDueDate.getTime()) {
        return aDueDate.getTime() - bDueDate.getTime();
    }
    
    // If due dates are equal, sort by updated_at
    const aUpdatedAt = a.updated_at ? new Date(a.updated_at) : new Date(0);
    const bUpdatedAt = b.updated_at ? new Date(b.updated_at) : new Date(0);
    if (aUpdatedAt.getTime() !== bUpdatedAt.getTime()) {
        return bUpdatedAt.getTime() - aUpdatedAt.getTime(); // Most recent first
    }
    
    // If updated_at dates are equal, sort by created_at
    const aCreatedAt = a.created_at ? new Date(a.created_at) : new Date(0);
    const bCreatedAt = b.created_at ? new Date(b.created_at) : new Date(0);
    return bCreatedAt.getTime() - aCreatedAt.getTime(); // Most recent first
};

/**
 * Separates deadlines into active, overdue, and completed categories.
 * Active and overdue are sorted by due date, while completed are sorted by last update.
 * @param deadlines - Array of deadlines to separate
 * @returns Object containing active, overdue, and completed deadline arrays
 */
export const separateDeadlines = (deadlines: ReadingDeadlineWithProgress[]) => {
    const active: ReadingDeadlineWithProgress[] = [];
    const overdue: ReadingDeadlineWithProgress[] = [];
    const completed: ReadingDeadlineWithProgress[] = [];

    deadlines.forEach(deadline => {
        // Get the latest status from the status array
        const latestStatus = deadline.status && deadline.status.length > 0 
            ? deadline.status[deadline.status.length - 1].status 
            : 'reading';
            
        if (latestStatus === 'complete' || latestStatus === 'set_aside') {
            completed.push(deadline);
        } else if (isDateBefore(deadline.deadline_date)) {
            overdue.push(deadline);
        } else {
            active.push(deadline);
        }
    });
    
    // Sort active and overdue by priority
    active.sort(sortDeadlines);
    overdue.sort(sortDeadlines);

    // Sort completed by most recently updated
    completed.sort((a, b) => {
        const aDate = a.updated_at ? new Date(a.updated_at) : new Date(0);
        const bDate = b.updated_at ? new Date(b.updated_at) : new Date(0);
        return bDate.getTime() - aDate.getTime();
    });
    
    return { active, overdue, completed };
};

/**
 * Calculates the number of days remaining until a deadline.
 * Returns a positive number for future dates and negative for past dates.
 * @param deadlineDate - The deadline date as a string
 * @returns Number of days left (positive) or overdue (negative)
 */
export const calculateDaysLeft = (deadlineDate: string): number => {
    return calculateDaysLeftUtil(deadlineDate);
};

/**
 * Calculates the current progress for a deadline by finding the most recent progress entry.
 * @param deadline - The deadline with its progress entries
 * @returns The current progress value, or 0 if no progress entries exist
 */
export const calculateProgress = (deadline: ReadingDeadlineWithProgress): number => {
    if (!deadline.progress || deadline.progress.length === 0) return 0;
    
    const latestProgress = deadline.progress.reduce((latest, current) => {
        return new Date(current.updated_at || current.created_at || '') > 
               new Date(latest.updated_at || latest.created_at || '') ? current : latest;
    });
    
    return latestProgress.current_progress || 0;
};

/**
 * Calculates the progress percentage for a deadline based on current progress and total quantity.
 * @param deadline - The deadline to calculate percentage for
 * @returns Progress percentage rounded to the nearest whole number
 */
export const calculateProgressPercentage = (deadline: ReadingDeadlineWithProgress): number => {
    const currentProgress = calculateProgress(deadline);
    const totalQuantity = calculateTotalQuantity(deadline.format, deadline.total_quantity);
    return Math.round((currentProgress / totalQuantity) * 100);
};

/**
 * Returns the appropriate unit for display based on the reading format.
 * @param format - The reading format (physical, ebook, or audio)
 * @returns The unit string ('minutes' for audio, 'pages' for physical/ebook)
 */
export const getUnitForFormat = (format: 'physical' | 'ebook' | 'audio'): string => {
    switch (format) {
        case 'audio':
            return 'minutes';
        case 'physical':
        case 'ebook':
        default:
            return 'pages';
    }
};

/**
 * Formats progress display based on the reading format.
 * For audio books, converts minutes to hours and minutes format.
 * For physical/ebook, returns the progress as-is.
 * @param format - The reading format (physical, ebook, or audio)
 * @param progress - The progress value to format
 * @returns Formatted progress string
 */
export const formatProgressDisplay = (format: 'physical' | 'ebook' | 'audio', progress: number): string => {
    if (format === 'audio') {
        const hours = Math.floor(progress / 60);
        const minutes = progress % 60;
        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        }
        return `${minutes}m`;
    }
    return `${progress}`;
};

/**
 * Calculates the total reading time per day needed for all active deadlines.
 * Converts pages to estimated minutes using an average reading speed of 40 pages per hour.
 * @param activeDeadlines - Array of active deadlines
 * @param getDeadlineCalculations - Function that calculates units per day for a deadline
 * @returns Formatted string showing total daily reading time needed or "No active deadlines"
 */
export const getTotalReadingTimePerDay = (
    activeDeadlines: ReadingDeadlineWithProgress[],
    getDeadlineCalculations: (deadline: ReadingDeadlineWithProgress) => {
        unitsPerDay: number;
    }
): string => {
    if (activeDeadlines.length === 0) {
        return 'No active deadlines';
    }
    
    let totalMinutesPerDay = 0;
    
    activeDeadlines.forEach(deadline => {
        const calculations = getDeadlineCalculations(deadline);
        
        if (deadline.format === 'audio') {
            // For audio, unitsPerDay is already in minutes
            totalMinutesPerDay += calculations.unitsPerDay;
        } else {
            // For physical/ebook, convert pages to estimated minutes
            // Assuming average reading speed of 40 pages per hour
            // So 1 page = 1.5 minutes (60 minutes / 40 pages = 1.5 minutes per page)
            const estimatedMinutesPerDay = calculations.unitsPerDay * 1.5;
            totalMinutesPerDay += estimatedMinutesPerDay;
        }
    });
    
    // Format the total time
    const hours = Math.floor(totalMinutesPerDay / 60);
    const minutes = Math.round(totalMinutesPerDay % 60);
    
    if (hours > 0) {
        if (minutes > 0) {
            return `${hours}h ${minutes}m/day needed`;
        }
        return `${hours}h/day needed`;
    }
    return `${minutes}m/day needed`;
}; 