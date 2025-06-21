import { ReadingDeadlineWithProgress } from '@/types/deadline';
import { calculateTotalQuantity } from './deadlineCalculations';

// Sort function for deadlines
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

export const separateDeadlines = (deadlines: ReadingDeadlineWithProgress[]) => {
    const now = new Date();
    
    const active: ReadingDeadlineWithProgress[] = [];
    const overdue: ReadingDeadlineWithProgress[] = [];
    
    deadlines.forEach(deadline => {
        const deadlineDate = new Date(deadline.deadline_date);
        
        if (deadlineDate < now) {
            overdue.push(deadline);
        } else {
            active.push(deadline);
        }
    });
    
    // Sort both arrays
    active.sort(sortDeadlines);
    overdue.sort(sortDeadlines);
    
    return { active, overdue };
};

export const calculateDaysLeft = (deadlineDate: string): number => {
    const now = new Date();
    const deadline = new Date(deadlineDate);
    const diffTime = deadline.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
};

export const calculateProgress = (deadline: ReadingDeadlineWithProgress): number => {
    if (deadline.progress.length === 0) return 0;
    
    const latestProgress = deadline.progress.reduce((latest, current) => {
        return new Date(current.updated_at || current.created_at || '') > 
               new Date(latest.updated_at || latest.created_at || '') ? current : latest;
    });
    
    return latestProgress.current_progress || 0;
};

export const calculateProgressPercentage = (deadline: ReadingDeadlineWithProgress): number => {
    const currentProgress = calculateProgress(deadline);
    const totalQuantity = calculateTotalQuantity(deadline.format, deadline.total_quantity);
    return Math.round((currentProgress / totalQuantity) * 100);
};

// Helper function to get the appropriate unit for display based on format
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

// Helper function to format progress display based on format
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

// Calculate total reading time per day needed for all active deadlines
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