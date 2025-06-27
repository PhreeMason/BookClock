import { renderHook, act, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useDeleteDeadline } from '../useDeadlines';

// Mock Supabase
const mockSupabase = {
  from: jest.fn(),
};

jest.mock('@/lib/supabase', () => ({
  useSupabase: jest.fn(() => mockSupabase),
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
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );

  describe('Successful Deletion', () => {
    it('should delete progress entries and deadline successfully', async () => {
      // Mock successful deletion chain
      const mockProgressDelete = {
        eq: jest.fn(() => Promise.resolve({ error: null })),
      };
      const mockDeadlineDelete = {
        eq: jest.fn(() => Promise.resolve({ error: null })),
      };

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'reading_deadline_progress') {
          return { delete: jest.fn(() => mockProgressDelete) };
        }
        if (table === 'reading_deadlines') {
          return { 
            delete: jest.fn(() => ({
              eq: jest.fn(() => mockDeadlineDelete),
            })),
          };
        }
      });

      const { result } = renderHook(() => useDeleteDeadline(), { wrapper });

      let deletedId: string | undefined;
      await act(async () => {
        result.current.mutate('test-deadline-id', {
          onSuccess: (id) => {
            deletedId = id;
          },
        });
      });

      await waitFor(() => {
        expect(deletedId).toBe('test-deadline-id');
      });

      // Verify correct deletion order
      expect(mockSupabase.from).toHaveBeenCalledWith('reading_deadline_progress');
      expect(mockSupabase.from).toHaveBeenCalledWith('reading_deadlines');
      expect(mockProgressDelete.eq).toHaveBeenCalledWith('reading_deadline_id', 'test-deadline-id');
      expect(mockDeadlineDelete.eq).toHaveBeenCalledWith('user_id', 'test-user-id');
    });

    it('should invalidate queries after successful deletion', async () => {
      // Mock successful deletion
      mockSupabase.from.mockReturnValue({
        delete: jest.fn(() => ({
          eq: jest.fn(() => Promise.resolve({ error: null })),
        })),
      });

      const invalidateQueriesSpy = jest.spyOn(queryClient, 'invalidateQueries');

      const { result } = renderHook(() => useDeleteDeadline(), { wrapper });

      await act(async () => {
        result.current.mutate('test-deadline-id');
      });

      await waitFor(() => {
        expect(invalidateQueriesSpy).toHaveBeenCalledWith({
          queryKey: ['deadlines', 'test-user-id'],
        });
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle progress deletion error', async () => {
      // Mock progress deletion error
      const progressError = new Error('Failed to delete progress');
      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'reading_deadline_progress') {
          return {
            delete: jest.fn(() => ({
              eq: jest.fn(() => Promise.resolve({ 
                error: { message: 'Failed to delete progress' },
              })),
            })),
          };
        }
      });

      const { result } = renderHook(() => useDeleteDeadline(), { wrapper });

      let errorReceived: Error | undefined;
      await act(async () => {
        result.current.mutate('test-deadline-id', {
          onError: (error) => {
            errorReceived = error;
          },
        });
      });

      await waitFor(() => {
        expect(errorReceived?.message).toBe('Failed to delete progress');
      });

      // Should not attempt to delete deadline if progress deletion fails
      expect(mockSupabase.from).toHaveBeenCalledTimes(1);
      expect(mockSupabase.from).toHaveBeenCalledWith('reading_deadline_progress');
    });

    it('should handle deadline deletion error', async () => {
      // Mock successful progress deletion but failed deadline deletion
      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'reading_deadline_progress') {
          return {
            delete: jest.fn(() => ({
              eq: jest.fn(() => Promise.resolve({ error: null })),
            })),
          };
        }
        if (table === 'reading_deadlines') {
          return {
            delete: jest.fn(() => ({
              eq: jest.fn(() => ({
                eq: jest.fn(() => Promise.resolve({ 
                  error: { message: 'Failed to delete deadline' },
                })),
              })),
            })),
          };
        }
      });

      const { result } = renderHook(() => useDeleteDeadline(), { wrapper });

      let errorReceived: Error | undefined;
      await act(async () => {
        result.current.mutate('test-deadline-id', {
          onError: (error) => {
            errorReceived = error;
          },
        });
      });

      await waitFor(() => {
        expect(errorReceived?.message).toBe('Failed to delete deadline');
      });
    });

    it('should handle user not authenticated', async () => {
      // Mock no user
      const { useUser } = require('@clerk/clerk-expo');
      useUser.mockReturnValue({ user: null });

      const { result } = renderHook(() => useDeleteDeadline(), { wrapper });

      let errorReceived: Error | undefined;
      await act(async () => {
        result.current.mutate('test-deadline-id', {
          onError: (error) => {
            errorReceived = error;
          },
        });
      });

      await waitFor(() => {
        expect(errorReceived?.message).toBe('User not authenticated');
      });

      expect(mockSupabase.from).not.toHaveBeenCalled();
    });
  });

  describe('Mutation States', () => {
    it('should track loading state correctly', async () => {
      // Mock delayed response
      mockSupabase.from.mockReturnValue({
        delete: jest.fn(() => ({
          eq: jest.fn(() => new Promise((resolve) => {
            setTimeout(() => resolve({ error: null }), 100);
          })),
        })),
      });

      const { result } = renderHook(() => useDeleteDeadline(), { wrapper });

      expect(result.current.isPending).toBe(false);

      act(() => {
        result.current.mutate('test-deadline-id');
      });

      expect(result.current.isPending).toBe(true);

      await waitFor(() => {
        expect(result.current.isPending).toBe(false);
      });
    });

    it('should reset error state on new mutation', async () => {
      // First mutation with error
      mockSupabase.from.mockReturnValueOnce({
        delete: jest.fn(() => ({
          eq: jest.fn(() => Promise.resolve({ 
            error: { message: 'First error' },
          })),
        })),
      });

      const { result } = renderHook(() => useDeleteDeadline(), { wrapper });

      await act(async () => {
        result.current.mutate('test-deadline-id');
      });

      await waitFor(() => {
        expect(result.current.error?.message).toBe('First error');
      });

      // Second mutation success
      mockSupabase.from.mockReturnValue({
        delete: jest.fn(() => ({
          eq: jest.fn(() => Promise.resolve({ error: null })),
        })),
      });

      await act(async () => {
        result.current.mutate('another-deadline-id');
      });

      await waitFor(() => {
        expect(result.current.error).toBeNull();
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty deadline ID', async () => {
      const { result } = renderHook(() => useDeleteDeadline(), { wrapper });

      await act(async () => {
        result.current.mutate('');
      });

      // Should still attempt deletion with empty ID
      expect(mockSupabase.from).toHaveBeenCalled();
    });

    it('should handle concurrent deletion attempts', async () => {
      mockSupabase.from.mockReturnValue({
        delete: jest.fn(() => ({
          eq: jest.fn(() => new Promise((resolve) => {
            setTimeout(() => resolve({ error: null }), 100);
          })),
        })),
      });

      const { result } = renderHook(() => useDeleteDeadline(), { wrapper });

      // Start two deletions
      act(() => {
        result.current.mutate('deadline-1');
        result.current.mutate('deadline-2');
      });

      // Only the second one should be pending
      await waitFor(() => {
        expect(result.current.variables).toBe('deadline-2');
      });
    });
  });
});