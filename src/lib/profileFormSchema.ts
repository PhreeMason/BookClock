import { z } from 'zod';

export const profileFormSchema = z.object({
    firstName: z.string().min(1, 'First name is required').max(50, 'First name must be less than 50 characters'),
    lastName: z.string().min(1, 'Last name is required').max(50, 'Last name must be less than 50 characters'),
});

export type ProfileFormData = z.infer<typeof profileFormSchema>;