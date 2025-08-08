/**
 * Centralized mocks for custom hooks
 * This file contains mock implementations for commonly used hooks across test files
 */

import { ReadingDeadlineWithProgress } from '@/types/deadline';

// useDeadlines hook mocks
export const mockUseGetDeadlines = jest.fn(() => ({
  data: [],
  error: null,
  isLoading: false,
  isError: false,
  isSuccess: true,
  isFetching: false,
  refetch: jest.fn(),
}));

export const mockUseAddDeadline = jest.fn(() => ({
  mutate: jest.fn(),
  mutateAsync: jest.fn(),
  isLoading: false,
  isError: false,
  isSuccess: false,
  error: null,
  reset: jest.fn(),
}));

export const mockUseUpdatebook = jest.fn(() => ({
  mutate: jest.fn(),
  mutateAsync: jest.fn(),
  isLoading: false,
  isError: false,
  isSuccess: false,
  error: null,
  reset: jest.fn(),
}));

export const mockUseDeletebook = jest.fn(() => ({
  mutate: jest.fn(),
  mutateAsync: jest.fn(),
  isLoading: false,
  isError: false,
  isSuccess: false,
  error: null,
  reset: jest.fn(),
}));

export const mockUseCompletebook = jest.fn(() => ({
  mutate: jest.fn(),
  mutateAsync: jest.fn(),
  isLoading: false,
  isError: false,
  isSuccess: false,
  error: null,
  reset: jest.fn(),
}));

export const mockUseSetAsidebook = jest.fn(() => ({
  mutate: jest.fn(),
  mutateAsync: jest.fn(),
  isLoading: false,
  isError: false,
  isSuccess: false,
  error: null,
  reset: jest.fn(),
}));

// Apply useDeadlines mocks
jest.mock('@/hooks/useDeadlines', () => ({
  useGetDeadlines: mockUseGetDeadlines,
  useAddDeadline: mockUseAddDeadline,
  useUpdatebook: mockUseUpdatebook,
  useDeletebook: mockUseDeletebook,
  useCompletebook: mockUseCompletebook,
  useSetAsidebook: mockUseSetAsidebook,
}));

// useReadingHistory hook mocks
export const mockUseReadingHistory = jest.fn(() => ({
  readingDays: [],
  isLoading: false,
  error: null,
  refetch: jest.fn(),
  getReadingDayByDate: jest.fn(),
  getTotalPagesRead: jest.fn(() => 0),
  getReadingStreak: jest.fn(() => 0),
}));

jest.mock('@/hooks/useReadingHistory', () => ({
  useReadingHistory: mockUseReadingHistory,
}));

// usebookHistory hook mocks - Note: Hook may not exist yet
export const mockUsebookHistory = jest.fn(() => ({
  completedDeadlines: [],
  setAsidebooks: [],
  allHistoricalDeadlines: [],
  isLoading: false,
  error: null,
  refetch: jest.fn(),
}));

// Note: Commenting out until usebookHistory hook is implemented
// jest.mock('@/hooks/usebookHistory', () => ({
//   usebookHistory: mockUsebookHistory,
// }));

// useDailyReadingSession hook mock
export const mockUseDailyReadingSession = jest.fn(() => ({
  sessions: [],
  isLoading: false,
  error: null,
  addSession: jest.fn(),
  updateSession: jest.fn(),
  deleteSession: jest.fn(),
  getTodaysSessions: jest.fn(() => []),
  getTotalReadingTime: jest.fn(() => 0),
}));

jest.mock('@/hooks/useDailyReadingSession', () => ({
  useDailyReadingSession: mockUseDailyReadingSession,
}));

// useAchievementSystem hook mock
export const mockUseAchievementSystem = jest.fn(() => ({
  isReady: false,
  isInitializing: false,
  hasError: false,
  error: null,
  achievements: [],
  progress: [],
  checkAchievements: jest.fn(),
  getUserAchievements: jest.fn(() => []),
}));

jest.mock('@/hooks/useAchievementSystem', () => ({
  useAchievementSystem: mockUseAchievementSystem,
  useInitializeAchievementSystem: jest.fn(() => ({
    initialize: jest.fn(),
    status: { isInitialized: false, isInitializing: false, error: null },
    error: null,
    retry: jest.fn(),
  })),
  useAchievementSystemServices: jest.fn(() => ({
    eventService: null,
    registry: null,
    eventPublisher: null,
    dataProvider: null,
    isInitialized: false,
  })),
  useTriggerAchievementCheck: jest.fn(() => ({
    mutate: jest.fn(),
    mutateAsync: jest.fn(),
    isLoading: false,
    isSuccess: false,
    isError: false,
  })),
  useIsAchievementSystemReady: jest.fn(() => ({
    isReady: false,
    userId: undefined,
    isInitialized: false,
  })),
}));

