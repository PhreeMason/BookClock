## Custom Reusable Components

### HapticTab
**API:** Extends `BottomTabBarButtonProps` from React Navigation  
**Use Case:** Enhanced tab bar button that provides haptic feedback on iOS devices when pressed. Automatically adds light impact feedback for better user experience in tab navigation.

### SignInWith
**API:**
- Props: `{ strategy: 'oauth_google' | 'oauth_apple' }`
- Exports: `useWarmUpBrowser()` hook

**Use Case:** OAuth authentication component for Google and Apple sign-in. Handles the complete SSO flow with Clerk authentication, includes browser warm-up optimization for Android, and displays provider-specific icons.

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