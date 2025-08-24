import { useSupabase } from "@/lib/supabase";
import { fetchBookData, searchBookList } from "@/services/books/edge-functions";
import { useQuery } from "@tanstack/react-query";

/* 
    React Query hooks for fetching book data 
    returns a list of books matching the search query
**/
export const useSearchBooksList = (query: string) => {
    const supabase = useSupabase();
    return useQuery({
        queryKey: ['books', 'search', query],
        queryFn: async () => searchBookList(query, supabase),
        staleTime: 1000 * 60 * 5,
        enabled: !!query && query.length > 2,
    });
};

/* 
    React Query hook for fetching book data by api_id ID
**/
export const useFetchBookData = (api_id: string) => {
    const supabase = useSupabase();
    return useQuery({
        queryKey: ['book', api_id],
        queryFn: async () => fetchBookData(api_id, supabase),
        staleTime: 1000 * 60 * 5,
    });
}