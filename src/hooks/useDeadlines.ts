import { useSupabase } from "@/lib/supabase";
import { ReadingDeadlineInsert, ReadingDeadlineProgressInsert, ReadingDeadlineWithProgress } from "@/types/deadline";
import { useUser } from "@clerk/clerk-expo";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useAddDeadline = () => {
    const supabase = useSupabase();
    const user = useUser();
    const userId = user?.user?.id;
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationKey: ['addDeadline'],
        mutationFn: async (
            {
                deadlineDetails,
                progressDetails
            }: {
                deadlineDetails: Omit<ReadingDeadlineInsert, 'user_id'>,
                progressDetails: ReadingDeadlineProgressInsert
            }) => {
            if (!userId) {
                throw new Error("User not authenticated");
            }
            
            // Generate IDs
            const { data: deadlineId, error: deadlineIdError } = await supabase.rpc('generate_prefixed_id', { prefix: 'rd' });
            const finalDeadlineId = deadlineIdError ? `rd_${crypto.randomUUID()}` : deadlineId;
            if (deadlineIdError) {
                console.warn('RPC ID generation failed, using crypto fallback for deadline ID:', deadlineIdError);
            }
            
            const { data: progressId, error: progressIdError } = await supabase.rpc('generate_prefixed_id', { prefix: 'rdp' });
            const finalProgressId = progressIdError ? `rdp_${crypto.randomUUID()}` : progressId;
            if (progressIdError) {
                console.warn('RPC ID generation failed, using crypto fallback for progress ID:', progressIdError);
            }
            
            deadlineDetails.id = finalDeadlineId;
            progressDetails.id = finalProgressId;
            progressDetails.reading_deadline_id = finalDeadlineId;

            const { data, error } = await supabase.from('reading_deadlines').insert({
                ...deadlineDetails,
                user_id: userId,
            })
                .select()
                .single();

            if (error) {
                console.error('Error inserting deadline:', error);
                throw new Error(error.message);
            }

            const { data: progressData, error: progressError } = await supabase.from('reading_deadline_progress')
                .insert(progressDetails)
                .select()
                .single();

            if (progressError) {
                console.error('Error inserting progress:', progressError);
                throw new Error(progressError.message);
            }
            
            data.progress = progressData;
            return data;
        },
        onSuccess: () => {
            // Invalidate and refetch deadlines after successful addition
            queryClient.invalidateQueries({ queryKey: ['deadlines', userId] });
        },
        onError: (error) => {
            console.error("Error adding deadline:", error);
        },
    })
}

export const useUpdateDeadlineProgress = () => {
    const supabase = useSupabase();
    const user = useUser();
    const userId = user?.user?.id;
    const queryClient = useQueryClient();

    return useMutation({
        mutationKey: ['updateDeadlineProgress'],
        mutationFn: async (progressDetails: { deadlineId: string; currentProgress: number }) => {
            if (!userId) {
                throw new Error("User not authenticated");
            }
            
            // Generate progress ID using RPC with crypto fallback
            const { data: progressId, error: progressIdError } = await supabase.rpc('generate_prefixed_id', { prefix: 'rdp' });
            const finalProgressId = progressIdError ? `rdp_${crypto.randomUUID()}` : progressId;
            if (progressIdError) {
                console.warn('RPC ID generation failed, using crypto fallback for progress ID:', progressIdError);
            }
            
            // Create new progress entry
            const { data, error } = await supabase
                .from('reading_deadline_progress')
                .insert({
                    id: finalProgressId,
                    reading_deadline_id: progressDetails.deadlineId,
                    current_progress: progressDetails.currentProgress,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                })
                .select()
                .single();

            if (error) {
                throw error;
            }

            return data;
        },
        onSuccess: () => {
            // Invalidate and refetch deadlines after successful update
            queryClient.invalidateQueries({ queryKey: ['deadlines', userId] });
        },
        onError: (error) => {
            console.error("Error updating deadline progress:", error);
        },
    })
}

export const useGetDeadlines = () => {
    const supabase = useSupabase();
    const user = useUser();
    const userId = user?.user?.id;

    return useQuery<ReadingDeadlineWithProgress[]>({
        queryKey: ['deadlines', userId],
        queryFn: async () => {
            if (!userId) throw new Error("User not authenticated");
            const { data, error } = await supabase
                .from('reading_deadlines')
                .select(`
                    *,
                    progress:reading_deadline_progress(*)
                `)
                .eq('user_id', userId)
                .order('created_at', { ascending: false });

            if (error) throw new Error(error.message);
            return data as ReadingDeadlineWithProgress[];
        },
        enabled: !!userId,
        refetchOnWindowFocus: false,
        // staleTime: 1000 * 60 * 60 * 5, // 5 hours
    })
}