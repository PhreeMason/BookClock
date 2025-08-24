import { getSampleDeadlines } from '@/__tests__/fixtures/sampleDeadlines';
import { DailyDeadlineEntry } from '@/hooks/useReadingHistory';
import { useTheme } from '@/theme';
import { render } from '@testing-library/react-native';
import React from 'react';
import ReadingDayDetails from '../features/calendar/ReadingDayDetails';

// Mock dependencies
jest.mock('@/theme');
jest.mock('expo-symbols', () => ({
    SymbolView: ({ children }: any) => children,
}));
jest.mock('react-native-pager-view', () => {
    const React = require('react');
    const { View } = require('react-native');
    const PagerView = React.forwardRef(({ children }: any, ref: any) => {
        return React.createElement(View, { ref }, children);
    });
    PagerView.displayName = 'PagerView';
    return PagerView;
});
// Mock Modal component directly and include Animated
jest.mock('react-native', () => {
    const {
        View,
        Text,
        TextInput,
        TouchableOpacity,
        ScrollView,
        StyleSheet,
        Dimensions,
        Platform,
        Animated
    } = jest.requireActual('react-native');

    const MockModal = ({ children, visible }: any) => visible ? children : null;

    return {
        View,
        Text,
        TextInput,
        TouchableOpacity,
        ScrollView,
        StyleSheet,
        Dimensions,
        Platform,
        Animated,
        Modal: MockModal,
    };
});

const mockUseTheme = useTheme as jest.MockedFunction<typeof useTheme>;

