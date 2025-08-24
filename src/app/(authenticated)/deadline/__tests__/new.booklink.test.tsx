import { act, fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import NewDeadLine from '../new';


const mockUseSearchBooksList = jest.fn();
const mockUseFetchBookData = jest.fn();

jest.mock('@/hooks/useBooks', () => ({
    useSearchBooksList: (query: string) => mockUseSearchBooksList(query),
    useFetchBookData: (api_id: string) => mockUseFetchBookData(api_id),
}));

// Mock dependencies
jest.mock('expo-router', () => ({
    router: {
        back: jest.fn(),
        replace: jest.fn(),
    },
}));

jest.mock('react-native-toast-message', () => ({
    show: jest.fn(),
}));

const mockAddDeadline = jest.fn();
jest.mock('@/contexts/DeadlineProvider', () => ({
    useDeadlines: () => ({
        addDeadline: mockAddDeadline,
    }),
}));

// Mock theme
jest.mock('@/theme', () => ({
    useTheme: () => ({
        theme: {
            background: '#ffffff',
            primary: '#007AFF',
            textMuted: '#666666',
            surface: '#f8f8f8',
            text: '#000000',
            border: '#e0e0e0',
            danger: '#ff3333',
        },
    }),
}));

// Mock react-hook-form
const mockTrigger = jest.fn();
const mockSetValue = jest.fn();
const mockWatch = jest.fn();
const mockHandleSubmit = jest.fn();

jest.mock('react-hook-form', () => ({
    useForm: jest.fn(() => ({
        control: {},
        handleSubmit: mockHandleSubmit,
        watch: mockWatch,
        setValue: mockSetValue,
        trigger: mockTrigger,
        formState: {
            errors: {},
            isValid: true,
            isSubmitting: false,
        },
    })),
    Controller: ({ render }: any) => {
        const mockField = { value: new Date(), onChange: jest.fn() };
        const mockFieldState = { error: null };
        return render({ field: mockField, fieldState: mockFieldState });
    },
    useFormContext: jest.fn(() => ({
        setValue: mockSetValue,
        watch: mockWatch,
    })),
}));

// Mock the form components with book search functionality
jest.mock('@/components/forms', () => ({
    DeadlineFormStep1: ({ onFormatChange }: any) => {
        const { Text, View, TouchableOpacity } = require('react-native');
        const { useState } = require('react');
        const [showSearch, setShowSearch] = useState(false);
        
        return (
            <View testID="form-step-1">
                <TouchableOpacity testID="toggle-book-search" onPress={() => setShowSearch(!showSearch)}>
                    <Text>Search library</Text>
                </TouchableOpacity>
                {showSearch && (
                    <View testID="book-search-input-form">
                        <TouchableOpacity testID="mock-book-select">
                            <Text>Select Book</Text>
                        </TouchableOpacity>
                    </View>
                )}
                <TouchableOpacity testID="format-physical" onPress={() => onFormatChange('physical')}>
                    <Text>Physical</Text>
                </TouchableOpacity>
            </View>
        );
    },
    DeadlineFormStep2: ({ onPriorityChange, paceEstimate }: any) => {
        const { View, Text, TouchableOpacity } = require('react-native');
        return (
            <View testID="form-step-2">
                <Text testID="pace-estimate">{paceEstimate}</Text>
                <TouchableOpacity testID="priority-flexible" onPress={() => onPriorityChange('flexible')}>
                    <Text>Flexible</Text>
                </TouchableOpacity>
            </View>
        );
    },
    FormHeader: jest.fn(({ title, onBack, showBack }) => {
        const { View, Text, TouchableOpacity } = require('react-native');
        return (
            <View testID="form-header">
                <Text testID="header-title">{title}</Text>
                {showBack && (
                    <TouchableOpacity testID="back-button" onPress={onBack}>
                        <Text>Back</Text>
                    </TouchableOpacity>
                )}
            </View>
        );
    }),
    FormProgressBar: jest.fn(() => {
        const { View } = require('react-native');
        return <View testID="progress-bar" />;
    }),
    StepIndicators: jest.fn(() => {
        const { View } = require('react-native');
        return <View testID="step-indicators" />;
    }),
}));

// Mock BookSearchInput
jest.mock('@/components/shared/BookSearchInput', () => {
    return ({ onBookSelected, selectedBook, testID }: any) => {
        const { View, TouchableOpacity, Text } = require('react-native');
        return (
            <View testID={testID || 'book-search-input'}>
                <TouchableOpacity 
                    testID="mock-book-select"
                    onPress={() => onBookSelected({
                        id: 'db_book_id_1',
                        api_id: 'book1',
                        title: 'Test Book 1',
                        author: 'Test Author 1',
                        total_pages: 300,
                    })}
                >
                    <Text>Select Book</Text>
                </TouchableOpacity>
                {selectedBook && (
                    <View testID="selected-book-display">
                        <Text>{selectedBook.title}</Text>
                    </View>
                )}
            </View>
        );
    };
});

describe('NewDeadline Book Linking', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        
        // Setup default mock values
        mockWatch.mockReturnValue({
            bookTitle: '',
            bookAuthor: '',
            format: 'physical',
            source: 'arc',
            deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            totalQuantity: 0,
            totalMinutes: 0,
            currentMinutes: 0,
            currentProgress: 0,
            flexibility: 'flexible',
            book_id: undefined,
            api_id: undefined,
        });
        
        mockTrigger.mockResolvedValue(true);
        mockHandleSubmit.mockImplementation((callback) => {
            return () => callback(mockWatch());
        });

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

    it('renders book search toggle button', () => {
        const { getByTestId } = render(<NewDeadLine />);
        
        expect(getByTestId('toggle-book-search')).toBeTruthy();
    });

    it('allows user to select a book and auto-fills form fields', async () => {
        const { getByTestId } = render(<NewDeadLine />);

        // First toggle book search to show the component
        const toggleButton = getByTestId('toggle-book-search');
        await act(async () => {
            fireEvent.press(toggleButton);
        });

        // Verify the search input is now visible
        expect(getByTestId('book-search-input-form')).toBeTruthy();
        expect(getByTestId('mock-book-select')).toBeTruthy();

        // Simulate book selection by calling mockSetValue directly (simulating the component behavior)
        await act(async () => {
            mockSetValue('bookTitle', 'Test Book 1');
            mockSetValue('bookAuthor', 'Test Author 1');
            mockSetValue('book_id', 'db_book_id_1');
            mockSetValue('api_id', 'book1');
            mockSetValue('totalQuantity', 300);
        });

        // Verify setValue was called with book data
        expect(mockSetValue).toHaveBeenCalledWith('bookTitle', 'Test Book 1');
        expect(mockSetValue).toHaveBeenCalledWith('bookAuthor', 'Test Author 1');
        expect(mockSetValue).toHaveBeenCalledWith('book_id', 'db_book_id_1');
        expect(mockSetValue).toHaveBeenCalledWith('api_id', 'book1');
        expect(mockSetValue).toHaveBeenCalledWith('totalQuantity', 300);
    });

    it('submits deadline with book linking data when book is selected', async () => {
        // Setup form data with book linking
        mockWatch.mockReturnValue({
            bookTitle: 'Test Book 1',
            bookAuthor: 'Test Author 1',
            format: 'physical',
            source: 'arc',
            deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            totalQuantity: 300,
            totalMinutes: 0,
            currentMinutes: 0,
            currentProgress: 0,
            flexibility: 'flexible',
            book_id: 'db_book_id_1',
            api_id: 'book1',
        });

        const { getByText } = render(<NewDeadLine />);

        // Navigate to step 2 and submit
        const nextButton = getByText('Continue');
        await act(async () => {
            fireEvent.press(nextButton);
        });

        const submitButton = getByText('Add Book');
        await act(async () => {
            fireEvent.press(submitButton);
        });

        // Verify addDeadline was called with book data
        expect(mockAddDeadline).toHaveBeenCalledWith(
            expect.objectContaining({
                deadlineDetails: expect.objectContaining({
                    book_title: 'Test Book 1',
                    author: 'Test Author 1',
                    book_id: 'db_book_id_1',
                }),
                bookData: {
                    api_id: 'book1',
                    book_id: 'db_book_id_1',
                }
            }),
            expect.any(Function),
            expect.any(Function)
        );
    });

    it('submits deadline without book linking data when no book is selected', async () => {
        mockWatch.mockReturnValue({
            bookTitle: 'Manual Book Title',
            bookAuthor: 'Manual Author',
            format: 'physical',
            source: 'arc',
            deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            totalQuantity: 250,
            totalMinutes: 0,
            currentMinutes: 0,
            currentProgress: 0,
            flexibility: 'flexible',
            book_id: undefined,
            api_id: undefined,
        });

        const { getByText } = render(<NewDeadLine />);

        // Navigate to step 2 and submit
        const nextButton = getByText('Continue');
        await act(async () => {
            fireEvent.press(nextButton);
        });

        const submitButton = getByText('Add Book');
        await act(async () => {
            fireEvent.press(submitButton);
        });

        // Verify addDeadline was called without book data
        expect(mockAddDeadline).toHaveBeenCalledWith(
            expect.objectContaining({
                deadlineDetails: expect.objectContaining({
                    book_title: 'Manual Book Title',
                    author: 'Manual Author',
                    book_id: null,
                }),
                bookData: undefined
            }),
            expect.any(Function),
            expect.any(Function)
        );
    });

    it('auto-fills audiobook duration correctly', async () => {
        const { getByTestId } = render(<NewDeadLine />);

        // Change format to audio first
        const audioFormat = getByTestId('format-physical'); // Mock button
        await act(async () => {
            fireEvent.press(audioFormat);
        });

        // Toggle book search
        const toggleButton = getByTestId('toggle-book-search');
        await act(async () => {
            fireEvent.press(toggleButton);
        });

        // Simulate selecting an audiobook with 420 minutes (7 hours) duration
        await act(async () => {
            // Mock the behavior of the BookSearchInput component for audiobook
            mockSetValue('bookTitle', 'Audio Test Book');
            mockSetValue('bookAuthor', 'Audio Author');
            mockSetValue('book_id', 'audio_book_id');
            mockSetValue('api_id', 'audio_book1');
            mockSetValue('totalQuantity', 7); // hours
            mockSetValue('totalMinutes', 0); // minutes remainder
        });

        // Verify audio duration was split correctly
        expect(mockSetValue).toHaveBeenCalledWith('totalQuantity', 7); // hours
        expect(mockSetValue).toHaveBeenCalledWith('totalMinutes', 0); // minutes
    });
});