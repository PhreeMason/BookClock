# Centralized Mock System Implementation Plan

## Executive Summary

This document outlines the plan to centralize common mocks across the test suite to reduce code duplication, improve maintainability, and ensure consistency in testing patterns. The analysis of 58+ test files revealed significant mock duplication that can be consolidated into a centralized system.

## Current State Analysis

### Existing Infrastructure
- **Setup file**: `src/__tests__/setup.ts` with basic mock configuration
- **Centralized mocks**: `src/__mocks__/theme.ts`, `src/__mocks__/useDeadlinesMock.ts`
- **Test fixtures**: `src/__tests__/fixtures/samplebooks.ts`

### Problems Identified
- **Mock duplication**: Same libraries mocked repeatedly across 50+ test files
- **Inconsistent patterns**: Different mock implementations for the same modules
- **Maintenance burden**: Updates require changes in multiple files
- **Test fragility**: Inconsistent mocks cause test flakiness

### Most Common Mock Patterns Found

#### External Libraries (found in 15+ files each)
- `expo-router` - Router navigation mocks
- `react-native-toast-message` - Toast notification mocks
- `@clerk/clerk-expo` - Authentication mocks
- `@react-native-async-storage/async-storage` - Storage mocks
- `react-native-safe-area-context` - Safe area mocks

#### Internal Modules (found in 10+ files each)
- `@/lib/supabase` - Database client mocks
- `@/hooks/useDeadlines` - Deadline management hook mocks
- `@/contexts/DeadlineProvider` - Context provider mocks
- `@/services/achievements/AchievementEventService` - Achievement system mocks
- `@/theme` - Theme system mocks

#### React Native Components (found in 5+ files each)
- `react-native-calendars` - Calendar component mocks
- `react-native-gifted-charts` - Chart component mocks
- `react-native-pager-view` - Pager component mocks
- `react-hook-form` - Form handling mocks

## Proposed Architecture

### Directory Structure
```
src/
├── __mocks__/
│   ├── externalLibraries.ts      # Third-party library mocks
│   ├── reactNativeComponents.ts  # RN component mocks
│   ├── reactHookForm.ts          # Form-related mocks
│   ├── supabase.ts               # Database mocks
│   ├── achievementSystem.ts      # Achievement system mocks
│   ├── contextProviders.ts       # React context mocks
│   ├── hooks.ts                  # Custom hook mocks
│   └── theme.ts                  # (existing) Theme mocks
├── __tests__/
│   ├── fixtures/
│   │   ├── samplebooks.ts    # (existing) Sample data
│   │   ├── sampleProgress.ts     # Progress data fixtures
│   │   └── sampleAchievements.ts # Achievement data fixtures
│   ├── utils/
│   │   ├── mockFactories.ts      # Factory functions for test data
│   │   ├── testWrappers.ts       # Common test component wrappers
│   │   └── mockHelpers.ts        # Mock utility functions
│   └── setup.ts                  # (existing) Enhanced test setup
```

## Detailed Mock Specifications

### 1. External Libraries (`src/__mocks__/externalLibraries.ts`)

```typescript
// Expo Router Mock
export const mockExpoRouter = {
  router: {
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  },
  useRouter: () => mockExpoRouter.router,
  useLocalSearchParams: () => ({}),
  Link: ({ children }: { children: React.ReactNode }) => children,
};

// Toast Message Mock
export const mockToast = {
  show: jest.fn(),
  hide: jest.fn(),
};

// Clerk Authentication Mock
export const mockClerk = {
  useUser: jest.fn(() => ({
    user: { id: 'test-user-id' },
    isLoaded: true,
    isSignedIn: true,
  })),
};

// AsyncStorage Mock
export const mockAsyncStorage = {
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve()),
};
```

### 2. Internal Modules (`src/__mocks__/supabase.ts`)

```typescript
export const mockSupabaseClient = {
  from: jest.fn(() => ({
    select: jest.fn(() => Promise.resolve({ data: [], error: null })),
    insert: jest.fn(() => Promise.resolve({ data: null, error: null })),
    update: jest.fn(() => Promise.resolve({ data: null, error: null })),
    delete: jest.fn(() => Promise.resolve({ data: null, error: null })),
    eq: jest.fn(() => Promise.resolve({ data: [], error: null })),
  })),
};

export const mockUseSupabase = jest.fn(() => mockSupabaseClient);
```

### 3. Test Utilities (`src/__tests__/utils/mockFactories.ts`)

