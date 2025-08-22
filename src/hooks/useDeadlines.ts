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

            // create deadline status entry
            const { data: statusData, error: statusError } = await supabase.from('reading_deadline_status')
                .insert({
                    reading_deadline_id: finalDeadlineId,
                    status: 'reading',
                    created_at: new Date().toISOString()
                })
                .select()
                .single();

            if (statusError) {
                console.error('Error inserting initial status:', statusError);
                throw new Error(statusError.message);
            }
    
            const result = {
                ...data,
                id: finalDeadlineId,
                user_id: userId,
                progress: progressData,
                status: [statusData]
            }
            return result;
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

export const useUpdateDeadline = () => {
    const supabase = useSupabase();
    const user = useUser();
    const userId = user?.user?.id;
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationKey: ['updateDeadline'],
        mutationFn: async (
            {
                deadlineDetails,
                progressDetails
            }: {
                deadlineDetails: ReadingDeadlineInsert,
                progressDetails: ReadingDeadlineProgressInsert
            }) => {
            if (!userId) {
                throw new Error("User not authenticated");
            }
            
            // Update deadline
            const { data: deadlineData, error: deadlineError } = await supabase
                .from('reading_deadlines')
                .update({
                    ...deadlineDetails,
                    updated_at: new Date().toISOString()
                })
                .eq('id', deadlineDetails.id)
                .eq('user_id', userId)
                .select()
                .single();

            if (deadlineError) {
                console.error('Error updating deadline:', deadlineError);
                throw new Error(deadlineError.message);
            }

            // Update or create progress entry
            let progressData;
            if (progressDetails.id) {
                // Update existing progress
                const { data, error: progressError } = await supabase
                    .from('reading_deadline_progress')
                    .update({
                        current_progress: progressDetails.current_progress,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', progressDetails.id)
                    .select()
                    .single();

                if (progressError) {
                    console.error('Error updating progress:', progressError);
                    throw new Error(progressError.message);
                }
                
                progressData = data;
            } else {
                // Create new progress entry
                const { data: progressId, error: progressIdError } = await supabase.rpc('generate_prefixed_id', { prefix: 'rdp' });
                const finalProgressId = progressIdError ? `rdp_${crypto.randomUUID()}` : progressId;
                if (progressIdError) {
                    console.warn('RPC ID generation failed, using crypto fallback for progress ID:', progressIdError);
                }
                
                const { data, error: progressError } = await supabase
                    .from('reading_deadline_progress')
                    .insert({
                        id: finalProgressId,
                        reading_deadline_id: deadlineDetails.id,
                        current_progress: progressDetails.current_progress,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                    })
                    .select()
                    .single();

                if (progressError) {
                    console.error('Error creating progress:', progressError);
                    throw new Error(progressError.message);
                }
                
                progressData = data;
            }
            return {...deadlineData, progress: progressData};
        },
        onSuccess: () => {
            // Invalidate and refetch deadlines after successful update
            queryClient.invalidateQueries({ queryKey: ['deadlines', userId] });
        },
        onError: (error) => {
            console.error("Error updating deadline:", error);
        },
    })
}

