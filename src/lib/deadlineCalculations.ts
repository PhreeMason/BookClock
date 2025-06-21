// Helper functions for deadline calculations
export const calculateTotalQuantity = (
    format: 'physical' | 'ebook' | 'audio',
    totalQuantity: number | string,
    totalMinutes?: number | string
): number => {
    const quantity = typeof totalQuantity === 'string' ? parseInt(totalQuantity) : totalQuantity;
    const minutes = typeof totalMinutes === 'string' ? parseInt(totalMinutes) : (totalMinutes || 0);
    
    if (format === 'audio') {
        return (quantity * 60) + minutes; // Convert hours to minutes and add extra minutes
    }
    return quantity;
};

export const calculateCurrentProgress = (
    format: 'physical' | 'ebook' | 'audio',
    currentProgress: number | string,
    currentMinutes?: number | string
): number => {
    const progress = typeof currentProgress === 'string' ? parseInt(currentProgress) : (currentProgress || 0);
    const minutes = typeof currentMinutes === 'string' ? parseInt(currentMinutes) : (currentMinutes || 0);
    
    if (format === 'audio') {
        return (progress * 60) + minutes; // Convert hours to minutes and add extra minutes
    }
    return progress;
};

export const calculateRemaining = (
    format: 'physical' | 'ebook' | 'audio',
    totalQuantity: number | string,
    totalMinutes: number | string | undefined,
    currentProgress: number | string,
    currentMinutes: number | string | undefined
): number => {
    const total = calculateTotalQuantity(format, totalQuantity, totalMinutes);
    const current = calculateCurrentProgress(format, currentProgress, currentMinutes);
    return total - current;
};

export const getReadingEstimate = (
    format: 'physical' | 'ebook' | 'audio',
    remaining: number
): string => {
    if (remaining <= 0) return '';
    
    switch (format) {
        case 'physical':
        case 'ebook':
            const hours = Math.ceil(remaining / 40); // Assuming 40 pages per hour
            return `📖 About ${hours} hours of reading time`;
        case 'audio':
            const hoursRemaining = Math.floor(remaining / 60);
            const minutesRemaining = remaining % 60;
            if (hoursRemaining > 0) {
                return `🎧 About ${hoursRemaining} hour${hoursRemaining > 1 ? 's' : ''}${minutesRemaining > 0 ? ` and ${minutesRemaining} minutes` : ''} of listening time`;
            } else {
                return `🎧 About ${minutesRemaining} minutes of listening time`;
            }
        default:
            return '';
    }
};

export const getPaceEstimate = (
    format: 'physical' | 'ebook' | 'audio',
    deadline: Date,
    remaining: number
): string => {
    if (remaining <= 0) return '';
    
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const daysLeft = Math.ceil((deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (daysLeft <= 0) {
        return '⚠️ This deadline has already passed';
    }

    const unitsPerDay = Math.ceil(remaining / daysLeft);
    
    if (format === 'audio') {
        const hoursPerDay = Math.floor(unitsPerDay / 60);
        const minutesPerDay = unitsPerDay % 60;
        let paceText = '';
        if (hoursPerDay > 0) {
            paceText = `${hoursPerDay} hour${hoursPerDay > 1 ? 's' : ''}${minutesPerDay > 0 ? ` ${minutesPerDay} minutes` : ''}`;
        } else {
            paceText = `${minutesPerDay} minutes`;
        }
        return `📅 You'll need to listen ${paceText}/day to finish on time`;
    } else {
        const unit = 'pages';
        return `📅 You'll need to read ${unitsPerDay} ${unit}/day to finish on time`;
    }
}; 