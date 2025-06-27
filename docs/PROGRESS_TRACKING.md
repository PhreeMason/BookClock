# Progress Tracking System

The R-R-Books app includes a comprehensive progress tracking system that allows users to monitor their reading progress over time with format-specific handling and historical data persistence.

## Overview

The progress tracking system is built around a modular component architecture that handles different book formats (physical, ebook, audio) with appropriate display formatting and input handling.

## Architecture

### Database Schema

The progress tracking uses the `reading_deadline_progress` table:

```sql
reading_deadline_progress (
  id: string (UUID)
  reading_deadline_id: string (foreign key)
  current_progress: number
  created_at: timestamp
  updated_at: timestamp
)
```

**Key Design Decisions:**
- **Historical Tracking**: Each progress update creates a new entry (no updates to existing entries)
- **Foreign Key Relationship**: Proper relationship to `reading_deadlines` table
- **UUID Primary Keys**: Ensures unique identification across distributed systems

### Component Architecture

The progress tracking UI is built using a modular component system:

```
components/progress/
├── ProgressHeader.tsx      # Header with icon and title
├── ProgressStats.tsx       # Current/total/remaining statistics
├── ProgressBar.tsx         # Visual progress bar with percentage
├── ProgressInput.tsx       # Smart input with format handling
└── QuickActionButtons.tsx  # Quick increment buttons
```

### Main Progress Component

The `ReadingProgress` component orchestrates all sub-components:

```typescript
<ReadingProgress deadline={deadline}>
  <ProgressHeader />
  <ProgressStats 
    currentProgress={progress}
    totalQuantity={total}
    remaining={remaining}
    format={format}
    urgencyLevel={urgency}
  />
  <ProgressBar 
    currentProgress={progress}
    totalQuantity={total}
    progressPercentage={percentage}
    format={format}
    deadlineDate={deadline}
  />
  <ProgressInput 
    format={format}
    control={control}
    setValue={setValue}
    currentProgress={progress}
  />
  <QuickActionButtons 
    unitsPerDay={unitsPerDay}
    onQuickUpdate={handleQuickUpdate}
  />
</ReadingProgress>
```

## Format-Specific Handling

### Physical Books & Ebooks
- **Display**: Page numbers (e.g., "37 of 52")
- **Input**: Numeric input for page numbers
- **Labels**: "READ", "TOTAL", "LEFT"

### Audiobooks
- **Display**: Time format (e.g., "4h 41m of 8h 39m")
- **Input**: Smart time parsing ("2h 30m", "2h", "30m", or plain minutes)
- **Labels**: "LISTENED", "TOTAL TIME", "REMAINING"
- **Conversion**: Automatic conversion between minutes and "Xh Ym" format

## Smart Input System

### AudioBook Time Input
The `AudiobookProgressInput` component provides comprehensive audiobook time parsing:

```typescript
// Supported formats (all converted to minutes internally):
parseAudiobookTime('3h 2m')      // => 182
parseAudiobookTime('3H 2M')      // => 182 (case insensitive)
parseAudiobookTime('3h2m')       // => 182 (no spaces)
parseAudiobookTime('03h 02m')    // => 182 (leading zeros)
parseAudiobookTime('3:02')       // => 182 (colon format)
parseAudiobookTime('3:02:30')    // => 182 (ignores seconds)
parseAudiobookTime('2.5h')       // => 150 (decimal hours)
parseAudiobookTime('2,5h')       // => 150 (European format)
parseAudiobookTime('45m')        // => 45  (minutes only)
parseAudiobookTime('182')        // => 182 (plain number as minutes)
parseAudiobookTime('3 hours 2 minutes') // => 182 (full words)

// Formatting for display:
formatAudiobookTime(182)         // => "3h 2m"
formatAudiobookTime(180)         // => "3h"
formatAudiobookTime(45)          // => "45m"
```

**Key Features:**
- **Real-time validation** with visual feedback
- **Auto-formatting** on blur for consistency  
- **Error recovery** - restores last valid value for invalid input
- **Always stores as minutes** for database consistency
- **Comprehensive format support** - handles virtually any reasonable time input

### Mixed Value Support
The `CustomInput` component handles both string and number values:

