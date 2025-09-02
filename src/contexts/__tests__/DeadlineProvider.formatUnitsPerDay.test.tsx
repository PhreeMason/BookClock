import { renderHook } from '@testing-library/react-native';
import React from 'react';

// Unmock the DeadlineProvider to use the real implementation
jest.unmock('../DeadlineProvider');

// Import after unmocking to get the real implementation
import { DeadlineProvider, useDeadlines } from '../DeadlineProvider';

// Mock only the hooks that are needed
jest.mock('@/hooks/useDeadlines', () => ({
  useGetDeadlines: jest.fn(() => ({
    data: [],
    error: null,
    isLoading: false,
  })),
  useAddDeadline: jest.fn(() => ({ mutate: jest.fn() })),
  useUpdateDeadline: jest.fn(() => ({ mutate: jest.fn() })),
  useDeleteDeadline: jest.fn(() => ({ mutate: jest.fn() })),
  useCompleteDeadline: jest.fn(() => ({ mutate: jest.fn() })),
  useSetAsideDeadline: jest.fn(() => ({ mutate: jest.fn() })),
  useReactivateDeadline: jest.fn(() => ({ mutate: jest.fn() })),
}));

describe('DeadlineProvider - formatUnitsPerDay', () => {
  const createWrapper = () => ({ children }: { children: React.ReactNode }) => (
    <DeadlineProvider>{children}</DeadlineProvider>
  );

  describe('Current behavior (standard cases)', () => {
    it('should format standard daily reading pace', () => {
      const { result } = renderHook(() => useDeadlines(), { wrapper: createWrapper() });
      
      // Test normal cases that should still work
      expect(result.current.formatUnitsPerDay(1, 'physical')).toBe('1 pages/day needed');
      expect(result.current.formatUnitsPerDay(5, 'physical')).toBe('5 pages/day needed');
      expect(result.current.formatUnitsPerDay(10, 'ebook')).toBe('10 pages/day needed');
    });

    it('should format audio time correctly', () => {
      const { result } = renderHook(() => useDeadlines(), { wrapper: createWrapper() });
      
      // Test audio formatting
      expect(result.current.formatUnitsPerDay(60, 'audio')).toBe('1h/day needed');
      expect(result.current.formatUnitsPerDay(90, 'audio')).toBe('1h 30m/day needed');
      expect(result.current.formatUnitsPerDay(30, 'audio')).toBe('30 minutes/day needed');
    });
  });

  describe('Low pace scenarios (< 1 unit/day) - NEW BEHAVIOR', () => {
    it('should handle Rona book scenario: 52 pages over 372 days', () => {
      const { result } = renderHook(() => useDeadlines(), { wrapper: createWrapper() });
      
      // Test the new display function with actual remaining and daysLeft values
      const remaining = 52;
      const daysLeft = 372;
      const unitsPerDay = Math.ceil(remaining / daysLeft); // This would be 1 (rounded up)
      const formattedResult = result.current.formatUnitsPerDayForDisplay(unitsPerDay, 'physical', remaining, daysLeft);
      expect(formattedResult).toBe('1 page/week');
    });

    it('should handle very low pace scenarios', () => {
      const { result } = renderHook(() => useDeadlines(), { wrapper: createWrapper() });
      
      // Test case: 100 pages over 500 days = 0.2 pages/day = 1 page every 5 days
      const remaining = 100;
      const daysLeft = 500;
      const unitsPerDay = Math.ceil(remaining / daysLeft); // This would be 1 (rounded up)
      const formattedResult = result.current.formatUnitsPerDayForDisplay(unitsPerDay, 'physical', remaining, daysLeft);
      expect(formattedResult).toBe('1 page every 5 days');
    });

    it('should handle audio low pace scenarios', () => {
      const { result } = renderHook(() => useDeadlines(), { wrapper: createWrapper() });
      
      // Test case: 30 minutes over 60 days = 0.5 minutes/day = 1 minute every 2 days
      const remaining = 30;
      const daysLeft = 60;
      const unitsPerDay = Math.ceil(remaining / daysLeft); // This would be 1 (rounded up)
      const formattedResult = result.current.formatUnitsPerDayForDisplay(unitsPerDay, 'audio', remaining, daysLeft);
      expect(formattedResult).toBe('1 minute every 2 days');
    });

    it('should handle edge case: exactly 1 unit per day', () => {
      const { result } = renderHook(() => useDeadlines(), { wrapper: createWrapper() });
      
      // Should still show the standard format for exactly 1
      expect(result.current.formatUnitsPerDay(1, 'physical')).toBe('1 pages/day needed');
      expect(result.current.formatUnitsPerDay(1, 'ebook')).toBe('1 pages/day needed');
    });

    it('should handle additional low pace test cases', () => {
      const { result } = renderHook(() => useDeadlines(), { wrapper: createWrapper() });
      
      // Test various low pace scenarios using the new display function
      expect(result.current.formatUnitsPerDayForDisplay(1, 'physical', 10, 100)).toBe('1 page every 10 days');
      expect(result.current.formatUnitsPerDayForDisplay(1, 'ebook', 25, 100)).toBe('1 page every 4 days');
      expect(result.current.formatUnitsPerDayForDisplay(1, 'audio', 33, 100)).toBe('1 minute every 3 days');
    });

    it('should handle week-based formatting', () => {
      const { result } = renderHook(() => useDeadlines(), { wrapper: createWrapper() });
      
      // Test week-based scenarios using the new display function
      expect(result.current.formatUnitsPerDayForDisplay(1, 'physical', 1, 7)).toBe('1 page/week');
      expect(result.current.formatUnitsPerDayForDisplay(1, 'physical', 1, 14)).toBe('1 page/2 weeks');
      expect(result.current.formatUnitsPerDayForDisplay(1, 'ebook', 1, 21)).toBe('1 page/3 weeks');
      expect(result.current.formatUnitsPerDayForDisplay(1, 'physical', 1, 28)).toBe('1 page/month');
      
      // Test audio week-based scenarios
      expect(result.current.formatUnitsPerDayForDisplay(1, 'audio', 1, 7)).toBe('1 minute/week');
      expect(result.current.formatUnitsPerDayForDisplay(1, 'audio', 1, 14)).toBe('1 minute/2 weeks');
    });
  });
});

