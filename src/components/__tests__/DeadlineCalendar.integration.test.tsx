import { getSampleDeadlines } from '@/__tests__/fixtures/sampleDeadlines';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, waitFor } from '@testing-library/react-native';
import dayjs from 'dayjs';
import React from 'react';
import ReadingCalendar from '../features/calendar/ReadingCalendar';

// Import centralized mocks
import { mockUseTheme } from '@/__mocks__/contextProviders';
import { mockUseUser } from '@/__mocks__/externalLibraries';
import '@/__mocks__/reactNativeComponents'; // This includes Calendar mock
import { mockUseSupabase } from '@/__mocks__/supabase';

// Mock the useDeadlineHistory hook
jest.mock('@/hooks/useReadingHistory', () => ({
  useDeadlineHistory: jest.fn(),
}));

import { useDeadlineHistory } from '@/hooks/useReadingHistory';
const mockUseDeadlineHistory = useDeadlineHistory as jest.MockedFunction<typeof useDeadlineHistory>;

describe('Deadline Calendar Integration', () => {
    let queryClient: QueryClient;

    const mockUser = {
        id: 'test-user-id',
        firstName: 'Test',
        lastName: 'User',
    };

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

    const mockSupabaseClient = {
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        in: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        gte: jest.fn().mockReturnThis(),
    };

    // Convert sample deadline data to Supabase format
    const sampleData = getSampleDeadlines(2);
    const mockDeadlineData = sampleData.map(deadline => {
        const { progress, ...deadlineWithoutProgress } = deadline;
        return ({
            ...deadlineWithoutProgress,
            reading_deadline_progress: progress.map(p => ({
                id: p.id,
                current_progress: p.current_progress,
                created_at: p.created_at,
                updated_at: p.updated_at,
            })),
        })
    });

    beforeEach(() => {
        queryClient = new QueryClient({
            defaultOptions: {
                queries: { retry: false },
                mutations: { retry: false },
            },
        });

        mockUseUser.mockReturnValue({
            user: mockUser,
            isLoaded: true,
            isSignedIn: true,
        } as any);

        mockUseTheme.mockReturnValue({ theme: mockTheme } as any);

        mockUseSupabase.mockReturnValue(mockSupabaseClient as any);

        // Default successful response
        mockSupabaseClient.order.mockResolvedValue({
            data: mockDeadlineData,
            error: null,
        });

        // Mock useDeadlineHistory with proper data structure
        mockUseDeadlineHistory.mockReturnValue({
            data: {
                entries: [],
                summary: {
                    totalDays: 2,
                    totalDeadlines: 2,
                    ArchivedDeadlines: 0,
                },
            },
            isLoading: false,
            isError: false,
            error: null,
            calendarData: {},
            isSuccess: true,
        } as any);

        jest.clearAllMocks();
    });

    const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    it('should complete full user workflow: load calendar, view data, and interact', async () => {
        const { getByText, getByTestId } = render(
            <ReadingCalendar selectedCategory="all" dateRange="30d" />,
            { wrapper }
        );

        // 1. Should show loading state initially
        expect(getByText('Loading calendar...')).toBeTruthy();

        // 2. Wait for data to load
        await waitFor(() => {
            expect(getByText('Deadline Progress Calendar')).toBeTruthy();
        });

        // 3. Should display summary statistics
        await waitFor(() => {
            expect(getByText('2')).toBeTruthy(); // Active deadlines
            // Progress values will depend on the actual sample data calculations
        });

        // 4. Should display legend
        expect(getByText('Reading Deadlines')).toBeTruthy();
        expect(getByText('Audio Deadlines')).toBeTruthy();
        expect(getByText('Mixed Deadlines')).toBeTruthy();

        // 5. Calendar should be rendered
        expect(getByTestId('deadline-calendar')).toBeTruthy();
    });

    it('should handle format filtering correctly', async () => {
        // Test reading filter
        const { rerender, getByText } = render(
            <ReadingCalendar selectedCategory="reading" />,
            { wrapper }
        );

        await waitFor(() => {
            expect(getByText('Deadline Progress Calendar')).toBeTruthy();
        });

        // Verify hook was called with reading filter
        expect(mockSupabaseClient.in).toHaveBeenCalledWith('format', ['physical', 'ebook']);

        // Test listening filter
        rerender(
            <ReadingCalendar selectedCategory="listening" />
        );

        // Should call with audio filter
        await waitFor(() => {
            expect(mockSupabaseClient.in).toHaveBeenCalledWith('format', ['audio']);
        });
    });

    it('should handle date range changes', async () => {
        const { rerender, getByText } = render(
            <ReadingCalendar selectedCategory="all" dateRange="7d" />,
            { wrapper }
        );

        await waitFor(() => {
            expect(getByText('Last 7 days')).toBeTruthy();
        });

        rerender(
            <ReadingCalendar selectedCategory="all" dateRange="1y" />
        );

        await waitFor(() => {
            expect(getByText('Last year')).toBeTruthy();
        });
    });

    it('should handle error states gracefully', async () => {
        // Mock error response
        mockSupabaseClient.order.mockReturnValue({
            data: null,
            error: new Error('Database connection failed'),
        });

        const { getByText } = render(
            <ReadingCalendar selectedCategory="all" />,
            { wrapper }
        );

        await waitFor(() => {
            expect(getByText('Unable to load calendar data')).toBeTruthy();
        });
    });

    it('should handle unauthenticated user state', () => {
        mockUseUser.mockReturnValue({
            user: null,
            isLoaded: true,
            isSignedIn: false,
        } as any);

        render(
            <ReadingCalendar selectedCategory="all" />,
            { wrapper }
        );

        // Should not call Supabase when user is not authenticated
        expect(mockSupabaseClient.from).not.toHaveBeenCalled();
    });

    it('should process complex deadline progress correctly', async () => {
        // Mock data with multiple progress entries per deadline
        const created_at_date = dayjs(new Date());
        const updated_at_date = created_at_date.add(1, 'day').toISOString();
        const complexData = [
            {
                id: 'complex-deadline',
                book_title: 'Complex Progress Book',
                author: 'Progress Author',
                format: 'physical',
                total_quantity: 500,
                deadline_date: created_at_date.add(30, 'days').toISOString(),
                source: 'Bookstore',
                flexibility: 'moderate',
                updated_at: updated_at_date,
                created_at: created_at_date.toISOString(),
                reading_deadline_progress: [
                    { id: 'p1', current_progress: 25, created_at: created_at_date.add(2, 'days'), updated_at: created_at_date.add(2, 'days') },
                    { id: 'p2', current_progress: 75, created_at: created_at_date.add(3, 'days'), updated_at: created_at_date.add(3, 'days') },
                    { id: 'p3', current_progress: 150, created_at: created_at_date.add(4, 'days'), updated_at: created_at_date.add(4, 'days') },
                    { id: 'p4', current_progress: 250, created_at: created_at_date.add(5, 'days'), updated_at: created_at_date.add(5, 'days') },
                ],
            },
        ];

        mockSupabaseClient.order.mockResolvedValueOnce({
            data: complexData,
            error: null,
        });

        const { getByText } = render(
            <ReadingCalendar selectedCategory="all" />,
            { wrapper }
        );

        await waitFor(() => {
            expect(getByText('Deadline Progress Calendar')).toBeTruthy();
        });

        // Should have calculated daily progress correctly:
        // Based on sample data progress entries
        await waitFor(() => {
            expect(getByText('4')).toBeTruthy(); // Active days
            expect(getByText('250')).toBeTruthy(); // Total progress
        });
    });

    it('should handle empty data state', async () => {
        mockSupabaseClient.order.mockReturnValue({
            data: [],
            error: null,
        });

        const { getByText, getAllByText } = render(
            <ReadingCalendar selectedCategory="all" />,
            { wrapper }
        );

        await waitFor(() => {
            expect(getByText('Deadline Progress Calendar')).toBeTruthy();
        });

        // Should show zero values for all metrics
        await waitFor(() => {
            const zeroElements = getAllByText('0');
            expect(zeroElements.length).toBeGreaterThan(0); // Multiple zeros for different metrics
        });
    });

    it('should respect progress threshold for initial entries', async () => {
        // Test that initial progress > 50 is not counted as daily progress
        const thresholdData = [
            {
                id: 'threshold-test',
                book_title: 'Threshold Test Book',
                author: 'Test Author',
                format: 'physical',
                total_quantity: 300,
                deadline_date: '2025-08-15T00:00:00Z',
                source: 'Library',
                flexibility: 'moderate',
                created_at: '2025-07-15T12:00:00Z',
                reading_deadline_progress: [
                    {
                        id: 'big-initial',
                        current_progress: 100, // Large initial value - should not count as daily progress
                        created_at: '2025-07-15T10:00:00Z',
                        updated_at: '2025-07-15T10:00:00Z',
                    },
                    {
                        id: 'actual-progress',
                        current_progress: 125, // This difference should count
                        created_at: '2025-07-16T10:00:00Z',
                        updated_at: '2025-07-16T10:00:00Z',
                    },
                ],
            },
        ];

        mockSupabaseClient.order.mockResolvedValueOnce({
            data: thresholdData,
            error: null,
        });

        const { getByText } = render(
            <ReadingCalendar selectedCategory="all" />,
            { wrapper }
        );

        await waitFor(() => {
            expect(getByText('Deadline Progress Calendar')).toBeTruthy();
        });

        // Should only count the actual daily progress
        // Large initial progress should be ignored based on threshold logic
        await waitFor(() => {
            expect(getByText('1')).toBeTruthy(); // Only 1 active day
            expect(getByText('25')).toBeTruthy(); // Only 25 progress counted
        });
    });
});