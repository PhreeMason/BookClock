# Component API Reference

> **Note:** All components can be imported using `@/components/COMPONENT_NAME`

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
- Extends `TextProps` with optional `lightColor`, `darkColor`, and `type` props
- Types: `'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link'`

**Use Case:** Theme-aware text component with predefined typography styles. Automatically applies theme colors and provides consistent text styling across the app with multiple preset variants.

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
**Use Case:** Welcome/greeting component for user onboarding or welcome screens. 