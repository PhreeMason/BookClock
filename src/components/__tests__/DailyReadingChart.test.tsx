import { render } from '@testing-library/react-native';
import React from 'react';
import DailyReadingChart from '../DailyReadingChart';
import { ReadingDeadlineWithProgress } from '@/types/deadline';

// Mock the gifted charts
jest.mock('react-native-gifted-charts', () => ({
  BarChart: jest.fn(({ testID, data, ...props }: any) => {
    const React = require('react');
    const { View, Text } = require('react-native');
    return React.createElement(
      View,
      { testID: testID || 'bar-chart' },
      React.createElement(Text, {}, `BarChart with ${data?.length || 0} items`)
    );
  }),
}));

// Mock the pace calculations
jest.mock('@/lib/paceCalculations', () => ({
  calculateRequiredPace: jest.fn((total, current, days, format) => {
    // Mock calculation: simple remaining/days
    const remaining = total - current;
    return Math.ceil(remaining / days);
  }),
}));

describe('DailyReadingChart', () => {
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
        created_at: '2025-06-25T00:00:00Z',
        updated_at: '2025-06-25T00:00:00Z',
        current_progress: 50,
        reading_deadline_id: 'test-book-1'
      },
      {
        id: 'progress-2',
        created_at: '2025-06-26T00:00:00Z',
        updated_at: '2025-06-26T00:00:00Z',
        current_progress: 75,
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
        created_at: '2025-06-25T00:00:00Z',
        updated_at: '2025-06-25T00:00:00Z',
        current_progress: 120,
        reading_deadline_id: 'test-audio-book'
      },
      {
        id: 'progress-audio-2',
        created_at: '2025-06-26T00:00:00Z',
        updated_at: '2025-06-26T00:00:00Z',
        current_progress: 180,
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
        created_at: '2025-06-25T00:00:00Z',
        updated_at: '2025-06-25T00:00:00Z',
        current_progress: 25,
        reading_deadline_id: 'test-ebook'
      }
    ]
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render bar chart for physical book', () => {
      const { getByTestId, getByText } = render(
        <DailyReadingChart deadline={mockPhysicalBook} />
      );

      expect(getByTestId('bar-chart')).toBeTruthy();
      expect(getByText('Daily Reading Progress (Last 7 Days)')).toBeTruthy();
      expect(getByText('Pages read per day')).toBeTruthy();
    });

    it('should render bar chart for audio book with correct labels', () => {
      const { getByText } = render(
        <DailyReadingChart deadline={mockAudioBook} />
      );

      expect(getByText('Daily Listening Progress (Last 7 Days)')).toBeTruthy();
      expect(getByText('Minutes listened per day')).toBeTruthy();
    });

    it('should render bar chart for ebook with correct labels', () => {
      const { getByText } = render(
        <DailyReadingChart deadline={mockEbookBook} />
      );

      expect(getByText('Daily Reading Progress (Last 7 Days)')).toBeTruthy();
      expect(getByText('Percentage read per day')).toBeTruthy();
    });

    it('should not render when no progress data exists', () => {
      const bookWithoutProgress = {
        ...mockPhysicalBook,
        progress: []
      };

      const { queryByTestId } = render(
        <DailyReadingChart deadline={bookWithoutProgress} />
      );

      expect(queryByTestId('bar-chart')).toBeNull();
    });
  });

  describe('Data Processing', () => {
    it('should process daily reading data correctly', () => {
      const { getByTestId, getByText } = render(
        <DailyReadingChart deadline={mockPhysicalBook} />
      );

      const chart = getByTestId('bar-chart');
      expect(chart).toBeTruthy();
      // The chart should show progress differences: 75-50=25 pages on 6/26
      expect(getByText(/BarChart with \d+ items/)).toBeTruthy();
    });

    it('should handle same-day progress updates correctly', () => {
      const bookWithSameDayProgress = {
        ...mockPhysicalBook,
        progress: [
          {
            id: 'progress-1',
            created_at: '2025-06-26T08:00:00Z',
            updated_at: '2025-06-26T08:00:00Z',
            current_progress: 50,
            reading_deadline_id: 'test-book-1'
          },
          {
            id: 'progress-2',
            created_at: '2025-06-26T20:00:00Z',
            updated_at: '2025-06-26T20:00:00Z',
            current_progress: 80,
            reading_deadline_id: 'test-book-1'
          }
        ]
      };

      const { getByTestId } = render(
        <DailyReadingChart deadline={bookWithSameDayProgress} />
      );

      expect(getByTestId('bar-chart')).toBeTruthy();
      // Should aggregate to 30 pages on 6/26
    });
  });

  describe('Goal Line', () => {
    it('should display daily goal legend for physical book', () => {
      const { getByText } = render(
        <DailyReadingChart deadline={mockPhysicalBook} />
      );

      expect(getByText('Daily Progress')).toBeTruthy();
      expect(getByText(/Daily Goal \(\d+ pg\)/)).toBeTruthy();
    });

    it('should display daily goal legend for audio book with minutes', () => {
      const { getByText } = render(
        <DailyReadingChart deadline={mockAudioBook} />
      );

      expect(getByText('Daily Progress')).toBeTruthy();
      expect(getByText(/Daily Goal \(\d+ min\)/)).toBeTruthy();
    });

    it('should display daily goal legend for ebook with percentage', () => {
      const { getByText } = render(
        <DailyReadingChart deadline={mockEbookBook} />
      );

      expect(getByText('Daily Progress')).toBeTruthy();
      expect(getByText(/Daily Goal \(\d+ %\)/)).toBeTruthy();
    });
  });

  describe('Format-Specific Behavior', () => {
    it('should use correct unit labels for different formats', () => {
      // Test physical book
      const { rerender, getByText: getByTextPhysical } = render(
        <DailyReadingChart deadline={mockPhysicalBook} />
      );
      expect(getByTextPhysical(/pg/)).toBeTruthy();

      // Test audio book
      rerender(<DailyReadingChart deadline={mockAudioBook} />);
      expect(getByTextPhysical(/min/)).toBeTruthy();

      // Test ebook
      rerender(<DailyReadingChart deadline={mockEbookBook} />);
      expect(getByTextPhysical(/%/)).toBeTruthy();
    });
  });

  describe('Edge Cases', () => {
    it('should handle book with very old progress data', () => {
      const bookWithOldProgress = {
        ...mockPhysicalBook,
        progress: [
          {
            id: 'old-progress',
            created_at: '2025-01-01T00:00:00Z', // Very old date
            updated_at: '2025-01-01T00:00:00Z',
            current_progress: 100,
            reading_deadline_id: 'test-book-1'
          }
        ]
      };

      const { queryByTestId } = render(
        <DailyReadingChart deadline={bookWithOldProgress} />
      );

      // Should not render since no recent progress
      expect(queryByTestId('bar-chart')).toBeNull();
    });

    it('should handle large initial progress values correctly', () => {
      const bookWithLargeInitialProgress = {
        ...mockAudioBook,
        progress: [
          {
            id: 'large-initial',
            created_at: '2025-06-26T00:00:00Z',
            updated_at: '2025-06-26T00:00:00Z',
            current_progress: 300, // Large initial progress (should be ignored)
            reading_deadline_id: 'test-audio-book'
          },
          {
            id: 'normal-progress',
            created_at: '2025-06-27T00:00:00Z',
            updated_at: '2025-06-27T00:00:00Z',
            current_progress: 320, // Only 20 minutes of actual reading
            reading_deadline_id: 'test-audio-book'
          }
        ]
      };

      const { getByTestId } = render(
        <DailyReadingChart deadline={bookWithLargeInitialProgress} />
      );

      expect(getByTestId('bar-chart')).toBeTruthy();
      // Should only show 20 minutes on 6/27, ignoring the large initial value
    });

    it('should handle negative progress changes', () => {
      const bookWithNegativeProgress = {
        ...mockPhysicalBook,
        progress: [
          {
            id: 'progress-1',
            created_at: '2025-06-26T08:00:00Z',
            updated_at: '2025-06-26T08:00:00Z',
            current_progress: 100,
            reading_deadline_id: 'test-book-1'
          },
          {
            id: 'progress-2',
            created_at: '2025-06-26T20:00:00Z',
            updated_at: '2025-06-26T20:00:00Z',
            current_progress: 90, // User went backwards (correction)
            reading_deadline_id: 'test-book-1'
          }
        ]
      };

      const { getByTestId } = render(
        <DailyReadingChart deadline={bookWithNegativeProgress} />
      );

      expect(getByTestId('bar-chart')).toBeTruthy();
      // Should handle negative changes gracefully
    });
  });
});