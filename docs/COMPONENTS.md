# Component API Reference

> **Note:** All components can be imported using `@/components/COMPONENT_NAME`

## Design System & Theming

Our app uses a cohesive design system to ensure a consistent look and feel. This is built upon a semantic color palette and a set of themed components.

### Color Palette
**Location:** `src/constants/Colors.ts`

The `Colors.ts` file exports a `Colors` object that contains color palettes for both `light` and `dark` modes. The colors are organized semantically to represent their function in the UI.

**Semantic Color Names:**
- `text`: Default text color.
- `textMuted`: For secondary or less important text.
- `background`: The screen background color.
- `card`: The background color for card-like components.
- `border`: The color for borders and dividers.
- `primary`: The primary accent color, used for buttons and important elements.
- `primaryForeground`: The color for text and icons on a primary-colored background.
- `destructive`: Red color for danger/delete actions.
- `destructiveForeground`: Text color for destructive buttons.
- `successForeground`: Text color for success buttons.
- `icon`: The default color for icons.
- `tabIconDefault`: The color for inactive tab bar icons.
- `tabIconSelected`: The color for the active tab bar icon.

### Using Themed Components
The core of our design system is a set of theme-aware components that automatically adapt to light and dark modes. You should always prefer these components over standard React Native components.

---

## Themed Components

### ThemedButton
**API:**
- Props: `TouchableOpacityProps & { variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'success'; backgroundColor?: string; textColor?: string; borderColor?: string; children: React.ReactNode }`

**Use Case:** Primary button component with multiple variants and theme support. Supports custom colors while falling back to variant defaults.

**Variants:**
- `primary`: Blue background with white text (default)
- `secondary`: Card background with border and regular text
- `danger`: Red background with white text for destructive actions
- `ghost`: Transparent background with border and regular text
- `success`: Green background with white text for positive actions

**Example:**
```typescript
<ThemedButton variant="success" onPress={handleComplete}>
  Mark as Complete
</ThemedButton>
<ThemedButton variant="danger" onPress={handleDelete}>
  Delete
</ThemedButton>
```

### ThemedText
**API:** Extends `TextProps` with theme-aware styling
**Use Case:** Primary text component that automatically adapts to light/dark themes.

### ThemedView
**API:** Extends `ViewProps` with theme-aware styling
**Use Case:** Primary container component with automatic theme adaptation.

### ThemedScrollView
**API:** Extends `ScrollViewProps` with theme-aware styling
**Use Case:** Scrollable container with theme support.

### ThemedKeyboardAvoidingView
**API:** Extends `KeyboardAvoidingViewProps` with theme-aware styling
**Use Case:** Keyboard-avoiding container with theme support.

---

## Form Components
**Location:** `@/components/forms/`

**Import Pattern:**
```typescript
import { 
  FormProgressBar, 
  StepIndicators, 
  FormHeader,
  FormatSelector,
  SourceSelector,
  PrioritySelector,
  DeadlineFormStep1,
  DeadlineFormStep2 
} from '@/components/forms';
```
## Progress Tracking Components
**Location:** `@/components/progress/`

**Import Pattern:**
```typescript
import { 
  ProgressHeader,
  ProgressStats,
  ProgressBar,
  ProgressInput,
  QuickActionButtons
} from '@/components/progress';
```

### ProgressHeader
**API:**
- Props: `{}`

**Use Case:** Simple header component for progress tracking screens with consistent icon and title styling.

### ProgressStats
**API:**
- Props: `{ currentProgress: number; totalQuantity: number; remaining: number; format: 'physical' | 'ebook' | 'audio'; urgencyLevel: string }`

**Use Case:** Displays current, total, and remaining progress statistics with format-aware display and update functionality.

**Features:**
- Format-aware labels (READ/LISTENED, TOTAL/TOTAL TIME, LEFT/REMAINING)
- Urgency-based color coding
- Automatic progress calculations

### ProgressBar
**API:**
- Props: `{ currentProgress: number; totalQuantity: number; progressPercentage: number; format: 'physical' | 'ebook' | 'audio'; deadlineDate: string }`

**Use Case:** Visual progress bar with percentage display and deadline information.

**Features:**
- Format-specific progress text display
- Vertical text layout with progress values and percentage
- Deadline date display with proper formatting
- Visual progress indicator

### ProgressInput
**API:**
- Props: `{ format: 'physical' | 'ebook' | 'audio'; control: Control<any>; setValue: UseFormSetValue<any>; currentProgress: number }`

**Use Case:** Smart input component that handles both regular numeric input and audiobook time formatting.

**Features:**
- Audiobook time format conversion (minutes ↔ "Xh Ym" format)
- Flexible input parsing ("2h 30m", "2h", "30m", or plain numbers)
- Form integration with proper state management
- Format-specific placeholder text

