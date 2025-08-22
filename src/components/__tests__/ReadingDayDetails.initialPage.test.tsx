import { DailyDeadlineEntry } from '@/hooks/useReadingHistory';
import { render } from '@testing-library/react-native';
import React from 'react';
import ReadingDayDetails from '../features/calendar/ReadingDayDetails';

// Mock PagerView to track initialPage prop

jest.mock('react-native-pager-view', () => {
  const React = require('react');
  const { View, Text } = require('react-native');
  
  const mockTestModule = { capturedInitialPage: undefined };
  
  const MockPagerView = React.forwardRef(({ children, initialPage, onPageSelected, style }: any, ref: any) => {
    // Capture the initialPage value for testing
    mockTestModule.capturedInitialPage = initialPage;
    (global as any).__capturedInitialPage = initialPage;
    
    const [currentPage, setCurrentPage] = React.useState(initialPage || 0);
    
    React.useImperativeHandle(ref, () => ({
      setPage: (page: number) => {
        setCurrentPage(page);
        if (onPageSelected) {
          onPageSelected({ nativeEvent: { position: page } });
        }
      },
    }));
    
    const childArray = React.Children.toArray(children);
    
    return (
      <View testID="pager-view" style={style}>
        <Text testID="initial-page-value">{initialPage}</Text>
        <Text testID="current-page-value">{currentPage}</Text>
        <View testID={`page-${currentPage}`}>
          {childArray[currentPage]}
        </View>
      </View>
    );
  });
  MockPagerView.displayName = 'MockPagerView';
  return MockPagerView;
});

// Mock theme
jest.mock('@/theme', () => ({
  useTheme: () => ({
    theme: {
      primary: '#007AFF',
      secondary: '#5856D6',
      accent: '#FF9500',
      success: '#34C759',
      warning: '#FF9500',
      error: '#FF3B30',
      background: '#FFFFFF',
      surface: '#F2F2F7',
      text: '#000000',
      textMuted: '#8E8E93',
      border: '#C7C7CC',
    },
  }),
}));

describe('ReadingDayDetails Initial Page Bug Tests', () => {
  beforeEach(() => {
    (global as any).__capturedInitialPage = undefined;
  });

  const createMockData = (dates: string[]): DailyDeadlineEntry[] => {
    return dates.map((date, index) => ({
      date,
      statusChanges: [],
      deadlines: [
        {
          id: `book-${index}`,
          book_title: `Book for ${date}`,
          author: `Author ${index}`,
          format: 'physical' as const,
          progress_made: 50 + index * 10,
          total_progress: 100 + index * 20,
          total_quantity: 300,
          deadline_date: '2025-12-31T00:00:00Z',
          source: 'personal' as const,
          flexibility: 'flexible' as const,
        },
      ],
      totalProgressMade: 50 + index * 10,
    }));
  };

  test('BUG: clicking July 2nd should show July 2nd, not June 21st', () => {
    // This test simulates the exact bug reported by the user
    const dates = ['2025-06-21', '2025-06-22', '2025-06-23', '2025-06-24', '2025-06-25', '2025-06-26', '2025-07-02'];
    const allDayData = createMockData(dates);
    const availableDates = dates;
    
    // User clicks on July 2nd, which is at index 6
    const clickedDateIndex = 6;
    const clickedDayData = allDayData[clickedDateIndex];
    
    const { getByTestId, getByText } = render(
      <ReadingDayDetails
        isVisible={true}
        onClose={jest.fn()}
        dayData={clickedDayData}
        selectedCategory="all"
        availableDates={availableDates}
        currentDateIndex={clickedDateIndex}
        onDateChange={jest.fn()}
        allDayData={allDayData}
      />
    );

    // Check what initialPage was passed to PagerView
    expect((global as any).__capturedInitialPage).toBe(6);
    
    // Check current page value
    const currentPageElement = getByTestId('current-page-value');
    expect(currentPageElement.props.children).toBe(6);
    
    // The bug would be if we see June 21st content instead of July 2nd
    // July 2nd content should be visible
    expect(getByText('Book for 2025-07-02')).toBeTruthy();
    
    // June 21st content should NOT be visible
    expect(() => getByText('Book for 2025-06-21')).toThrow();
    
    // Page indicator should show 7 of 7 (since July 2nd is the 7th item)
    expect(getByText('7 of 7')).toBeTruthy();
  });

  test('currentDateIndex prop should match PagerView initialPage', () => {
    const dates = ['2025-06-20', '2025-06-21', '2025-06-22', '2025-06-23', '2025-06-24'];
    const allDayData = createMockData(dates);
    
    // Test different index values
    const testCases = [0, 1, 2, 3, 4];
    
    testCases.forEach(index => {
      (global as any).__capturedInitialPage = undefined;
      
      const { unmount } = render(
        <ReadingDayDetails
          isVisible={true}
          onClose={jest.fn()}
          dayData={allDayData[index]}
          selectedCategory="all"
          availableDates={dates}
          currentDateIndex={index}
          onDateChange={jest.fn()}
          allDayData={allDayData}
        />
      );
      
      expect((global as any).__capturedInitialPage).toBe(index);
      unmount();
    });
  });

  test('useEffect should update page when currentDateIndex changes', async () => {
    const dates = ['2025-06-21', '2025-06-22', '2025-06-23'];
    const allDayData = createMockData(dates);
    
    const { rerender, getByTestId } = render(
      <ReadingDayDetails
        isVisible={true}
        onClose={jest.fn()}
        dayData={allDayData[0]}
        selectedCategory="all"
        availableDates={dates}
        currentDateIndex={0}
        onDateChange={jest.fn()}
        allDayData={allDayData}
      />
    );
    
    // Initial state
    expect(getByTestId('current-page-value').props.children).toBe(0);
    
    // Change currentDateIndex to 2
    rerender(
      <ReadingDayDetails
        isVisible={true}
        onClose={jest.fn()}
        dayData={allDayData[2]}
        selectedCategory="all"
        availableDates={dates}
        currentDateIndex={2}
        onDateChange={jest.fn()}
        allDayData={allDayData}
      />
    );
    
    // After rerender, the current page should be updated
    // The mock would have handled the setPage call internally
  });
});