import { z } from 'zod';

export const progressUpdateSchema = z.object({
    currentProgress: z.coerce.number()
        .int('Progress must be a whole number')
        .min(0, 'Progress cannot be negative')
        .refine((val) => val !== undefined && val !== null, {
            message: 'Progress is required'
        }),
});

export type ProgressUpdateData = z.infer<typeof progressUpdateSchema>;

// Dynamic schema factory for validation against total quantity
export const createProgressUpdateSchema = (totalQuantity: number, format: 'physical' | 'ebook' | 'audio') => {
    const unitName = format === 'audio' ? 'minutes' : 'pages';
    
    return z.object({
        currentProgress: z.coerce.number()
            .int('Progress must be a whole number')
            .min(0, 'Progress cannot be negative')
            .max(totalQuantity, `Progress cannot exceed ${totalQuantity} ${unitName}`)
            .refine((val) => val !== undefined && val !== null, {
                message: 'Progress is required'
            }),
    });
};
