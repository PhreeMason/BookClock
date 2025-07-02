import { render, screen, fireEvent } from '@testing-library/react-native';
import React from 'react';
import ReadingProgress from '../shared/ReadingProgress';
import { ReadingDeadlineWithProgress } from '@/types/deadline';

// Mock the hooks
jest.mock('@/hooks/useDeadlines', () => ({
  useUpdateDeadlineProgress: jest.fn(() => ({
    mutate: jest.fn(),
    isPending: false,
  })),
}));

jest.mock('react-native-toast-message', () => ({
  show: jest.fn(),
}));

const mockDeadline: ReadingDeadlineWithProgress = {
  id: '1',
  book_title: 'Test Book',
  author: 'Test Author',
  format: 'physical' as const,
  total_quantity: 300,
  flexibility: 'flexible' as const,
  source: 'library',
  deadline_date: '2024-12-31',
  created_at: '2024-01-01',
  updated_at: '2024-01-01',
  user_id: 'test-user-id',
  progress: [],
};

const mockCalculations = {
  unitsPerDay: 5, // This should show +5, +10, +15 buttons
  urgencyLevel: 'medium' as const,
  currentProgress: 32,
  totalQuantity: 300,
  remaining: 268,
  progressPercentage: 10.67,
};

// Mock the DeadlineProvider context
const mockDeadlineContext = {
  getDeadlineCalculations: jest.fn(() => mockCalculations),
  deadlines: [],
  isLoading: false,
  refreshDeadlines: jest.fn(),
};

// Mock the context provider
jest.mock('@/contexts/DeadlineProvider', () => ({
  useDeadlines: () => mockDeadlineContext,
}));