// Helper functions to configure hook responses
export const configurebooksHook = (deadlines: ReadingDeadlineWithProgress[], options = {}) => {
  mockUseGetDeadlines.mockReturnValue({
    data: deadlines,
    error: null,
    isLoading: false,
    isError: false,
    isSuccess: true,
    isFetching: false,
    refetch: jest.fn(),
    ...options,
  });
};

export const configurebooksLoading = () => {
  mockUseGetDeadlines.mockReturnValue({
    data: undefined,
    error: null,
    isLoading: true,
    isError: false,
    isSuccess: false,
    isFetching: true,
    refetch: jest.fn(),
  });
};

export const configurebooksError = (error: Error) => {
  mockUseGetDeadlines.mockReturnValue({
    data: undefined,
    error,
    isLoading: false,
    isError: true,
    isSuccess: false,
    isFetching: false,
    refetch: jest.fn(),
  });
};

export const configureMutationSuccess = (mockMutation: jest.Mock) => {
  mockMutation.mockReturnValue({
    mutate: jest.fn((data, { onSuccess }) => {
      if (onSuccess) onSuccess();
    }),
    mutateAsync: jest.fn(() => Promise.resolve()),
    isLoading: false,
    isError: false,
    isSuccess: true,
    error: null,
    reset: jest.fn(),
  });
};

export const configureMutationError = (mockMutation: jest.Mock, error: Error) => {
  mockMutation.mockReturnValue({
    mutate: jest.fn((data, { onError }) => {
      if (onError) onError(error);
    }),
    mutateAsync: jest.fn(() => Promise.reject(error)),
    isLoading: false,
    isError: true,
    isSuccess: false,
    error,
    reset: jest.fn(),
  });
};

// Utility function to reset all hook mocks
export const resetHookMocks = () => {
  // Reset deadline hooks
  mockUseGetDeadlines.mockClear();
  mockUseAddDeadline.mockClear();
  mockUseUpdatebook.mockClear();
  mockUseDeletebook.mockClear();
  mockUseCompletebook.mockClear();
  mockUseSetAsidebook.mockClear();
  
  // Reset to default returns
  mockUseGetDeadlines.mockReturnValue({
    data: [],
    error: null,
    isLoading: false,
    isError: false,
    isSuccess: true,
    isFetching: false,
    refetch: jest.fn(),
  });
  
  const defaultMutation = {
    mutate: jest.fn(),
    mutateAsync: jest.fn(),
    isLoading: false,
    isError: false,
    isSuccess: false,
    error: null,
    reset: jest.fn(),
  };
  
  mockUseAddDeadline.mockReturnValue(defaultMutation);
  mockUseUpdatebook.mockReturnValue(defaultMutation);
  mockUseDeletebook.mockReturnValue(defaultMutation);
  mockUseCompletebook.mockReturnValue(defaultMutation);
  mockUseSetAsidebook.mockReturnValue(defaultMutation);
  
  // Reset other hooks
  mockUseReadingHistory.mockClear();
  mockUseReadingHistory.mockReturnValue({
    readingDays: [],
    isLoading: false,
    error: null,
    refetch: jest.fn(),
    getReadingDayByDate: jest.fn(),
    getTotalPagesRead: jest.fn(() => 0),
    getReadingStreak: jest.fn(() => 0),
  });
  
  // Note: Commented out until usebookHistory hook is implemented
  // mockUsebookHistory.mockClear();
  // mockUsebookHistory.mockReturnValue({
  //   completedDeadlines: [],
  //   setAsidebooks: [],
  //   allHistoricalDeadlines: [],
  //   isLoading: false,
  //   error: null,
  //   refetch: jest.fn(),
  // });
  
  mockUseDailyReadingSession.mockClear();
  mockUseDailyReadingSession.mockReturnValue({
    sessions: [],
    isLoading: false,
    error: null,
    addSession: jest.fn(),
    updateSession: jest.fn(),
    deleteSession: jest.fn(),
    getTodaysSessions: jest.fn(() => []),
    getTotalReadingTime: jest.fn(() => 0),
  });
  
  mockUseAchievementSystem.mockClear();
  mockUseAchievementSystem.mockReturnValue({
    isReady: false,
    isInitializing: false,
    hasError: false,
    error: null,
    achievements: [],
    progress: [],
    checkAchievements: jest.fn(),
    getUserAchievements: jest.fn(() => []),
  });
};

// useAchievementsQuery hook mock
export const mockUseAchievementsQuery = jest.fn(() => ({
  data: [],
  isLoading: false,
  isError: false,
  error: null,
  refetch: jest.fn(),
}));

jest.mock('@/hooks/useAchievementsQuery', () => ({
  useAchievementsQuery: mockUseAchievementsQuery,
}));