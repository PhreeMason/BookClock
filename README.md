# R-R-Books

A React Native app for tracking reading deadlines and progress.

## Project Structure

### Core Directories

```
src/
├── app/                    # Expo Router app directory
│   ├── (auth)/            # Authentication routes
│   └── (authenticated)/   # Protected routes
├── components/            # Reusable UI components
│   ├── forms/            # Form-specific components
│   └── ui/               # General UI components
├── lib/                   # Utility functions and schemas
├── hooks/                 # Custom React hooks
├── types/                 # TypeScript type definitions
└── constants/             # App constants
```

### Form Architecture

The app uses a modular form architecture for complex multi-step forms:

#### Form Components (`src/components/forms/`)
- **`FormProgressBar`** - Visual progress indicator for multi-step forms
- **`StepIndicators`** - Step dots showing current position
- **`FormHeader`** - Header with back/skip navigation
- **`FormatSelector`** - Chip-based format selection (physical/ebook/audio)
- **`SourceSelector`** - Chip-based source selection (ARC/library/personal)
- **`PrioritySelector`** - Card-based priority selection (flexible/strict)
- **`DeadlineFormStep1`** - First step: book details and format
- **`DeadlineFormStep2`** - Second step: deadline and progress

#### Form Utilities (`src/lib/`)
- **`deadlineFormSchema.ts`** - Zod schema and TypeScript types for form validation
- **`deadlineCalculations.ts`** - Utility functions for reading time and pace calculations

#### Best Practices for Forms

1. **Component Separation**: Each form step should be a separate component
2. **Schema Centralization**: Define Zod schemas in `src/lib/` for reusability
3. **Utility Extraction**: Move calculation logic to dedicated utility files
4. **Type Safety**: Use TypeScript interfaces for all form data
5. **Consistent Styling**: Reuse form styles across components

### Example Form Implementation

```typescript
// Main form component
import { DeadlineFormStep1, DeadlineFormStep2 } from '@/components/forms';
import { deadlineFormSchema, DeadlineFormData } from '@/lib/deadlineFormSchema';
import { calculateRemaining, getReadingEstimate } from '@/lib/deadlineCalculations';

const MyForm = () => {
  const { control, watch } = useForm<DeadlineFormData>({
    resolver: zodResolver(deadlineFormSchema)
  });
  
  return (
    <View>
      {currentStep === 1 ? (
        <DeadlineFormStep1 
          control={control}
          selectedFormat={format}
          onFormatChange={handleFormatChange}
        />
      ) : (
        <DeadlineFormStep2 
          control={control}
          selectedFormat={format}
          onPriorityChange={handlePriorityChange}
        />
      )}
    </View>
  );
};
```

## Custom Reusable Components
> **Note:** All components can be imported using `@/components/COMPONENT_NAME`

### Form Components
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
- Props: `{children: React.Node, title: string}

**User Case:** Creates an accordion container that opens and closes on user click.
`
### SignOutButton
**API:** No props required  
**Use Case:** Simple sign-out button that handles user authentication logout via Clerk and redirects to the home page. Displays themed text with touch interaction.

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

## Development Guidelines

### Adding New Forms
1. Create form schema in `src/lib/`
2. Extract calculation utilities if needed
3. Create form step components in `src/components/forms/`
4. Update `src/components/forms/index.ts` with new exports
5. Implement main form component using the modular pattern

### Code Organization
- **Keep components focused**: Each component should have a single responsibility
- **Extract utilities**: Move business logic to utility functions
- **Use TypeScript**: Define proper interfaces for all data structures
- **Follow naming conventions**: Use descriptive names for components and functions
- **Document APIs**: Add JSDoc comments for complex components
