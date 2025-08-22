import { useDeadlineHistory } from '@/hooks/useReadingHistory';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import React from 'react';
import ReadingCalendar from '../features/calendar/ReadingCalendar';

// Mock the hooks and components
jest.mock('@/hooks/useReadingHistory');
jest.mock('@/lib/supabase', () => ({
  useSupabase: () => ({
    from: jest.fn(),
  }),
}));
jest.mock('@clerk/clerk-expo', () => ({
  useUser: () => ({ user: { id: 'test-user' } }),
}));
jest.mock('../features/calendar/ReadingDayDetails', () => {
  return jest.fn(({ dayData, isVisible }) => {
    const { View, Text } = require('react-native');
    if (!isVisible) return null;
    return (
      <View testID="reading-day-details">
        <Text testID="selected-date">{dayData.date}</Text>
        <Text testID="total-progress">{dayData.totalProgressMade}</Text>
        <Text testID="deadlines-count">{dayData.deadlines.length}</Text>
        {dayData.deadlines.map((deadline: any, index: number) => (
          <Text key={index} testID={`deadline-${index}`}>
            {deadline.book_title}
          </Text>
        ))}
      </View>
    );
  });
});

// Mock the Calendar component to capture onDayPress
jest.mock('react-native-calendars', () => ({
  Calendar: ({ onDayPress, markedDates, ...props }: any) => {
    const { View, TouchableOpacity, Text } = require('react-native');
    return (
      <View testID="calendar" {...props}>
        <View testID="calendar-grid">
          {/* Simulate calendar dates that can be pressed */}
          <TouchableOpacity
            testID="date-2025-06-21"
            onPress={() => onDayPress({ dateString: '2025-06-21' })}
          >
            <Text>21</Text>
          </TouchableOpacity>
          <TouchableOpacity
            testID="date-2025-06-22"
            onPress={() => onDayPress({ dateString: '2025-06-22' })}
          >
            <Text>22</Text>
          </TouchableOpacity>
          <TouchableOpacity
            testID="date-2025-06-23"
            onPress={() => onDayPress({ dateString: '2025-06-23' })}
          >
            <Text>23</Text>
          </TouchableOpacity>
          <TouchableOpacity
            testID="date-2025-06-24"
            onPress={() => onDayPress({ dateString: '2025-06-24' })}
          >
            <Text>24</Text>
          </TouchableOpacity>
          <TouchableOpacity
            testID="date-2025-06-25"
            onPress={() => onDayPress({ dateString: '2025-06-25' })}
          >
            <Text>25</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  },
}));

// Mock theme hook
jest.mock('@/theme', () => ({
  useTheme: () => ({
    theme: {
      primary: '#007AFF',
      surface: '#FFFFFF',
      background: '#FFFFFF',
      text: '#000000',
      textMuted: '#666666',
      border: '#E0E0E0',
      warning: '#FF9500',
    },
  }),
}));

const mockUseDeadlineHistory = useDeadlineHistory as jest.MockedFunction<typeof useDeadlineHistory>;

describe('ReadingCalendar Date Click Tests', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    jest.clearAllMocks();
  });

  const renderCalendar = (selectedCategory: 'reading' | 'listening' | 'combined' = 'reading') => {
    return render(
      <QueryClientProvider client={queryClient}>
        <ReadingCalendar selectedCategory={selectedCategory} dateRange="90d" />
      </QueryClientProvider>
    );
  };

  test('clicking June 21 should show June 21 data, not June 20', async () => {
    // Mock data with specific dates that match user's actual data
    const mockData = {
      entries: [
        {
          date: '2025-06-21', // This should be the date shown when clicking June 21
          deadlines: [
            {
              id: 'rd_1546b109fce34579',
              book_title: 'The lean start up',
              author: 'Eric Ries',
              format: 'audio' as const,
              progress_made: 281,
              total_progress: 281,
              total_quantity: 519,
              deadline_date: '2025-07-31T06:47:00+00:00',
              source: 'personal',
              flexibility: 'flexible',
            },
            {
              id: 'rd_39c7e304c851434a',
              book_title: 'Onyx Storm',
              author: 'Rebecca Yarros',
              format: 'audio' as const,
              progress_made: 832,
              total_progress: 832,
              total_quantity: 1432,
              deadline_date: '2025-12-31T07:57:00+00:00',
              source: 'personal',
              flexibility: 'strict',
            },
            {
              id: 'rd_983950d544304c7c',
              book_title: 'Dungeon Crawler Carl This Inevitable Ruin',
              author: 'Matt Dinniman',
              format: 'audio' as const,
              progress_made: 1272,
              total_progress: 1272,
              total_quantity: 1720,
              deadline_date: '2025-12-31T07:57:00+00:00',
              source: 'personal',
              flexibility: 'strict',
            },
          ],
          totalProgressMade: 2385,
        },
        {
          date: '2025-06-22',
          deadlines: [
            {
              id: 'rd_c7a2f6a0c8434e75',
              book_title: 'Singing',
              author: undefined,
              format: 'audio' as const,
              progress_made: 1200,
              total_progress: 1200,
              total_quantity: 6000,
              deadline_date: '2025-12-31T07:57:00+00:00',
              source: 'personal',
              flexibility: 'strict',
            },
          ],
          totalProgressMade: 1200,
        },
      ],
      summary: {
        totalDays: 2,
        totalProgressMade: 3585,
        averageProgressPerDay: 1792.5,
        activeDeadlines: 4,
        ArchivedDeadlines: 0,
      },
    };

    const mockCalendarData = {
      '2025-06-21': {
        marked: true,
        dotColor: '#FF9500',
        selectedColor: '#FF9500',
        selectedTextColor: 'white',
      },
      '2025-06-22': {
        marked: true,
        dotColor: '#FF9500',
        selectedColor: '#FF9500',
        selectedTextColor: 'white',
      },
    };

    mockUseDeadlineHistory.mockReturnValue({
      data: mockData,
      isLoading: false,
      error: null,
      calendarData: mockCalendarData,
      isError: false,
      isFetching: false,
      isSuccess: true,
      status: 'success',
      dataUpdatedAt: 0,
      errorUpdatedAt: 0,
      failureCount: 0,
      failureReason: null,
      errorUpdateCount: 0,
      isFetched: true,
      isFetchedAfterMount: true,
      isInitialLoading: false,
      isPaused: false,
      isPending: false,
      isPlaceholderData: false,
      isRefetchError: false,
      isRefetching: false,
      isStale: false,
      refetch: jest.fn(),
      isLoadingError: false,
      fetchStatus: 'idle' as const,
      promise: Promise.resolve({} as any),
    });

    const { getByText, getByTestId, queryByTestId } = renderCalendar('listening');

    // Wait for calendar to render
    await waitFor(() => {
      expect(getByText('Deadline Progress Calendar')).toBeTruthy();
    });

    // Verify that June 21 dot is present (this should be visible on the calendar)
    // Note: The calendar component uses react-native-calendars which we'll simulate
    // by finding a pressable element with the date

    // Find and click on June 21 date button
    const june21Button = getByTestId('date-2025-06-21');
    fireEvent.press(june21Button);

    // Wait for the details modal to appear
    await waitFor(() => {
      const detailsModal = queryByTestId('reading-day-details');
      expect(detailsModal).toBeTruthy();
    });

    // CRITICAL TEST: Verify that clicking June 21 shows June 21 data, NOT June 20
    const selectedDate = getByTestId('selected-date');
    expect(selectedDate.props.children).toBe('2025-06-21');
    // This test should FAIL if there's a timezone bug showing wrong date

    // Additional verifications
    const totalProgress = getByTestId('total-progress');
    expect(totalProgress.props.children).toBe(2385);

    const deadlinesCount = getByTestId('deadlines-count');
    expect(deadlinesCount.props.children).toBe(3);

    // Verify the correct books are shown
    expect(getByTestId('deadline-0').props.children).toBe('The lean start up');
    expect(getByTestId('deadline-1').props.children).toBe('Onyx Storm');
    expect(getByTestId('deadline-2').props.children).toBe('Dungeon Crawler Carl This Inevitable Ruin');
  });

  test('clicking June 25 should show June 25 data, not June 24', async () => {
    // Mock data for June 25 to test the specific bug you mentioned
    const mockData = {
      entries: [
        {
          date: '2025-06-25',
          deadlines: [
            {
              id: 'rd_84d0ec8cb5b94bea',
              book_title: 'The Way of Kings',
              author: 'Brandon Sanderson',
              format: 'audio' as const,
              progress_made: 24, // Progress made on June 25 (962 - 938)
              total_progress: 962,
              total_quantity: 2734,
              deadline_date: '2025-12-31T07:57:00+00:00',
              source: 'personal',
              flexibility: 'strict',
            },
            {
              id: 'rd_c7a2f6a0c8434e75',
              book_title: 'Singing',
              author: undefined,
              format: 'audio' as const,
              progress_made: 78, // Progress made on June 25 (1278 - 1226 + 26)
              total_progress: 1278,
              total_quantity: 6000,
              deadline_date: '2025-12-31T07:57:00+00:00',
              source: 'personal',
              flexibility: 'strict',
            },
          ],
          totalProgressMade: 102,
        },
        {
          date: '2025-06-24',
          deadlines: [
            {
              id: 'rd_84d0ec8cb5b94bea',
              book_title: 'The Way of Kings',
              author: 'Brandon Sanderson',
              format: 'audio' as const,
              progress_made: 938,
              total_progress: 938,
              total_quantity: 2734,
              deadline_date: '2025-12-31T07:57:00+00:00',
              source: 'personal',
              flexibility: 'strict',
            },
          ],
          totalProgressMade: 938,
        },
      ],
      summary: {
        totalDays: 2,
        totalProgressMade: 1040,
        averageProgressPerDay: 520,
        activeDeadlines: 2,
        ArchivedDeadlines: 0,
      },
    };

    const mockCalendarData = {
      '2025-06-24': {
        marked: true,
        dotColor: '#FF9500',
        selectedColor: '#FF9500',
        selectedTextColor: 'white',
      },
      '2025-06-25': {
        marked: true,
        dotColor: '#FF9500',
        selectedColor: '#FF9500',
        selectedTextColor: 'white',
      },
    };

    mockUseDeadlineHistory.mockReturnValue({
      data: mockData,
      isLoading: false,
      error: null,
      calendarData: mockCalendarData,
      isError: false,
      isFetching: false,
      isSuccess: true,
      status: 'success',
      dataUpdatedAt: 0,
      errorUpdatedAt: 0,
      failureCount: 0,
      failureReason: null,
      errorUpdateCount: 0,
      isFetched: true,
      isFetchedAfterMount: true,
      isInitialLoading: false,
      isPaused: false,
      isPending: false,
      isPlaceholderData: false,
      isRefetchError: false,
      isRefetching: false,
      isStale: false,
      refetch: jest.fn(),
      isLoadingError: false,
      fetchStatus: 'idle' as const,
      promise: Promise.resolve({} as any),
    });

    const { getByText, getByTestId, queryByTestId } = renderCalendar('listening');

    await waitFor(() => {
      expect(getByText('Deadline Progress Calendar')).toBeTruthy();
    });

    // Simulate clicking June 25
    const june25Button = getByTestId('date-2025-06-25');
    fireEvent.press(june25Button);

    await waitFor(() => {
      const detailsModal = queryByTestId('reading-day-details');
      expect(detailsModal).toBeTruthy();
    });

    // CRITICAL TEST: This should show June 25 data, not June 24
    const selectedDate = getByTestId('selected-date');
    expect(selectedDate.props.children).toBe('2025-06-25');
    // If there's a timezone bug, this might show '2025-06-24' instead

    // Verify June 25 specific data
    const totalProgress = getByTestId('total-progress');
    expect(totalProgress.props.children).toBe(102); // June 25 progress, not June 24's 938

    const deadlinesCount = getByTestId('deadlines-count');
    expect(deadlinesCount.props.children).toBe(2); // June 25 has 2 books with progress

    // Verify the correct books for June 25
    expect(getByTestId('deadline-0').props.children).toBe('The Way of Kings');
    expect(getByTestId('deadline-1').props.children).toBe('Singing');
  });

  test('clicking empty date should now show details modal with empty content', async () => {
    const mockData = {
      statusChanges: [],
      entries: [
        {
          date: '2025-06-21',
          deadlines: [],
          totalProgressMade: 0,
        },
      ],
      summary: {
        totalDays: 1,
        totalProgressMade: 0,
        averageProgressPerDay: 0,
        activeDeadlines: 0,
        ArchivedDeadlines: 0,
      },
    };

    mockUseDeadlineHistory.mockReturnValue({
      data: mockData,
      isLoading: false,
      error: null,
      calendarData: {},
      isError: false,
      isFetching: false,
      isSuccess: true,
      status: 'success',
      dataUpdatedAt: 0,
      errorUpdatedAt: 0,
      failureCount: 0,
      failureReason: null,
      errorUpdateCount: 0,
      isFetched: true,
      isFetchedAfterMount: true,
      isInitialLoading: false,
      isPaused: false,
      isPending: false,
      isPlaceholderData: false,
      isRefetchError: false,
      isRefetching: false,
      isStale: false,
      refetch: jest.fn(),
      isLoadingError: false,
      fetchStatus: 'idle' as const,
      promise: Promise.resolve({} as any),
    });

    const { getByText, getByTestId, queryByTestId } = renderCalendar();

    await waitFor(() => {
      expect(getByText('Deadline Progress Calendar')).toBeTruthy();
    });

    // Click on a date with no data (June 23)
    const june23Button = getByTestId('date-2025-06-23');
    fireEvent.press(june23Button);

    // Details modal should now appear even for empty dates
    await waitFor(() => {
      const detailsModal = queryByTestId('reading-day-details');
      expect(detailsModal).toBeTruthy();
    });
    
    // Verify it shows the correct date
    const selectedDate = getByTestId('selected-date');
    expect(selectedDate.props.children).toBe('2025-06-23');
    
    // Verify it shows 0 deadlines
    const deadlinesCount = getByTestId('deadlines-count');
    expect(deadlinesCount.props.children).toBe(0);
  });
});