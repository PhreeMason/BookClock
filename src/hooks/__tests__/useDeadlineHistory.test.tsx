import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useUser } from '@clerk/clerk-expo';
import { useDeadlineHistory } from '../useReadingHistory';
import { useSupabase } from '@/lib/supabase';
import { sampleDeadlines, getSampleDeadlines, getSampleDeadlinesByFormat } from '@/__tests__/fixtures/sampleDeadlines';

// Mock dependencies
jest.mock('@clerk/clerk-expo');
jest.mock('@/lib/supabase');

const mockUseUser = useUser as jest.MockedFunction<typeof useUser>;
const mockUseSupabase = useSupabase as jest.MockedFunction<typeof useSupabase>;

const mockSupabaseClient = {
  from: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  in: jest.fn().mockReturnThis(),
  order: jest.fn().mockReturnThis(),
  gte: jest.fn().mockReturnThis(),
};

// Helper function to convert sample deadlines to Supabase format
const convertToSupabaseFormat = (deadlines: typeof sampleDeadlines) => {
  return deadlines.map(deadline => ({
    id: deadline.id,
    book_title: deadline.book_title,
    author: deadline.author,
    format: deadline.format,
    total_quantity: deadline.total_quantity,
    deadline_date: deadline.deadline_date,
    source: deadline.source,
    flexibility: deadline.flexibility,
    created_at: deadline.created_at,
    reading_deadline_progress: deadline.progress.map(p => ({
      id: p.id,
      current_progress: p.current_progress,
      created_at: p.created_at,
      updated_at: p.updated_at,
    })),
  }));
};

