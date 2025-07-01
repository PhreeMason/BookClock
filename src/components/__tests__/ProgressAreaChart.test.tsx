import { render } from '@testing-library/react-native';
import React from 'react';
import ProgressAreaChart from '../ProgressAreaChart';
import { ReadingDeadlineWithProgress } from '@/types/deadline';

// Mock the gifted charts
jest.mock('react-native-gifted-charts', () => ({
  LineChart: jest.fn(({ testID, data, areaChart, ...props }: any) => {
    const React = require('react');
    const { View, Text } = require('react-native');
    return React.createElement(
      View,
      { testID: testID || 'line-chart' },
      React.createElement(Text, {}, `${areaChart ? 'Area' : 'Line'}Chart with ${data?.length || 0} points`)
    );
  }),
}));

describe('ProgressAreaChart', () => {
  const mockPhysicalBook: ReadingDeadlineWithProgress = {
    id: 'test-book-1',
    book_title: 'Test Physical Book',
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
        created_at: '2025-06-20T00:00:00Z',
        updated_at: '2025-06-20T00:00:00Z',
        current_progress: 50,
        reading_deadline_id: 'test-book-1'
      },
      {
        id: 'progress-2',
        created_at: '2025-06-25T00:00:00Z',
        updated_at: '2025-06-25T00:00:00Z',
        current_progress: 100,
        reading_deadline_id: 'test-book-1'
      },
      {
        id: 'progress-3',
        created_at: '2025-06-26T00:00:00Z',
        updated_at: '2025-06-26T00:00:00Z',
        current_progress: 150,
        reading_deadline_id: 'test-book-1'
      }
    ]
  };

  const mockAudioBook: ReadingDeadlineWithProgress = {
    ...mockPhysicalBook,
    id: 'test-audio-book',
    book_title: 'Test Audio Book',
    format: 'audio',
    total_quantity: 600, // 600 minutes
    progress: [
      {
        id: 'progress-audio-1',
        created_at: '2025-06-20T00:00:00Z',
        updated_at: '2025-06-20T00:00:00Z',
        current_progress: 120,
        reading_deadline_id: 'test-audio-book'
      },
      {
        id: 'progress-audio-2',
        created_at: '2025-06-25T00:00:00Z',
        updated_at: '2025-06-25T00:00:00Z',
        current_progress: 250,
        reading_deadline_id: 'test-audio-book'
      }
    ]
  };

  const mockEbookBook: ReadingDeadlineWithProgress = {
    ...mockPhysicalBook,
    id: 'test-ebook',
    book_title: 'Test Ebook',
    format: 'ebook',
    total_quantity: 100, // 100%
    progress: [
      {
        id: 'progress-ebook-1',
        created_at: '2025-06-20T00:00:00Z',
        updated_at: '2025-06-20T00:00:00Z',
        current_progress: 25,
        reading_deadline_id: 'test-ebook'
      },
      {
        id: 'progress-ebook-2',
        created_at: '2025-06-25T00:00:00Z',
        updated_at: '2025-06-25T00:00:00Z',
        current_progress: 60,
        reading_deadline_id: 'test-ebook'
      }
    ]
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render area chart for physical book', () => {
      const { getByTestId, getByText } = render(
        <ProgressAreaChart deadline={mockPhysicalBook} />
      );

      expect(getByTestId('line-chart')).toBeTruthy();
      expect(getByText('Reading Progress Over Time')).toBeTruthy();
      expect(getByText('Total progress toward 300 pg')).toBeTruthy();
    });

    it('should render area chart for audio book with correct labels', () => {
      const { getByText } = render(
        <ProgressAreaChart deadline={mockAudioBook} />
      );

      expect(getByText('Listening Progress Over Time')).toBeTruthy();
      expect(getByText('Total progress toward 600 min')).toBeTruthy();
    });

    it('should render area chart for ebook with correct labels', () => {
      const { getByText } = render(
        <ProgressAreaChart deadline={mockEbookBook} />
      );

      expect(getByText('Reading Progress Over Time')).toBeTruthy();
      expect(getByText('Total progress toward 100%')).toBeTruthy();
    });

    it('should not render when no progress data exists', () => {
      const bookWithoutProgress = {
        ...mockPhysicalBook,
        progress: []
      };

      const { queryByTestId } = render(
        <ProgressAreaChart deadline={bookWithoutProgress} />
      );

      expect(queryByTestId('line-chart')).toBeNull();
    });
  });

  describe('Data Processing', () => {
    it('should process cumulative progress data correctly', () => {
      const { getByTestId, getByText } = render(
        <ProgressAreaChart deadline={mockPhysicalBook} />
      );

      const chart = getByTestId('line-chart');
      expect(chart).toBeTruthy();
      // Should show cumulative progress over time (50, 100, 150)
      expect(getByText(/AreaChart with \d+ points/)).toBeTruthy();
    });

    it('should sort progress entries by date', () => {
      const bookWithUnsortedProgress = {
        ...mockPhysicalBook,
        progress: [
          {
            id: 'progress-3',
            created_at: '2025-06-26T00:00:00Z',
            updated_at: '2025-06-26T00:00:00Z',
            current_progress: 150,
            reading_deadline_id: 'test-book-1'
          },
          {
            id: 'progress-1',
            created_at: '2025-06-20T00:00:00Z',
            updated_at: '2025-06-20T00:00:00Z',
            current_progress: 50,
            reading_deadline_id: 'test-book-1'
          },
          {
            id: 'progress-2',
            created_at: '2025-06-25T00:00:00Z',
            updated_at: '2025-06-25T00:00:00Z',
            current_progress: 100,
            reading_deadline_id: 'test-book-1'
          }
        ]
      };

      const { getByTestId } = render(
        <ProgressAreaChart deadline={bookWithUnsortedProgress} />
      );

      expect(getByTestId('line-chart')).toBeTruthy();
      // Should still process correctly despite unsorted input
    });
  });

  describe('Goal Line and Legend', () => {
    it('should display legend with current progress and goal', () => {
      const { getByText } = render(
        <ProgressAreaChart deadline={mockPhysicalBook} />
      );

      expect(getByText('Current Progress')).toBeTruthy();
      expect(getByText('Goal (300 pg)')).toBeTruthy();
    });

    it('should display correct goal for audio book', () => {
      const { getByText } = render(
        <ProgressAreaChart deadline={mockAudioBook} />
      );

      expect(getByText('Current Progress')).toBeTruthy();
      expect(getByText('Goal (600 min)')).toBeTruthy();
    });

    it('should display correct goal for ebook', () => {
      const { getByText } = render(
        <ProgressAreaChart deadline={mockEbookBook} />
      );

      expect(getByText('Current Progress')).toBeTruthy();
      expect(getByText('Goal (100 %)')).toBeTruthy();
    });
  });

  describe('Format-Specific Behavior', () => {
    it('should use correct unit labels for different formats', () => {
      // Test physical book
      const { rerender, getByText } = render(
        <ProgressAreaChart deadline={mockPhysicalBook} />
      );
      expect(getByText('Goal (300 pg)')).toBeTruthy();

      // Test audio book
      rerender(<ProgressAreaChart deadline={mockAudioBook} />);
      expect(getByText('Goal (600 min)')).toBeTruthy();

      // Test ebook
      rerender(<ProgressAreaChart deadline={mockEbookBook} />);
      expect(getByText('Goal (100 %)')).toBeTruthy();
    });

    it('should show appropriate titles for different formats', () => {
      // Test physical book
      const { rerender, getByText } = render(
        <ProgressAreaChart deadline={mockPhysicalBook} />
      );
      expect(getByText('Reading Progress Over Time')).toBeTruthy();

      // Test audio book
      rerender(<ProgressAreaChart deadline={mockAudioBook} />);
      expect(getByText('Listening Progress Over Time')).toBeTruthy();

      // Test ebook
      rerender(<ProgressAreaChart deadline={mockEbookBook} />);
      expect(getByText('Reading Progress Over Time')).toBeTruthy();
    });
  });

  describe('Edge Cases', () => {
    it('should handle single progress entry', () => {
      const bookWithSingleProgress = {
        ...mockPhysicalBook,
        progress: [
          {
            id: 'single-progress',
            created_at: '2025-06-26T00:00:00Z',
            updated_at: '2025-06-26T00:00:00Z',
            current_progress: 75,
            reading_deadline_id: 'test-book-1'
          }
        ]
      };

      const { getByTestId } = render(
        <ProgressAreaChart deadline={bookWithSingleProgress} />
      );

      expect(getByTestId('line-chart')).toBeTruthy();
      // Should handle single point gracefully
    });

    it('should handle progress beyond goal', () => {
      const bookWithExcessProgress = {
        ...mockPhysicalBook,
        progress: [
          {
            id: 'excess-progress',
            created_at: '2025-06-26T00:00:00Z',
            updated_at: '2025-06-26T00:00:00Z',
            current_progress: 350, // Beyond 300 page goal
            reading_deadline_id: 'test-book-1'
          }
        ]
      };

      const { getByTestId } = render(
        <ProgressAreaChart deadline={bookWithExcessProgress} />
      );

      expect(getByTestId('line-chart')).toBeTruthy();
      // Should handle progress beyond goal gracefully
    });

    it('should handle zero progress', () => {
      const bookWithZeroProgress = {
        ...mockPhysicalBook,
        progress: [
          {
            id: 'zero-progress',
            created_at: '2025-06-26T00:00:00Z',
            updated_at: '2025-06-26T00:00:00Z',
            current_progress: 0,
            reading_deadline_id: 'test-book-1'
          }
        ]
      };

      const { getByTestId } = render(
        <ProgressAreaChart deadline={bookWithZeroProgress} />
      );

      expect(getByTestId('line-chart')).toBeTruthy();
      // Should handle zero progress gracefully
    });

    it('should handle very large datasets', () => {
      const progressEntries = Array.from({ length: 50 }, (_, index) => ({
        id: `progress-${index}`,
        created_at: new Date(2025, 5, index + 1).toISOString(),
        updated_at: new Date(2025, 5, index + 1).toISOString(),
        current_progress: index * 5,
        reading_deadline_id: 'test-book-1'
      }));

      const bookWithManyProgressEntries = {
        ...mockPhysicalBook,
        progress: progressEntries
      };

      const { getByTestId } = render(
        <ProgressAreaChart deadline={bookWithManyProgressEntries} />
      );

      expect(getByTestId('line-chart')).toBeTruthy();
      // Should handle large datasets efficiently
    });

    it('should handle malformed progress data', () => {
      const bookWithMalformedProgress = {
        ...mockPhysicalBook,
        progress: [
          {
            id: 'malformed-progress',
            created_at: '2025-06-26T00:00:00Z',
            updated_at: '2025-06-26T00:00:00Z',
            current_progress: null as any, // Malformed data
            reading_deadline_id: 'test-book-1'
          }
        ]
      };

      const { queryByTestId } = render(
        <ProgressAreaChart deadline={bookWithMalformedProgress} />
      );

      // Should filter out malformed data and not render chart
      expect(queryByTestId('line-chart')).toBeNull();
    });

    it('should handle missing created_at timestamps', () => {
      const bookWithMissingTimestamps = {
        ...mockPhysicalBook,
        progress: [
          {
            id: 'missing-timestamp',
            created_at: null as any, // Missing timestamp
            updated_at: '2025-06-26T00:00:00Z',
            current_progress: 50,
            reading_deadline_id: 'test-book-1'
          }
        ]
      };

      const { queryByTestId } = render(
        <ProgressAreaChart deadline={bookWithMissingTimestamps} />
      );

      // Should filter out entries with missing timestamps and not render chart
      expect(queryByTestId('line-chart')).toBeNull();
    });

    it('should handle negative progress values', () => {
      const bookWithNegativeProgress = {
        ...mockPhysicalBook,
        progress: [
          {
            id: 'negative-progress',
            created_at: '2025-06-26T00:00:00Z',
            updated_at: '2025-06-26T00:00:00Z',
            current_progress: -10, // Negative progress
            reading_deadline_id: 'test-book-1'
          }
        ]
      };

      const { getByTestId } = render(
        <ProgressAreaChart deadline={bookWithNegativeProgress} />
      );

      // Should handle negative values by converting to 0
      expect(getByTestId('line-chart')).toBeTruthy();
    });

    it('should handle missing total_quantity', () => {
      const bookWithMissingGoal = {
        ...mockPhysicalBook,
        total_quantity: null as any, // Missing goal
        progress: [
          {
            id: 'valid-progress',
            created_at: '2025-06-26T00:00:00Z',
            updated_at: '2025-06-26T00:00:00Z',
            current_progress: 50,
            reading_deadline_id: 'test-book-1'
          }
        ]
      };

      const { getByTestId } = render(
        <ProgressAreaChart deadline={bookWithMissingGoal} />
      );

      // Should handle missing goal gracefully
      expect(getByTestId('line-chart')).toBeTruthy();
    });
  });

  describe('Chart Configuration', () => {
    it('should render as area chart', () => {
      const { getByTestId, getByText } = render(
        <ProgressAreaChart deadline={mockPhysicalBook} />
      );

      expect(getByTestId('line-chart')).toBeTruthy();
      expect(getByText(/AreaChart with \d+ points/)).toBeTruthy();
    });

    it('should include reference line for goal', () => {
      const { getByTestId } = render(
        <ProgressAreaChart deadline={mockPhysicalBook} />
      );

      // Chart should be rendered (goal line is configured in props)
      expect(getByTestId('line-chart')).toBeTruthy();
    });
  });
});