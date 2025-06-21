# Lib Tests

This directory contains comprehensive tests for all functions in the `src/lib` folder.

## Test Files

- `deadlineCalculations.test.ts` - Tests for deadline calculation functions
- `deadlineUtils.test.ts` - Tests for deadline utility functions  
- `deadlineFormSchema.test.ts` - Tests for form validation schema

## Running Tests

### Run all lib tests
```bash
npm test src/lib/__tests__
```

### Run specific test file
```bash
npm test src/lib/__tests__/deadlineCalculations.test.ts
```

### Run tests with coverage
```bash
npm test -- --coverage src/lib/__tests__
```

### Run tests in watch mode
```bash
npm test -- --watch src/lib/__tests__
```

## Test Coverage

The tests cover:

### deadlineCalculations.ts
- ✅ `calculateTotalQuantityFromForm` - Form data processing for all formats
- ✅ `calculateCurrentProgressFromForm` - Current progress calculation from form data
- ✅ `calculateTotalQuantity` - Database data processing for all formats
- ✅ `calculateCurrentProgress` - Current progress calculation from database data
- ✅ `calculateRemaining` - Remaining calculation for all formats
- ✅ `calculateRemainingFromForm` - Remaining calculation from form data
- ✅ `getReadingEstimate` - Reading time estimates for all formats
- ✅ `getPaceEstimate` - Daily pace calculations for all formats

### deadlineUtils.ts
- ✅ `separateDeadlines` - Separating active and overdue deadlines
- ✅ `calculateDaysLeft` - Days remaining calculation
- ✅ `calculateProgress` - Latest progress calculation
- ✅ `calculateProgressPercentage` - Progress percentage calculation
- ✅ `getUnitForFormat` - Unit display for different formats
- ✅ `formatProgressDisplay` - Progress formatting for display

### deadlineFormSchema.ts
- ✅ `deadlineFormSchema` - Complete form validation schema
- ✅ All field validations (required, optional, format, constraints)
- ✅ Error message validation
- ✅ Type coercion testing

## Test Structure

Each test file follows the structure:
```typescript
describe('ModuleName', () => {
  describe('functionName', () => {
    it('should handle valid case', () => {
      // Test implementation
    });
    
    it('should handle edge case', () => {
      // Test implementation
    });
    
    it('should handle error case', () => {
      // Test implementation
    });
  });
});
```

## Mocking

- **Date/Time**: Uses Jest's fake timers for consistent date-based testing
- **External Dependencies**: Mocks Clerk auth and Supabase client
- **Environment Variables**: Mocked for consistent test environment

## Best Practices

1. **Comprehensive Coverage**: Each function has multiple test cases covering happy path, edge cases, and error conditions
2. **Clear Test Names**: Test descriptions clearly indicate what is being tested
3. **Isolated Tests**: Each test is independent and doesn't rely on other tests
4. **Mock Data**: Uses realistic mock data that matches the actual data structures
5. **Type Safety**: All tests are fully typed with TypeScript
6. **Date Consistency**: All date-based tests use Jest fake timers to prevent future failures

## Adding New Tests

When adding new functions to the lib folder:

1. Create a new test file: `newFunction.test.ts`
2. Follow the existing test structure and naming conventions
3. Include tests for all code paths (success, failure, edge cases)
4. Update this README with the new test coverage
5. Ensure all tests pass before committing 