```typescript
export const createMockDeadline = (overrides = {}) => ({
  id: 'test-deadline-id',
  book_title: 'Test Book',
  author: 'Test Author',
  format: 'physical' as const,
  source: 'personal' as const,
  deadline_date: '2024-12-31T00:00:00Z',
  total_quantity: 300,
  flexibility: 'flexible' as const,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  user_id: 'test-user-id',
  progress: [],
  ...overrides,
});

export const createMockProgress = (overrides = {}) => ({
  id: 'test-progress-id',
  reading_deadline_id: 'test-deadline-id',
  current_progress: 50,
  created_at: '2024-01-05T00:00:00Z',
  updated_at: '2024-01-05T00:00:00Z',
  ...overrides,
});
```

## Implementation Timeline

### Phase 1: Foundation (Week 1)
- [x] Analyze existing test files and identify patterns
- [ ] Create base mock files with most common patterns
- [ ] Update setup.ts to import centralized mocks
- [ ] Create factory functions for test data

### Phase 2: Migration (Week 2)
- [ ] Migrate 10-15 test files to use centralized mocks
- [ ] Test migration to ensure no regressions
- [ ] Refine mock implementations based on test feedback
- [ ] Document patterns and create examples

### Phase 3: Full Implementation (Week 3-4)
- [ ] Migrate remaining test files
- [ ] Remove redundant mock code
- [ ] Create comprehensive documentation
- [ ] Performance testing and optimization

### Phase 4: Documentation & Training (Week 4)
- [ ] Update TESTING_README.md
- [ ] Create mock usage examples
- [ ] Team training on new patterns
- [ ] Establish code review guidelines

## Migration Strategy

### For Existing Tests
1. **Identify mock usage** in each test file
2. **Replace with centralized imports**:
   ```typescript
   // Before
   jest.mock('expo-router', () => ({
     router: { push: jest.fn() }
   }));
   
   // After
   import { mockExpoRouter } from '@/__mocks__/externalLibraries';
   ```
3. **Update test assertions** to use centralized mock references
4. **Remove redundant mock code**

### For New Tests
1. **Import required mocks** from centralized files
2. **Use factory functions** for test data creation
3. **Follow established patterns** documented in TESTING_README.md
4. **Override only when necessary** using jest.mocked()

## Testing Strategy

### Validation Approach
1. **Run existing test suite** before any changes
2. **Migrate tests incrementally** to avoid breaking changes
3. **Validate each migration** with targeted test runs
4. **Full regression testing** after each phase

### Quality Gates
- All existing tests must pass after migration
- No increase in test execution time
- Reduced lines of mock code (target: 80% reduction)
- Improved test reliability metrics

## Benefits and ROI

### Immediate Benefits
- **Reduced duplication**: ~80% reduction in mock code across test files
- **Faster test writing**: Developers can focus on test logic vs. mock setup
- **Consistency**: Standardized mock behaviors across all tests

### Long-term Benefits
- **Easier maintenance**: Single source of truth for mock patterns
- **Better reliability**: Consistent mocks reduce flaky tests
- **Improved onboarding**: New developers learn one set of patterns
- **Enhanced debugging**: Centralized mocks easier to troubleshoot

### Metrics to Track
- Lines of mock code before/after migration
- Test execution time
- Test failure rates
- Developer velocity for new test creation

## Risk Mitigation

### Potential Risks
1. **Breaking existing tests** during migration
2. **Performance impact** from centralized imports
3. **Reduced flexibility** for edge case testing

### Mitigation Strategies
1. **Incremental migration** with thorough testing at each step
2. **Lazy loading** of mocks to minimize performance impact
3. **Override mechanisms** for tests requiring custom behavior
4. **Rollback plan** to revert changes if issues arise

## Success Criteria

### Technical Success
- [ ] All existing tests pass after full migration
- [ ] 80% reduction in duplicated mock code
- [ ] No performance degradation in test execution
- [ ] Comprehensive documentation completed

### Team Success
- [ ] Team trained on new patterns
- [ ] Code review guidelines established
- [ ] New test creation follows centralized patterns
- [ ] Positive developer feedback on new system

## Next Steps

1. **Review and approve** this implementation plan
2. **Assign implementation team** and timeline
3. **Set up tracking** for success metrics
4. **Begin Phase 1** implementation
5. **Regular progress reviews** and plan adjustments

---

*This document will be updated as implementation progresses and new requirements are identified.*