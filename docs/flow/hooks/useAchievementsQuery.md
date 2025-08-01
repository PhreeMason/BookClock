# useAchievementsQuery Hook Flow Chart

## Overview
The `useAchievementsQuery` hook manages achievement data fetching, caching, and unlocking operations using React Query for state management and optimistic updates.

## Flow Chart

```mermaid
flowchart TD
    A[useAchievementsQuery Hook Called] --> B[Initialize Dependencies]
    B --> C[Get User ID, Supabase, Active Deadlines]
    C --> D[Create Achievement Service Instance]
    D --> E{User Authenticated?}
    
    E -->|No| F[Return Disabled State]
    E -->|Yes| G[Initialize React Query]
    
    G --> H[Main Query: Fetch Achievements]
    H --> I[Call AchievementService.getAchievementsWithStatus]
    I --> J[Process Achievement Data]
    J --> K[Calculate Progress & Status]
    K --> L[Return Achievement Data]
    
    L --> M[Data Transformations]
    M --> N[Group by Category]
    N --> O[Sort by Unlock Status & Progress]
    O --> P[Calculate Totals]
    
    P --> Q[Return Transformed Data]
    
    R[Unlock Mutation] --> S[Optimistic Update]
    S --> T[Update Local Cache]
    T --> U[Call Supabase Insert]
    U --> V{Success?}
    V -->|Yes| W[Show Success Toast]
    V -->|No| X[Revert Optimistic Update]
    X --> Y[Show Error Toast]
    W --> Z[Invalidate Queries]
    Y --> Z
    
    Z --> AA[Refetch Achievement Data]
```

## Key Features

### Data Management
- **React Query Integration**: Automatic caching, background updates, and error handling
- **Optimistic Updates**: Immediate UI feedback for unlock operations
- **Data Transformation**: Grouping, sorting, and progress calculations

### Achievement Operations
- **Fetch with Status**: Retrieves achievements with current unlock status and progress
- **Unlock Mutation**: Handles achievement unlocking with optimistic updates
- **Progress Tracking**: Real-time progress calculation and updates

### Caching Strategy
- **Stale Time**: 5 minutes before refetching
- **Cache Time**: 30 minutes for background retention
- **Smart Invalidation**: Targeted cache updates

## Usage Pattern
```typescript
const {
  achievements,
  achievementsByCategory,
  totalUnlocked,
  totalAchievements,
  isLoading,
  unlockAchievement,
  isUnlocking
} = useAchievementsQuery();
```

## Dependencies
- `@tanstack/react-query` (for data fetching and caching)
- `@clerk/clerk-expo` (for authentication)
- `@/services/achievementService` (for business logic)
- `@/lib/supabase` (for database operations)
- `@/contexts/DeadlineProvider` (for active deadlines) 