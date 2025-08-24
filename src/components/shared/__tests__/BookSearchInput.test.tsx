import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import React from 'react';
import BookSearchInput from '../BookSearchInput';

// Mock the hooks
const mockSearchResults = {
    bookList: [
        {
            api_id: 'book1',
            api_source: 'goodreads',
            bookUrl: 'book1',
            title: 'Test Book 1',
            cover_image_url: 'https://example.com/cover1.jpg',
            publication_date: null,
            rating: null,
            source: 'api',
            epub_url: '',
            metadata: {
                goodreads_id: 'book1',
                authors: ['Test Author 1'],
                edition_count: null,
                ratings_count: null,
                series: null,
                series_number: null,
            },
        },
        {
            api_id: 'book2',
            api_source: 'goodreads',
            bookUrl: 'book2',
            title: 'Test Book 2',
            cover_image_url: 'https://example.com/cover2.jpg',
            publication_date: null,
            rating: null,
            source: 'api',
            epub_url: '',
            metadata: {
                goodreads_id: 'book2',
                authors: ['Test Author 2'],
                edition_count: null,
                ratings_count: null,
                series: null,
                series_number: null,
            },
        },
    ],
};

const mockFullBookData = {
    id: 'db_book_id',
    api_id: 'book1',
    api_source: 'goodreads',
    title: 'Test Book 1',
    cover_image_url: 'https://example.com/cover1.jpg',
    description: null,
    edition: null,
    format: null,
    genres: [],
    has_user_edits: false,
    isbn10: null,
    isbn13: null,
    language: null,
    publication_date: null,
    publisher: null,
    rating: null,
    source: 'goodreads',
    total_pages: 300,
    total_duration: null,
    bookUrl: 'book1',
    epub_url: '',
    metadata: {
        authors: ['Test Author 1'],
        extraction_method: 'test',
    },
};

const mockUseSearchBooksList = jest.fn();
const mockUseFetchBookData = jest.fn();

jest.mock('@/hooks/useBooks', () => ({
    useSearchBooksList: (query: string) => mockUseSearchBooksList(query),
    useFetchBookData: (api_id: string) => mockUseFetchBookData(api_id),
}));

// Mock theme
jest.mock('@/theme', () => ({
    useTheme: () => ({
        theme: {
            surface: '#f8f8f8',
            border: '#e0e0e0',
            text: '#000000',
            textMuted: '#666666',
            primary: '#007AFF',
            danger: '#ff3333',
        },
    }),
}));

// Mock IconSymbol
jest.mock('../../ui/IconSymbol', () => ({
    IconSymbol: ({ testID }: { testID?: string }) => {
        const { View } = require('react-native');
        return <View testID={testID || 'icon'} />;
    },
}));