describe('DeadlineProvider - Integration tests', () => {
  const createWrapper = () => ({ children }: { children: React.ReactNode }) => (
    <DeadlineProvider>{children}</DeadlineProvider>
  );

  describe('End-to-end Rona book scenario', () => {
    it('should show "1 page/week" for Rona book (52 pages, 372 days)', () => {
      const { result } = renderHook(() => useDeadlines(), { wrapper: createWrapper() });
      
      // Test the exact scenario from the screenshot using the new display function
      const remaining = 52;
      const daysLeft = 372;
      const unitsPerDay = Math.ceil(remaining / daysLeft); // This would be 1 (rounded up)
      const formattedResult = result.current.formatUnitsPerDayForDisplay(unitsPerDay, 'physical', remaining, daysLeft);
      
      expect(formattedResult).toBe('1 page/week');
    });

    it('should handle edge cases near 1 unit per day correctly', () => {
      const { result } = renderHook(() => useDeadlines(), { wrapper: createWrapper() });
      
      // Test values just below and above 1 using the display function
      expect(result.current.formatUnitsPerDayForDisplay(1, 'physical', 99, 100)).toBe('1 page every 1 days');
      expect(result.current.formatUnitsPerDayForDisplay(2, 'physical', 101, 100)).toBe('2 pages/day needed');
    });

    it('should calculate decimal values correctly (testing calculateUnitsPerDay indirectly)', () => {
      // Test that the display function works with very small fractions
      const { result } = renderHook(() => useDeadlines(), { wrapper: createWrapper() });
      
      // Very small fraction should work - 1 page over 100 days
      expect(result.current.formatUnitsPerDayForDisplay(1, 'physical', 1, 100)).toBe('1 page every 100 days');
      
      // Test some week-based calculations - 1 page over 35 days = 5 weeks
      expect(result.current.formatUnitsPerDayForDisplay(1, 'physical', 1, 35)).toBe('1 page/5 weeks');
    });
  });
});