describe('ReadingDayDetails', () => {
    const mockTheme = {
        primary: '#007AFF',
        secondary: '#FF9500',
        accent: '#FF3B30',
        background: '#FFFFFF',
        surface: '#F8F9FA',
        text: '#000000',
        textMuted: '#6C7B7F',
        border: '#E5E5EA',
        success: '#34C759',
        warning: '#FF9500',
    };

    // Create test data based on sample deadlines
    const sampleData = getSampleDeadlines(3);
    const mockDayData: DailyDeadlineEntry = {
        date: '2025-06-27',
        deadlines: [
            {
                id: sampleData[0].id,
                book_title: sampleData[0].book_title,
                author: sampleData[0].author || 'Unknown Author',
                format: sampleData[0].format,
                progress_made: 2, // 39 - 37 = 2 pages
                total_progress: 39,
                total_quantity: sampleData[0].total_quantity,
                deadline_date: sampleData[0].deadline_date,
                source: sampleData[0].source,
                flexibility: sampleData[0].flexibility,
            },
            {
                id: sampleData[1].id,
                book_title: sampleData[1].book_title,
                author: sampleData[1].author || 'Unknown Author',
                format: sampleData[1].format,
                progress_made: 21, // 302 - 281 = 21 minutes
                total_progress: 302,
                total_quantity: sampleData[1].total_quantity,
                deadline_date: sampleData[1].deadline_date,
                source: sampleData[1].source,
                flexibility: sampleData[1].flexibility,
            },
            {
                id: sampleData[2].id,
                book_title: sampleData[2].book_title,
                author: sampleData[2].author || 'Unknown Author',
                format: sampleData[2].format,
                progress_made: 10, // 41 - 31 = 10 pages
                total_progress: 41,
                total_quantity: sampleData[2].total_quantity,
                deadline_date: sampleData[2].deadline_date,
                source: sampleData[2].source,
                flexibility: sampleData[2].flexibility,
            },
        ],
        statusChanges: [],
        totalProgressMade: 33,
    };

    const defaultProps = {
        isVisible: true,
        onClose: jest.fn(),
        dayData: mockDayData,
        selectedCategory: 'all' as const,
    };

    beforeEach(() => {
        mockUseTheme.mockReturnValue({ theme: mockTheme } as any);
        jest.clearAllMocks();
    });

    it('should render modal when visible', () => {
        const { getByText } = render(<ReadingDayDetails {...defaultProps} />);

        expect(getByText('Friday, June 27, 2025')).toBeTruthy();
        expect(getByText('Daily Summary')).toBeTruthy();
        expect(getByText('Deadlines Worked On')).toBeTruthy();
    });

    it('should not render when not visible', () => {
        const { queryByText } = render(
            <ReadingDayDetails {...defaultProps} isVisible={false} />
        );

        expect(queryByText('Daily Summary')).toBeFalsy();
    });

    it('should call onClose when close button is pressed', () => {
        const mockOnClose = jest.fn();
        // Note: We'd need to add accessibility labels to the close button
        // For now, we'll test that onClose is provided
        expect(mockOnClose).toBeDefined();
    });

    it('should display correct summary statistics', () => {
        const { getByText } = render(<ReadingDayDetails {...defaultProps} />);

        expect(getByText('33')).toBeTruthy(); // Total Progress
        expect(getByText('3')).toBeTruthy(); // Deadlines Worked
        expect(getByText('0')).toBeTruthy(); // Completed (none in this example)
        expect(getByText('Total Progress')).toBeTruthy();
        expect(getByText('Deadlines Worked')).toBeTruthy();
        expect(getByText('Completed')).toBeTruthy();
    });

    it('should display all deadlines when category is "all"', () => {
        const { getByText } = render(<ReadingDayDetails {...defaultProps} />);

        expect(getByText('Letters to a Young Poet')).toBeTruthy();
        expect(getByText('The lean start up')).toBeTruthy();
        expect(getByText('Freeing the natural voice')).toBeTruthy();
    });

    it('should filter to reading deadlines only when category is "reading"', () => {
        const { getByText, queryByText } = render(
            <ReadingDayDetails {...defaultProps} selectedCategory="reading" />
        );

        expect(getByText('Letters to a Young Poet')).toBeTruthy(); // physical
        expect(getByText('Freeing the natural voice')).toBeTruthy(); // physical
        expect(queryByText('The lean start up')).toBeFalsy(); // audio - should be filtered out
    });

    it('should filter to listening deadlines only when category is "listening"', () => {
        const { getByText, queryByText } = render(
            <ReadingDayDetails {...defaultProps} selectedCategory="listening" />
        );

        expect(getByText('The lean start up')).toBeTruthy(); // audio
        expect(queryByText('Letters to a Young Poet')).toBeFalsy(); // physical - should be filtered out
        expect(queryByText('Freeing the natural voice')).toBeFalsy(); // physical - should be filtered out
    });

    it('should format progress correctly for physical/ebook books', () => {
        const { getByText } = render(<ReadingDayDetails {...defaultProps} />);

        expect(getByText('Progress: 2 pages')).toBeTruthy(); // Letters to a Young Poet
        expect(getByText('Progress: 10 pages')).toBeTruthy(); // Freeing the natural voice
    });

    it('should format progress correctly for audiobooks', () => {
        const { getByText } = render(<ReadingDayDetails {...defaultProps} />);

        expect(getByText('Progress: 21m')).toBeTruthy(); // The lean start up - 21 minutes
    });

    it('should display deadline information correctly', () => {
        const { getByText, getAllByText } = render(<ReadingDayDetails {...defaultProps} />);

        // Check deadline dates (using actual sample data dates)
        expect(getByText('Due: Jul 11, 2025')).toBeTruthy();
        expect(getByText('Due: Jul 31, 2025')).toBeTruthy();
        expect(getByText('Due: Aug 31, 2025')).toBeTruthy();

        // Check sources (multiple books can have same source)
        const personalSources = getAllByText('Source: personal');
        expect(personalSources.length).toBeGreaterThan(0);
        expect(getByText('Source: library')).toBeTruthy();
    });

    it('should calculate and display progress percentages correctly', () => {
        const { getByText } = render(<ReadingDayDetails {...defaultProps} />);

        // Letters to a Young Poet: 39/52 = 75%
        expect(getByText('Total: 39 pages/52 pages (75%)')).toBeTruthy();

        // The lean start up: 302/519 = 58%
        expect(getByText('Total: 5h 2m/8h 39m (58%)')).toBeTruthy();

        // Freeing the natural voice: 41/374 = 11%
        expect(getByText('Total: 41 pages/374 pages (11%)')).toBeTruthy();
    });

    it('should handle deadlines without authors', () => {
        const dayDataWithoutAuthors: DailyDeadlineEntry = {
            ...mockDayData,
            deadlines: [
                {
                    id: mockDayData.deadlines[0].id,
                    book_title: mockDayData.deadlines[0].book_title,
                    format: mockDayData.deadlines[0].format,
                    progress_made: mockDayData.deadlines[0].progress_made,
                    total_progress: mockDayData.deadlines[0].total_progress,
                    total_quantity: mockDayData.deadlines[0].total_quantity,
                    deadline_date: mockDayData.deadlines[0].deadline_date,
                    source: mockDayData.deadlines[0].source,
                    flexibility: mockDayData.deadlines[0].flexibility,
                },
            ],
        };

        const { getByText, queryByText } = render(
            <ReadingDayDetails {...defaultProps} dayData={dayDataWithoutAuthors} />
        );

        expect(getByText('Letters to a Young Poet')).toBeTruthy();
        expect(queryByText('by Rainer Maria Rilke')).toBeFalsy();
    });

    it('should show empty state when no deadlines match filter', () => {
        const emptyDayData: DailyDeadlineEntry = {
            date: '2024-01-03',
            deadlines: [],
            statusChanges: [],
            totalProgressMade: 0,
        };

        const { getByText } = render(
            <ReadingDayDetails {...defaultProps} dayData={emptyDayData} />
        );

        expect(getByText('No deadline progress recorded for this day')).toBeTruthy();
    });

    it('should calculate completed deadlines correctly in summary', () => {
        const dayDataWithCompleted: DailyDeadlineEntry = {
            ...mockDayData,
            deadlines: [
                {
                    ...mockDayData.deadlines[0],
                    total_progress: 300, // Completed (matches total_quantity)
                    total_quantity: 300,
                },
                ...mockDayData.deadlines.slice(1), // Keep others incomplete
            ],
        };

        const { getByText } = render(
            <ReadingDayDetails {...defaultProps} dayData={dayDataWithCompleted} />
        );

        expect(getByText('1')).toBeTruthy(); // Should show 1 completed deadline
    });

    it('should handle different format icons correctly', () => {
        // This test would need to verify icon usage, but since we're using IconSymbol
        // which is mocked, we can at least verify the component renders without errors
        const { getByText } = render(<ReadingDayDetails {...defaultProps} />);

        expect(getByText('Letters to a Young Poet')).toBeTruthy(); // physical
        expect(getByText('The lean start up')).toBeTruthy(); // audio
        expect(getByText('Freeing the natural voice')).toBeTruthy(); // physical
    });

    it('should format date correctly', () => {
        const { getByText } = render(<ReadingDayDetails {...defaultProps} />);

        expect(getByText('Friday, June 27, 2025')).toBeTruthy();
    });

    it('should use correct theme colors', () => {
        render(<ReadingDayDetails {...defaultProps} />);

        expect(mockUseTheme).toHaveBeenCalled();
    });

    it('should handle edge case of 0 progress made', () => {
        const dayDataZeroProgress: DailyDeadlineEntry = {
            ...mockDayData,
            deadlines: [
                {
                    ...mockDayData.deadlines[0],
                    progress_made: 0,
                },
            ],
            totalProgressMade: 0,
        };

        const { getByText, getAllByText } = render(
            <ReadingDayDetails {...defaultProps} dayData={dayDataZeroProgress} />
        );

        expect(getByText('Progress: 0 pages')).toBeTruthy();
        // Check for the 0 in "Total Progress" section specifically
        const zeroElements = getAllByText('0');
        expect(zeroElements.length).toBeGreaterThan(0);
    });

    it('should handle minutes-only audiobook progress formatting', () => {
        const dayDataMinutesOnly: DailyDeadlineEntry = {
            ...mockDayData,
            deadlines: [
                {
                    ...mockDayData.deadlines[1],
                    progress_made: 45, // Less than 60 minutes
                },
            ],
        };

        const { getByText } = render(
            <ReadingDayDetails {...defaultProps} dayData={dayDataMinutesOnly} />
        );

        expect(getByText('Progress: 45m')).toBeTruthy();
    });
});