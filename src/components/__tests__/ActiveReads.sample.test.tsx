import { render, waitFor } from '@testing-library/react-native';
import React from 'react';
import ActiveReads from '../features/deadlines/ActiveReads';
import { mockUseGetDeadlines } from '@/__mocks__/useDeadlinesMock';
import { sampleDeadlines } from '@/__tests__/fixtures/sampleDeadlines';

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
jest.mock('@/contexts/DeadlineProvider', () => {
  const { sampleDeadlines } = require('@/__tests__/fixtures/sampleDeadlines');
  
  return {
    useDeadlines: jest.fn(() => ({
      deadlines: sampleDeadlines,
      activeDeadlines: sampleDeadlines, // Use sample deadlines as active deadlines
      overdueDeadlines: [],
      isLoading: false,
      error: null,
      addDeadline: jest.fn(),
      updateDeadline: jest.fn(),
      deleteDeadline: jest.fn(),
      getDeadlineCalculations: jest.fn(() => ({
        currentProgress: 100,
        totalQuantity: 300,
        remaining: 200,
        progressPercentage: 33,
        daysLeft: 15,
        unitsPerDay: 10,
        urgencyLevel: 'good',
        urgencyColor: 'green',
        statusMessage: 'On track',
        readingEstimate: '20 days',
        paceEstimate: '10 pages/day',
        unit: 'pages',
        userPace: 25,
        requiredPace: 10,
        paceStatus: 'green',
        paceMessage: 'On track at 25 pages/day',
      })),
      calculateUnitsPerDay: jest.fn(),
      getUrgencyLevel: jest.fn(),
      getUrgencyColor: jest.fn(),
      getStatusMessage: jest.fn(),
      formatUnitsPerDay: jest.fn(),
      getTotalReadingTimePerDay: jest.fn(() => ({ hours: 0, minutes: 0 })),
      activeCount: sampleDeadlines.length,
      overdueCount: 0,
    })),
    DeadlineProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  };
});

// Mock router
jest.mock('expo-router', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  })),
  Link: ({ children }: { children: React.ReactNode }) => <>{children}</>,
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

  it('should render deadline cards with sample data', async () => {
    useGetDeadlines.mockImplementation(mockUseGetDeadlines);

    const { getByText } = render(<ActiveReads />);

    await waitFor(() => {
      // Should render deadline cards for all sample books
      expect(getByText('Letters to a Young Poet')).toBeTruthy();
      expect(getByText('The lean start up')).toBeTruthy();
      expect(getByText('Freeing the natural voice')).toBeTruthy();
      expect(getByText('The Way of Kings')).toBeTruthy();
      
      // Should show the page title
      expect(getByText('ACTIVE DEADLINES')).toBeTruthy();
      
      // Should show the add new book button
      expect(getByText('+ Add New Book')).toBeTruthy();
    });
  });
});