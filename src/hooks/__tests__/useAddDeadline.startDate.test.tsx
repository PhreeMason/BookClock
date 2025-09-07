/**
 * @jest-environment jsdom
 */
import { useSupabase } from '@/lib/supabase';
import { useUser } from '@clerk/clerk-expo';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react';
import React from 'react';
import { useAddDeadline } from '../useDeadlines';

// Mock dependencies
jest.mock('@/lib/supabase');
jest.mock('@clerk/clerk-expo');

const mockSupabase = {
  rpc: jest.fn(),
  from: jest.fn(),
  functions: {
    invoke: jest.fn()
  }
};

const mockUser = {
  user: {
    id: 'test-user-123'
  }
};

describe('useAddDeadline - Start Date Handling', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    jest.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false }
      }
    });
    
    (useSupabase as jest.Mock).mockReturnValue(mockSupabase);
    (useUser as jest.Mock).mockReturnValue(mockUser);

    // Setup default mock implementations
    mockSupabase.rpc.mockImplementation((fnName) => {
      if (fnName === 'generate_prefixed_id') {
        return { 
          data: 'test_id_123', 
          error: null 
        };
      }
      return { data: null, error: null };
    });

    mockSupabase.from.mockImplementation((table) => ({
      insert: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      single: jest.fn().mockImplementation(() => {
        if (table === 'reading_deadlines') {
          return Promise.resolve({
            data: { id: 'rd_123', created_at: new Date().toISOString() },
            error: null
          });
        }
        if (table === 'reading_deadline_progress') {
          return Promise.resolve({
            data: { id: 'rdp_123', created_at: new Date().toISOString() },
            error: null
          });
        }
        if (table === 'reading_deadline_status') {
          return Promise.resolve({
            data: { id: 'rds_123', status: 'reading', created_at: new Date().toISOString() },
            error: null
          });
        }
        return Promise.resolve({ data: null, error: null });
      })
    }));
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );

  it('should pass startDate to progress entry created_at when provided', async () => {
    const startDate = new Date('2025-01-08T12:00:00Z');
    const mockProgressInsert = jest.fn().mockReturnThis();
    const mockProgressSelect = jest.fn().mockReturnThis();
    const mockProgressSingle = jest.fn().mockResolvedValue({
      data: { id: 'rdp_123', created_at: startDate.toISOString() },
      error: null
    });

    mockSupabase.from.mockImplementation((table) => {
      if (table === 'reading_deadline_progress') {
        return {
          insert: mockProgressInsert,
          select: mockProgressSelect,
          single: mockProgressSingle
        };
      }
      return {
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: {}, error: null })
      };
    });

    const { result } = renderHook(() => useAddDeadline(), { wrapper });

    await act(async () => {
      await result.current.mutateAsync({
        deadlineDetails: {
          id: '',
          book_title: 'Test Book',
          deadline_date: new Date('2025-02-15').toISOString(),
          total_quantity: 300,
          format: 'physical',
          source: 'personal',
          flexibility: 'flexible',
          author: null,
          book_id: null
        },
        progressDetails: {
          id: '',
          current_progress: 100,
          reading_deadline_id: '',
          created_at: startDate.toISOString() // This should be passed through
        },
        startDate
      });
    });

    // Verify that the progress entry was created with the start date in created_at
    expect(mockProgressInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        created_at: startDate.toISOString(),
        current_progress: 100
      })
    );
  });

  it('should pass startDate to status entry created_at when provided', async () => {
    const startDate = new Date('2025-01-08T12:00:00Z');
    const mockStatusInsert = jest.fn().mockReturnThis();
    const mockStatusSelect = jest.fn().mockReturnThis();
    const mockStatusSingle = jest.fn().mockResolvedValue({
      data: { id: 'rds_123', status: 'reading', created_at: startDate.toISOString() },
      error: null
    });

    mockSupabase.from.mockImplementation((table) => {
      if (table === 'reading_deadline_status') {
        return {
          insert: mockStatusInsert,
          select: mockStatusSelect,
          single: mockStatusSingle
        };
      }
      return {
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: {}, error: null })
      };
    });

    const { result } = renderHook(() => useAddDeadline(), { wrapper });

    await act(async () => {
      await result.current.mutateAsync({
        deadlineDetails: {
          id: '',
          book_title: 'Test Book',
          deadline_date: new Date('2025-02-15').toISOString(),
          total_quantity: 300,
          format: 'physical',
          source: 'personal',
          flexibility: 'flexible',
          author: null,
          book_id: null
        },
        progressDetails: {
          id: '',
          current_progress: 100,
          reading_deadline_id: ''
        },
        startDate
      });
    });

    // Verify that the status entry was created with the start date
    expect(mockStatusInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'reading',
        created_at: startDate.toISOString()
      })
    );
  });

  it('should use current date for status when no startDate provided', async () => {
    const now = new Date();
    jest.useFakeTimers();
    jest.setSystemTime(now);

    const mockStatusInsert = jest.fn().mockReturnThis();
    const mockStatusSelect = jest.fn().mockReturnThis();
    const mockStatusSingle = jest.fn().mockResolvedValue({
      data: { id: 'rds_123', status: 'reading', created_at: now.toISOString() },
      error: null
    });

    mockSupabase.from.mockImplementation((table) => {
      if (table === 'reading_deadline_status') {
        return {
          insert: mockStatusInsert,
          select: mockStatusSelect,
          single: mockStatusSingle
        };
      }
      return {
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: {}, error: null })
      };
    });

    const { result } = renderHook(() => useAddDeadline(), { wrapper });

    await act(async () => {
      await result.current.mutateAsync({
        deadlineDetails: {
          id: '',
          book_title: 'Test Book',
          deadline_date: new Date('2025-02-15').toISOString(),
          total_quantity: 300,
          format: 'physical',
          source: 'personal',
          flexibility: 'flexible',
          author: null,
          book_id: null
        },
        progressDetails: {
          id: '',
          current_progress: 0,
          reading_deadline_id: ''
        }
        // No startDate provided
      });
    });

    // Verify that the status entry was created with current time
    expect(mockStatusInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'reading',
        created_at: now.toISOString()
      })
    );

    jest.useRealTimers();
  });

  it('should not affect deadline created_at when startDate is provided', async () => {
    const startDate = new Date('2025-01-08T12:00:00Z');
    const mockDeadlineInsert = jest.fn().mockReturnThis();
    const mockDeadlineSelect = jest.fn().mockReturnThis();
    const mockDeadlineSingle = jest.fn().mockResolvedValue({
      data: { id: 'rd_123', created_at: new Date().toISOString() },
      error: null
    });

    mockSupabase.from.mockImplementation((table) => {
      if (table === 'reading_deadlines') {
        return {
          insert: mockDeadlineInsert,
          select: mockDeadlineSelect,
          single: mockDeadlineSingle
        };
      }
      return {
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: {}, error: null })
      };
    });

    const { result } = renderHook(() => useAddDeadline(), { wrapper });

    await act(async () => {
      await result.current.mutateAsync({
        deadlineDetails: {
          id: '',
          book_title: 'Test Book',
          deadline_date: new Date('2025-02-15').toISOString(),
          total_quantity: 300,
          format: 'physical',
          source: 'personal',
          flexibility: 'flexible',
          author: null,
          book_id: null
        },
        progressDetails: {
          id: '',
          current_progress: 100,
          reading_deadline_id: ''
        },
        startDate
      });
    });

    // Verify that the deadline was NOT created with the start date
    // It should use the default (current time) for created_at
    expect(mockDeadlineInsert).toHaveBeenCalledWith(
      expect.not.objectContaining({
        created_at: startDate.toISOString()
      })
    );
  });

  it('should handle errors when inserting with backdated created_at', async () => {
    const startDate = new Date('2025-01-08T12:00:00Z');
    const errorMessage = 'Database error';

    mockSupabase.from.mockImplementation((table) => {
      if (table === 'reading_deadline_progress') {
        return {
          insert: jest.fn().mockReturnThis(),
          select: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({
            data: null,
            error: { message: errorMessage }
          })
        };
      }
      return {
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: {}, error: null })
      };
    });

    const { result } = renderHook(() => useAddDeadline(), { wrapper });

    await expect(
      act(async () => {
        await result.current.mutateAsync({
          deadlineDetails: {
            id: '',
            book_title: 'Test Book',
            deadline_date: new Date('2025-02-15').toISOString(),
            total_quantity: 300,
            format: 'physical',
            source: 'personal',
            flexibility: 'flexible',
            author: null,
            book_id: null
          },
          progressDetails: {
            id: '',
            current_progress: 100,
            reading_deadline_id: '',
            created_at: startDate.toISOString()
          },
          startDate
        });
      })
    ).rejects.toThrow(errorMessage);
  });
});