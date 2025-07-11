# Reading Timer Feature - Implementation Plan

## Overview
Add a full-screen reading timer feature to the deadlines view that provides a distraction-free reading experience with automatic progress tracking.

## Current Architecture Analysis

### Existing Components
- **Deadlines View**: `/app/(authenticated)/deadline/[id]/view.tsx` - Main deadline detail screen
- **ActiveReads**: `/components/ActiveReads.tsx` - Deadline cards with swipeable charts
- **Progress Tracking**: `useUpdateDeadlineProgress` hook with React Query mutations
- **Theme System**: Comprehensive theming with `useAppTheme()` hook
- **UI Components**: `ThemedButton`, `ThemedText`, and other themed components

### Current Progress Flow
1. User opens deadline detail view
2. Manual progress updates via ReadingProgress component
3. Progress stored in Supabase via optimistic React Query mutations
4. Charts and calculations update automatically

## Feature Requirements

### Core Functionality
- **Full-screen timer modal** accessible from deadline views
- **Format-aware timing** (pages for books, minutes for audiobooks)
- **Automatic progress calculation** based on user's reading pace
- **Session persistence** if app backgrounds/foregrounds
- **Manual progress override** option before saving

### User Experience
- **Minimal distractions** - clean, focused interface
- **Large, readable timer** display
- **Easy controls** - start/pause/stop with clear visual feedback
- **Haptic feedback** on interactions
- **Gesture support** - swipe down to close (with confirmation)

### Integration Points
- **Deadline Cards** - floating timer button on ActiveReads cards
- **Deadline Detail** - "Start Reading Session" button
- **Progress System** - seamless integration with existing update flow
- **Theme System** - full theme support including dark mode

## Technical Implementation

### New Components Architecture

```
src/components/timer/
├── TimerModal.tsx              # Main full-screen modal wrapper
├── ReadingTimer.tsx            # Core timer logic and state
├── TimerDisplay.tsx            # Large centered timer display
├── TimerControls.tsx           # Start/pause/stop buttons
├── SessionSummary.tsx          # End-of-session progress summary
└── __tests__/
    ├── TimerModal.test.tsx
    ├── ReadingTimer.test.tsx
    └── TimerControls.test.tsx
```

### State Management Strategy

#### Custom Hook: `useReadingTimer`
```typescript
interface TimerState {
  isRunning: boolean;
  isPaused: boolean;
  elapsedTime: number; // seconds
  startTime: Date | null;
  sessionId: string;
}

interface TimerActions {
  start: () => void;
  pause: () => void;
  stop: () => void;
  reset: () => void;
}
```

#### Session Data Structure
```typescript
interface ReadingSession {
  id: string;
  deadlineId: string;
  startTime: Date;
  endTime?: Date;
  elapsedSeconds: number;
  estimatedProgress: number;
  actualProgress?: number;
  format: 'physical' | 'ebook' | 'audiobook';
}
```

### Database Integration

#### Option A: Session Tracking (Recommended)
- Create `reading_sessions` table for analytics
- Store session data for user insights
- Enable future features (reading streaks, time analytics)

#### Option B: Progress-Only (Minimal)
- No session storage
- Direct progress updates only
- Simpler implementation

### UI/UX Specifications

#### Timer Modal Layout
```
┌─────────────────────────────────┐
│ [×] Book Title              [⚙] │ ← Header
├─────────────────────────────────┤
│                                │
│        📖 Book Cover           │ ← Book Info
│        "Book Title"            │
│                                │
│       ⏱️ 00:45:32              │ ← Large Timer
│                                │
│     ▶️  ⏸️  ⏹️                 │ ← Controls
│                                │
│ [📊 Save Progress: 15 pages]   │ ← Save Button
└─────────────────────────────────┘
```

#### Color Scheme (Theme-aware)
- **Background**: `theme.colors.surface`
- **Timer Text**: `theme.colors.onSurface` (extra large)
- **Controls**: `theme.colors.primary` (active), `theme.colors.outline` (inactive)
- **Progress Button**: `theme.colors.accent`

### Progress Calculation Logic

#### Reading (Physical/Ebook)
```typescript
const estimatedPages = Math.round(
  (elapsedMinutes / averageReadingPace) * paceMultiplier
);
```

#### Listening (Audiobook)
```typescript
const progressMinutes = elapsedMinutes; // Direct 1:1 mapping
```

### Entry Points & Navigation

#### 1. Deadline Card (ActiveReads)
- **Timer Button**: Floating action button on swipeable chart
- **Icon**: ⏱️ with subtle animation
- **Placement**: Bottom-right corner of card