export const useDeleteDeadline = () => {
    const supabase = useSupabase();
    const user = useUser();
    const userId = user?.user?.id;
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationKey: ['deleteDeadline'],
        mutationFn: async (deadlineId: string) => {
            if (!userId) {
                throw new Error("User not authenticated");
            }
            
            // Delete associated progress entries first
            const { error: progressError } = await supabase
                .from('reading_deadline_progress')
                .delete()
                .eq('reading_deadline_id', deadlineId);

            if (progressError) {
                console.error('Error deleting progress entries:', progressError);
                throw new Error(progressError.message);
            }

            // Delete the deadline
            const { error: deadlineError } = await supabase
                .from('reading_deadlines')
                .delete()
                .eq('id', deadlineId)
                .eq('user_id', userId);

            if (deadlineError) {
                console.error('Error deleting deadline:', deadlineError);
                throw new Error(deadlineError.message);
            }
            
            return deadlineId;
        },
        onSuccess: () => {
            // Invalidate and refetch deadlines after successful deletion
            queryClient.invalidateQueries({ queryKey: ['deadlines', userId] });
        },
        onError: (error) => {
            console.error("Error deleting deadline:", error);
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

export const useGetDeadlines = (options?: { includeNonActive?: boolean }) => {
    const supabase = useSupabase();
    const user = useUser();
    const userId = user?.user?.id;
    const includeNonActive = options?.includeNonActive ?? false;

    return useQuery<ReadingDeadlineWithProgress[]>({
        queryKey: ['deadlines', userId, includeNonActive],
        queryFn: async () => {
            if (!userId) throw new Error("User not authenticated");
            const { data, error } = await supabase
                .from('reading_deadlines')
                .select(`
                    *,
                    progress:reading_deadline_progress(*),
                    status:reading_deadline_status(*)
                `)
                .eq('user_id', userId)
                .order('created_at', { ascending: false });

            if (error) throw new Error(error.message);
            
            // Filter based on includeNonActive option
            const filteredData = includeNonActive 
                ? (data || [])
                : (data?.filter(deadline => {
                    const latestStatus = deadline.status?.[deadline.status.length - 1]?.status;
                    return !latestStatus || latestStatus === 'reading';
                }) || []);
            
            return filteredData as ReadingDeadlineWithProgress[];
        },
        enabled: !!userId,
        refetchOnWindowFocus: false,
        // staleTime: 1000 * 60 * 60 * 5, // 5 hours
    })
}

const useUpdateDeadlineStatus = (status: 'complete' | 'set_aside' | 'reading') => {
    const supabase = useSupabase();
    const user = useUser();
    const userId = user?.user?.id;
    const queryClient = useQueryClient();
    
    const getActionName = (status: string) => {
        switch (status) {
            case 'complete': return 'completing';
            case 'set_aside': return 'setting aside';
            case 'reading': return 'reactivating';
            default: return 'updating';
        }
    };
    
    const getMutationKey = (status: string) => {
        switch (status) {
            case 'complete': return 'completeDeadline';
            case 'set_aside': return 'setAsideDeadline';
            case 'reading': return 'reactivateDeadline';
            default: return 'updateDeadlineStatus';
        }
    };
    
    const actionName = getActionName(status);
    const mutationKey = getMutationKey(status);
    
    return useMutation({
        mutationKey: [mutationKey],
        mutationFn: async (deadlineId: string) => {
            if (!userId) {
                throw new Error("User not authenticated");
            }
            
            const { data, error } = await supabase
                .from('reading_deadline_status')
                .insert({
                    reading_deadline_id: deadlineId,
                    status,
                    created_at: new Date().toISOString()
                })
                .select()
                .single();

            if (error) {
                console.error(`Error ${actionName} deadline:`, error);
                throw new Error(error.message);
            }
            
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['deadlines', userId] });
        },
        onError: (error) => {
            console.error(`Error ${actionName} deadline:`, error);
        },
    })
}

export const useCompleteDeadline = () => useUpdateDeadlineStatus('complete');

export const useSetAsideDeadline = () => useUpdateDeadlineStatus('set_aside');

export const useReactivateDeadline = () => useUpdateDeadlineStatus('reading');

export const useGetArchivedDeadlines = () => {
    const supabase = useSupabase();
    const user = useUser();
    const userId = user?.user?.id;

    return useQuery<ReadingDeadlineWithProgress[]>({
        queryKey: ['ArchivedDeadlines', userId],
        queryFn: async () => {
            if (!userId) throw new Error("User not authenticated");
            const { data, error } = await supabase
                .from('reading_deadlines')
                .select(`
                    *,
                    progress:reading_deadline_progress(*),
                    status:reading_deadline_status(*)
                `)
                .eq('user_id', userId)
                .order('created_at', { ascending: false });

            if (error) throw new Error(error.message);
            
            // Filter for completed and set_aside deadlines only
            const filteredData = data?.filter(deadline => {
                const latestStatus = deadline.status?.[deadline.status.length - 1]?.status;
                return latestStatus === 'complete' || latestStatus === 'set_aside';
            }) || [];
            
            // Sort by completion date (most recent status entry)
            filteredData.sort((a, b) => {
                const aDate = a.status?.[a.status.length - 1]?.created_at || a.created_at;
                const bDate = b.status?.[b.status.length - 1]?.created_at || b.created_at;
                if (!aDate || !bDate) return 0; // Handle cases where dates might be missing
                return new Date(bDate).getTime() - new Date(aDate).getTime();
            });
            
            return filteredData as ReadingDeadlineWithProgress[];
        },
        enabled: !!userId,
        refetchOnWindowFocus: false,
    })
}

export const useGetDeadlineById = (deadlineId: string | undefined) => {
    const supabase = useSupabase();
    const user = useUser();
    const userId = user?.user?.id;

    return useQuery<ReadingDeadlineWithProgress | null>({
        queryKey: ['deadline', userId, deadlineId],
        queryFn: async () => {
            if (!userId || !deadlineId) return null;
            
            const { data, error } = await supabase
                .from('reading_deadlines')
                .select(`
                    *,
                    progress:reading_deadline_progress(*),
                    status:reading_deadline_status(*)
                `)
                .eq('user_id', userId)
                .eq('id', deadlineId)
                .single();

            if (error) {
                if (error.code === 'PGRST116') {
                    // No rows returned
                    return null;
                }
                throw new Error(error.message);
            }
            
            return data as ReadingDeadlineWithProgress;
        },
        enabled: !!userId && !!deadlineId,
        refetchOnWindowFocus: false,
        staleTime: 1000 * 60 * 5, // 5 minutes
    })
}