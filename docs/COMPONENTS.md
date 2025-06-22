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
**API:** Extends `ViewProps` with optional `lightColor` and `darkColor` props  
**Use Case:** Basic theme-aware container view that automatically applies background colors based on the current theme context.

### ThemedText
**API:**
- Extends `TextProps`.
- Props:
  - `type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link'`
  - `colorName?: keyof typeof Colors.light`

**Use Case:** The primary component for displaying all text. It automatically handles theme colors and provides consistent, predefined typography styles.

**Example:**
```typescript
// For standard text
<ThemedText>Some default text.</ThemedText>

// For a subtitle with a muted color
<ThemedText type="subtitle" colorName="textMuted">
  This is a subtitle.
</ThemedText>
```

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