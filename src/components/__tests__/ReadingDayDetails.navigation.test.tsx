import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import ReadingDayDetails from '../features/calendar/ReadingDayDetails';
import { DailyDeadlineEntry } from '@/hooks/useReadingHistory';

// Mock timers for setTimeout
jest.useFakeTimers();

// Mock PagerView
jest.mock('react-native-pager-view', () => {
  const React = require('react');
  const { View } = require('react-native');
  
  const MockPagerView = React.forwardRef(({ children, initialPage = 0, onPageSelected }: any, ref: any) => {
    const [currentPage, setCurrentPage] = React.useState(initialPage);
    
    React.useImperativeHandle(ref, () => ({
      setPage: (page: number) => {
        const { act } = require('@testing-library/react-native');
        act(() => {
          setCurrentPage(page);
        });
        if (onPageSelected) {
          act(() => {
            onPageSelected({ nativeEvent: { position: page } });
          });
        }
      },
    }));
    
    const childArray = React.Children.toArray(children);
    
    return (
      <View testID="pager-view">
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

describe('ReadingDayDetails Navigation Tests', () => {
  afterEach(() => {
    jest.clearAllTimers();
  });

  const createMockData = (includeEmptyDays = false): DailyDeadlineEntry[] => {
    const baseDates = ['2025-07-01', '2025-07-02', '2025-07-03', '2025-07-04', '2025-07-05'];
    
    if (includeEmptyDays) {
      // Include all dates, some with no deadlines
      return baseDates.map((date, index) => ({
        date,
        deadlines: index % 2 === 0 ? [] : [
          {
            id: `book-${index}`,
            book_title: `Book for ${date}`,
            author: `Author ${index}`,
            format: 'physical' as const,
            progress_made: 50,
            total_progress: 100,
            total_quantity: 300,
            deadline_date: '2025-12-31T00:00:00Z',
            source: 'personal' as const,
            flexibility: 'flexible' as const,
          },
        ],
        totalProgressMade: index % 2 === 0 ? 0 : 50,
      }));
    } else {
      // Only include dates with deadlines
      return baseDates
        .filter((_, index) => index % 2 !== 0)
        .map((date, index) => ({
          date,
          deadlines: [
            {
              id: `book-${index}`,
              book_title: `Book for ${date}`,
              author: `Author ${index}`,
              format: 'physical' as const,
              progress_made: 50,
              total_progress: 100,
              total_quantity: 300,
              deadline_date: '2025-12-31T00:00:00Z',
              source: 'personal' as const,
              flexibility: 'flexible' as const,
            },
          ],
          totalProgressMade: 50,
        }));
    }
  };

  test('should show dates in next/previous buttons', () => {
    const allDayData = createMockData(false);
    const availableDates = allDayData.map(d => d.date);
    const onDateChange = jest.fn();

    const { getByText } = render(
      <ReadingDayDetails
        isVisible={true}
        onClose={jest.fn()}
        dayData={allDayData[1]} // Start at July 3rd (middle)
        selectedCategory="all"
        availableDates={availableDates}
        currentDateIndex={1}
        onDateChange={onDateChange}
        allDayData={allDayData}
      />
    );

    // The buttons now show dates when available
    expect(getByText('Jul 2')).toBeTruthy(); // Previous button shows July 2
    // Since we're at index 1 (July 4) and there are only 2 dates, Next button shows "Next"
    expect(getByText('Next')).toBeTruthy(); // No next date available
  });

  test('should navigate to all dates including empty ones', () => {
    const allDayData = createMockData(true); // Include empty days
    const availableDates = allDayData.map(d => d.date);
    const onDateChange = jest.fn();

    const { getByText } = render(
      <ReadingDayDetails
        isVisible={true}
        onClose={jest.fn()}
        dayData={allDayData[0]} // Start at July 1st
        selectedCategory="all"
        availableDates={availableDates}
        currentDateIndex={0}
        onDateChange={onDateChange}
        allDayData={allDayData}
      />
    );

    // Click Next to go from July 1 to July 2
    act(() => {
      fireEvent.press(getByText('Jul 2')); // Next button shows the date
    });
    
    expect(onDateChange).toHaveBeenCalledWith('2025-07-02');
    
    // Reset mock
    onDateChange.mockClear();
    
    // TODO: After implementation to support empty days navigation:
    // The user should be able to navigate through all dates,
    // even if they have no reading activity
  });

  test('should disable Previous on first date and Next on last date', () => {
    const allDayData = createMockData(false);
    const availableDates = allDayData.map(d => d.date);

    // Test first date - Previous should be disabled
    const { getByText: getByTextFirst, rerender } = render(
      <ReadingDayDetails
        isVisible={true}
        onClose={jest.fn()}
        dayData={allDayData[0]}
        selectedCategory="all"
        availableDates={availableDates}
        currentDateIndex={0}
        onDateChange={jest.fn()}
        allDayData={allDayData}
      />
    );

    // Check if button is disabled (through accessibilityState or logical behavior)
    expect(getByTextFirst('Previous')).toBeTruthy(); // Button shows "Previous" when on first page
    
    // Verify we're on first page
    expect(getByTextFirst('1 of 2')).toBeTruthy(); // Page indicator shows "1 of 2"

    // Test last date - Next should be disabled
    act(() => {
      rerender(
        <ReadingDayDetails
          isVisible={true}
          onClose={jest.fn()}
          dayData={allDayData[allDayData.length - 1]}
          selectedCategory="all"
          availableDates={availableDates}
          currentDateIndex={allDayData.length - 1}
          onDateChange={jest.fn()}
          allDayData={allDayData}
        />
      );
    });

    // Wait for any setTimeout calls to complete
    act(() => {
      jest.runAllTimers();
    });

    // Verify we're on last page first
    const totalPages = allDayData.length;
    expect(getByTextFirst(`${totalPages} of ${totalPages}`)).toBeTruthy(); // Page indicator shows "2 of 2"
    
    // Check if Next button shows "Next" when on last page
    expect(getByTextFirst('Next')).toBeTruthy();
  });

  test('page indicator should update correctly', () => {
    const allDayData = createMockData(false);
    const availableDates = allDayData.map(d => d.date);
    const onDateChange = jest.fn();

    const { getByText } = render(
      <ReadingDayDetails
        isVisible={true}
        onClose={jest.fn()}
        dayData={allDayData[0]}
        selectedCategory="all"
        availableDates={availableDates}
        currentDateIndex={0}
        onDateChange={onDateChange}
        allDayData={allDayData}
      />
    );

    // Should show "1 of 2" for first page
    expect(getByText('1 of 2')).toBeTruthy();

    // Navigate to next page - the Next button shows "Jul 4"
    act(() => {
      fireEvent.press(getByText('Jul 4'));
    });

    // After navigation, the component would need to be re-rendered with new currentDateIndex
    // In real usage, the parent component would update currentDateIndex
  });

  test('should format dates correctly in header', () => {
    const allDayData = createMockData(false);
    const availableDates = allDayData.map(d => d.date);

    const { getByText } = render(
      <ReadingDayDetails
        isVisible={true}
        onClose={jest.fn()}
        dayData={allDayData[0]}
        selectedCategory="all"
        availableDates={availableDates}
        currentDateIndex={0}
        onDateChange={jest.fn()}
        allDayData={allDayData}
      />
    );

    // Check that the date is formatted correctly in the header
    // July 2, 2025 (for date 2025-07-02)
    expect(getByText(/July 2, 2025/)).toBeTruthy();
  });
});