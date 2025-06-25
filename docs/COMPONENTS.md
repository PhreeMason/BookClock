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
- `icon`: The default color for icons.
- `tabIconDefault`: The color for inactive tab bar icons.
- `tabIconSelected`: The color for the active tab bar icon.

### Using Themed Components
The core of our design system is a set of theme-aware components that automatically adapt to light and dark modes. You should always prefer these components over standard React Native components.

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

**Use Case:** Component for displaying overdue reading deadlines. Used in the main tab navigation to show tasks that need immediate attention.

### BookList
**API:**
- Props: `{ books: Book[], onBookPress?: (book: Book) => void }`

**Use Case:** Displays a list of books with consistent styling and interaction handling.

### BookListItem
**API:**
- Props: `{ book: Book, onPress?: (book: Book) => void }`

**Use Case:** Individual book item component used within BookList for consistent book display and interaction.

### SearchBar
**API:**
- Props: `{ onSearch: (query: string) => void, placeholder?: string }`

**Use Case:** Search input component with clear functionality and consistent theming.

### UserAvatar
**API:**
- Props: `{ size?: number, imageUrl?: string }`

**Use Case:** Displays user avatar with fallback to initials or default image.

### UserProfile
**API:**
- Props: None (uses authentication context)

**Use Case:** User profile display component showing user information and settings access.

### HapticTab
**API:** Extends `BottomTabBarButtonProps` from React Navigation  
**Use Case:** Enhanced tab bar button that provides haptic feedback on iOS devices when pressed. Automatically adds light impact feedback for better user experience in tab navigation.

### SignInWith
**API:**
- Props: `{ strategy: 'oauth_google' | 'oauth_apple' }`
- Exports: `useWarmUpBrowser()` hook

**Use Case:** OAuth authentication component for Google and Apple sign-in. Handles the complete SSO flow with Clerk authentication, includes browser warm-up optimization for Android, and displays provider-specific icons.

### Collapsible
**API:**
- Props: `{children: React.Node, title: string}`

**Use Case:** Creates an accordion container that opens and closes on user click.

### SignOutButton
**API:** No props required  
**Use Case:** Simple sign-out button that handles user authentication logout via Clerk and redirects to the home page. Displays themed text with touch interaction.

### ThemedButton
**API:**
- Props: `{ onPress: () => void, title: string, variant?: 'primary' | 'secondary' | 'danger' | 'ghost', style?: ViewStyle, textStyle?: TextStyle, disabled?: boolean }`

**Use Case:** A reusable, themed button for primary actions. It automatically uses the `primary` and `primaryForeground` colors from the theme and supports multiple variants.

**Example:**
```typescript
import { ThemedButton } from '@/components/ThemedButton';

const MyComponent = () => (
  <ThemedButton 
    title="Submit" 
    variant="primary"
    onPress={() => console.log('Pressed!')} 
  />
);
```

## Themed Components

### ThemedKeyboardAvoidingView
**API:** Extends `KeyboardAvoidingViewProps` with optional `lightColor` and `darkColor` props  
**Use Case:** Theme-aware keyboard avoiding view that automatically adjusts behavior based on platform (iOS: padding, Android: height) and applies theme colors.

### ThemedScrollView
**API:** Extends `ScrollViewProps` with optional `lightColor` and `darkColor` props  
**Use Case:** Theme-aware scroll view that automatically applies background colors based on the current theme (light/dark mode) with bouncing enabled by default.

### ThemedView
**API:** 
- Extends `ViewProps`
- Props:
  - `backgroundColor?: ColorValue` - Background color (defaults to 'background')
  - `borderColor?: ColorValue` - Border color

**Use Case:** Basic theme-aware container view that automatically applies background and border colors based on the current theme context. Handles core container styling concerns.

**Examples:**
```typescript
// Simple background
<ThemedView backgroundColor="card" />

// Background + border
<ThemedView backgroundColor="card" borderColor="border" />

// Default background (uses 'background' theme color)
<ThemedView />

// With custom styling
<ThemedView backgroundColor="primary" style={{ padding: 20, borderRadius: 8 }} />
```

### ThemedText
**API:**
- Extends `TextProps`.
- Props:
  - `type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link' | 'header' | 'body' | 'bodyMuted' | 'caption' | 'captionMuted' | 'label' | 'labelMuted' | 'button' | 'small' | 'smallMuted'`
  - `color?: ColorValue` - Text color (overrides automatic type colors)

**Use Case:** The primary component for displaying all text. It provides semantic typography types with automatic theming and consistent styling across the app.

**Semantic Types:**
- `default` (16px) - Standard body text
- `title` (32px, bold) - Page titles
- `header` (20px, bold) - Section headers
- `subtitle` (20px, bold) - Subsection headers
- `body` (16px) - Regular body text
- `bodyMuted` (16px, muted) - Secondary body text
- `caption` (14px) - Small descriptive text
- `captionMuted` (14px, muted) - Small secondary text
- `label` (14px, 500, uppercase) - Form labels
- `labelMuted` (12px, muted, uppercase) - Secondary labels
- `button` (16px, 600) - Button text styling
- `small` (12px) - Small text
- `smallMuted` (12px, muted) - Small secondary text
- `defaultSemiBold` (16px, 600) - Semi-bold default text
- `link` (16px) - Link styling

**Examples:**
```typescript
// Semantic usage (recommended)
<ThemedText type="header">Section Title</ThemedText>
<ThemedText type="bodyMuted">Secondary information</ThemedText>
<ThemedText type="label">Form Label</ThemedText>
<ThemedText type="captionMuted">Help text</ThemedText>

// With custom colors
<ThemedText type="button" color="primary">Action Button</ThemedText>

// Override specific properties
<ThemedText type="header" style={{ fontSize: 18 }}>Custom sized header</ThemedText>
```

**Color Priority:** `color` prop > automatic type color > default 'text' color

**Note:** For background colors and borders, wrap ThemedText in a ThemedView instead.

## Utility Components

### CustomInput
**API:** Extends `TextInputProps` with form control integration
- Props: `{ control: Control<T>, name: Path<T> }` + standard TextInput props

**Use Case:** Form input component with React Hook Form integration and validation support.

### Loader
**API:**
- Props: `{ size?: 'small' | 'large', text?: string, fullScreen?: boolean, lightColor?: string, darkColor?: string }`

**Use Case:** Loading component with theme support and customizable appearance.

### ParallaxScrollView
**API:** Extends `ScrollViewProps` with parallax effects
**Use Case:** Enhanced scroll view with parallax scrolling effects for improved visual experience.

### ExternalLink
**API:** Extends `TouchableOpacityProps` with URL handling
**Use Case:** External link component that handles opening URLs in external browsers.

### HelloWave
**API:** No props required
**Use Case:** Welcome/greeting component for user onboarding or welcome screens with animated wave emoji. 