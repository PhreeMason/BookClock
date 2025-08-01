# useReadingHistory Hook Flow Chart

## Overview
The `useReadingHistory` hook provides comprehensive reading history analysis, including daily progress tracking, format filtering, and calendar data generation for visualization.

## Flow Chart

```mermaid
flowchart TD
    A[useDeadlineHistory Hook Called] --> B[Initialize Options]
    B --> C[Get Date Range & Format Filter]
    C --> D[Calculate Date Range Start]
    D --> E[Determine Format Filter]
    E --> F[Initialize React Query]
    
    F --> G[Fetch Deadlines with Progress]
    G --> H[Filter by Date Range]
    H --> I[Filter by Format]
    I --> J[Process Deadline Data]
    
    J --> K[Initialize Daily Entries Map]
    K --> L[Iterate Through Deadlines]
    L --> M[Process Progress Entries]
    
    M --> N[Group Progress by Date]
    N --> O[Calculate Daily Progress]
    O --> P{First Progress Entry?}
    
    P -->|Yes| Q[Check Deadline Creation Date]
    P -->|No| R[Calculate Progress Difference]
    
    Q --> S{Deadline Created Same Day?}
    S -->|Yes| T[Set Progress Made to 0]
    S -->|No| U[Set Progress Made to Current Progress]
    
    R --> V[Calculate: Current - Previous]
    T --> W[Add to Daily Entries]
    U --> W
    V --> W
    
    W --> X[Update Total Progress Made]
    X --> Y{More Deadlines?}
    Y -->|Yes| L
    Y -->|No| Z[Convert to Array & Sort]
    
    Z --> AA[Calculate Summary Statistics]
    AA --> BB[Count Active vs Archived]
    BB --> CC[Calculate Averages]
    CC --> DD[Return Processed Data]
    
    DD --> EE[Generate Calendar Data]
    EE --> FF[Process Each Entry]
    FF --> GG[Determine Calendar Colors]
    GG --> HH[Create Marked Dates]
    HH --> II[Return Calendar Data]
    
    II --> JJ[Return Hook Data]
```

## Key Features

### Data Processing
- **Daily Aggregation**: Groups progress by date for calendar visualization
- **Progress Calculation**: Calculates daily progress differences and cumulative totals
- **Format Filtering**: Supports reading, listening, or combined format views
- **Date Range Filtering**: Configurable time periods (7d, 30d, 90d, 1y, all)

### Calendar Integration
- **Color Coding**: Different colors for reading, listening, and combined activities
- **Marked Dates**: Visual indicators for days with reading activity
- **Performance Optimization**: Memoized calendar data generation

### Summary Statistics
- **Total Days**: Count of days with reading activity
- **Total Progress**: Cumulative progress across all deadlines
- **Average Progress**: Daily average progress calculation
- **Active vs Archived**: Count of active vs completed deadlines

## Usage Pattern
```typescript
const {
  data,
  isLoading,
  calendarData,
  summary
} = useDeadlineHistory({
  dateRange: '90d',
  formatFilter: 'all'
});
```

## Data Structure

### Daily Entry
```typescript
interface DailyDeadlineEntry {
  date: string;
  deadlines: {
    id: string;
    book_title: string;
    format: 'physical' | 'ebook' | 'audio';
    progress_made: number;
    total_progress: number;
    // ... other fields
  }[];
  totalProgressMade: number;
}
```

### Summary Data
```typescript
interface Summary {
  totalDays: number;
  totalProgressMade: number;
  averageProgressPerDay: number;
  activeDeadlines: number;
  ArchivedDeadlines: number;
}
```

## Dependencies
- `@tanstack/react-query` (for data fetching and caching)
- `@clerk/clerk-expo` (for user authentication)
- `@/lib/supabase` (for database operations)
- `react` (for useMemo optimization) 