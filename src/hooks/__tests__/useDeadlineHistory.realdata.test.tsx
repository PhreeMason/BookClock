import { useSupabase } from '@/lib/supabase';
import { useUser } from '@clerk/clerk-expo';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react-native';
import { useDeadlineHistory } from '../useReadingHistory';

// Mock dependencies
jest.mock('@clerk/clerk-expo');
jest.mock('@/lib/supabase');

const mockUseUser = useUser as jest.MockedFunction<typeof useUser>;
const mockUseSupabase = useSupabase as jest.MockedFunction<typeof useSupabase>;

// User's actual deadline data from the bug report
const realUserData = [
  {
    "id": "rd_3334d0efe76545e9",
    "book_title": "Letters to a Young Poet",
    "author": "Rainer Maria Rilke",
    "format": "physical",
    "source": "personal",
    "total_quantity": 52,
    "deadline_date": "2025-07-11T21:11:00+00:00",
    "flexibility": "flexible",
    "user_id": "user_2yqCu9TotmCYVGwIJlnr5XfOMxJ",
    "created_at": "2025-06-26T21:13:29.617564+00:00",
    "updated_at": "2025-06-27T05:13:59.777+00:00",
    "reading_deadline_progress": [
      {
        "id": "rdp_09af60dd299b40dd",
        "created_at": "2025-06-26T21:13:29.773601+00:00",
        "updated_at": "2025-06-27T05:13:59.913+00:00",
        "current_progress": 37,
        "reading_deadline_id": "rd_3334d0efe76545e9"
      },
      {
        "id": "rdp_32f359f56c4d4ab2",
        "created_at": "2025-06-28T00:54:07.324+00:00",
        "updated_at": "2025-06-28T00:54:07.324+00:00",
        "current_progress": 39,
        "reading_deadline_id": "rd_3334d0efe76545e9"
      }
    ]
  },
  {
    "id": "rd_1546b109fce34579",
    "book_title": "The lean start up",
    "author": "Eric Ries",
    "format": "audio",
    "source": "personal",
    "total_quantity": 519,
    "deadline_date": "2025-07-31T06:47:00+00:00",
    "flexibility": "flexible",
    "user_id": "user_2yqCu9TotmCYVGwIJlnr5XfOMxJ",
    "created_at": "2025-06-21T05:46:43.766915+00:00",
    "updated_at": "2025-06-21T05:46:43.766915+00:00",
    "reading_deadline_progress": [
      {
        "id": "rdp_6c150511684b407b",
        "created_at": "2025-06-21T05:46:43.766915+00:00",
        "updated_at": "2025-06-21T05:46:43.766915+00:00",
        "current_progress": 281,
        "reading_deadline_id": "rd_1546b109fce34579"
      },
      {
        "id": "rdp_f28d8558fb9445f9",
        "created_at": "2025-06-27T02:49:52.547+00:00",
        "updated_at": "2025-06-27T02:49:52.547+00:00",
        "current_progress": 302,
        "reading_deadline_id": "rd_1546b109fce34579"
      },
      {
        "id": "rdp_02fdff7295a84fa4",
        "created_at": "2025-06-27T17:04:16.402+00:00",
        "updated_at": "2025-06-27T17:04:16.402+00:00",
        "current_progress": 344,
        "reading_deadline_id": "rd_1546b109fce34579"
      },
      {
        "id": "rdp_fdce0dfcc22249dd",
        "created_at": "2025-06-27T17:59:24.503+00:00",
        "updated_at": "2025-06-27T17:59:24.503+00:00",
        "current_progress": 346,
        "reading_deadline_id": "rd_1546b109fce34579"
      },
      {
        "id": "rdp_09670755ee9142dd",
        "created_at": "2025-06-27T17:59:32.686+00:00",
        "updated_at": "2025-06-27T17:59:32.686+00:00",
        "current_progress": 344,
        "reading_deadline_id": "rd_1546b109fce34579"
      },
      {
        "id": "rdp_0515ca7f8d7b4e41",
        "created_at": "2025-06-30T20:06:18.398+00:00",
        "updated_at": "2025-06-30T20:06:18.398+00:00",
        "current_progress": 350,
        "reading_deadline_id": "rd_1546b109fce34579"
      }
    ]
  },
  {
    "id": "rd_e3aab91b52044931",
    "book_title": "Freeing the natural voice",
    "author": "Kristin Linklater",
    "format": "physical",
    "source": "library",
    "total_quantity": 374,
    "deadline_date": "2025-09-01T03:55:00+00:00",
    "flexibility": "flexible",
    "user_id": "user_2yqCu9TotmCYVGwIJlnr5XfOMxJ",
    "created_at": "2025-06-26T04:03:53.45453+00:00",
    "updated_at": "2025-06-27T06:31:10.995+00:00",
    "reading_deadline_progress": [
      {
        "id": "rdp_a0ecad9e56d84ffa",
        "created_at": "2025-06-26T04:03:53.745677+00:00",
        "updated_at": "2025-06-27T06:31:12.37+00:00",
        "current_progress": 31,
        "reading_deadline_id": "rd_e3aab91b52044931"
      },
      {
        "id": "rdp_573b6fdcb61e47ad",
        "created_at": "2025-06-28T04:45:39.085+00:00",
        "updated_at": "2025-06-28T04:45:39.085+00:00",
        "current_progress": 41,
        "reading_deadline_id": "rd_e3aab91b52044931"
      }
    ]
  },
  {
    "id": "rd_983950d544304c7c",
    "book_title": "Dungeon Crawler Carl This Inevitable Ruin",
    "author": "Matt Dinniman",
    "format": "audio",
    "source": "personal",
    "total_quantity": 1720,
    "deadline_date": "2025-12-31T07:57:00+00:00",
    "flexibility": "strict",
    "user_id": "user_2yqCu9TotmCYVGwIJlnr5XfOMxJ",
    "created_at": "2025-06-21T05:46:43.766915+00:00",
    "updated_at": "2025-06-21T05:46:43.766915+00:00",
    "reading_deadline_progress": [
      {
        "id": "rdp_4a352499cc5a4881",
        "created_at": "2025-06-21T05:46:43.766915+00:00",
        "updated_at": "2025-06-21T05:46:43.766915+00:00",
        "current_progress": 1272,
        "reading_deadline_id": "rd_983950d544304c7c"
      },
      {
        "id": "rdp_95cd40345f5e4e34",
        "created_at": "2025-06-28T01:49:16.59+00:00",
        "updated_at": "2025-06-28T01:49:16.59+00:00",
        "current_progress": 1358,
        "reading_deadline_id": "rd_983950d544304c7c"
      },
      {
        "id": "rdp_46f964d27d2349d6",
        "created_at": "2025-06-28T16:49:01.786+00:00",
        "updated_at": "2025-06-28T16:49:01.786+00:00",
        "current_progress": 1385,
        "reading_deadline_id": "rd_983950d544304c7c"
      },
      {
        "id": "rdp_700977d09964440d",
        "created_at": "2025-06-29T09:26:20.461+00:00",
        "updated_at": "2025-06-29T09:26:20.461+00:00",
        "current_progress": 1499,
        "reading_deadline_id": "rd_983950d544304c7c"
      },
      {
        "id": "rdp_830fa32632ce4573",
        "created_at": "2025-06-30T20:06:38.123+00:00",
        "updated_at": "2025-06-30T20:06:38.123+00:00",
        "current_progress": 1505,
        "reading_deadline_id": "rd_983950d544304c7c"
      },
      {
        "id": "rdp_c21c434e0e6a436a",
        "created_at": "2025-07-01T12:26:39.442+00:00",
        "updated_at": "2025-07-01T12:26:39.442+00:00",
        "current_progress": 1559,
        "reading_deadline_id": "rd_983950d544304c7c"
      }
    ]
  }
];

