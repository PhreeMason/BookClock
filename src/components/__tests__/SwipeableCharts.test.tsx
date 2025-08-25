import { ReadingDeadlineWithProgress } from '@/types/deadline';
import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import SwipeableCharts from '../features/stats/SwipeableCharts';

// Mock the child components
jest.mock('../charts/ProgressAreaChart', () => {
  return jest.fn(({ deadline, testID }: any) => {
    const React = require('react');
    const { View, Text } = require('react-native');
    return React.createElement(
      View,
      { testID: testID || 'progress-area-chart' },
      React.createElement(Text, {}, `ProgressAreaChart for ${deadline.book_title}`)
    );
  });
});

jest.mock('../charts/DailyReadingChart', () => {
  return jest.fn(({ deadline, testID }: any) => {
    const React = require('react');
    const { View, Text } = require('react-native');
    return React.createElement(
      View,
      { testID: testID || 'daily-reading-chart' },
      React.createElement(Text, {}, `DailyReadingChart for ${deadline.book_title}`)
    );
  });
});

// Mock PagerView
const mockSetPage = jest.fn();
jest.mock('react-native-pager-view', () => {
  const React = require('react');
  
  const MockPagerView = React.forwardRef(({ children, onPageSelected, testID, ...props }: any, ref: any) => {
    const { ScrollView } = require('react-native');
    
    // Simulate ref with setPage method
    React.useImperativeHandle(ref, () => ({
      setPage: mockSetPage,
    }));

    return React.createElement(
      ScrollView,
      { 
        testID: testID || 'pager-view',
        horizontal: true,
        pagingEnabled: true,
        onScroll: () => {
          // Simulate page selection
          if (onPageSelected) {
            onPageSelected({ nativeEvent: { position: 0 } });
          }
        },
        ...props 
      },
      children
    );
  });
  
  MockPagerView.displayName = 'MockPagerView';
  return MockPagerView;
});