describe('BookSearchInput', () => {
    const mockOnBookSelected = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        mockUseSearchBooksList.mockReturnValue({
            data: null,
            isLoading: false,
            error: null,
        });
        mockUseFetchBookData.mockReturnValue({
            data: null,
            isLoading: false,
            error: null,
        });
    });

    it('renders search input with placeholder', () => {
        const { getByTestId } = render(
            <BookSearchInput onBookSelected={mockOnBookSelected} />
        );

        const input = getByTestId('book-search-input');
        expect(input).toBeTruthy();
        expect(input.props.placeholder).toBe('Search for a book to link...');
    });

    it('renders custom placeholder when provided', () => {
        const customPlaceholder = 'Find your book...';
        const { getByTestId } = render(
            <BookSearchInput 
                onBookSelected={mockOnBookSelected}
                placeholder={customPlaceholder}
            />
        );

        const input = getByTestId('book-search-input');
        expect(input.props.placeholder).toBe(customPlaceholder);
    });

    it('shows loading state while searching', async () => {
        mockUseSearchBooksList.mockReturnValue({
            data: null,
            isLoading: true,
            error: null,
        });

        const { getByTestId, getByText } = render(
            <BookSearchInput onBookSelected={mockOnBookSelected} />
        );

        const input = getByTestId('book-search-input');
        
        await act(async () => {
            fireEvent.changeText(input, 'test query');
        });

        await waitFor(() => {
            expect(getByText('Searching books...')).toBeTruthy();
        });
    });

    it('shows search results when available', async () => {
        mockUseSearchBooksList.mockReturnValue({
            data: mockSearchResults,
            isLoading: false,
            error: null,
        });

        const { getByTestId, getByText } = render(
            <BookSearchInput onBookSelected={mockOnBookSelected} />
        );

        const input = getByTestId('book-search-input');
        
        await act(async () => {
            fireEvent.changeText(input, 'test');
        });

        await waitFor(() => {
            expect(getByTestId('book-search-results')).toBeTruthy();
            expect(getByText('Test Book 1')).toBeTruthy();
            expect(getByText('by Test Author 1')).toBeTruthy();
            expect(getByText('Test Book 2')).toBeTruthy();
            expect(getByText('by Test Author 2')).toBeTruthy();
        });
    });

    it('shows no results message when search returns empty', async () => {
        mockUseSearchBooksList.mockReturnValue({
            data: { bookList: [] },
            isLoading: false,
            error: null,
        });

        const { getByTestId, getByText } = render(
            <BookSearchInput onBookSelected={mockOnBookSelected} />
        );

        const input = getByTestId('book-search-input');
        
        await act(async () => {
            fireEvent.changeText(input, 'nonexistent book');
        });

        await waitFor(() => {
            expect(getByText('No books found for "nonexistent book"')).toBeTruthy();
        });
    });

    it('shows error message when search fails', async () => {
        mockUseSearchBooksList.mockReturnValue({
            data: null,
            isLoading: false,
            error: new Error('Search failed'),
        });

        const { getByTestId, getByText } = render(
            <BookSearchInput onBookSelected={mockOnBookSelected} />
        );

        const input = getByTestId('book-search-input');
        
        await act(async () => {
            fireEvent.changeText(input, 'test');
        });

        await waitFor(() => {
            expect(getByText('Failed to search books. Please try again.')).toBeTruthy();
        });
    });

    it('handles book selection and fetches full data', async () => {
        mockUseSearchBooksList.mockReturnValue({
            data: mockSearchResults,
            isLoading: false,
            error: null,
        });

        const { getByTestId, rerender } = render(
            <BookSearchInput onBookSelected={mockOnBookSelected} />
        );

        const input = getByTestId('book-search-input');
        
        await act(async () => {
            fireEvent.changeText(input, 'test');
        });

        await waitFor(() => {
            expect(getByTestId('book-result-book1')).toBeTruthy();
        });

        // Simulate book selection
        await act(async () => {
            fireEvent.press(getByTestId('book-result-book1'));
        });

        // Mock the fetch book data call
        mockUseFetchBookData.mockReturnValue({
            data: mockFullBookData,
            isLoading: false,
            error: null,
        });

        // Re-render to trigger useEffect
        rerender(<BookSearchInput onBookSelected={mockOnBookSelected} />);

        await waitFor(() => {
            expect(mockOnBookSelected).toHaveBeenCalledWith({
                id: 'db_book_id',
                api_id: 'book1',
                title: 'Test Book 1',
                author: 'Test Author 1',
                cover_image_url: 'https://example.com/cover1.jpg',
                total_pages: 300,
                total_duration: null,
            });
        });
    });

    it('shows selected book with clear option', () => {
        const selectedBook = {
            id: 'db_book_id',
            api_id: 'book1',
            title: 'Test Book 1',
            author: 'Test Author 1',
            cover_image_url: 'https://example.com/cover1.jpg',
            total_pages: 300,
        };

        const { getByTestId, getByText } = render(
            <BookSearchInput 
                onBookSelected={mockOnBookSelected}
                selectedBook={selectedBook}
            />
        );

        expect(getByText('Test Book 1')).toBeTruthy();
        expect(getByText('by Test Author 1')).toBeTruthy();
        expect(getByText('📚 Linked from library')).toBeTruthy();
        expect(getByTestId('clear-book-selection')).toBeTruthy();
        expect(getByTestId('selected-book-cover')).toBeTruthy();
    });

    it('clears selection when clear button is pressed', async () => {
        const selectedBook = {
            id: 'db_book_id',
            api_id: 'book1',
            title: 'Test Book 1',
            author: 'Test Author 1',
        };

        const { getByTestId } = render(
            <BookSearchInput 
                onBookSelected={mockOnBookSelected}
                selectedBook={selectedBook}
            />
        );

        const clearButton = getByTestId('clear-book-selection');
        
        await act(async () => {
            fireEvent.press(clearButton);
        });

        expect(mockOnBookSelected).toHaveBeenCalledWith(null);
    });

    it('debounces search input', async () => {
        jest.useFakeTimers();
        
        const { getByTestId } = render(
            <BookSearchInput onBookSelected={mockOnBookSelected} />
        );

        const input = getByTestId('book-search-input');
        
        // Type quickly
        await act(async () => {
            fireEvent.changeText(input, 't');
            fireEvent.changeText(input, 'te');
            fireEvent.changeText(input, 'tes');
            fireEvent.changeText(input, 'test');
        });

        // Should not have called search yet
        expect(mockUseSearchBooksList).toHaveBeenLastCalledWith('');

        // Fast forward timers
        await act(async () => {
            jest.advanceTimersByTime(300);
        });

        // Now should have called with debounced value
        expect(mockUseSearchBooksList).toHaveBeenLastCalledWith('test');
        
        jest.useRealTimers();
    });

    it('does not show results for queries shorter than 3 characters', async () => {
        mockUseSearchBooksList.mockReturnValue({
            data: mockSearchResults,
            isLoading: false,
            error: null,
        });

        const { getByTestId, queryByTestId } = render(
            <BookSearchInput onBookSelected={mockOnBookSelected} />
        );

        const input = getByTestId('book-search-input');
        
        await act(async () => {
            fireEvent.changeText(input, 'te');
        });

        expect(queryByTestId('book-search-results')).toBeNull();
    });

    it('shows loading state when fetching book details', () => {
        mockUseFetchBookData.mockReturnValue({
            data: null,
            isLoading: true,
            error: null,
        });

        const selectedBook = {
            id: 'db_book_id',
            api_id: 'book1',
            title: 'Test Book 1',
            author: 'Test Author 1',
        };

        const { getByText } = render(
            <BookSearchInput 
                onBookSelected={mockOnBookSelected}
                selectedBook={selectedBook}
            />
        );

        expect(getByText('Loading book details...')).toBeTruthy();
    });

    it('clears selection when user clears input text', async () => {
        const selectedBook = {
            id: 'db_book_id',
            api_id: 'book1',
            title: 'Test Book 1',
            author: 'Test Author 1',
        };

        const { getByTestId, rerender } = render(
            <BookSearchInput 
                onBookSelected={mockOnBookSelected}
                selectedBook={selectedBook}
            />
        );

        // Re-render without selected book to show input
        rerender(<BookSearchInput onBookSelected={mockOnBookSelected} />);

        const input = getByTestId('book-search-input');
        
        await act(async () => {
            fireEvent.changeText(input, '');
        });

        expect(mockOnBookSelected).toHaveBeenCalledWith(null);
    });
});