describe('useDeadlineHistory', () => {
  let queryClient: QueryClient;

  const mockUser = {
    id: 'test-user-id',
    firstName: 'Test',
    lastName: 'User',
    emailAddresses: [{ emailAddress: 'test@example.com' }],
  };

  const mockDeadlineData = convertToSupabaseFormat(getSampleDeadlines(3)); // Use first 3 sample deadlines

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    mockUseUser.mockReturnValue({
      user: mockUser,
      isLoaded: true,
      isSignedIn: true,
    } as any);

    mockUseSupabase.mockReturnValue(mockSupabaseClient as any);

    // Reset all mocks
    jest.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it('should fetch and process deadline history successfully', async () => {
    mockSupabaseClient.from.mockReturnValue({
      ...mockSupabaseClient,
      select: jest.fn().mockReturnValue({
        ...mockSupabaseClient,
        eq: jest.fn().mockReturnValue({
          ...mockSupabaseClient,
          in: jest.fn().mockReturnValue({
            ...mockSupabaseClient,
            order: jest.fn().mockResolvedValue({
              data: mockDeadlineData,
              error: null,
            }),
          }),
        }),
      }),
    });

    const { result } = renderHook(() => useDeadlineHistory(), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toBeDefined();
    expect(result.current.data?.entries.length).toBeGreaterThan(0); // Should have some activity days
    expect(result.current.data?.summary.totalDays).toBeGreaterThan(0);
    expect(result.current.data?.summary.activeDeadlines).toBeGreaterThanOrEqual(0);
    expect(result.current.data?.summary.completedDeadlines).toBeGreaterThanOrEqual(0);
  });

  it('should handle date range filtering', async () => {
    mockSupabaseClient.from.mockReturnValue({
      ...mockSupabaseClient,
      select: jest.fn().mockReturnValue({
        ...mockSupabaseClient,
        eq: jest.fn().mockReturnValue({
          ...mockSupabaseClient,
          in: jest.fn().mockReturnValue({
            ...mockSupabaseClient,
            order: jest.fn().mockResolvedValue({
              data: mockDeadlineData,
              error: null,
            }),
          }),
        }),
      }),
    });

    const { result } = renderHook(
      () => useDeadlineHistory({ dateRange: '7d' }),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    // Should only include entries from Jan 2nd onwards due to date filtering
    expect(result.current.data?.entries.length).toBeLessThanOrEqual(2);
  });

  it('should handle format filtering for reading only', async () => {
    const readingDeadlines = convertToSupabaseFormat(getSampleDeadlinesByFormat('physical'));
    
    mockSupabaseClient.from.mockReturnValue({
      ...mockSupabaseClient,
      select: jest.fn().mockReturnValue({
        ...mockSupabaseClient,
        eq: jest.fn().mockReturnValue({
          ...mockSupabaseClient,
          in: jest.fn().mockReturnValue({
            ...mockSupabaseClient,
            order: jest.fn().mockResolvedValue({
              data: readingDeadlines,
              error: null,
            }),
          }),
        }),
      }),
    });

    const { result } = renderHook(
      () => useDeadlineHistory({ formatFilter: 'reading' }),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    // Should only include physical/ebook deadlines
    result.current.data?.entries.forEach(entry => {
      entry.deadlines.forEach(deadline => {
        expect(['physical', 'ebook']).toContain(deadline.format);
      });
    });
  });

  it('should handle format filtering for listening only', async () => {
    const audioDeadlines = convertToSupabaseFormat(getSampleDeadlinesByFormat('audio'));
    
    mockSupabaseClient.from.mockReturnValue({
      ...mockSupabaseClient,
      select: jest.fn().mockReturnValue({
        ...mockSupabaseClient,
        eq: jest.fn().mockReturnValue({
          ...mockSupabaseClient,
          in: jest.fn().mockReturnValue({
            ...mockSupabaseClient,
            order: jest.fn().mockResolvedValue({
              data: audioDeadlines,
              error: null,
            }),
          }),
        }),
      }),
    });

    const { result } = renderHook(
      () => useDeadlineHistory({ formatFilter: 'listening' }),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    // Should only include audio deadlines
    result.current.data?.entries.forEach(entry => {
      entry.deadlines.forEach(deadline => {
        expect(deadline.format).toBe('audio');
      });
    });
  });

  it('should calculate daily progress correctly', async () => {
    mockSupabaseClient.from.mockReturnValue({
      ...mockSupabaseClient,
      select: jest.fn().mockReturnValue({
        ...mockSupabaseClient,
        eq: jest.fn().mockReturnValue({
          ...mockSupabaseClient,
          in: jest.fn().mockReturnValue({
            ...mockSupabaseClient,
            order: jest.fn().mockResolvedValue({
              data: mockDeadlineData,
              error: null,
            }),
          }),
        }),
      }),
    });

    const { result } = renderHook(() => useDeadlineHistory(), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    const entries = result.current.data?.entries || [];
    
    // Find entry for 2024-01-02
    const jan2Entry = entries.find(e => e.date === '2024-01-02');
    expect(jan2Entry).toBeDefined();
    
    // Should have progress from both deadlines on Jan 2
    expect(jan2Entry?.deadlines).toHaveLength(2);
    
    // Check progress calculations
    const physicalDeadline = jan2Entry?.deadlines.find(d => d.format === 'physical');
    expect(physicalDeadline?.progress_made).toBe(50); // 100 - 50 = 50 pages
    
    const audioDeadline = jan2Entry?.deadlines.find(d => d.format === 'audio');
    expect(audioDeadline?.progress_made).toBe(60); // First entry, should be 60 minutes
  });

  it('should generate calendar data correctly', async () => {
    mockSupabaseClient.from.mockReturnValue({
      ...mockSupabaseClient,
      select: jest.fn().mockReturnValue({
        ...mockSupabaseClient,
        eq: jest.fn().mockReturnValue({
          ...mockSupabaseClient,
          in: jest.fn().mockReturnValue({
            ...mockSupabaseClient,
            order: jest.fn().mockResolvedValue({
              data: mockDeadlineData,
              error: null,
            }),
          }),
        }),
      }),
    });

    const { result } = renderHook(() => useDeadlineHistory(), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.calendarData).toBeDefined();
    
    // Should have marked dates for days with activity
    const markedDates = Object.keys(result.current.calendarData);
    expect(markedDates.length).toBeGreaterThan(0);
    
    // Check color coding
    const jan2Data = result.current.calendarData['2024-01-02'];
    expect(jan2Data?.marked).toBe(true);
    expect(jan2Data?.dotColor).toBe('#purple'); // Mixed reading and listening
  });

  it('should handle errors gracefully', async () => {
    mockSupabaseClient.from.mockReturnValue({
      ...mockSupabaseClient,
      select: jest.fn().mockReturnValue({
        ...mockSupabaseClient,
        eq: jest.fn().mockReturnValue({
          ...mockSupabaseClient,
          in: jest.fn().mockReturnValue({
            ...mockSupabaseClient,
            order: jest.fn().mockResolvedValue({
              data: null,
              error: new Error('Database error'),
            }),
          }),
        }),
      }),
    });

    const { result } = renderHook(() => useDeadlineHistory(), { wrapper });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toBeDefined();
  });

  it('should not fetch data when user is not authenticated', () => {
    mockUseUser.mockReturnValue({
      user: null,
      isLoaded: true,
      isSignedIn: false,
    } as any);

    const { result } = renderHook(() => useDeadlineHistory(), { wrapper });

    expect(result.current.data).toBeUndefined();
    expect(result.current.isLoading).toBe(false);
    expect(mockSupabaseClient.from).not.toHaveBeenCalled();
  });

  it('should calculate completed deadlines correctly', async () => {
    const completedDeadlineData = [
      {
        ...mockDeadlineData[0],
        reading_deadline_progress: [
          {
            id: 'progress-completed',
            current_progress: 300, // Completed (matches total_quantity)
            created_at: '2024-01-01T10:00:00Z',
            updated_at: '2024-01-01T10:00:00Z',
          },
        ],
      },
    ];

    mockSupabaseClient.from.mockReturnValue({
      ...mockSupabaseClient,
      select: jest.fn().mockReturnValue({
        ...mockSupabaseClient,
        eq: jest.fn().mockReturnValue({
          ...mockSupabaseClient,
          in: jest.fn().mockReturnValue({
            ...mockSupabaseClient,
            order: jest.fn().mockResolvedValue({
              data: completedDeadlineData,
              error: null,
            }),
          }),
        }),
      }),
    });

    const { result } = renderHook(() => useDeadlineHistory(), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.summary.completedDeadlines).toBe(1);
    expect(result.current.data?.summary.activeDeadlines).toBe(0);
  });
});