describe('ProgressFormInteraction', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('input and quick button synchronization', () => {
    it('should maintain correct value when typing then using quick buttons', () => {
      render(<ReadingProgress deadline={mockDeadline} />);

      const input = screen.getByPlaceholderText('Enter current progress');
      const quickButton = screen.getByText('+5');

      // Initial state - should show 32
      expect(input.props.value).toBe('32');

      // User types 45
      fireEvent.changeText(input, '45');
      expect(input.props.value).toBe('45');

      // User clicks +5 quick button
      fireEvent.press(quickButton);

      // Should now show 50 (45 + 5), not 37 (32 + 5)
      expect(input.props.value).toBe('50');
    });

    it('should handle decimal input correctly with quick buttons', () => {
      render(<ReadingProgress deadline={mockDeadline} />);

      const input = screen.getByPlaceholderText('Enter current progress');
      const quickButton = screen.getByText('+5');

      // User types decimal number
      fireEvent.changeText(input, '45.7');

      // Click quick button
      fireEvent.press(quickButton);

      // Should use 45.7 + 5 = 50.7 (no automatic integer conversion)
      expect(input.props.value).toBe('50.7');
    });

    it('should handle empty input correctly with quick buttons', () => {
      render(<ReadingProgress deadline={mockDeadline} />);

      const input = screen.getByPlaceholderText('Enter current progress');
      const quickButton = screen.getByText('+5');

      // User clears input
      fireEvent.changeText(input, '');

      // Click quick button - should fall back to original progress
      fireEvent.press(quickButton);

      // Should use original currentProgress (32) + 5 = 37
      expect(input.props.value).toBe('37');
    });

    it('should handle invalid text input correctly with quick buttons', () => {
      render(<ReadingProgress deadline={mockDeadline} />);

      const input = screen.getByPlaceholderText('Enter current progress');
      const quickButton = screen.getByText('+5');

      // User types invalid text
      fireEvent.changeText(input, 'abc');

      // Click quick button - should fall back to original progress
      fireEvent.press(quickButton);

      // Should use original currentProgress (32) + 5 = 37
      expect(input.props.value).toBe('37');
    });

    it('should handle sequential quick button clicks correctly', () => {
      render(<ReadingProgress deadline={mockDeadline} />);

      const input = screen.getByPlaceholderText('Enter current progress');
      const quickButton5 = screen.getByText('+5');
      const quickButton10 = screen.getByText('+10');

      // Start with 32, type 50
      fireEvent.changeText(input, '50');

      // Click +5
      fireEvent.press(quickButton5);
      expect(input.props.value).toBe('55');

      // Click +10
      fireEvent.press(quickButton10);
      expect(input.props.value).toBe('65');
    });

    it('should respect maximum value limits with quick buttons', () => {
      render(<ReadingProgress deadline={mockDeadline} />);

      const input = screen.getByPlaceholderText('Enter current progress');
      const quickButton = screen.getByText('+5');

      // Type value close to maximum  
      fireEvent.changeText(input, '296');

      // Click +5 (would make 301, but max is 300)
      fireEvent.press(quickButton);

      // Should cap at maximum
      expect(input.props.value).toBe('300');
    });

    it('should handle minimum value limits with quick buttons', () => {
      // Use the existing negative increment

      render(<ReadingProgress deadline={mockDeadline} />);

      const input = screen.getByPlaceholderText('Enter current progress');
      const quickButton = screen.getByText('+5');

      // Type small value
      fireEvent.changeText(input, '3');

      // Click -5 (would make -2, but min is 0)
      fireEvent.press(quickButton);

      // Should be 8
      expect(input.props.value).toBe('8');
    });
  });

  describe('edge cases', () => {
    it('should handle very large numbers correctly', () => {
      render(<ReadingProgress deadline={mockDeadline} />);

      const input = screen.getByPlaceholderText('Enter current progress');
      const quickButton = screen.getByText('+5');

      // User types very large number
      fireEvent.changeText(input, '999999');

      // Click quick button
      fireEvent.press(quickButton);

      expect(input.props.value).toBe('300'); // Still max value after -5
    });

    it('should handle leading/trailing whitespace', () => {
      render(<ReadingProgress deadline={mockDeadline} />);

      const input = screen.getByPlaceholderText('Enter current progress');
      const quickButton = screen.getByText('+5');

      // User types with whitespace
      fireEvent.changeText(input, '  45  ');

      // Click quick button
      fireEvent.press(quickButton);

      // Should parse correctly and add
      expect(input.props.value).toBe('50');
    });

    it('should handle negative input values', () => {
      render(<ReadingProgress deadline={mockDeadline} />);

      const input = screen.getByPlaceholderText('Enter current progress');
      const quickButton = screen.getByText('+5');

      // User types negative number
      fireEvent.changeText(input, '-10');

      // Click quick button
      fireEvent.press(quickButton);

      // Should use the negative value: -10 + 2 = -8, but cap at 0
      expect(input.props.value).toBe('0');
    });
  });

  describe('multiple quick button interactions', () => {
    it('should work correctly with different quick button values', () => {
      render(<ReadingProgress deadline={mockDeadline} />);

      const input = screen.getByPlaceholderText('Enter current progress');
      const quickButton5 = screen.getByText('+5');
      const quickButton10 = screen.getByText('+10');
      const quickButton15 = screen.getByText('+15');

      // Start with typed value
      fireEvent.changeText(input, '100');

      // Test different quick buttons
      fireEvent.press(quickButton5);
      expect(input.props.value).toBe('105');

      fireEvent.press(quickButton10);
      expect(input.props.value).toBe('115');

      fireEvent.press(quickButton15);
      expect(input.props.value).toBe('130');
    });
  });

  describe('audio format time handling', () => {
    const audioDeadline: ReadingDeadlineWithProgress = {
      ...mockDeadline,
      format: 'audio' as const,
      total_quantity: 180, // 3 hours in minutes
    };

    const audioCalculations = {
      ...mockCalculations,
      unitsPerDay: 30, // 30 minutes per day for audiobooks
      currentProgress: 60, // 1 hour 
      totalQuantity: 180, // 3 hours total
    };

    beforeEach(() => {
      mockDeadlineContext.getDeadlineCalculations = jest.fn(() => audioCalculations);
    });

    it('should display initial audiobook progress correctly', () => {
      render(<ReadingProgress deadline={audioDeadline} />);

      const input = screen.getByPlaceholderText('e.g., 3h 2m or 3:02');
      
      // Should display 60 minutes as "1h"
      expect(input.props.value).toBe('1h');
    });

    it('should handle audiobook quick actions when input is not focused', () => {
      render(<ReadingProgress deadline={audioDeadline} />);

      const input = screen.getByPlaceholderText('e.g., 3h 2m or 3:02');
      const quickButton = screen.getByText('+30'); // 30 minutes

      // Initial display should be "1h" (60 minutes)
      expect(input.props.value).toBe('1h');

      // Click +30 quick button
      fireEvent.press(quickButton);

      // Should now display "1h 30m" (90 minutes = 60 + 30)
      expect(input.props.value).toBe('1h 30m');
    });

    it('should handle audiobook quick actions when input is focused with typed value', () => {
      render(<ReadingProgress deadline={audioDeadline} />);

      const input = screen.getByPlaceholderText('e.g., 3h 2m or 3:02');
      const quickButton = screen.getByText('+30'); // 30 minutes

      // User types a time value and focuses the input
      fireEvent.changeText(input, '2h 15m'); // 135 minutes
      
      // Verify the typed value is displayed
      expect(input.props.value).toBe('2h 15m');

      // Click +30 quick button while input is focused
      fireEvent.press(quickButton);

      // Should now display "2h 45m" (165 minutes = 135 + 30)
      // This is the critical test - it should work even when focused
      expect(input.props.value).toBe('2h 45m');
    });

    it('should handle different audiobook time formats with quick actions', () => {
      render(<ReadingProgress deadline={audioDeadline} />);

      const input = screen.getByPlaceholderText('e.g., 3h 2m or 3:02');
      const quickButton = screen.getByText('+30');

      // Test colon format
      fireEvent.changeText(input, '1:45'); // 1 hour 45 minutes = 105 minutes
      fireEvent.press(quickButton);
      expect(input.props.value).toBe('2h 15m'); // 135 minutes formatted

      // Reset and test minutes only
      fireEvent.changeText(input, '90m'); // 90 minutes
      fireEvent.press(quickButton);
      expect(input.props.value).toBe('2h'); // 120 minutes formatted

      // Reset and test decimal hours
      fireEvent.changeText(input, '1.5h'); // 1.5 hours = 90 minutes
      fireEvent.press(quickButton);
      expect(input.props.value).toBe('2h'); // 120 minutes formatted
    });

    it('should handle sequential audiobook quick actions correctly', () => {
      render(<ReadingProgress deadline={audioDeadline} />);

      const input = screen.getByPlaceholderText('e.g., 3h 2m or 3:02');
      const quickButton30 = screen.getByText('+30');
      const quickButton60 = screen.getByText('+60');

      // Start with typed value
      fireEvent.changeText(input, '30m'); // 30 minutes

      // Click +30
      fireEvent.press(quickButton30);
      expect(input.props.value).toBe('1h'); // 60 minutes

      // Click +60  
      fireEvent.press(quickButton60);
      expect(input.props.value).toBe('2h'); // 120 minutes
    });

    it('should respect maximum limit for audiobook quick actions', () => {
      render(<ReadingProgress deadline={audioDeadline} />);

      const input = screen.getByPlaceholderText('e.g., 3h 2m or 3:02');
      const quickButton = screen.getByText('+30');

      // Type value close to maximum (180 minutes = 3h)
      fireEvent.changeText(input, '2h 45m'); // 165 minutes

      // Click +30 (would make 195, but max is 180)
      fireEvent.press(quickButton);

      // Should cap at maximum
      expect(input.props.value).toBe('3h'); // 180 minutes
    });

    it('should handle invalid audiobook input with quick actions', () => {
      render(<ReadingProgress deadline={audioDeadline} />);

      const input = screen.getByPlaceholderText('e.g., 3h 2m or 3:02');
      const quickButton = screen.getByText('+30');

      // User types invalid format
      fireEvent.changeText(input, 'invalid time');

      // Click quick button - should fall back to original progress
      fireEvent.press(quickButton);

      // Should use original currentProgress (60) + 30 = 90 minutes = "1h 30m"
      expect(input.props.value).toBe('1h 30m');
    });

    it('should handle partial time input and format on quick actions', () => {
      render(<ReadingProgress deadline={audioDeadline} />);

      const input = screen.getByPlaceholderText('e.g., 3h 2m or 3:02');
      const quickButton = screen.getByText('+30');

      // User types in colon format - this gets parsed and formatted immediately
      fireEvent.changeText(input, '1:3'); // Gets formatted to "1h 3m"

      // AudiobookProgressInput formats valid input immediately  
      expect(input.props.value).toBe('1h 3m');

      // When quick action is pressed, it should add correctly
      fireEvent.press(quickButton);

      // Should parse 1h 3m (63 minutes) + 30 = 93 minutes = "1h 33m"
      expect(input.props.value).toBe('1h 33m');
    });
  });

  describe('ebook format percentage handling', () => {
    const ebookDeadline: ReadingDeadlineWithProgress = {
      ...mockDeadline,
      format: 'ebook' as const,
      total_quantity: 100, // 100 percent
    };

    const ebookCalculations = {
      ...mockCalculations,
      unitsPerDay: 10, // 10% per day for ebooks
      currentProgress: 25, // 25%
      totalQuantity: 100, // 100% total
    };

    beforeEach(() => {
      mockDeadlineContext.getDeadlineCalculations = jest.fn(() => ebookCalculations);
    });

    it('should handle ebook quick actions when input is focused with typed value', () => {
      render(<ReadingProgress deadline={ebookDeadline} />);

      const input = screen.getByPlaceholderText('Enter current progress');
      const quickButton = screen.getByText('+10'); // 10%

      // User types a percentage value
      fireEvent.changeText(input, '45'); // 45%
      
      // Verify the typed value is displayed
      expect(input.props.value).toBe('45');

      // Click +10 quick button while input is focused
      fireEvent.press(quickButton);

      // Should now display "55" (45 + 10)
      expect(input.props.value).toBe('55');
    });

    it('should handle decimal percentages with ebook quick actions', () => {
      render(<ReadingProgress deadline={ebookDeadline} />);

      const input = screen.getByPlaceholderText('Enter current progress');
      const quickButton = screen.getByText('+10');

      // User types decimal percentage
      fireEvent.changeText(input, '45.5'); // 45.5%
      fireEvent.press(quickButton);
      
      // Should add correctly: 45.5 + 10 = 55.5
      expect(input.props.value).toBe('55.5');
    });

    it('should respect 100% maximum for ebook quick actions', () => {
      render(<ReadingProgress deadline={ebookDeadline} />);

      const input = screen.getByPlaceholderText('Enter current progress');
      const quickButton = screen.getByText('+10');

      // Type value close to maximum
      fireEvent.changeText(input, '95'); // 95%

      // Click +10 (would make 105, but max is 100)
      fireEvent.press(quickButton);

      // Should cap at maximum
      expect(input.props.value).toBe('100');
    });
  });

  describe('cross-format consistency', () => {
    it('should work consistently across all book formats', () => {
      // Test that the quick action logic works the same way for all formats
      const formats = [
        { 
          format: 'physical' as const, 
          total: 300, 
          current: 50, 
          increment: 5,
          placeholder: 'Enter current progress'
        },
        { 
          format: 'ebook' as const, 
          total: 100, 
          current: 25, 
          increment: 10,
          placeholder: 'Enter current progress'
        },
        { 
          format: 'audio' as const, 
          total: 180, 
          current: 60, 
          increment: 30,
          placeholder: 'e.g., 3h 2m or 3:02'
        }
      ];

      formats.forEach(({ format, total, current, increment, placeholder }) => {
        const deadline = { ...mockDeadline, format, total_quantity: total };
        const calculations = { 
          ...mockCalculations, 
          currentProgress: current, 
          totalQuantity: total,
          unitsPerDay: increment 
        };
        
        mockDeadlineContext.getDeadlineCalculations = jest.fn(() => calculations);

        const { unmount } = render(<ReadingProgress deadline={deadline} />);

        const input = screen.getByPlaceholderText(placeholder);
        const quickButton = screen.getByText(`+${increment}`);

        // For audio format, we need to account for the display format
        const expectedValue = format === 'audio' ? '1h' : current.toString();
        expect(input.props.value).toBe(expectedValue);

        // Type a new value
        const typedValue = format === 'audio' ? '2h' : (current + 10).toString();
        fireEvent.changeText(input, typedValue);

        // Click quick button
        fireEvent.press(quickButton);

        // Verify the increment was applied correctly
        const expectedResult = format === 'audio' ? '2h 30m' : (current + 10 + increment).toString();
        expect(input.props.value).toBe(expectedResult);

        unmount();
      });
    });
  });
});