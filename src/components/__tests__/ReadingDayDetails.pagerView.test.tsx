import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import ReadingDayDetails from '../features/calendar/ReadingDayDetails';
import { DailyDeadlineEntry } from '@/hooks/useReadingHistory';

// Mock PagerView with proper initialization behavior
jest.mock('react-native-pager-view', () => {
  const React = require('react');
  const { View } = require('react-native');
  
  const MockPagerView = React.forwardRef(({ children, initialPage, onPageSelected, style }: any, ref: any) => {
    const [currentPage, setCurrentPage] = React.useState(initialPage || 0);
    
    React.useImperativeHandle(ref, () => ({
      setPage: (page: number) => {
        setCurrentPage(page);
        if (onPageSelected) {
          onPageSelected({ nativeEvent: { position: page } });
        }
      },
    }));
    
    // Render only the current page
    const childArray = React.Children.toArray(children);
    
    return (
      <View testID="pager-view" style={style}>
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

describe('ReadingDayDetails PagerView Tests', () => {
  const mockDayData: DailyDeadlineEntry = {
    date: '2025-07-02',
    deadlines: [
      {
        id: 'test-1',
        book_title: 'Test Book 1',
        author: 'Test Author',
        format: 'physical',
        progress_made: 50,
        total_progress: 150,
        total_quantity: 300,
        deadline_date: '2025-12-31T00:00:00Z',
        source: 'personal',
        flexibility: 'flexible',
      },
    ],
    totalProgressMade: 50,
  };

  const allDayData: DailyDeadlineEntry[] = [
    {
      date: '2025-06-21',
      deadlines: [
        {
          id: 'june-21-1',
          book_title: 'June 21 Book',
          author: 'June Author',
          format: 'audio',
          progress_made: 120,
          total_progress: 120,
          total_quantity: 500,
          deadline_date: '2025-12-31T00:00:00Z',
          source: 'personal',
          flexibility: 'strict',
        },
      ],
      totalProgressMade: 120,
    },
    {
      date: '2025-06-25',
      deadlines: [
        {
          id: 'june-25-1',
          book_title: 'June 25 Book',
          author: 'Another Author',
          format: 'ebook',
          progress_made: 75,
          total_progress: 200,
          total_quantity: 400,
          deadline_date: '2025-12-31T00:00:00Z',
          source: 'library',
          flexibility: 'flexible',
        },
      ],
      totalProgressMade: 75,
    },
    {
      date: '2025-07-02',
      deadlines: mockDayData.deadlines,
      totalProgressMade: mockDayData.totalProgressMade,
    },
  ];

  const availableDates = allDayData.map(d => d.date);

  test('should initialize PagerView to the correct date index when clicking July 2', () => {
    const currentDateIndex = 2; // July 2 is at index 2
    const onDateChange = jest.fn();

    const { getByTestId, getByText } = render(
      <ReadingDayDetails
        isVisible={true}
        onClose={jest.fn()}
        dayData={mockDayData}
        selectedCategory="all"
        availableDates={availableDates}
        currentDateIndex={currentDateIndex}
        onDateChange={onDateChange}
        allDayData={allDayData}
      />
    );

    // Check that the correct page is visible (July 2, index 2)
    expect(getByTestId('page-2')).toBeTruthy();
    
    // Verify July 2 content is shown
    expect(getByText('Test Book 1')).toBeTruthy();
    expect(getByText('50 pages')).toBeTruthy();
    
    // Verify the header shows the correct date
    expect(getByText(/July 2, 2025/)).toBeTruthy();
    
    // Verify page indicator shows correct position
    expect(getByText('3 of 3')).toBeTruthy();
  });

  test('should show June 21 content when initialized at index 0', () => {
    const currentDateIndex = 0; // June 21 is at index 0
    const onDateChange = jest.fn();

    const { getByTestId, getByText, queryByText } = render(
      <ReadingDayDetails
        isVisible={true}
        onClose={jest.fn()}
        dayData={allDayData[0]}
        selectedCategory="all"
        availableDates={availableDates}
        currentDateIndex={currentDateIndex}
        onDateChange={onDateChange}
        allDayData={allDayData}
      />
    );

    // Check that page 0 is visible
    expect(getByTestId('page-0')).toBeTruthy();
    
    // Verify June 21 content is shown
    expect(getByText('June 21 Book')).toBeTruthy();
    expect(getByText('2h')).toBeTruthy(); // 120 minutes = 2 hours
    
    // Verify July 2 content is NOT shown
    expect(queryByText('Test Book 1')).toBeFalsy();
    
    // Verify page indicator
    expect(getByText('1 of 3')).toBeTruthy();
  });

  test('navigation buttons should update dates correctly', () => {
    const currentDateIndex = 1; // Start at June 25 (middle)
    const onDateChange = jest.fn();

    const { getByText } = render(
      <ReadingDayDetails
        isVisible={true}
        onClose={jest.fn()}
        dayData={allDayData[1]}
        selectedCategory="all"
        availableDates={availableDates}
        currentDateIndex={currentDateIndex}
        onDateChange={onDateChange}
        allDayData={allDayData}
      />
    );

    // Verify we're on June 25
    expect(getByText('June 25 Book')).toBeTruthy();
    expect(getByText('2 of 3')).toBeTruthy();

    // Click Next button
    const nextButton = getByText('Next');
    fireEvent.press(nextButton);

    // Verify onDateChange was called with July 2
    expect(onDateChange).toHaveBeenCalledWith('2025-07-02');
  });

  test('Previous button should be disabled on first page', () => {
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

    const previousButton = getByText('Previous').parent;
    
    // Check if button has disabled styling
    expect(previousButton?.props.style).toContainEqual(
      expect.objectContaining({ opacity: 0.5 })
    );
  });

  test('Next button should be disabled on last page', () => {
    const { getByText } = render(
      <ReadingDayDetails
        isVisible={true}
        onClose={jest.fn()}
        dayData={allDayData[2]}
        selectedCategory="all"
        availableDates={availableDates}
        currentDateIndex={2}
        onDateChange={jest.fn()}
        allDayData={allDayData}
      />
    );

    const nextButton = getByText('Next').parent;
    
    // Check if button has disabled styling
    expect(nextButton?.props.style).toContainEqual(
      expect.objectContaining({ opacity: 0.5 })
    );
  });
});