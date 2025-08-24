/**
 * Test wrapper utilities for consistent test setup
 * These wrappers provide standardized test environments with necessary providers
 */

import React from 'react';
import { render, RenderOptions } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MockDeadlineProvider } from '@/__mocks__/contextProviders';

// Create a new QueryClient for each test to ensure isolation
export const createTestQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
        staleTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });
};

// Base wrapper with QueryClient
interface QueryWrapperProps {
  children: React.ReactNode;
  queryClient?: QueryClient;
}

export const QueryWrapper: React.FC<QueryWrapperProps> = ({ 
  children, 
  queryClient = createTestQueryClient() 
}) => {
  return React.createElement(
    QueryClientProvider,
    { client: queryClient },
    children
  );
};

// Full app wrapper with all providers
interface AppWrapperProps {
  children: React.ReactNode;
  queryClient?: QueryClient;
}

export const AppWrapper: React.FC<AppWrapperProps> = ({ 
  children, 
  queryClient = createTestQueryClient() 
}) => {
  return React.createElement(
    QueryClientProvider,
    { client: queryClient },
    React.createElement(MockDeadlineProvider, null, children)
  );
};

// Custom render function with QueryClient
export const renderWithQuery = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'> & {
    queryClient?: QueryClient;
  }
) => {
  const { queryClient = createTestQueryClient(), ...renderOptions } = options || {};
  
  const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) =>
    React.createElement(QueryWrapper, { queryClient, children });

  return {
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
    queryClient,
  };
};

// Custom render function with all providers
export const renderWithProviders = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'> & {
    queryClient?: QueryClient;
  }
) => {
  const { queryClient = createTestQueryClient(), ...renderOptions } = options || {};
  
  const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) =>
    React.createElement(AppWrapper, { queryClient, children });

  return {
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
    queryClient,
  };
};

// Hook testing wrapper
export const createHookWrapper = (queryClient?: QueryClient) => {
  const client = queryClient || createTestQueryClient();
  
  const WrapperComponent = ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryWrapper, { queryClient: client, children });
  
  return WrapperComponent;
};

// Hook testing wrapper with all providers
export const createFullHookWrapper = (queryClient?: QueryClient) => {
  const client = queryClient || createTestQueryClient();
  
  const WrapperComponent = ({ children }: { children: React.ReactNode }) =>
    React.createElement(AppWrapper, { queryClient: client, children });
  
  return WrapperComponent;
};

// Utility to wait for query operations to complete
export const waitForQueryToSettle = async (queryClient: QueryClient) => {
  const promises = queryClient.getQueryCache().findAll().map(query => {
    if (query.state.fetchStatus === 'fetching') {
      return query.promise;
    }
    return Promise.resolve();
  });
  await Promise.all(promises);
};

// Utility to clear all queries and mutations
export const clearQueryClient = (queryClient: QueryClient) => {
  queryClient.getQueryCache().clear();
  queryClient.getMutationCache().clear();
};

// Test environment setup helper
export const setupTestEnvironment = () => {
  const queryClient = createTestQueryClient();
  
  const cleanup = () => {
    clearQueryClient(queryClient);
  };
  
  return {
    queryClient,
    cleanup,
    renderWithQuery: (ui: React.ReactElement, options?: any) => 
      renderWithQuery(ui, { queryClient, ...options }),
    renderWithProviders: (ui: React.ReactElement, options?: any) => 
      renderWithProviders(ui, { queryClient, ...options }),
    hookWrapper: createHookWrapper(queryClient),
    fullHookWrapper: createFullHookWrapper(queryClient),
  };
};

// Mock data injection helper
export const injectMockData = (queryClient: QueryClient, key: string[], data: any) => {
  queryClient.setQueryData(key, data);
};

// Error boundary for testing error states
export class TestErrorBoundary extends React.Component<
  { children: React.ReactNode; onError?: (error: Error) => void },
  { hasError: boolean; error?: Error }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, _errorInfo: React.ErrorInfo) {
    this.props.onError?.(error);
  }

  render() {
    if (this.state.hasError) {
      return React.createElement('div', { testID: 'error-boundary' }, 'Error occurred');
    }

    return this.props.children;
  }
}

// Wrapper with error boundary
export const renderWithErrorBoundary = (
  ui: React.ReactElement,
  options?: {
    onError?: (error: Error) => void;
    queryClient?: QueryClient;
  }
) => {
  const { onError, queryClient = createTestQueryClient() } = options || {};
  
  const WrappedComponent = () =>
    React.createElement(
      QueryWrapper,
      { queryClient, children: React.createElement(TestErrorBoundary, { onError }, ui) }
    );

  return {
    ...render(React.createElement(WrappedComponent)),
    queryClient,
  };
};

// Basic test to prevent "no tests" error
describe('Test Wrappers', () => {
  test('createTestQueryClient creates valid query client', () => {
    const queryClient = createTestQueryClient();
    expect(queryClient).toBeDefined();
    expect(queryClient.getQueryCache).toBeDefined();
    expect(queryClient.getMutationCache).toBeDefined();
  });
});