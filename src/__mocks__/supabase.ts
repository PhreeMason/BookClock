/**
 * Centralized mocks for Supabase
 * This file contains mock implementations for Supabase client and related functionality
 */

// Mock Supabase client methods
export const mockFrom = jest.fn();
export const mockSelect = jest.fn();
export const mockInsert = jest.fn();
export const mockUpdate = jest.fn();
export const mockDelete = jest.fn();
export const mockEq = jest.fn();
export const mockIn = jest.fn();
export const mockOrder = jest.fn();
export const mockLimit = jest.fn();
export const mockSingle = jest.fn();
export const mockRange = jest.fn();
export const mockGt = jest.fn();
export const mockGte = jest.fn();
export const mockLt = jest.fn();
export const mockLte = jest.fn();

// Chain methods together as Supabase does
const createChainableMock = () => {
  const mock = {
    select: mockSelect.mockReturnThis(),
    insert: mockInsert.mockReturnThis(),
    update: mockUpdate.mockReturnThis(),
    delete: mockDelete.mockReturnThis(),
    eq: mockEq.mockReturnThis(),
    in: mockIn.mockReturnThis(),
    order: mockOrder.mockReturnThis(),
    limit: mockLimit.mockReturnThis(),
    single: mockSingle.mockReturnThis(),
    range: mockRange.mockReturnThis(),
    gt: mockGt.mockReturnThis(),
    gte: mockGte.mockReturnThis(),
    lt: mockLt.mockReturnThis(),
    lte: mockLte.mockReturnThis(),
  };
  
  // Make each method return the mock for chaining
  Object.keys(mock).forEach(key => {
    (mock as any)[key].mockReturnValue(mock);
  });
  
  // Terminal methods that return promises
  mockSelect.mockReturnValue({
    ...mock,
    then: (resolve: any) => resolve({ data: [], error: null }),
  });
  
  mockInsert.mockReturnValue({
    ...mock,
    then: (resolve: any) => resolve({ data: null, error: null }),
  });
  
  mockUpdate.mockReturnValue({
    ...mock,
    then: (resolve: any) => resolve({ data: null, error: null }),
  });
  
  mockDelete.mockReturnValue({
    ...mock,
    then: (resolve: any) => resolve({ data: null, error: null }),
  });
  
  return mock;
};

// Main Supabase client mock
export const mockSupabaseClient = {
  from: mockFrom.mockImplementation(() => createChainableMock()),
  auth: {
    getUser: jest.fn(() => Promise.resolve({ 
      data: { user: { id: 'test-user-id' } }, 
      error: null 
    })),
    signInWithPassword: jest.fn(() => Promise.resolve({ 
      data: { user: { id: 'test-user-id' }, session: {} }, 
      error: null 
    })),
    signOut: jest.fn(() => Promise.resolve({ error: null })),
  },
  storage: {
    from: jest.fn(() => ({
      upload: jest.fn(() => Promise.resolve({ data: { path: 'test-path' }, error: null })),
      download: jest.fn(() => Promise.resolve({ data: new Blob(), error: null })),
      remove: jest.fn(() => Promise.resolve({ data: [], error: null })),
    })),
  },
};

// Mock useSupabase hook
export const mockUseSupabase = jest.fn(() => mockSupabaseClient);

// Apply the mock
jest.mock('@/lib/supabase', () => ({
  supabase: mockSupabaseClient,
  useSupabase: mockUseSupabase,
}));

// Helper to configure common query responses
export const configureSupabaseSelect = (table: string, data: any[], error: any = null) => {
  mockFrom.mockImplementation((tableName: string) => {
    if (tableName === table) {
      const chainable = createChainableMock();
      mockSelect.mockReturnValue({
        ...chainable,
        then: (resolve: any) => resolve({ data, error }),
      });
      return chainable;
    }
    return createChainableMock();
  });
};

// Helper to configure common insert responses
export const configureSupabaseInsert = (table: string, responseData: any = null, error: any = null) => {
  mockFrom.mockImplementation((tableName: string) => {
    if (tableName === table) {
      const chainable = createChainableMock();
      mockInsert.mockReturnValue({
        ...chainable,
        then: (resolve: any) => resolve({ data: responseData, error }),
      });
      return chainable;
    }
    return createChainableMock();
  });
};

// Helper to configure common update responses
export const configureSupabaseUpdate = (table: string, responseData: any = null, error: any = null) => {
  mockFrom.mockImplementation((tableName: string) => {
    if (tableName === table) {
      const chainable = createChainableMock();
      mockUpdate.mockReturnValue({
        ...chainable,
        then: (resolve: any) => resolve({ data: responseData, error }),
      });
      return chainable;
    }
    return createChainableMock();
  });
};

// Helper to configure common delete responses
export const configureSupabaseDelete = (table: string, error: any = null) => {
  mockFrom.mockImplementation((tableName: string) => {
    if (tableName === table) {
      const chainable = createChainableMock();
      mockDelete.mockReturnValue({
        ...chainable,
        then: (resolve: any) => resolve({ data: null, error }),
      });
      return chainable;
    }
    return createChainableMock();
  });
};

// Utility function to reset all Supabase mocks
export const resetSupabaseMocks = () => {
  // Clear all mock calls
  mockFrom.mockClear();
  mockSelect.mockClear();
  mockInsert.mockClear();
  mockUpdate.mockClear();
  mockDelete.mockClear();
  mockEq.mockClear();
  mockIn.mockClear();
  mockOrder.mockClear();
  mockLimit.mockClear();
  mockSingle.mockClear();
  mockRange.mockClear();
  mockGt.mockClear();
  mockGte.mockClear();
  mockLt.mockClear();
  mockLte.mockClear();
  
  // Reset to default implementations
  mockFrom.mockImplementation(() => createChainableMock());
  mockUseSupabase.mockReturnValue(mockSupabaseClient);
  
  // Reset auth methods
  mockSupabaseClient.auth.getUser.mockClear();
  mockSupabaseClient.auth.signInWithPassword.mockClear();
  mockSupabaseClient.auth.signOut.mockClear();
  
  // Reset storage methods
  mockSupabaseClient.storage.from.mockClear();
};