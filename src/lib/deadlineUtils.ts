import { ReadingDeadlineWithProgress } from '@/types/deadline';
import { calculateTotalQuantity } from './deadlineCalculations';

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