#### 2. Deadline Detail View
- **Timer Button**: In DeadlineActionButtons section
- **Style**: Primary button with timer icon
- **Text**: "Start Reading Session"

#### 3. ReadingProgress Component
- **Quick Timer**: Small timer icon next to progress input
- **Behavior**: Launch timer modal pre-configured for current book

### Error Handling & Edge Cases

#### App State Management
- **Background**: Pause timer, save state
- **Foreground**: Resume timer, show notification
- **Network Issues**: Queue progress updates, retry on reconnection
- **Low Battery**: Show warning, offer to save progress

#### User Scenarios
- **Accidental Close**: Confirmation dialog if timer running
- **Multiple Sessions**: Prevent simultaneous timers
- **Progress Conflicts**: Handle optimistic update conflicts
- **Invalid Progress**: Validate against book length/format

### Performance Considerations

#### Timer Optimization
- Use `useRef` for interval management
- Minimize re-renders during timer updates
- Implement efficient background/foreground handling

#### React Query Integration
- **Cache Strategy**: Include timer sessions in user queries
- **Optimistic Updates**: Immediate UI feedback
- **Error Recovery**: Rollback on failed mutations

### Testing Strategy

#### Unit Tests
- Timer logic accuracy
- Progress calculations
- State transitions
- Error scenarios

#### Integration Tests
- Modal interactions
- Progress updates
- Theme switching
- Navigation flows

#### Manual Testing
- Background/foreground behavior
- Different book formats
- Network connectivity issues
- Accessibility features

## Development Phases

### Phase 1: Core Timer (Week 1)
- [ ] `TimerModal` component with basic layout
- [ ] `useReadingTimer` hook with start/pause/stop
- [ ] `TimerDisplay` with formatted time
- [ ] Integration with deadline detail view

### Phase 2: Progress Integration (Week 2)
- [ ] Progress calculation logic
- [ ] Integration with `useUpdateDeadlineProgress`
- [ ] Session summary and save functionality
- [ ] Toast notifications and error handling

### Phase 3: Polish & Entry Points (Week 3)
- [ ] Timer buttons on deadline cards
- [ ] Animations and haptic feedback
- [ ] Theme integration and dark mode
- [ ] Comprehensive testing

### Phase 4: Advanced Features (Future)
- [ ] Session analytics and insights
- [ ] Reading streak tracking
- [ ] Focus mode settings
- [ ] Background audio support

## Files to Create/Modify

### New Files
```
src/components/timer/TimerModal.tsx
src/components/timer/ReadingTimer.tsx
src/components/timer/TimerDisplay.tsx
src/components/timer/TimerControls.tsx
src/components/timer/SessionSummary.tsx
src/components/timer/__tests__/TimerModal.test.tsx
src/components/timer/__tests__/ReadingTimer.test.tsx
src/hooks/useReadingTimer.ts
src/types/timer.ts
```

### Modified Files
```
src/app/(authenticated)/deadline/[id]/view.tsx
src/components/DeadlineActionButtons.tsx
src/components/ActiveReads.tsx
src/components/ReadingProgress.tsx (optional)
```

## Success Metrics

### User Engagement
- **Timer Usage Rate**: % of users who start reading sessions
- **Session Completion**: % of sessions that end with progress updates
- **Session Duration**: Average reading session length
- **Retention**: Impact on daily/weekly active users

### Technical Performance
- **Load Time**: Timer modal open time < 200ms
- **Battery Impact**: Minimal battery drain during sessions
- **Crash Rate**: Zero crashes related to timer functionality
- **Progress Accuracy**: Calculated vs. actual progress correlation

## Risk Mitigation

### Technical Risks
- **Performance**: Optimize timer updates, minimize re-renders
- **Battery Drain**: Efficient background handling
- **Data Loss**: Implement session persistence
- **Conflicts**: Handle simultaneous progress updates

### User Experience Risks
- **Complexity**: Keep interface minimal and intuitive
- **Accuracy**: Provide manual override options
- **Interruptions**: Graceful handling of app state changes

## Future Enhancements

### Analytics Dashboard
- Reading time trends
- Peak reading hours
- Format preferences
- Progress accuracy insights

### Social Features
- Reading challenges
- Shared reading sessions
- Community leaderboards

### Advanced Timer Features
- Pomodoro technique integration
- Background music/sounds
- Reading environment recommendations
- Smart break suggestions

---

**Document Version**: 1.0  
**Last Updated**: 2025-07-01  
**Review Status**: Pending Team Review