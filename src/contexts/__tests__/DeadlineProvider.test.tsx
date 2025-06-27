import { ReadingDeadlineWithProgress } from '@/types/deadline';
import { fireEvent, render, screen } from '@testing-library/react-native';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { DeadlineProvider, useDeadlines } from '../DeadlineProvider';

// Mock the hooks with simpler types
jest.mock('@/hooks/useDeadlines', () => ({
  useGetDeadlines: jest.fn(() => ({
    data: [],
    error: null,
    isLoading: false,
  })),
  useAddDeadline: jest.fn(() => ({
    mutate: jest.fn(),
  })),
  useUpdateDeadline: jest.fn(() => ({
    mutate: jest.fn(),
  })),
}));

import { useAddDeadline, useGetDeadlines, useUpdateDeadline } from '@/hooks/useDeadlines';

const mockUseGetDeadlines = useGetDeadlines as jest.MockedFunction<typeof useGetDeadlines>;
const mockUseAddDeadline = useAddDeadline as jest.MockedFunction<typeof useAddDeadline>;
const mockUseUpdateDeadline = useUpdateDeadline as jest.MockedFunction<typeof useUpdateDeadline>;

// Mock data for testing
const createMockDeadline = (
  id: string,
  bookTitle: string,
  author: string,
  deadlineDate: string,
  format: 'physical' | 'ebook' | 'audio' = 'physical',
  totalQuantity: number = 300,
  progress: any[] = []
): ReadingDeadlineWithProgress => ({
  id,
  book_title: bookTitle,
  author,
  format,
  source: 'personal',
  deadline_date: deadlineDate,
  total_quantity: totalQuantity,
  flexibility: 'flexible',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  user_id: 'test-user-id',
  progress
});

const createMockProgress = (currentProgress: number) => ({
  id: '1',
  reading_deadline_id: '1',
  current_progress: currentProgress,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z'
});

// Test component to access the provider
const TestComponent = () => {
  const context = useDeadlines();
  return (
    <View>
      <Text>Active Count: {context.activeCount}</Text>
      <Text>Overdue Count: {context.overdueCount}</Text>
      <Text>Total Deadlines: {context.deadlines.length}</Text>
      <Text>Is Loading: {context.isLoading.toString()}</Text>
      <Text>Error: {context.error ? context.error.message : 'no-error'}</Text>
    </View>
  );
};

