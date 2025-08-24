import { useSupabase } from "@/lib/supabase";

/**
 * Fetch book data directly from the books table by book_id
 * This is different from fetchBookData which uses api_id and edge functions
 */
export const fetchBookById = async (book_id: string, supabase: ReturnType<typeof useSupabase>) => {
    const { data, error } = await supabase
        .from('books')
        .select('*')
        .eq('id', book_id)
        .single();

    if (error) {
        throw new Error(`Failed to fetch book data: ${error.message}`);
    }

    return data;
};