const mockSupabaseClient = {
  from: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  in: jest.fn().mockReturnThis(),
  order: jest.fn().mockReturnThis(),
  gte: jest.fn().mockReturnThis(),
};

describe('useDeadlineHistory - Real User Data Bug Reproduction', () => {
  let queryClient: QueryClient;

  const mockUser = {
    id: 'user_2yqCu9TotmCYVGwIJlnr5XfOMxJ',
    firstName: 'Test',
    lastName: 'User',
  };

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

    // Mock successful response with real user data
    mockSupabaseClient.from.mockReturnValue({
      ...mockSupabaseClient,
      select: jest.fn().mockReturnValue({
        ...mockSupabaseClient,
        eq: jest.fn().mockReturnValue({
          ...mockSupabaseClient,
          in: jest.fn().mockReturnValue({
            ...mockSupabaseClient,
            order: jest.fn().mockResolvedValue({
              data: realUserData,
              error: null,
            }),
          }),
        }),
      }),
    });

    jest.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it('should process real user data and show multiple active days', async () => {
    const { result } = renderHook(() => useDeadlineHistory(), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    const data = result.current.data;
    console.log('Processed entries:', JSON.stringify(data?.entries, null, 2));
    console.log('Calendar data:', JSON.stringify(result.current.calendarData, null, 2));
    console.log('Summary:', JSON.stringify(data?.summary, null, 2));

    expect(data).toBeDefined();
    
    // Based on the user's data, we should see activity on these dates:
    // 2025-06-21: Initial progress for "The lean start up" and "Dungeon Crawler Carl"
    // 2025-06-26: Initial progress for "Letters to a Young Poet" and "Freeing the natural voice"
    // 2025-06-27: Multiple progress updates (should have significant activity)
    // 2025-06-28: Multiple progress updates
    // 2025-06-29: Progress update for "Dungeon Crawler Carl"
    // 2025-06-30: Progress update for "Dungeon Crawler Carl"
    // 2025-07-01: Most recent progress update
    
    // We should have at least 7 active days, not just 2
    expect(data?.summary.totalDays).toBeGreaterThanOrEqual(7);
    
    // Calendar should have multiple marked dates
    const markedDates = Object.keys(result.current.calendarData);
    expect(markedDates.length).toBeGreaterThanOrEqual(7);
    
    // Verify specific dates that should be present
    expect(result.current.calendarData['2025-06-21']).toBeDefined();
    expect(result.current.calendarData['2025-06-26']).toBeDefined();
    expect(result.current.calendarData['2025-06-27']).toBeDefined();
    expect(result.current.calendarData['2025-06-28']).toBeDefined();
    expect(result.current.calendarData['2025-06-29']).toBeDefined();
    expect(result.current.calendarData['2025-06-30']).toBeDefined();
    expect(result.current.calendarData['2025-07-01']).toBeDefined();
  });

  it('should handle multiple progress entries on the same day correctly', async () => {
    const { result } = renderHook(() => useDeadlineHistory(), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    const data = result.current.data;
    
    // Find June 27th entry - it has multiple progress updates on the same day
    const june27Entry = data?.entries.find(entry => entry.date === '2025-06-27');
    expect(june27Entry).toBeDefined();
    
    // Should include progress from "The lean start up" with multiple same-day updates
    // Progress on 2025-06-27: 302, 344, 346, 344 (multiple entries)
    const leanStartupProgress = june27Entry?.deadlines.find(d => d.book_title === 'The lean start up');
    expect(leanStartupProgress).toBeDefined();
  });
});