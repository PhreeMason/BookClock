import { render, waitFor } from '@testing-library/react-native';
import React from 'react';
import ActiveReads from '../ActiveReads';
import { mockUseGetDeadlines } from '@/__mocks__/useDeadlinesMock';

// Mock the deadline hooks
jest.mock('@/hooks/useDeadlines', () => ({
  useGetDeadlines: jest.fn(),
  useAddDeadline: jest.fn(() => ({
    mutate: jest.fn(),
    isPending: false,
  })),
  useUpdateDeadline: jest.fn(() => ({
    mutate: jest.fn(),
    isPending: false,
  })),
  useDeleteDeadline: jest.fn(() => ({
    mutate: jest.fn(),
    isPending: false,
  })),
}));

// Mock the DeadlineProvider
jest.mock('@/contexts/DeadlineProvider', () => ({
  useDeadlines: jest.fn(() => ({
    deadlines: [],
    activeDeadlines: [],
    overdueDeadlines: [],
    isLoading: false,
    error: null,
    addDeadline: jest.fn(),
    updateDeadline: jest.fn(),
    deleteDeadline: jest.fn(),
    getDeadlineCalculations: jest.fn(),
    calculateUnitsPerDay: jest.fn(),
    getUrgencyLevel: jest.fn(),
    getUrgencyColor: jest.fn(),
    getStatusMessage: jest.fn(),
    formatUnitsPerDay: jest.fn(),
    getTotalReadingTimePerDay: jest.fn(() => ({ hours: 0, minutes: 0 })),
    activeCount: 0,
    overdueCount: 0,
  })),
  DeadlineProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Mock router
jest.mock('expo-router', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  })),
}));

const { useGetDeadlines } = require('@/hooks/useDeadlines');

describe('ActiveReads with Sample Data', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render active reads from sample data', async () => {
    // Mock the hook to return sample data
    useGetDeadlines.mockImplementation(mockUseGetDeadlines);

    const { getByText } = render(<ActiveReads />);

    await waitFor(() => {
      // Should show some of the sample books
      expect(getByText('Letters to a Young Poet')).toBeTruthy();
      expect(getByText('The lean start up')).toBeTruthy();
      expect(getByText('Freeing the natural voice')).toBeTruthy();
    });
  });

  it('should show charts with sample data when available', async () => {
    useGetDeadlines.mockImplementation(mockUseGetDeadlines);

    const { getByTestId } = render(<ActiveReads />);

    await waitFor(() => {
      // Charts should be rendered with the sample data
      // Note: The actual implementation may vary, adjust based on your component structure
      expect(getByTestId('swipeable-charts')).toBeTruthy();
    });
  });
});