import { z } from 'zod';

export const deadlineFormSchema = z.object({
    bookTitle: z.string().min(1, 'Book title is required'),
    bookAuthor: z.string().optional(),
    format: z.enum(['physical', 'ebook', 'audio'], {
        errorMap: () => ({ message: 'Please select a format' })
    }),
    source: z.string().min(1, 'Please select or enter a source'),
    deadline: z.date({
        required_error: 'Deadline is required'
    }),
    totalQuantity: z.coerce.number().int().positive({
        message: 'Total must be a positive number'
    }),
    totalMinutes: z.coerce.number().int().min(0, {
        message: 'Minutes must be 0 or greater'
    }).optional(),
    currentMinutes: z.coerce.number().int().min(0, {
        message: 'Minutes must be 0 or greater'
    }).optional(),
    currentProgress: z.coerce.number().int().min(0).optional(),
    flexibility: z.enum(['flexible', 'strict'], {
        errorMap: () => ({ message: 'Please select deadline flexibility' })
    }),
    // Optional book linking fields
    book_id: z.string().optional(), // Links to books table
    api_id: z.string().optional(),  // External API ID for book fetching
});

export type DeadlineFormData = z.infer<typeof deadlineFormSchema>; 