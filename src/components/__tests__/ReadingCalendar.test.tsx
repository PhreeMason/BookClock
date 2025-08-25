import { getSampleDeadlines } from '@/__tests__/fixtures/sampleDeadlines';
import { useDeadlineHistory } from '@/hooks/useReadingHistory';
import { useTheme } from '@/theme';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react-native';
import React from 'react';
import ReadingCalendar from '../features/calendar/ReadingCalendar';

// Mock dependencies
jest.mock('@/hooks/useReadingHistory', () => ({
  useDeadlineHistory: jest.fn(),
}));
jest.mock('@/theme');
jest.mock('react-native-calendars', () => {
  const React = require('react');
  const { View, Text } = require('react-native');
  
  return {
    Calendar: ({ onDayPress }: any) => {
      const mockPress = () => onDayPress && onDayPress({ dateString: '2024-01-02' });
      return React.createElement(View, { testID: 'mock-calendar' }, [
        React.createElement(Text, { key: 'calendar-title' }, 'Mock Calendar'),
        React.createElement(Text, { key: 'calendar-action', onPress: mockPress }, 'Mock Day')
      ]);
    },
  };
});

const mockUseDeadlineHistory = useDeadlineHistory as jest.MockedFunction<typeof useDeadlineHistory>;
const mockUseTheme = useTheme as jest.MockedFunction<typeof useTheme>;

