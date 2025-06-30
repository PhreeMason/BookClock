import { sampleDeadlines } from '@/__tests__/fixtures/sampleDeadlines';

export const mockUseGetDeadlines = () => ({
  data: sampleDeadlines,
  error: null,
  isLoading: false,
  isError: false,
  isSuccess: true,
  isFetching: false,
  refetch: jest.fn(),
});

export const mockUseGetDeadlinesEmpty = () => ({
  data: [],
  error: null,
  isLoading: false,
  isError: false,
  isSuccess: true,
  isFetching: false,
  refetch: jest.fn(),
});

export const mockUseGetDeadlinesLoading = () => ({
  data: undefined,
  error: null,
  isLoading: true,
  isError: false,
  isSuccess: false,
  isFetching: true,
  refetch: jest.fn(),
});

export const mockUseGetDeadlinesError = () => ({
  data: undefined,
  error: new Error('Failed to fetch deadlines'),
  isLoading: false,
  isError: true,
  isSuccess: false,
  isFetching: false,
  refetch: jest.fn(),
});