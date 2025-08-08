# Testing Guidelines & Best Practices

This document outlines testing best practices for React hooks and components in this project, with special attention to `act()` wrapper requirements and common pitfalls.

## Table of Contents

- [Centralized Mock System](#centralized-mock-system)
- [Core Testing Principles](#core-testing-principles)
- [React Testing Library & act() Guidelines](#react-testing-library--act-guidelines)
- [Hook Testing Best Practices](#hook-testing-best-practices)
- [Common Issues & Solutions](#common-issues--solutions)
- [Test Setup Examples](#test-setup-examples)

## Centralized Mock System

### Overview

We use a centralized mock system to reduce code duplication and ensure consistency across all tests. Common mocks are located in `src/__mocks__/` and automatically imported through the test setup.

### Available Centralized Mocks

#### External Libraries

**Already configured in test setup** (no imports needed):
- `expo-router` - Navigation and routing
- `@react-native-async-storage/async-storage` - Local storage
- `@/components/themed` - Themed components

**Import when needed**:
```typescript
import { mockToast } from '@/__mocks__/externalLibraries';
import { mockClerk } from '@/__mocks__/externalLibraries';
```

#### Internal Modules

```typescript
// Supabase database mocks
import { mockSupabaseClient, mockUseSupabase } from '@/__mocks__/supabase';

// Achievement system mocks
import { mockAchievementService } from '@/__mocks__/achievementSystem';

// Hook mocks
import { mockUseGetDeadlines, mockUseAddDeadline } from '@/__mocks__/hooks';

// Context provider mocks
import { mockDeadlineProvider } from '@/__mocks__/contextProviders';
```

### Test Data Factories

Use factory functions to create consistent test data:

```typescript
import { createMockDeadline, createMockProgress } from '@/__tests__/utils/mockFactories';

// Create test data with defaults
const deadline = createMockDeadline();

// Override specific properties
const customDeadline = createMockDeadline({
  book_title: 'Custom Book',
  format: 'audio',
  total_quantity: 500
});

const progress = createMockProgress({
  current_progress: 150,
  reading_deadline_id: deadline.id
});
```

### Common Mock Patterns

#### Pattern 1: Using Centralized External Mocks
```typescript
import { mockToast } from '@/__mocks__/externalLibraries';

describe('MyComponent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should show success toast', () => {
    // Component action that shows toast
    fireEvent.press(screen.getByText('Save'));
    
    // Assert using centralized mock
    expect(mockToast.show).toHaveBeenCalledWith({
      type: 'success',
      text1: 'Saved successfully'
    });
  });
});
```

#### Pattern 2: Using Centralized Internal Mocks
```typescript
import { mockUseGetDeadlines } from '@/__mocks__/hooks';

// Mock is already applied via jest.mock() in the centralized file
describe('DeadlineComponent', () => {
  beforeEach(() => {
    // Configure mock return value
    mockUseGetDeadlines.mockReturnValue({
      data: [createMockDeadline()],
      isLoading: false,
      error: null
    });
  });
});
```

#### Pattern 3: Overriding Centralized Mocks
```typescript
// Override centralized mock for specific test
jest.mock('@/lib/supabase', () => ({
  useSupabase: jest.fn(() => ({
    from: jest.fn(() => ({
      select: jest.fn(() => Promise.resolve({ 
        data: customData, 
        error: null 
      }))
    }))
  }))
}));
```

### Mock Guidelines

#### ✅ DO
- Use centralized mocks when available
- Import only the mocks you need
- Use factory functions for test data
- Override centralized mocks only when necessary
- Reset mocks in `beforeEach` to prevent test interference

#### ❌ DON'T
- Duplicate mock implementations across test files
- Create inline mocks for commonly used libraries
- Forget to clear mocks between tests
- Modify centralized mock files for specific test needs

### Adding New Centralized Mocks

When you find yourself mocking the same library/module in multiple test files:

1. **Identify the pattern**: Note the common mock implementation
2. **Choose the right file**: 
   - External libraries → `src/__mocks__/externalLibraries.ts`
   - Internal modules → `src/__mocks__/[category].ts`
   - Test data → `src/__tests__/utils/mockFactories.ts`
3. **Add the mock**: Export a reusable mock implementation
4. **Update setup**: Import in `src/__tests__/setup.ts` if it should be global
5. **Document**: Add to this README with usage examples

### Migration from Inline Mocks

When updating existing tests to use centralized mocks:

```typescript
// Before - Inline mock
jest.mock('react-native-toast-message', () => ({
  show: jest.fn(),
}));

const mockToastShow = require('react-native-toast-message').show;

// After - Centralized mock
import { mockToast } from '@/__mocks__/externalLibraries';

// Use mockToast.show directly
```

### Troubleshooting Mock Issues

**Mock not working?**
1. Check if it's already centralized in `src/__mocks__/`
2. Verify import path is correct
3. Ensure mock is properly exported
4. Check if `jest.clearAllMocks()` is called in `beforeEach`

**Need custom behavior?**
1. Override the specific method: `mockFunction.mockReturnValue(customValue)`
2. Use `jest.mocked()` for type-safe overrides
3. Create test-specific mock only if centralized version can't be adapted

**Mock conflicts?**
1. Ensure `jest.clearAllMocks()` is called between tests
2. Check if multiple mocks are affecting the same module
3. Use `jest.resetModules()` if needed for complete reset

## Core Testing Principles

### Always Use act() for State Changes

**🚨 CRITICAL**: Wrap all React state updates in `act()` to prevent warnings and ensure proper testing behavior.

```typescript
// ❌ BAD - React state updates not wrapped
await result.current.mutateAsync(data);

// ✅ GOOD - Properly wrapped in act()
await act(async () => {
  await result.current.mutateAsync(data);
});
```

### Test Cleanup is Essential

Always clean up after tests to prevent:
- Memory leaks
- Cross-test interference 
- Jest hanging issues

```typescript
afterEach(() => {
  jest.clearAllTimers();
  mockQueryClient.clear();
  jest.clearAllMocks();
});
```

## React Testing Library & act() Guidelines

### When to Use act()

Use `act()` when your test code:

1. **Triggers state updates** (useState, useReducer)
2. **Calls mutations** (React Query mutations)
3. **Updates component props** that cause re-renders
4. **Manually triggers effects** that update state

### act() Patterns

#### Pattern 1: Async Mutations
```typescript
it('should handle async mutations', async () => {
  const { result } = renderHook(() => useMyMutation(), { wrapper });
  
  await act(async () => {
    await result.current.mutateAsync(data);
  });
  
  expect(result.current.isSuccess).toBe(true);
});
```

#### Pattern 2: Waiting for State Changes
```typescript
it('should wait for state changes', async () => {
  const { result } = renderHook(() => useMyHook(), { wrapper });
  
  await waitFor(() => {
    expect(result.current.isLoaded).toBe(true);
  }, { timeout: 3000 });
});
```

#### Pattern 3: Expected Errors
```typescript
it('should handle expected errors', async () => {
  // Suppress console.error for expected errors
  const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  
  const { result } = renderHook(() => useMyHook(), { wrapper });
  
  await act(async () => {
    await expect(result.current.action()).rejects.toThrow('Expected error');
  });
  
  // Verify error was logged (but suppressed)
  expect(consoleSpy).toHaveBeenCalledWith('Error message:', expect.any(Error));
  
  consoleSpy.mockRestore();
});
```

## Hook Testing Best Practices

### 1. Proper Test Environment Setup

```typescript
/**
 * @jest-environment jsdom
 */

// Set global test timeout to prevent hanging tests
jest.setTimeout(10000);
```

### 2. Query Client Setup

```typescript
const mockQueryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false }
  }
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={mockQueryClient}>
    {children}
  </QueryClientProvider>
);
```

### 3. Mock Management

Use centralized mocks when possible, and follow consistent patterns:

```typescript
import { mockSupabaseClient } from '@/__mocks__/supabase';
import { mockClerk } from '@/__mocks__/externalLibraries';
import { createMockDeadline } from '@/__tests__/utils/mockFactories';

describe('MyHook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockQueryClient.clear();
    
    // Configure centralized mocks
    mockSupabaseClient.from.mockReturnValue({
      select: jest.fn(() => Promise.resolve({ data: [], error: null }))
    });
    mockClerk.useUser.mockReturnValue({
      user: { id: 'test-user-id' },
      isLoaded: true,
      isSignedIn: true
    });
  });
  
  afterEach(() => {
    jest.clearAllTimers();
    mockQueryClient.clear();
    jest.clearAllMocks();
    
    // Reset centralized mocks to default state
    mockSupabaseClient.from.mockReturnValue({
      select: jest.fn(() => Promise.resolve({ data: [], error: null }))
    });
    mockClerk.useUser.mockReturnValue({
      user: { id: 'test-user-id' },
      isLoaded: true,
      isSignedIn: true
    });
  });
});
```

### 4. Console Log Management

Suppress expected console outputs to keep test output clean:

```typescript
it('should suppress expected console output', async () => {
  const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
  
  // Test code that logs to console
  
  consoleSpy.mockRestore();
});
```

## Common Issues & Solutions

### Issue 1: "An update to TestComponent inside a test was not wrapped in act(...)"

**Cause**: React state updates happening outside of `act()` wrapper.

**Solution**: Wrap the operation that triggers state updates:

```typescript
// ❌ BAD
const { result } = renderHook(() => useMyHook());
await result.current.trigger();

// ✅ GOOD  
const { result } = renderHook(() => useMyHook());
await act(async () => {
  await result.current.trigger();
});
```

### Issue 2: Tests Timing Out or Hanging

**Cause**: Async operations not properly awaited or cleaned up.

**Solution**: 
1. Add timeouts to `waitFor` calls
2. Clean up properly in `afterEach`
3. Use global test timeout

```typescript
// Add timeout to waitFor
await waitFor(() => {
  expect(condition).toBe(true);
}, { timeout: 3000 });

// Global timeout
jest.setTimeout(10000);
```

### Issue 3: Memory Leaks in Tests

**Cause**: Query client cache not cleared, timers not cleared, effects not cleaned up.

**Solution**: Comprehensive cleanup:

```typescript
afterEach(() => {
  jest.clearAllTimers();
  mockQueryClient.clear();
  jest.clearAllMocks();
});

afterAll(async () => {
  await act(async () => {
    await new Promise(resolve => setTimeout(resolve, 100));
  });
  jest.clearAllTimers();
  jest.clearAllMocks();
});
```

### Issue 4: Cross-Test Interference

**Cause**: Mocks not properly reset between tests.

**Solution**: Reset all mocks to default state:

```typescript
afterEach(() => {
  // Reset all mocks to default state
  mockService.isInitialized.mockReturnValue(false);
  mockService.doSomething.mockResolvedValue(undefined);
  
  mockUseUser.mockReturnValue({
    user: { id: 'test-user-id' },
    isLoaded: true,
    isSignedIn: true,
  });
});
```

## Test Setup Examples

### Complete Hook Test Template

```typescript
/**
 * @jest-environment jsdom
 */

jest.setTimeout(10000);

import { act, renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useMyHook } from '../useMyHook';

// Import centralized mocks
import { mockSupabaseClient } from '@/__mocks__/supabase';
import { mockClerk } from '@/__mocks__/externalLibraries';
import { createMockDeadline } from '@/__tests__/utils/mockFactories';

const mockQueryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false }
  }
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={mockQueryClient}>
    {children}
  </QueryClientProvider>
);

describe('useMyHook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockQueryClient.clear();
    
    // Configure centralized mocks
    mockSupabaseClient.from.mockReturnValue({
      select: jest.fn(() => Promise.resolve({ data: [], error: null })),
      insert: jest.fn(() => Promise.resolve({ data: null, error: null }))
    });
    
    mockClerk.useUser.mockReturnValue({
      user: { id: 'test-user-id' },
      isLoaded: true,
      isSignedIn: true
    });
  });

  afterEach(() => {
    jest.clearAllTimers();
    mockQueryClient.clear();
    jest.clearAllMocks();
    
    // Reset centralized mocks to default state
    mockSupabaseClient.from.mockReturnValue({
      select: jest.fn(() => Promise.resolve({ data: [], error: null })),
      insert: jest.fn(() => Promise.resolve({ data: null, error: null }))
    });
    
    mockClerk.useUser.mockReturnValue({
      user: { id: 'test-user-id' },
      isLoaded: true,
      isSignedIn: true
    });
  });

  afterAll(async () => {
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
    });
    jest.clearAllTimers();
    jest.clearAllMocks();
  });

  it('should work correctly', async () => {
    const { result } = renderHook(() => useMyHook(), { wrapper });
    
    await act(async () => {
      await result.current.doSomething();
    });
    
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    }, { timeout: 3000 });
  });

  it('should handle errors gracefully', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    // Override centralized mock for error case
    mockSupabaseClient.from.mockReturnValue({
      select: jest.fn(() => Promise.resolve({ 
        data: null, 
        error: new Error('Test error') 
      }))
    });
    
    const { result } = renderHook(() => useMyHook(), { wrapper });
    
    await act(async () => {
      await expect(result.current.doSomething()).rejects.toThrow('Test error');
    });
    
    expect(consoleSpy).toHaveBeenCalledWith('Error:', expect.any(Error));
    consoleSpy.mockRestore();
  });

  it('should use test data factories', async () => {
    const mockDeadline = createMockDeadline({
      book_title: 'Test Book',
      format: 'audio'
    });
    
    mockSupabaseClient.from.mockReturnValue({
      select: jest.fn(() => Promise.resolve({ 
        data: [mockDeadline], 
        error: null 
      }))
    });
    
    const { result } = renderHook(() => useMyHook(), { wrapper });
    
    await waitFor(() => {
      expect(result.current.data).toContain(mockDeadline);
    }, { timeout: 3000 });
  });
});
```

### Testing Rules Checklist

#### Core Testing
- [ ] All async operations wrapped in `act()`
- [ ] `waitFor` calls have timeout specified
- [ ] Console logs/errors suppressed for expected outputs
- [ ] Proper cleanup in `afterEach` and `afterAll`
- [ ] Global test timeout set
- [ ] Query client properly cleared
- [ ] No memory leaks or hanging promises

#### Centralized Mock System
- [ ] Use centralized mocks when available (check `src/__mocks__/`)
- [ ] Import only needed mocks, don't duplicate inline
- [ ] Use factory functions for test data creation
- [ ] Reset mocks to default state between tests
- [ ] Override centralized mocks only when necessary
- [ ] Document new patterns in centralized mock files
- [ ] Follow established mock patterns from examples

## Memory Management

For complex test suites with many async operations:

1. **Use selective testing** for debugging memory issues
2. **Reduce act() usage** where not strictly necessary
3. **Simplify cleanup** to prevent timeout issues
4. **Run individual test suites** if memory issues persist

```bash
# Test specific patterns
npm test -- --testNamePattern="specific test name"

# Test specific describe blocks  
npm test -- --testNamePattern="describe block name"
```

## Summary

Following these guidelines will help you:

✅ Eliminate React act() warnings  
✅ Prevent test timeouts and hangs  
✅ Avoid memory leaks in test suites  
✅ Ensure reliable, isolated tests  
✅ Maintain clean test output  
✅ Reduce mock duplication with centralized system  
✅ Write tests faster with reusable patterns  
✅ Maintain consistency across test suite  

Remember: 
- **When in doubt, wrap it in act()!** Better to be safe than sorry with React state updates in tests.
- **Use centralized mocks first** - Check `src/__mocks__/` before creating inline mocks.
- **Follow the established patterns** - Use factory functions and consistent mock configurations.

## Quick Reference

### Starting a New Test File
1. Check `src/__mocks__/` for available centralized mocks
2. Import needed mocks and test utilities
3. Use factory functions for test data
4. Follow the complete test template above
5. Add to centralized system if you find repeated patterns

### Debugging Test Issues
1. Check if centralized mocks are properly imported
2. Verify mock reset in `beforeEach`/`afterEach`
3. Ensure `act()` wraps all state updates
4. Check console for unhandled promises or warnings
5. Review this guide for troubleshooting patterns