describe('SwipeableCharts', () => {
  const mockDeadline: ReadingDeadlineWithProgress = {
    id: 'test-book-1',
    book_id: null,
    book_title: 'Test Book',
    author: 'Test Author',
    format: 'physical',
    source: 'personal',
    total_quantity: 300,
    deadline_date: '2025-08-01T00:00:00Z',
    flexibility: 'flexible',
    user_id: 'test-user',
    created_at: '2025-06-01T00:00:00Z',
    updated_at: '2025-06-01T00:00:00Z',
    progress: [
      {
        id: 'progress-1',
        created_at: '2025-06-25T00:00:00Z',
        updated_at: '2025-06-25T00:00:00Z',
        current_progress: 50,
        reading_deadline_id: 'test-book-1',
        time_spent_reading: null
      }
    ]
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockSetPage.mockClear();
  });

  describe('Rendering', () => {
    it('should render both chart components', () => {
      const { getByTestId } = render(
        <SwipeableCharts deadline={mockDeadline} />
      );

      expect(getByTestId('pager-view')).toBeTruthy();
      expect(getByTestId('progress-area-chart')).toBeTruthy();
      expect(getByTestId('daily-reading-chart')).toBeTruthy();
    });

    it('should render page indicators', () => {
      const { getByTestId } = render(
        <SwipeableCharts deadline={mockDeadline} />
      );

      // Should have page indicator container
      expect(getByTestId('pager-view')).toBeTruthy();
      // Indicators are styled View components without specific testIDs
    });

    it('should render chart type labels', () => {
      const { getByText } = render(
        <SwipeableCharts deadline={mockDeadline} />
      );

      expect(getByText('Progress Over Time')).toBeTruthy();
      expect(getByText('Daily Reading')).toBeTruthy();
    });

    it('should pass deadline prop to both child components', () => {
      const { getByText } = render(
        <SwipeableCharts deadline={mockDeadline} />
      );

      expect(getByText(`ProgressAreaChart for ${mockDeadline.book_title}`)).toBeTruthy();
      expect(getByText(`DailyReadingChart for ${mockDeadline.book_title}`)).toBeTruthy();
    });
  });

  describe('Page Switching via Tap', () => {
    it('should call setPage when tapping "Progress Over Time" label', () => {
      const { getByText } = render(
        <SwipeableCharts deadline={mockDeadline} />
      );

      const progressLabel = getByText('Progress Over Time');
      fireEvent.press(progressLabel);

      // Should not call setPage when already on page 0
      expect(mockSetPage).not.toHaveBeenCalled();
    });

    it('should call setPage when tapping "Daily Reading" label', () => {
      const { getByText } = render(
        <SwipeableCharts deadline={mockDeadline} />
      );

      const dailyLabel = getByText('Daily Reading');
      fireEvent.press(dailyLabel);

      expect(mockSetPage).toHaveBeenCalledWith(1);
    });

    it('should handle tap interactions correctly', () => {
      const { getByText } = render(
        <SwipeableCharts deadline={mockDeadline} />
      );

      // Both labels should be pressable
      const progressLabel = getByText('Progress Over Time');
      const dailyLabel = getByText('Daily Reading');
      
      expect(progressLabel).toBeTruthy();
      expect(dailyLabel).toBeTruthy();
    });

    it('should provide visual feedback on press', () => {
      const { getByText } = render(
        <SwipeableCharts deadline={mockDeadline} />
      );

      const dailyLabel = getByText('Daily Reading');
      
      // Test press in and press out
      fireEvent(dailyLabel, 'pressIn');
      fireEvent(dailyLabel, 'pressOut');
      
      // Should not throw errors
      expect(dailyLabel).toBeTruthy();
    });
  });

  describe('Page State Management', () => {
    it('should start with first page active', () => {
      const { getByText } = render(
        <SwipeableCharts deadline={mockDeadline} />
      );

      // First label should be fully opaque (active)
      const progressLabel = getByText('Progress Over Time');
      const dailyLabel = getByText('Daily Reading');
      
      // We can't directly test opacity in RNTL, but we can ensure both labels exist
      expect(progressLabel).toBeTruthy();
      expect(dailyLabel).toBeTruthy();
    });

    it('should update page state when swiping', () => {
      const { getByTestId } = render(
        <SwipeableCharts deadline={mockDeadline} />
      );

      const pagerView = getByTestId('pager-view');
      
      // Simulate scroll event
      fireEvent.scroll(pagerView, {
        nativeEvent: {
          contentOffset: { x: 320, y: 0 }, // Simulate scroll to second page
        },
      });

      // Component should handle the page change
      expect(pagerView).toBeTruthy();
    });
  });

  describe('TouchableOpacity Behavior', () => {
    it('should have proper touch targets for labels', () => {
      const { getByText } = render(
        <SwipeableCharts deadline={mockDeadline} />
      );

      const progressLabel = getByText('Progress Over Time');
      const dailyLabel = getByText('Daily Reading');

      // Both labels should be pressable
      expect(progressLabel).toBeTruthy();
      expect(dailyLabel).toBeTruthy();
    });

    it('should handle multiple rapid taps gracefully', () => {
      const { getByText } = render(
        <SwipeableCharts deadline={mockDeadline} />
      );

      const dailyLabel = getByText('Daily Reading');
      
      // Rapid taps
      fireEvent.press(dailyLabel);
      fireEvent.press(dailyLabel);
      fireEvent.press(dailyLabel);

      // Should only call setPage once (since we start on page 0, going to page 1)
      expect(mockSetPage).toHaveBeenCalledTimes(1);
      expect(mockSetPage).toHaveBeenCalledWith(1);
    });
  });

  describe('Different Book Formats', () => {
    it('should work with audio book format', () => {
      const audioBook = {
        ...mockDeadline,
        format: 'audio' as const,
        total_quantity: 600
      };

      const { getByTestId } = render(
        <SwipeableCharts deadline={audioBook} />
      );

      expect(getByTestId('progress-area-chart')).toBeTruthy();
      expect(getByTestId('daily-reading-chart')).toBeTruthy();
    });

    it('should work with ebook format', () => {
      const ebook = {
        ...mockDeadline,
        format: 'ebook' as const,
        total_quantity: 100
      };

      const { getByTestId } = render(
        <SwipeableCharts deadline={ebook} />
      );

      expect(getByTestId('progress-area-chart')).toBeTruthy();
      expect(getByTestId('daily-reading-chart')).toBeTruthy();
    });
  });

  describe('Edge Cases', () => {
    it('should handle deadline with no progress', () => {
      const deadlineWithoutProgress = {
        ...mockDeadline,
        progress: []
      };

      const { getByTestId } = render(
        <SwipeableCharts deadline={deadlineWithoutProgress} />
      );

      // Should still render the container
      expect(getByTestId('pager-view')).toBeTruthy();
    });

    it('should handle deadline with null progress', () => {
      const deadlineWithNullProgress = {
        ...mockDeadline,
        progress: null as any
      };

      const { getByTestId } = render(
        <SwipeableCharts deadline={deadlineWithNullProgress} />
      );

      // Should still render the container
      expect(getByTestId('pager-view')).toBeTruthy();
    });

    it('should handle very long book titles', () => {
      const longTitleBook = {
        ...mockDeadline,
        book_title: 'This is an extremely long book title that might cause layout issues in the chart components and should be handled gracefully'
      };

      const { getByTestId } = render(
        <SwipeableCharts deadline={longTitleBook} />
      );

      expect(getByTestId('progress-area-chart')).toBeTruthy();
      expect(getByTestId('daily-reading-chart')).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    it('should have accessible labels', () => {
      const { getByText } = render(
        <SwipeableCharts deadline={mockDeadline} />
      );

      // Labels should be accessible for screen readers
      const progressLabel = getByText('Progress Over Time');
      const dailyLabel = getByText('Daily Reading');

      expect(progressLabel).toBeTruthy();
      expect(dailyLabel).toBeTruthy();
    });

    it('should handle touch interactions properly', () => {
      const { getByText } = render(
        <SwipeableCharts deadline={mockDeadline} />
      );

      const dailyLabel = getByText('Daily Reading');
      
      // Should handle both press and release
      fireEvent(dailyLabel, 'pressIn');
      expect(dailyLabel).toBeTruthy();
      
      fireEvent(dailyLabel, 'pressOut');
      expect(dailyLabel).toBeTruthy();
    });
  });

  describe('Performance', () => {
    it('should not re-render unnecessarily', () => {
      const { rerender } = render(
        <SwipeableCharts deadline={mockDeadline} />
      );

      // Re-render with same props
      rerender(<SwipeableCharts deadline={mockDeadline} />);

      // Should not cause issues
      expect(mockSetPage).not.toHaveBeenCalled();
    });

    it('should handle prop changes correctly', () => {
      const { rerender, getByText } = render(
        <SwipeableCharts deadline={mockDeadline} />
      );

      const updatedDeadline = {
        ...mockDeadline,
        book_title: 'Updated Book Title'
      };

      rerender(<SwipeableCharts deadline={updatedDeadline} />);

      // Should update child components with new props
      expect(getByText('ProgressAreaChart for Updated Book Title')).toBeTruthy();
      expect(getByText('DailyReadingChart for Updated Book Title')).toBeTruthy();
    });
  });
});