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
            if (deadlineIdError) {
                console.error('Error generating deadline ID:', deadlineIdError);
                throw new Error(`Failed to generate deadline ID: ${deadlineIdError.message}`);
            }
            
            const { data: progressId, error: progressIdError } = await supabase.rpc('generate_prefixed_id', { prefix: 'rdp' });
            if (progressIdError) {
                console.error('Error generating progress ID:', progressIdError);
                throw new Error(`Failed to generate progress ID: ${progressIdError.message}`);
            }
            
            deadlineDetails.id = deadlineId;
            progressDetails.id = progressId;
            progressDetails.reading_deadline_id = deadlineId;

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