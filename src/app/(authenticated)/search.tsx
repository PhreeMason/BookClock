import { BookList } from "@/components/BookList"
import { BookData } from "@/components/BookListItem"
import { Loader } from "@/components/Loader"
import { SearchBar } from "@/components/SearchBar"
import { ThemedText } from "@/components/ThemedText"
import { ThemedView } from "@/components/ThemedView"
import { useSearchBooks } from '@/hooks/useBooks'
import { useDebounce } from '@/hooks/useUtils'
import { router } from "expo-router"
import { useState } from "react"
import { StyleSheet } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

export default function SearchScreen() {
    const [searchQuery, setSearchQuery] = useState('');
    const debouncedSearch = useDebounce(searchQuery, 300);

    const { data, error, isLoading } = useSearchBooks(debouncedSearch)

    let searchResults: BookData[] = [];

    if (data && data.bookList) {
        searchResults = data.bookList;
    }

    const handleBookPress = (book: BookData) => {
        // TODO: Navigate to book details or handle book selection
        router.push(`/book/${book.api_id}/add`);
    };

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <ThemedView style={styles.container}>
                <ThemedText type="title" style={styles.title}>Search</ThemedText>

                <ThemedView style={styles.searchContainer}>
                    <SearchBar
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        placeholder="Search for books..."
                    />
                </ThemedView>

                {searchQuery.length > 0 && (
                    <ThemedView style={styles.resultsContainer}>
                        <ThemedText type="subtitle" style={styles.resultsTitle}>
                            Search results for "{searchQuery}"
                        </ThemedText>

                        {isLoading && (
                            <Loader text="Searching for books..." />
                        )}

                        {error && !isLoading && (
                            <ThemedText style={styles.errorText}>
                                Error loading search results. Please try again.
                            </ThemedText>
                        )}

                        {!isLoading && (
                            <BookList
                                books={searchResults}
                                onBookPress={handleBookPress}
                                emptyMessage="No books found for your search"
                                showEmptyState={!error}
                            />
                        )}
                    </ThemedView>
                )}
            </ThemedView>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        gap: 20,
    },
    title: {
        textAlign: 'center',
        marginBottom: 10,
    },
    searchContainer: {
        gap: 12,
    },
    resultsContainer: {
        flex: 1,
        marginTop: 20,
        gap: 12,
    },
    resultsTitle: {
        marginBottom: 8,
    },
    errorText: {
        color: '#DC2626',
        textAlign: 'center',
        marginBottom: 16,
    },
})