describe('DeadlineProvider', () => {
  const mockMutate = jest.fn();
  const mockUpdateMutate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAddDeadline.mockReturnValue({
      mutate: mockMutate,
    } as any);
    mockUseUpdateDeadline.mockReturnValue({
      mutate: mockUpdateMutate,
    } as any);
  });

  describe('Data Management', () => {
    it('should provide deadlines data correctly', () => {
      const mockDeadlines = [
        createMockDeadline('1', 'Book 1', 'Author 1', '2024-01-20T00:00:00Z'),
        createMockDeadline('2', 'Book 2', 'Author 2', '2024-01-10T00:00:00Z'),
      ];

      mockUseGetDeadlines.mockReturnValue({
        data: mockDeadlines,
        error: null,
        isLoading: false,
      } as any);

      render(
        <DeadlineProvider>
          <TestComponent />
        </DeadlineProvider>
      );

      expect(screen.getByText('Total Deadlines: 2')).toBeTruthy();
      expect(screen.getByText('Active Count: 0')).toBeTruthy();
      expect(screen.getByText('Overdue Count: 2')).toBeTruthy();
    });

    it('should handle loading state correctly', () => {
      mockUseGetDeadlines.mockReturnValue({
        data: undefined,
        error: null,
        isLoading: true,
      } as any);

      render(
        <DeadlineProvider>
          <TestComponent />
        </DeadlineProvider>
      );

      expect(screen.getByText('Is Loading: true')).toBeTruthy();
    });

    it('should handle error state correctly', () => {
      const error = new Error('Failed to fetch deadlines');
      mockUseGetDeadlines.mockReturnValue({
        data: undefined,
        error,
        isLoading: false,
      } as any);

      render(
        <DeadlineProvider>
          <TestComponent />
        </DeadlineProvider>
      );

      expect(screen.getByText('Error: Failed to fetch deadlines')).toBeTruthy();
    });
  });

  describe('Deadline Calculations', () => {
    const TestCalculationComponent = () => {
      const context = useDeadlines();
      
      const deadline = createMockDeadline('1', 'Test Book', 'Test Author', '2024-01-20T00:00:00Z');
      const calculations = context.getDeadlineCalculations(deadline);
      
      return (
        <View>
          <Text>Days Left: {calculations.daysLeft}</Text>
          <Text>Urgency Level: {calculations.urgencyLevel}</Text>
          <Text>Status Message: {calculations.statusMessage}</Text>
          <Text>Progress Percentage: {calculations.progressPercentage}</Text>
          <Text>Units Per Day: {calculations.unitsPerDay}</Text>
        </View>
      );
    };

    beforeEach(() => {
      // Mock current date to 2024-01-15
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2024-01-15T00:00:00Z'));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should calculate urgency levels correctly', () => {
      mockUseGetDeadlines.mockReturnValue({
        data: [],
        error: null,
        isLoading: false,
      } as any);

      render(
        <DeadlineProvider>
          <TestCalculationComponent />
        </DeadlineProvider>
      );

      // Deadline is 5 days away (2024-01-20), should be urgent
      expect(screen.getByText('Urgency Level: urgent')).toBeTruthy();
      expect(screen.getByText('Status Message: Tough timeline')).toBeTruthy();
    });

    it('should calculate days left correctly', () => {
      mockUseGetDeadlines.mockReturnValue({
        data: [],
        error: null,
        isLoading: false,
      } as any);

      render(
        <DeadlineProvider>
          <TestCalculationComponent />
        </DeadlineProvider>
      );

      // 2024-01-20 - 2024-01-15 = 5 days
      expect(screen.getByText('Days Left: 5')).toBeTruthy();
    });

    it('should calculate progress percentage correctly', () => {
      const progress = [createMockProgress(150)];
      const deadline = createMockDeadline('1', 'Test Book', 'Test Author', '2024-01-20T00:00:00Z', 'physical', 300, progress);

      mockUseGetDeadlines.mockReturnValue({
        data: [deadline],
        error: null,
        isLoading: false,
      } as any);

      const TestProgressComponent = () => {
        const context = useDeadlines();
        const calculations = context.getDeadlineCalculations(deadline);
        
        return (
          <View>
            <Text>Progress Percentage: {calculations.progressPercentage}</Text>
            <Text>Current Progress: {calculations.currentProgress}</Text>
            <Text>Total Quantity: {calculations.totalQuantity}</Text>
          </View>
        );
      };

      render(
        <DeadlineProvider>
          <TestProgressComponent />
        </DeadlineProvider>
      );

      // 150/300 = 50%
      expect(screen.getByText('Progress Percentage: 50')).toBeTruthy();
      expect(screen.getByText('Current Progress: 150')).toBeTruthy();
      expect(screen.getByText('Total Quantity: 300')).toBeTruthy();
    });
  });

  describe('Utility Functions', () => {
    const TestUtilityComponent = () => {
      const context = useDeadlines();
      
      return (
        <View>
          <Text>Urgency Level Good: {context.getUrgencyLevel(20)}</Text>
          <Text>Urgency Level Urgent: {context.getUrgencyLevel(5)}</Text>
          <Text>Urgency Level Overdue: {context.getUrgencyLevel(-5)}</Text>
          <Text>Urgency Color: {context.getUrgencyColor('urgent')}</Text>
          <Text>Status Message: {context.getStatusMessage('urgent')}</Text>
          <Text>Format Units Physical: {context.formatUnitsPerDay(30, 'physical')}</Text>
          <Text>Format Units Audio: {context.formatUnitsPerDay(90, 'audio')}</Text>
        </View>
      );
    };

    it('should provide correct urgency levels', () => {
      mockUseGetDeadlines.mockReturnValue({
        data: [],
        error: null,
        isLoading: false,
      } as any);

      render(
        <DeadlineProvider>
          <TestUtilityComponent />
        </DeadlineProvider>
      );

      expect(screen.getByText('Urgency Level Good: good')).toBeTruthy();
      expect(screen.getByText('Urgency Level Urgent: urgent')).toBeTruthy();
      expect(screen.getByText('Urgency Level Overdue: overdue')).toBeTruthy();
    });

    it('should provide correct urgency colors', () => {
      mockUseGetDeadlines.mockReturnValue({
        data: [],
        error: null,
        isLoading: false,
      } as any);

      render(
        <DeadlineProvider>
          <TestUtilityComponent />
        </DeadlineProvider>
      );

      expect(screen.getByText('Urgency Color: #dc2626')).toBeTruthy();
    });

    it('should provide correct status messages', () => {
      mockUseGetDeadlines.mockReturnValue({
        data: [],
        error: null,
        isLoading: false,
      } as any);

      render(
        <DeadlineProvider>
          <TestUtilityComponent />
        </DeadlineProvider>
      );

      expect(screen.getByText('Status Message: Tough timeline')).toBeTruthy();
    });

    it('should format units per day correctly', () => {
      mockUseGetDeadlines.mockReturnValue({
        data: [],
        error: null,
        isLoading: false,
      } as any);

      render(
        <DeadlineProvider>
          <TestUtilityComponent />
        </DeadlineProvider>
      );

      expect(screen.getByText('Format Units Physical: 30 pages/day needed')).toBeTruthy();
      expect(screen.getByText('Format Units Audio: 1h 30m/day needed')).toBeTruthy();
    });
  });

  describe('Add Deadline Functionality', () => {
    it('should call addDeadline mutation correctly', () => {
      mockUseGetDeadlines.mockReturnValue({
        data: [],
        error: null,
        isLoading: false,
      } as any);

      const TestAddComponent = () => {
        const context = useDeadlines();
        
        const handleAdd = () => {
          context.addDeadline({
            deadlineDetails: {
              id: 'test-id',
              book_title: 'Test Book',
              author: 'Test Author',
              deadline_date: '2024-01-20T00:00:00Z',
              total_quantity: 300,
              format: 'physical',
              source: 'personal',
              flexibility: 'flexible'
            },
            progressDetails: {
              id: 'progress-id',
              reading_deadline_id: 'test-id',
              current_progress: 0
            }
          });
        };

        return (
          <TouchableOpacity onPress={handleAdd}>
            <Text>Add Deadline</Text>
          </TouchableOpacity>
        );
      };

      const { getByText } = render(
        <DeadlineProvider>
          <TestAddComponent />
        </DeadlineProvider>
      );

      fireEvent.press(getByText('Add Deadline'));

      expect(mockMutate).toHaveBeenCalledWith({
        deadlineDetails: {
          id: 'test-id',
          book_title: 'Test Book',
          author: 'Test Author',
          deadline_date: '2024-01-20T00:00:00Z',
          total_quantity: 300,
          format: 'physical',
          source: 'personal',
          flexibility: 'flexible'
        },
        progressDetails: {
          id: 'progress-id',
          reading_deadline_id: 'test-id',
          current_progress: 0
        }
      }, {
        onSuccess: expect.any(Function),
        onError: expect.any(Function)
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty deadlines array', () => {
      mockUseGetDeadlines.mockReturnValue({
        data: [],
        error: null,
        isLoading: false,
      } as any);

      render(
        <DeadlineProvider>
          <TestComponent />
        </DeadlineProvider>
      );

      expect(screen.getByText('Total Deadlines: 0')).toBeTruthy();
      expect(screen.getByText('Active Count: 0')).toBeTruthy();
      expect(screen.getByText('Overdue Count: 0')).toBeTruthy();
    });

    it('should handle deadlines with no progress', () => {
      const deadline = createMockDeadline('1', 'Test Book', 'Test Author', '2024-01-20T00:00:00Z', 'physical', 300, []);

      mockUseGetDeadlines.mockReturnValue({
        data: [deadline],
        error: null,
        isLoading: false,
      } as any);

      const TestNoProgressComponent = () => {
        const context = useDeadlines();
        const calculations = context.getDeadlineCalculations(deadline);
        
        return (
          <View>
            <Text>Current Progress: {calculations.currentProgress}</Text>
            <Text>Progress Percentage: {calculations.progressPercentage}</Text>
          </View>
        );
      };

      render(
        <DeadlineProvider>
          <TestNoProgressComponent />
        </DeadlineProvider>
      );

      expect(screen.getByText('Current Progress: 0')).toBeTruthy();
      expect(screen.getByText('Progress Percentage: 0')).toBeTruthy();
    });
  });
}); 