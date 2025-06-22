# Deadline Provider

The Deadline Provider is a React Context that centralizes all deadline-related functionality, making it easy to access deadline data and calculations from any component in the app.

## Overview

Previously, components had to import multiple hooks and utility functions to work with deadlines:

```typescript
// Old way - multiple imports and manual calculations
import { useGetDeadlines } from '@/hooks/useDeadlines';
import { separateDeadlines, calculateDaysLeft, calculateProgress } from '@/lib/deadlineUtils';
import { calculateTotalQuantity, getReadingEstimate } from '@/lib/deadlineCalculations';

const MyComponent = () => {
  const { data: deadlines } = useGetDeadlines();
  const { active, overdue } = separateDeadlines(deadlines || []);
  
  // Manual calculations for each deadline
  const calculations = deadlines?.map(deadline => ({
    daysLeft: calculateDaysLeft(deadline.deadline_date),
    progress: calculateProgress(deadline),
    // ... more calculations
  }));
};
```

Now, with the Deadline Provider, everything is centralized:

```typescript
// New way - single import, all data and calculations available
import { useDeadlines } from '@/contexts/DeadlineProvider';

const MyComponent = () => {
  const { 
    deadlines, 
    activeDeadlines, 
    overdueDeadlines, 
    activeCount, 
    overdueCount,
    getDeadlineCalculations 
  } = useDeadlines();
  
  // All calculations done automatically
  const calculations = deadlines.map(deadline => 
    getDeadlineCalculations(deadline)
  );
};
```

## Setup

The Deadline Provider is automatically set up in the authenticated layout:

```typescript
// src/app/(authenticated)/_layout.tsx
import { DeadlineProvider } from '@/contexts/DeadlineProvider';

export default function ProtectedLayout() {
  return (
    <DeadlineProvider>
      <Stack>
        {/* Your authenticated screens */}
      </Stack>
    </DeadlineProvider>
  );
}
```

## Usage

### Basic Usage

```typescript
import { useDeadlines } from '@/contexts/DeadlineProvider';

const MyComponent = () => {
  const { 
    deadlines, 
    activeDeadlines, 
    overdueDeadlines, 
    isLoading, 
    error 
  } = useDeadlines();

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;

  return (
    <div>
      <h2>Active Deadlines: {activeDeadlines.length}</h2>
      <h2>Overdue Deadlines: {overdueDeadlines.length}</h2>
    </div>
  );
};
```

### Getting Calculations for a Single Deadline

```typescript
const DeadlineCard = ({ deadline }) => {
  const { getDeadlineCalculations } = useDeadlines();
  
  const {
    currentProgress,
    totalQuantity,
    remaining,
    progressPercentage,
    daysLeft,
    unitsPerDay,
    urgencyLevel,
    urgencyColor,
    statusMessage,
    readingEstimate,
    paceEstimate,
    unit
  } = getDeadlineCalculations(deadline);

  return (
    <div>
      <h3>{deadline.book_title}</h3>
      <p>Progress: {progressPercentage}%</p>
      <p>Days Left: {daysLeft}</p>
      <p>Pace: {paceEstimate}</p>
    </div>
  );
};
```

### Adding a New Deadline

```typescript
const AddDeadlineForm = () => {
  const { addDeadline } = useDeadlines();

  const handleSubmit = (formData) => {
    const deadlineDetails = {
      book_title: formData.title,
      author: formData.author,
      deadline_date: formData.deadline.toISOString(),
      total_quantity: formData.pages,
      format: formData.format,
      source: formData.source,
      flexibility: formData.flexibility
    };

    const progressDetails = {
      current_progress: formData.currentProgress || 0
    };

    addDeadline({ deadlineDetails, progressDetails });
  };

  return <form onSubmit={handleSubmit}>...</form>;
};
```

## Available Data and Methods

### Data Properties

- `deadlines`: All deadlines for the current user
- `activeDeadlines`: Deadlines that haven't passed their due date
- `overdueDeadlines`: Deadlines that have passed their due date
- `isLoading`: Whether deadlines are currently being fetched
- `error`: Any error that occurred while fetching deadlines
- `activeCount`: Number of active deadlines
- `overdueCount`: Number of overdue deadlines

### Methods

- `addDeadline(params)`: Add a new deadline
- `getDeadlineCalculations(deadline)`: Get all calculations for a specific deadline

### Utility Functions

- `calculateUnitsPerDay(totalQuantity, currentProgress, daysLeft, format)`: Calculate units needed per day
- `getUrgencyLevel(daysLeft)`: Get urgency level ('overdue', 'urgent', 'good', 'approaching')
- `getUrgencyColor(urgencyLevel)`: Get color for urgency level
- `getStatusMessage(urgencyLevel)`: Get status message for urgency level
- `formatUnitsPerDay(units, format)`: Format units per day display

## Calculations Available

When you call `getDeadlineCalculations(deadline)`, you get an object with:

- `currentProgress`: Current progress in appropriate units
- `totalQuantity`: Total quantity in appropriate units
- `remaining`: Remaining quantity
- `progressPercentage`: Progress as a percentage (0-100)
- `daysLeft`: Days until deadline (negative if overdue)
- `unitsPerDay`: Units needed per day to finish on time
- `urgencyLevel`: 'overdue' | 'urgent' | 'good' | 'approaching'
- `urgencyColor`: Color code for urgency
- `statusMessage`: Human-readable status message
- `readingEstimate`: Estimated reading time
- `paceEstimate`: Required pace to finish on time
- `unit`: Unit of measurement (pages/minutes)

## Benefits

1. **Centralized Logic**: All deadline calculations are in one place
2. **Consistent Data**: All components use the same data source
3. **Easy Testing**: Calculations can be tested independently
4. **Performance**: Calculations are done once and shared
5. **Type Safety**: Full TypeScript support with proper types
6. **Reusability**: Any component can easily access deadline data

## Migration Guide

To migrate existing components:

1. Replace `useGetDeadlines()` with `useDeadlines()`
2. Replace manual calculations with `getDeadlineCalculations()`
3. Remove imports of individual utility functions
4. Update component logic to use the centralized data

The provider maintains backward compatibility while providing a much cleaner API. 