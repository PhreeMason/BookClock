# Reading & Listening Data Separation

## Overview

As of June 2025, the application has been updated to completely separate reading data (physical books + ebooks) from listening data (audiobooks). This change improves data accuracy and provides users with more meaningful insights about their reading habits.

## What Changed

### Before: Mixed Calculations
- Audio minutes were converted to "page equivalents" using a 1.5 minutes/page ratio
- All data was combined into single charts and statistics
- Pace calculations mixed reading speed with listening activity
- Confusing "page equivalents" terminology throughout the UI

### After: Separated Data Streams
- **Reading Data**: Physical books + ebooks (both measured in pages)
- **Listening Data**: Audiobooks (measured in minutes/hours)
- **No Cross-Format Conversions**: Each format maintains its native units
- **Clear UI Language**: No more confusing "page equivalents" terminology

## New Components

### Format-Specific Charts
- **`DailyReadingProgressChart`**: Shows daily reading progress for physical + ebook books in pages
- **`DailyListeningProgressChart`**: Shows daily listening progress for audiobooks in minutes/hours
- **`DailyPagesChart`**: Combined view showing both reading and listening (for "Combined" toggle option)

### UI Controls
- **`ReadingListeningToggle`**: Allows users to switch between Reading, Listening, and Combined views
- Categories: `reading` | `listening` | `combined`

### Enhanced Pace Tracking
- **Reading Pace**: Pages per day (physical + ebook books only)
- **Listening Pace**: Minutes per day (audiobooks only)
- **Separate Reliability**: Each pace type has its own reliability calculation (≥3 days = reliable)

## Updated Components

### Stats Page (`stats.tsx`)
- **Dual Pace Display**: Side-by-side reading and listening pace with separate reliability indicators
- **Category Toggle**: Users can filter charts by reading/listening/combined
- **Clear Visual Separation**: Different icons and colors for reading vs listening

### Pace Calculations (`paceCalculations.ts`)
#### New Functions:
- `getRecentListeningDays()`: Extracts listening activity from audio deadlines
- `calculateUserListeningPace()`: Calculates listening pace with same tier system as reading
- `formatListeningPaceDisplay()`: Formats listening pace as "Xh Ym/day" or "Xm/day"

#### Updated Functions:
- `getRecentReadingDays()`: Now filters to physical + ebook deadlines only
- `calculateUserPace()`: Separated from audio data completely

### Pace Provider (`PaceProvider.tsx`)
- **Enhanced Context**: Now provides both `userPaceData` and `userListeningPaceData`
- **New Utilities**: Functions for listening pace reliability and calculation method

### Chart Components
#### Updated Labels and Terminology:
- **DailyPagesChart** (Combined):
  - Title: "Daily Combined Progress"
  - Stats: "Total combined", "Avg per day"
  - Legend: "Combined reading & listening activity"

- **TotalProgressRingChart**:
  - Labels: "Progress completed" / "Progress remaining" (instead of "page equivalents")

## Technical Implementation

### Data Flow Separation
```typescript
// Reading data (pages)
const readingDeadlines = deadlines.filter(d => 
  d.format === 'physical' || d.format === 'ebook'
);

// Listening data (minutes)
const audioDeadlines = deadlines.filter(d => 
  d.format === 'audio'
);
```

### Pace Calculation Tiers
Both reading and listening pace use the same reliability system:

**Tier 1: Reliable (≥3 days of activity in past 7 days)**
- Uses actual user activity data
- Reading: Average pages per day
- Listening: Average minutes per day

**Tier 2: Estimate (<3 days of activity)**
- Uses default estimates
- Reading: 25 pages/day
- Listening: 30 minutes/day

### Chart Height Standardization
All daily progress charts now use consistent 240px height to prevent label cutoff:
- `DailyReadingProgressChart`: 240px
- `DailyListeningProgressChart`: 240px
- `DailyPagesChart`: 240px (combined view)

## User Benefits

### Improved Accuracy
- Reading pace reflects actual reading speed (pages/day)
- Listening pace reflects actual listening habits (minutes/day)
- No artificial conversions between fundamentally different activities

### Better Insights
- Users can see separate patterns for reading vs listening
- More meaningful comparisons within each format
- Clear understanding of progress in native units

### Enhanced UX
- Toggle between reading/listening views
- Dual pace display with separate reliability indicators
- Consistent chart heights and improved visual design
- Clear, non-technical language throughout

## Migration Notes

### Backward Compatibility
- Existing data remains unchanged in the database
- All calculations work with existing progress entries
- No data migration required

### Default Estimates
- Users with insufficient data see helpful default estimates
- Clear indication of data reliability (Reliable vs Estimate)
- Gradual transition to reliable data as users log more activity

## Files Modified

### Core Calculation Files
- `src/lib/paceCalculations.ts`: New listening pace functions
- `src/contexts/PaceProvider.tsx`: Enhanced with listening pace data

### Component Files
- `src/components/DailyReadingProgressChart.tsx`: New reading-only chart
- `src/components/DailyListeningProgressChart.tsx`: New listening-only chart
- `src/components/ReadingListeningToggle.tsx`: New toggle component
- `src/components/DailyPagesChart.tsx`: Updated combined chart
- `src/components/TotalProgressRingChart.tsx`: Updated labels

### UI Files
- `src/app/(authenticated)/stats.tsx`: Enhanced pace section
- `src/components/ui/IconSymbol.tsx`: Added new icon mappings

## Future Enhancements

### Potential Additions
- Format-specific reading streaks
- Separate velocity charts (ReadingVelocityChart + ListeningVelocityChart)
- Advanced listening analytics (playback speed tracking)
- Reading vs listening time comparison tools

### Considerations
- Keep data streams separate while maintaining unified user experience
- Consider user preferences for default view (reading/listening/combined)
- Monitor user adoption of new toggle functionality

---

*Last updated: June 30, 2025*