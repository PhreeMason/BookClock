import { z } from 'zod';

export const deadlineFormSchema = z.object({
    bookTitle: z.string().min(1, 'Book title is required'),
    bookAuthor: z.string().optional(),
    format: z.enum(['physical', 'ebook', 'audio'], {
        errorMap: () => ({ message: 'Please select a format' })
    }),
    source: z.enum(['library', 'arc', 'personal'], {
        errorMap: () => ({ message: 'Please select a source' })
    }),
    deadline: z.date({
        required_error: 'Deadline is required'
    }).refine(date => date > new Date(), {
        message: 'Deadline must be in the future'
    }),
    totalQuantity: z.coerce.number().int().positive({
        message: 'Total must be a positive number'
    }),
    totalMinutes: z.coerce.number().int().positive({
        message: 'Minutes must be a positive number'
    }).optional(),
    currentMinutes: z.coerce.number().int().positive({
        message: 'Minutes must be a positive number'
    }).optional(),
    currentProgress: z.coerce.number().int().min(0).optional(),
    flexibility: z.enum(['flexible', 'strict'], {
        errorMap: () => ({ message: 'Please select deadline flexibility' })
    }),
});

export type DeadlineFormData = z.infer<typeof deadlineFormSchema>; 