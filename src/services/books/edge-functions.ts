import { useSupabase } from "@/lib/supabase";
import { SearchBooksResponse, FullBookData } from "@/types/bookSearch";

export const searchBookList = async (query: string, supabase: ReturnType<typeof useSupabase>): Promise<SearchBooksResponse> => {
    if (!query.trim()) return { bookList: [] };
    const { data, error } = await supabase.functions.invoke('search-books-v2', {
        body: { query },
    });

    if (error) throw error;
    return data;
};

export const fetchBookData = async (api_id: string, supabase: ReturnType<typeof useSupabase>): Promise<FullBookData> => {
    const { data, error } = await supabase.functions.invoke('book-data', {
        body: { api_id },
    });

    if (error) throw error;
    return data;
};