import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useDeleteDeadline } from '../useDeadlines';

// Mock Supabase
const mockFrom = jest.fn();

jest.mock('@/lib/supabase', () => ({
  useSupabase: () => ({
    from: mockFrom,
  }),
}));

// Mock Clerk
jest.mock('@clerk/clerk-expo', () => ({
  useUser: jest.fn(() => ({
    user: { id: 'test-user-id' },
  })),
}));

describe('useDeleteDeadline', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    jest.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    // Setup default mock chain for chained .eq() calls
    mockFrom.mockImplementation((table: string) => ({
      delete: () => ({
        eq: (field: string, value: string) => {
          if (table === 'reading_deadline_progress') {
            // Single .eq() call for progress table
            return Promise.resolve({ error: null });
          }
          if (table === 'reading_deadlines') {
            // Chained .eq() calls for deadlines table
            return {
              eq: (field2: string, value2: string) => Promise.resolve({ error: null }),
            };
          }
          return Promise.resolve({ error: null });
        },
      }),
    }));
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );

  describe('Successful Deletion', () => {
    it('should delete progress entries and deadline successfully', async () => {
      const { result } = renderHook(() => useDeleteDeadline(), { wrapper });

      // Call the mutation
      result.current.mutate('test-deadline-id');

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      // Verify deletion order
      expect(mockFrom).toHaveBeenCalledWith('reading_deadline_progress');
      expect(mockFrom).toHaveBeenCalledWith('reading_deadlines');
      expect(mockFrom).toHaveBeenCalledTimes(2);
    });
  });

  describe('Error Handling', () => {
    it('should handle progress deletion error', async () => {
      // Setup error for progress deletion
      mockFrom.mockImplementation((table: string) => ({
        delete: () => ({
          eq: (field: string, value: string) => {
            if (table === 'reading_deadline_progress') {
              return Promise.resolve({ 
                error: { message: 'Failed to delete progress' },
              });
            }
            return Promise.resolve({ error: null });
          },
        }),
      }));

      const { result } = renderHook(() => useDeleteDeadline(), { wrapper });

      result.current.mutate('test-deadline-id');

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
        expect(result.current.error?.message).toBe('Failed to delete progress');
      });

      // Should not attempt to delete deadline if progress deletion fails
      expect(mockFrom).toHaveBeenCalledTimes(1);
    });

    it('should handle deadline deletion error', async () => {
      // Progress deletion succeeds, deadline deletion fails
      mockFrom.mockImplementation((table: string) => ({
        delete: () => ({
          eq: (field: string, value: string) => {
            if (table === 'reading_deadline_progress') {
              return Promise.resolve({ error: null });
            }
            if (table === 'reading_deadlines') {
              return {
                eq: (field2: string, value2: string) => Promise.resolve({ 
                  error: { message: 'Failed to delete deadline' },
                }),
              };
            }
            return Promise.resolve({ error: null });
          },
        }),
      }));

      const { result } = renderHook(() => useDeleteDeadline(), { wrapper });

      result.current.mutate('test-deadline-id');

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
        expect(result.current.error?.message).toBe('Failed to delete deadline');
      });
    });

    it('should handle user not authenticated', async () => {
      // Mock no user
      const { useUser } = require('@clerk/clerk-expo');
      useUser.mockReturnValueOnce({ user: null });

      const { result } = renderHook(() => useDeleteDeadline(), { wrapper });

      result.current.mutate('test-deadline-id');

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
        expect(result.current.error?.message).toBe('User not authenticated');
      });

      expect(mockFrom).not.toHaveBeenCalled();
    });
  });

  describe('Mutation States', () => {
    it('should track mutation states correctly', async () => {
      const { result } = renderHook(() => useDeleteDeadline(), { wrapper });

      // Initial state
      expect(result.current.isPending).toBe(false);
      expect(result.current.isIdle).toBe(true);

      // Start mutation
      result.current.mutate('test-deadline-id');

      // Wait for success
      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toBe('test-deadline-id');
    });
  });
});