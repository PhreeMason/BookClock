# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
```bash
npm start                  # Start Expo development server
npm run ios               # Run on iOS simulator
npm run android           # Run on Android emulator
npm run web               # Run in web browser
```

### Build & Deploy
```bash
npm run build:local       # Build APK locally using EAS
```

### Code Quality
```bash
npm run lint              # Run ESLint - ALWAYS run before completing tasks
npm run typecheck         # TypeScript type checking - ALWAYS run before completing tasks
npm test                  # Run Jest tests
```

### Database
```bash
npm run supabase:genTypes # Generate TypeScript types from Supabase when schema changes
```

## Architecture Overview

### Project Structure
This is a React Native mobile app using Expo framework for tracking reading deadlines and progress.

**IMPORTANT: This app is focused exclusively on reading deadlines and deadline-related functionality. All features should center around `reading_deadlines` and `reading_deadline_progress` tables. Other database schemas (like `book_reading_logs`, `achievements`, etc.) should be ignored unless explicitly stated as non-deadline features and marked with bold text for special attention.**

**Key architectural decisions:**
- **Routing**: File-based routing with Expo Router in `app/` directory
- **Authentication**: Clerk for OAuth (Google/Apple) - auth logic in `providers/auth.tsx`
- **Database**: Supabase for persistent storage - client in `utils/supabase.ts`
- **State Management**: 
  - React Query for server state (books, progress data)
  - DeadlineProvider context for active reading session state
  - React Hook Form for all forms with Zod validation

### Component Architecture
- **Themed Components**: All UI components use the theming system via `useAppTheme()` hook
- **Smart Inputs**: Format-aware inputs handle specialized data (e.g., AudiobookTimeInput for HH:MM:SS)
- **Modular Design**: Large components split into focused sub-components (see ActiveReads/)
- **Progress Tracking**: Standalone progress tracking system decoupled from deadline tracking

### Critical Patterns
1. **Theme Usage**: Always use `theme.colors` for colors, never hardcode
2. **Form Validation**: Use Zod schemas with React Hook Form
3. **Error Handling**: Use toast notifications for user feedback
4. **Testing**: Comprehensive test coverage expected for new features
5. **Type Safety**: Strict TypeScript mode - avoid `any` types
6. **Data Separation**: NEVER mix reading (pages) and listening (minutes) in calculations
7. **React Query Usage**: Use React Query for server state with proper caching strategies

### React Query Patterns
- **Caching Strategy**: Use appropriate stale time (5 minutes) and cache time (30 minutes) for user-specific data
- **Query Keys**: Include user ID in query keys for proper cache isolation
- **Optimistic Updates**: Use mutations with optimistic updates for better UX
- **Error Handling**: Implement proper rollback on mutation failures
- **Memoization**: Memoize expensive data transformations in custom hooks
- **Background Refetching**: Disable unnecessary refetching (`refetchOnMount: false`, `refetchOnWindowFocus: false`)

### Reading & Listening Data Separation
**CRITICAL**: Reading and listening data are completely separated as of June 2025.

**Reading Data (Physical + Ebook):**
- Both measured in pages
- Combined in `getRecentReadingDays()` and `calculateUserPace()`
- Displayed as "X pages/day"

**Listening Data (Audiobooks):**
- Measured in minutes/hours
- Processed by `getRecentListeningDays()` and `calculateUserListeningPace()`
- Displayed as "Xh Ym/day" or "Xm/day"

**What NOT to do:**
- Convert audio minutes to "page equivalents" in core calculations
- Mix reading and listening data in pace calculations
- Use confusing "page equivalents" terminology in UI

**What TO do:**
- Filter deadlines by format before calculations
- Use format-specific charts (DailyReadingProgressChart vs DailyListeningProgressChart)
- Provide toggle for reading/listening/combined views
- Keep native units (pages for reading, minutes for listening)

### Key Files to Understand
- `providers/deadline.tsx`: Core deadline tracking logic and state
- `lib/paceCalculations.ts`: **Reading & listening pace calculations (SEPARATED)**
- `contexts/PaceProvider.tsx`: Pace data context with dual reading/listening support
- `hooks/useBookDeadline.ts`: Main hook for deadline operations
- `hooks/useAchievementsQuery.ts`: React Query hook for achievements with caching
- `components/themed/`: Reusable themed UI components
- `components/DailyReadingProgressChart.tsx`: Reading-only chart (physical + ebook)
- `components/DailyListeningProgressChart.tsx`: Listening-only chart (audiobooks)
- `components/ReadingListeningToggle.tsx`: Category selection UI
- `components/AchievementsCard.tsx`: Main achievements display component
- `components/AchievementsSkeleton.tsx`: Skeleton loader for achievements
- `services/achievementCalculator.ts`: Achievement progress calculation logic
- `services/achievementService.ts`: Achievement management and unlocking
- `types/*.ts`: TypeScript type definitions

### Development Flow
1. Run development server with `npm start`
2. Make changes and test on device/simulator
3. Run `npm run lint` and `npm run typecheck` before completing any task
4. Write tests for new functionality
5. Use semantic commit messages

### Achievement System
The app includes a comprehensive achievement system to motivate users and track reading milestones:

**Streak Achievements (9 levels):**
- Dedicated Reader (25 days) → Reading Legend (1000+ days)
- Uses both current and historical streak tracking
- Efficient calculation supporting up to 3 years of data

**Achievement Architecture:**
- `AchievementCalculator`: Centralized calculation logic for all achievement types
- `AchievementService`: Database management and unlock checking
- `useAchievementsQuery`: React Query hook for efficient data fetching and caching
- Dynamic system - new achievements automatically integrate without service changes
- Database constraints: category must be in ['reading', 'consistency', 'volume', 'speed', 'exploration', 'social']

**Performance Optimizations:**
- **React Query Caching**: Achievements are cached for 5 minutes (stale time) and 30 minutes (cache time)
- **Memoization**: Expensive calculations (sorting, categorizing) are memoized using `useMemo`
- **Skeleton Loading**: Beautiful animated skeleton shown during initial load
- **Optimistic Updates**: Instant UI feedback when unlocking achievements
- **No Refetch on Mount**: Achievements load from cache when returning to the screen

**Testing Requirements:**
- All new achievements must have comprehensive test coverage
- Include edge case testing (gaps, corrections, multiple daily entries)
- Use sample data tests to verify real-world behavior

### Important Context
- The app supports three book formats: physical books (pages), ebooks (pages), and audiobooks (minutes)
- **Data Separation**: Reading data (physical + ebook) is completely separated from listening data (audiobooks)
- **No Format Mixing**: Each format maintains its native units - no cross-format conversions in core calculations
- Progress tracking is independent of deadline tracking to support flexible reading habits
- The theme system includes 16+ themes with automatic light/dark variants
- All times are stored in UTC and converted to user's timezone for display
- Achievement system tracks reading consistency and milestone achievements