import { useSupabase } from "@/lib/supabase";
import { BookInsert, BookMetadata } from "@/types/book";

export const searchBookList = async (query: string, supabase: ReturnType<typeof useSupabase>): Promise<{ bookList: BookMetadata[] }> => {
    if (!query.trim()) return { bookList: [] };
    const { data, error } = await supabase.functions.invoke('search-books-v2', {
        body: { query },
    });

    if (error) throw error;
    return data;
};

export const fetchBookData = async (api_id: string, supabase: ReturnType<typeof useSupabase>): Promise<BookInsert> => {
    const { data, error } = await supabase.functions.invoke('book-data', {
        body: { api_id },
    });

    if (error) throw error;
    return data;
};