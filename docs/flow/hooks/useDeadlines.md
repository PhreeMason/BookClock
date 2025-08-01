# useDeadlines Hook Flow Chart

## Overview
The `useDeadlines` module provides a comprehensive set of hooks for managing reading deadlines, including CRUD operations, progress tracking, and status management.

## Flow Chart

```mermaid
flowchart TD
    A[useDeadlines Module] --> B[useAddDeadline]
    A --> C[useUpdateDeadline]
    A --> D[useDeleteDeadline]
    A --> E[useUpdateDeadlineProgress]
    A --> F[useGetDeadlines]
    A --> G[useCompleteDeadline]
    A --> H[useSetAsideDeadline]
    A --> I[useGetArchivedDeadlines]
    
    B --> J[Generate Prefixed IDs]
    J --> K[Insert Deadline Record]
    K --> L[Insert Progress Record]
    L --> M[Create Status Entry]
    M --> N[Invalidate Queries]
    
    C --> O[Update Deadline Details]
    O --> P{Progress Exists?}
    P -->|Yes| Q[Update Progress]
    P -->|No| R[Create New Progress]
    Q --> S[Invalidate Queries]
    R --> S
    
    D --> T[Delete Progress Entries]
    T --> U[Delete Deadline Record]
    U --> V[Invalidate Queries]
    
    E --> W[Generate Progress ID]
    W --> X[Create Progress Entry]
    X --> Y[Invalidate Queries]
    
    F --> Z[Fetch Deadlines with Relations]
    Z --> AA[Filter by Status]
    AA --> BB[Return Filtered Data]
    
    G --> CC[Create Status: 'complete']
    H --> DD[Create Status: 'set_aside']
    CC --> EE[Invalidate Queries]
    DD --> EE
    
    I --> FF[Fetch All Deadlines]
    FF --> GG[Filter Archived Only]
    GG --> HH[Sort by Completion Date]
    HH --> II[Return Archived Data]
    
    N --> JJ[Cache Updated]
    S --> JJ
    V --> JJ
    Y --> JJ
    BB --> JJ
    EE --> JJ
    II --> JJ
```

## Key Features

### CRUD Operations
- **Add Deadline**: Creates new deadline with progress and status tracking
- **Update Deadline**: Modifies existing deadline and associated progress
- **Delete Deadline**: Removes deadline and all related data
- **Progress Updates**: Tracks reading progress with timestamps

### Status Management
- **Active Deadlines**: Filter for currently reading deadlines
- **Complete Deadlines**: Mark deadlines as completed
- **Set Aside**: Temporarily pause deadlines
- **Archived View**: Separate view for completed/set aside deadlines

### Data Relationships
- **Deadline → Progress**: One-to-many relationship for progress tracking
- **Deadline → Status**: One-to-many relationship for status history
- **User → Deadlines**: User-specific deadline management

## Usage Patterns

### Adding a Deadline
```typescript
const addDeadline = useAddDeadline();
addDeadline.mutate({
  deadlineDetails: { /* deadline data */ },
  progressDetails: { /* progress data */ }
});
```

### Fetching Deadlines
```typescript
const { data: deadlines, isLoading } = useGetDeadlines();
const { data: archived } = useGetArchivedDeadlines();
```

### Updating Progress
```typescript
const updateProgress = useUpdateDeadlineProgress();
updateProgress.mutate({
  deadlineId: 'rd_123',
  currentProgress: 150
});
```

### Status Changes
```typescript
const completeDeadline = useCompleteDeadline();
const setAsideDeadline = useSetAsideDeadline();
```

## Dependencies
- `@tanstack/react-query` (for data fetching and caching)
- `@clerk/clerk-expo` (for user authentication)
- `@/lib/supabase` (for database operations)
- `@/types/deadline` (for TypeScript types) 