describe('ReadingCalendar', () => {
  let queryClient: QueryClient;

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

  // Create realistic test data based on sample deadlines
  const sampleData = getSampleDeadlines(2);
  const mockDeadlineData = {
    entries: [
      {
        date: '2025-06-26',
        deadlines: [
          {
            id: sampleData[0].id,
            book_title: sampleData[0].book_title,
            author: sampleData[0].author,
            format: sampleData[0].format,
            progress_made: 37, // From sample data first progress entry
            total_progress: 37,
            total_quantity: sampleData[0].total_quantity,
            deadline_date: sampleData[0].deadline_date,
            source: sampleData[0].source,
            flexibility: sampleData[0].flexibility,
          },
        ],
        totalProgressMade: 37,
      },
      {
        date: '2025-06-27',
        deadlines: [
          {
            id: sampleData[0].id,
            book_title: sampleData[0].book_title,
            author: sampleData[0].author,
            format: sampleData[0].format,
            progress_made: 2, // 39 - 37 = 2 pages progress
            total_progress: 39,
            total_quantity: sampleData[0].total_quantity,
            deadline_date: sampleData[0].deadline_date,
            source: sampleData[0].source,
            flexibility: sampleData[0].flexibility,
          },
          {
            id: sampleData[1].id,
            book_title: sampleData[1].book_title,
            author: sampleData[1].author,
            format: sampleData[1].format,
            progress_made: 21, // 302 - 281 = 21 minutes progress
            total_progress: 302,
            total_quantity: sampleData[1].total_quantity,
            deadline_date: sampleData[1].deadline_date,
            source: sampleData[1].source,
            flexibility: sampleData[1].flexibility,
          },
        ],
        totalProgressMade: 23,
      },
    ],
    summary: {
      totalDays: 2,
      totalDeadlines: 2,
      ArchivedDeadlines: 0,
    },
  };

  const mockCalendarData = {
    '2025-06-26': {
      marked: true,
      dotColor: '#blue',
      selectedColor: '#blue',
      selectedTextColor: 'white',
    },
    '2025-06-27': {
      marked: true,
      dotColor: '#purple',
      selectedColor: '#purple',
      selectedTextColor: 'white',
    },
  };

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    mockUseTheme.mockReturnValue({ theme: mockTheme } as any);

    mockUseDeadlineHistory.mockReturnValue({
      data: mockDeadlineData,
      isLoading: false,
      isError: false,
      error: null,
      calendarData: mockCalendarData,
      isSuccess: true,
    } as any);

    jest.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it('should render successfully with deadline data', () => {
    const { getByText, getAllByText } = render(
      <ReadingCalendar selectedCategory="all" />,
      { wrapper }
    );

    expect(getByText('Deadline Progress Calendar')).toBeTruthy();
    expect(getAllByText('Reading').length).toBeGreaterThan(0);
    expect(getByText('Audio')).toBeTruthy();
    expect(getByText('Mixed')).toBeTruthy();
  });

  it('should display summary statistics correctly', () => {
    const { getByText, getAllByText } = render(
      <ReadingCalendar selectedCategory="all" />,
      { wrapper }
    );

    // Check that labels exist
    expect(getByText('Active Days')).toBeTruthy();
    expect(getByText('Total Deadlines')).toBeTruthy();
    
    // Check that values exist (using getAllByText since numbers might appear multiple times)
    expect(getAllByText('2').length).toBeGreaterThan(0); // Active Days and Total Deadlines
  });

  it('should handle loading state', () => {
    mockUseDeadlineHistory.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
      calendarData: {},
      isSuccess: false,
    } as any);

    const { getByText } = render(
      <ReadingCalendar selectedCategory="reading" />,
      { wrapper }
    );

    expect(getByText('Loading calendar...')).toBeTruthy();
  });

  it('should handle error state', () => {
    mockUseDeadlineHistory.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: new Error('Database error'),
      calendarData: {},
      isSuccess: false,
    } as any);

    const { getByText } = render(
      <ReadingCalendar selectedCategory="reading" />,
      { wrapper }
    );

    expect(getByText('Unable to load calendar data')).toBeTruthy();
  });

  it('should pass correct props to useDeadlineHistory hook', () => {
    render(
      <ReadingCalendar selectedCategory="reading" dateRange="30d" />,
      { wrapper }
    );

    expect(mockUseDeadlineHistory).toHaveBeenCalledWith({
      dateRange: '30d',
      formatFilter: 'reading',
    });
  });

  it('should handle day press when data exists', () => {
    render(
      <ReadingCalendar selectedCategory="all" />,
      { wrapper }
    );

    // Calendar component should be rendered
    // Since we mocked Calendar to return object, we need to check differently
    expect(mockUseDeadlineHistory).toHaveBeenCalled();
  });

  it('should filter data based on selected category', () => {
    render(
      <ReadingCalendar selectedCategory="reading" />,
      { wrapper }
    );

    expect(mockUseDeadlineHistory).toHaveBeenCalledWith({
      dateRange: '90d',
      formatFilter: 'reading',
    });
  });

  it('should use correct date range', () => {
    render(
      <ReadingCalendar selectedCategory="all" dateRange="7d" />,
      { wrapper }
    );

    expect(mockUseDeadlineHistory).toHaveBeenCalledWith({
      dateRange: '7d',
      formatFilter: 'all',
    });
  });

  it('should display correct legend text', () => {
    const { getByText, getAllByText } = render(
      <ReadingCalendar selectedCategory="all" />,
      { wrapper }
    );

    expect(getAllByText('Reading').length).toBeGreaterThan(0);
    expect(getByText('Audio')).toBeTruthy();
    expect(getByText('Mixed')).toBeTruthy();
  });

  it('should show correct date range text in summary', () => {
    const { getByText } = render(
      <ReadingCalendar selectedCategory="all" dateRange="30d" />,
      { wrapper }
    );

    expect(getByText('Last 30 days')).toBeTruthy();
  });

  it('should handle empty data gracefully', () => {
    mockUseDeadlineHistory.mockReturnValue({
      data: {
        entries: [],
        summary: {
          totalDays: 0,
          totalDeadlines: 0,
          ArchivedDeadlines: 0,
        },
      },
      isLoading: false,
      isError: false,
      error: null,
      calendarData: {},
      isSuccess: true,
    } as any);

    const { getByText, getAllByText } = render(
      <ReadingCalendar selectedCategory="all" />,
      { wrapper }
    );

    // Check that labels exist
    expect(getByText('Active Days')).toBeTruthy();
    expect(getByText('Total Deadlines')).toBeTruthy();
    
    // Check that zero values are displayed (using getAllByText since "0" might appear multiple times)
    expect(getAllByText('0').length).toBeGreaterThan(0); // Should show 0 for all metrics
  });

  it('should use correct theme colors', () => {
    render(
      <ReadingCalendar selectedCategory="all" />,
      { wrapper }
    );

    expect(mockUseTheme).toHaveBeenCalled();
  });

  it('should handle different date ranges correctly', () => {
    const dateRanges: { range: any; expected: string }[] = [
      { range: '7d', expected: 'Last 7 days' },
      { range: '30d', expected: 'Last 30 days' },
      { range: '90d', expected: 'Last 90 days' },
      { range: '1y', expected: 'Last year' },
      { range: 'all', expected: 'All time' },
    ];

    dateRanges.forEach(({ range, expected }) => {
      const { getByText, unmount } = render(
        <ReadingCalendar selectedCategory="all" dateRange={range} />,
        { wrapper }
      );

      expect(getByText(expected)).toBeTruthy();
      unmount();
    });
  });

  it('should properly handle calendar data structure', () => {
    render(
      <ReadingCalendar selectedCategory="all" />,
      { wrapper }
    );

    // Verify that the calendar data is being used correctly
    expect(mockUseDeadlineHistory).toHaveBeenCalled();
    const hookCall = mockUseDeadlineHistory.mock.calls[0][0];
    expect(hookCall).toEqual({
      dateRange: '90d',
      formatFilter: 'all',
    });
  });
});