```typescript
// Handles form schemas with z.coerce.number()
const displayValue = typeof value === 'number' ? value.toString() : value || '';

const handleChangeText = (text: string) => {
  if (keyboardType === 'numeric' && text) {
    const numericValue = parseFloat(text);
    if (!isNaN(numericValue)) {
      onChange(numericValue);
      return;
    }
  }
  onChange(text);
};
```

## Progress Update Flow

### 1. User Input
- User enters progress via input field or quick action buttons
- Format-specific parsing converts input to appropriate format
- Form validation ensures valid values

### 2. Database Update
```typescript
const useUpdateDeadlineProgress = () => {
  return useMutation({
    mutationFn: async ({ reading_deadline_id, current_progress }) => {
      const { data, error } = await supabase
        .from('reading_deadline_progress')
        .insert({
          id: crypto.randomUUID(),
          reading_deadline_id,
          current_progress,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['deadlines']);
      Toast.show({
        type: 'success',
        text1: 'Progress Updated',
        text2: `Updated to ${formatProgressDisplay(newProgress, format)}`
      });
    }
  });
};
```

### 3. UI Updates
- Query invalidation triggers automatic UI refresh
- Toast notification provides user feedback
- Progress bar and stats update immediately

## Quick Action Buttons

Dynamic buttons based on daily reading pace:

```typescript
const QuickActionButtons = ({ unitsPerDay, onQuickUpdate }) => {
  const buttonValues = [
    unitsPerDay,           // 1 day worth
    unitsPerDay * 2,       // 2 days worth  
    unitsPerDay * 3        // 3 days worth
  ];

  return (
    <View style={styles.container}>
      {buttonValues.map((value, index) => (
        <ThemedButton
          key={index}
          variant="secondary"
          onPress={() => onQuickUpdate(value)}
        >
          +{value}
        </ThemedButton>
      ))}
    </View>
  );
};
```

## Progress Display Utilities

### Format-Aware Display
```typescript
const formatProgressDisplay = (progress: number, format: string): string => {
  if (format === 'audio') {
    return convertMinutesToTimeString(progress);
  }
  return progress.toString();
};
```

### Progress Calculations
```typescript
const calculateProgressPercentage = (current: number, total: number): number => {
  if (total === 0) return 0;
  return Math.round((current / total) * 100);
};

const calculateRemaining = (current: number, total: number): number => {
  return Math.max(0, total - current);
};
```

## Error Handling

### Form Validation
- Zod schema validation with proper error messages
- Input bounds checking (0 ≤ progress ≤ total)
- Format-specific validation rules

### Network Error Handling
```typescript
onError: (error) => {
  Toast.show({
    type: 'error',
    text1: 'Update Failed',
    text2: 'Please try again'
  });
}
```

### Loading States
- Button disabled during mutation
- Loading text ("Updating...")
- Visual feedback for user actions

## Testing Strategy

### Component Testing
- Unit tests for conversion utilities
- Component rendering tests
- User interaction testing
- Form validation testing

### Integration Testing
- Database integration tests
- Progress update flow testing
- Format-specific behavior testing

### Mock Strategy
```typescript
// Mock toast notifications
jest.mock('react-native-toast-message', () => ({
  default: {
    show: jest.fn(),
  },
}));

// Mock progress update hook
const mockUpdateProgress = jest.fn();
jest.mock('@/hooks/useDeadlines', () => ({
  useUpdateDeadlineProgress: () => ({
    mutateAsync: mockUpdateProgress,
    isLoading: false,
  }),
}));
```

## Best Practices

### Component Design
- **Single Responsibility**: Each component has one clear purpose
- **Reusability**: Components work across different contexts
- **Props Interface**: Minimal, focused prop interfaces
- **Error Boundaries**: Proper error handling at component level

### Data Management
- **Historical Preservation**: Never update existing progress entries
- **Atomic Updates**: Each progress update is a single database transaction
- **Query Invalidation**: Automatic UI updates via React Query
- **Optimistic Updates**: Consider implementing for better UX

### User Experience
- **Immediate Feedback**: Toast notifications for all actions
- **Loading States**: Clear indication of processing
- **Format Awareness**: Appropriate display for each book format
- **Input Flexibility**: Multiple input formats for audiobooks

### Performance
- **Memoization**: Prevent unnecessary re-renders
- **Lazy Loading**: Load progress history on demand
- **Debounced Input**: Prevent excessive API calls during typing