### QuickActionButtons
**API:**
- Props: `{ unitsPerDay: number; onQuickUpdate: (amount: number) => void }`

**Use Case:** Three quick increment buttons for rapid progress updates based on daily reading pace.

**Features:**
- Dynamic button values based on reading pace
- Consistent styling and layout
- Haptic feedback integration

---

## Deadline View Components
**Location:** `@/components/`

### DeadlineViewHeader
**API:**
- Props: `{ title: string; onBack: () => void; onEdit: () => void }`

**Use Case:** Reusable header component for deadline detail views with back navigation and edit functionality.

**Features:**
- Consistent header styling across deadline views
- Back button with proper navigation
- Edit button for deadline modification

### DeadlineActionButtons
**API:**
- Props: `{ deadline: ReadingDeadlineWithProgress; onComplete: () => void; onSetAside: () => void; onDelete: () => void }`

**Use Case:** Action button group for deadline management (complete, set aside, delete) with proper variant styling.

**Features:**
- Success variant for completion action
- Secondary variant for set aside action
- Danger variant for delete action
- Consistent spacing and layout

### DeadlineHeroSection
**API:**
- Props: `{ deadline: ReadingDeadlineWithProgress }`

**Use Case:** Hero section wrapper around DeadlineCard for detail views with enhanced styling.

**Features:**
- Maintains existing DeadlineCard functionality
- Enhanced visual presentation for detail views
- Modular and reusable design

---

## Reading Progress Component

### ReadingProgress
**API:**
- Props: `{ deadline: ReadingDeadlineWithProgress }`

**Use Case:** Comprehensive progress tracking component with format-aware display and update functionality.

**Features:**
- Modular architecture using progress sub-components
- Audiobook time formatting with proper conversion utilities
- Progress update functionality with toast notifications
- Quick action buttons for rapid updates
- Form validation and error handling
- Loading states and user feedback

**Example:**
```typescript
<ReadingProgress deadline={selectedDeadline} />
```

---

## Core UI Components

### Header
**API:**
- Props: `{ activeCount: number, attentionCount: number, totalReadingTimePerDay: string }`

**Use Case:** Main header component displaying the current date, reading statistics, and settings access. Used in the authenticated layout to show daily reading summary and navigation.

### DeadlineCard
**API:**
- Props: `{ deadline: ReadingDeadlineWithProgress }`
- Requires: `DeadlineProvider` context (automatically available in authenticated screens)

**Use Case:** Displays a deadline card with visual urgency indicators, progress tracking, and reading pace calculations. Uses the centralized DeadlineProvider for all calculations and data management. Features include:
- Color-coded urgency levels (overdue, urgent, good, approaching)
- Days remaining counter with dynamic styling
- Format-specific emoji indicators (📖 physical, 📱 ebook, 🎧 audio)
- Reading pace requirements
- Status messages
- Background image support with fallback

**Example:**
```typescript
import { DeadlineCard } from '@/components/DeadlineCard';
import { useDeadlines } from '@/contexts/DeadlineProvider';

const MyComponent = () => {
  const { deadlines } = useDeadlines();
  
  return (
    <View>
      {deadlines.map(deadline => (
        <DeadlineCard key={deadline.id} deadline={deadline} />
      ))}
    </View>
  );
};
```

### WaitingDeadlineCard
**API:**
- Props: `{ deadline: ReadingDeadlineWithProgress }`

**Use Case:** A variant of DeadlineCard used for deadlines that are waiting or in a different state. Provides alternative styling and behavior for specific deadline states.

### ActiveReads
**API:**
- Props: None (uses DeadlineProvider context)

**Use Case:** Component for displaying active (non-overdue) reading deadlines. Used in the main tab navigation to show current reading tasks.

### OverdueReads
**API:**
- Props: None (uses DeadlineProvider context)

**Use Case:** Component for displaying overdue reading deadlines with appropriate urgency styling and messaging.

---

## Authentication Components

### SignInWith
**API:**
- Props: `{ strategy: 'oauth_google' | 'oauth_apple' }`
- Exports: `useWarmUpBrowser()` hook

**Use Case:** OAuth authentication component for Google and Apple sign-in. Handles the complete SSO flow with Clerk authentication, includes browser warm-up optimization for Android, and displays provider-specific icons.

### Collapsible
**API:** Standard collapsible component with expand/collapse functionality
**Use Case:** Expandable content sections with smooth animations.

### ParallaxScrollView
**API:** Extends `ScrollViewProps` with parallax effects
**Use Case:** Enhanced scroll view with parallax scrolling effects for improved visual experience.

### ExternalLink
**API:** Extends `TouchableOpacityProps` with URL handling
**Use Case:** Link component that opens URLs in external browser with proper handling.