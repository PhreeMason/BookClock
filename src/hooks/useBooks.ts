import { useSupabase } from "@/lib/supabase";
import { useQuery } from "@tanstack/react-query";

export const useSearchBooks = (query: string) => {
    const client = useSupabase();
    return useQuery({
        queryKey: ['searchBooks', query],
        queryFn: async () => {
            if (query.length < 4) return null;
            const { data, error } = await client.functions.invoke('search-books-v2', {
                body: { query },
            });
            if (error) throw new Error(error.message);
            return data;
        },
        enabled: !!query,
        refetchOnWindowFocus: false,
        // staleTime: 1000 * 60 * 60 * 5, // 5 hours
    });
}

export const useGetBookData = (api_id: string) => {
    const client = useSupabase();
    return useQuery({
        queryKey: ['bookData', api_id],
        queryFn: async () => {
            const { data, error } = await client.functions.invoke('book-data', {
                body: { api_id },
            });

            if (error) throw new Error(error.message);
            return data;
        },
        enabled: !!api_id,
        refetchOnWindowFocus: false,
       // staleTime: 1000 * 60 * 60 * 5, // 5 hours
    });
}
