import { useSupabase } from "@/lib/supabase";
import { useQuery } from "@tanstack/react-query";

export const useSearchBooks = (query: string) => {
    const client = useSupabase();
    
    return useQuery({
        queryKey: ['searchBooks', query],
        queryFn: async () => {
        if (query.length < 4) return null;
        const { data, error } = await client.functions.invoke('search-books', {
            body: { query },
        });
        if (error) throw new Error(error.message);
        return data;
        },
        enabled: !!query,
        refetchOnWindowFocus: false,
    });
}
