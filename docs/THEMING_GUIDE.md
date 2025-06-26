# Theming System Guide

## Overview

This guide documents the simplified theming system implemented in the R&R Books app. The system has been migrated from a complex 25+ color palette to a streamlined 5-color system with computed semantic colors.

## Architecture

### Core Theme Structure

The theming system is built around a simple 5-color foundation:

```typescript
interface SimpleTheme {
  text: string;       // Primary text color
  background: string; // App background
  primary: string;    // Primary brand/action color
  secondary: string;  // Secondary/muted elements
  accent: string;     // Highlights and special elements
}
```

### Computed Colors

The system automatically generates semantic colors from the base 5 colors:

```typescript
interface ComputedColors {
  // Text variations
  textMuted: string;     // opacity(text, 0.7)
  textSubtle: string;    // opacity(text, 0.5)
  
  // Surface variations
  surface: string;       // mix(background, text, 5%)
  surfaceHover: string;  // mix(background, text, 8%)
  surfacePressed: string; // mix(background, text, 12%)
  
  // Border variations
  border: string;        // opacity(text, 0.15)
  borderHover: string;   // opacity(text, 0.25)
  
  // Semantic states
  danger: string;
  success: string;
  warning: string;
  info: string;
  // ... with hover variants
}
```

### Design Tokens

The system includes comprehensive design tokens for spacing, typography, and other design elements:

```typescript
interface DesignTokens {
  spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48 };
  radius: { sm: 4, md: 8, lg: 16, xl: 24, full: 9999 };
  fontSize: { xs: 12, sm: 14, md: 16, lg: 18, xl: 24, xxl: 32 };
  fontWeight: { normal: '400', medium: '500', semibold: '600', bold: '700' };
  lineHeight: { tight: 1.2, normal: 1.5, relaxed: 1.8 };
  shadow: { sm: '0 1px 2px rgba(0,0,0,0.05)', md: '0 4px 6px rgba(0,0,0,0.07)', ... };
}
```

## File Structure

```
src/theme/
├── index.ts                 # Main exports
├── types.ts                 # TypeScript interfaces
├── tokens.ts                # Design tokens
├── components/
│   └── ThemeProvider.tsx    # Theme context provider
├── hooks/
│   └── useTheme.ts          # Theme hook
├── themes/
│   ├── index.ts             # Theme registry
│   ├── light.ts             # Light theme
│   ├── dark.ts              # Dark theme
│   ├── nature.ts            # Nature theme
│   ├── ocean.ts             # Ocean theme
│   └── sunset.ts            # Sunset theme
└── utils/
    ├── colorUtils.ts        # Color manipulation utilities
    └── themeUtils.ts        # Theme creation utilities
```

## Usage

### Basic Usage

```typescript
import { useTheme } from '@/theme';

function MyComponent() {
  const { theme } = useTheme();
  
  return (
    <View style={{ backgroundColor: theme.background }}>
      <Text style={{ color: theme.text }}>Hello World</Text>
    </View>
  );
}
```

### Using Themed Components

```typescript
import { ThemedView, ThemedText } from '@/components/themed';

function MyComponent() {
  return (
    <ThemedView backgroundColor="surface">
      <ThemedText color="textMuted">Styled with theme</ThemedText>
    </ThemedView>
  );
}
```

### Theme Switching

```typescript
import { useTheme } from '@/theme';

function ThemeSwitcher() {
  const { themeMode, setThemeMode, availableThemes } = useTheme();
  
  return (
    <View>
      {availableThemes.map(theme => (
        <Button
          key={theme}
          title={theme}
          onPress={() => setThemeMode(theme)}
          selected={themeMode === theme}
        />
      ))}
    </View>
  );
}
```

## Creating New Themes

### 1. Define Your Theme

Create a new theme file in `src/theme/themes/`:

```typescript
// src/theme/themes/forest.ts
import { SimpleTheme } from '../types';

export const forestTheme: SimpleTheme = {
  text: '#1b4332',
  background: '#f3faf3',
  primary: '#2d6a4f',
  secondary: '#74a892',
  accent: '#ff8c42'
};
```

### 2. Register the Theme

Update `src/theme/themes/index.ts`:

```typescript
import { forestTheme } from './forest';

export const themes: Record<ThemeMode, SimpleTheme> = {
  // ... existing themes
  forest: forestTheme,
};

export const themeNames: Record<ThemeMode, string> = {
  // ... existing names
  forest: 'Forest',
};
```

### 3. Update Types

Add the new theme to the `ThemeMode` type in `src/theme/types.ts`:

```typescript
export type ThemeMode = 'light' | 'dark' | 'nature' | 'ocean' | 'sunset' | 'forest';
```

## Themed Components

### Available Components

- `ThemedView` - Themed View component
- `ThemedText` - Themed Text component
- `ThemedButton` - Themed Button component
- `ThemedScrollView` - Themed ScrollView component
- `ThemedKeyboardAvoidingView` - Themed KeyboardAvoidingView component

### Creating New Themed Components

```typescript
import React from 'react';
import { TextInput, type TextInputProps } from 'react-native';
import { useTheme } from '@/theme';

export type ThemedTextInputProps = TextInputProps & {
  borderColor?: string;
  placeholderTextColor?: string;
};

export function ThemedTextInput({
  style,
  borderColor = 'border',
  placeholderTextColor = 'textMuted',
  ...otherProps
}: ThemedTextInputProps) {
  const { theme } = useTheme();

  const getColor = (colorValue: string): string => {
    if (colorValue in theme) {
      return theme[colorValue as keyof typeof theme] as string;
    }
    return colorValue;
  };

  return (
    <TextInput
      style={[
        {
          borderColor: getColor(borderColor),
          color: theme.text,
        },
        style,
      ]}
      placeholderTextColor={getColor(placeholderTextColor)}
      {...otherProps}
    />
  );
}
```

## Best Practices

### 1. Use Semantic Colors

Prefer semantic color names over direct color values:

```typescript
// ✅ Good
<ThemedView backgroundColor="surface">
<ThemedText color="textMuted">

// ❌ Avoid
<View style={{ backgroundColor: '#f5f5f5' }}>
<Text style={{ color: '#666666' }}>
```

### 2. Leverage Design Tokens

Use design tokens for consistent spacing and typography:

```typescript
const { theme } = useTheme();

const styles = StyleSheet.create({
  container: {
    padding: theme.tokens.spacing.md,
    borderRadius: theme.tokens.radius.lg,
  },
  title: {
    fontSize: theme.tokens.fontSize.xl,
    fontWeight: theme.tokens.fontWeight.bold,
  },
});
```

### 3. Test Across Themes

Always test your components across different themes to ensure proper contrast and readability.

### 4. Use Computed Colors

Leverage the computed colors for consistency:

```typescript
// ✅ Good - uses computed surface color
<ThemedView backgroundColor="surface">

// ❌ Avoid - manual color mixing
<View style={{ backgroundColor: 'rgba(0,0,0,0.05)' }}>
```

## Migration Guide

### From Legacy Theme System

1. **Replace `useThemeColor` with `useTheme`:**
   ```typescript
   // Old
   const color = useThemeColor('primary');
   
   // New
   const { theme } = useTheme();
   const color = theme.primary;
   ```

2. **Update color references:**
   ```typescript
   // Old
   backgroundColor: useThemeColor('card')
   
   // New
   backgroundColor: theme.surface
   ```

3. **Use themed components:**
   ```typescript
   // Old
   <View style={{ backgroundColor: useThemeColor('background') }}>
   
   // New
   <ThemedView backgroundColor="background">
   ```

## Troubleshooting

### Common Issues

1. **Color not found:** Ensure the color exists in the theme or use a valid hex color
2. **Theme not updating:** Check that components are wrapped in `ThemeProvider`
3. **Type errors:** Verify that custom theme modes are added to the `ThemeMode` type

### Debugging

Use the theme debugger to inspect current theme values:

```typescript
const { theme, themeMode } = useTheme();
console.log('Current theme:', themeMode);
console.log('Theme colors:', theme);
```

## Performance Considerations

- Colors are computed once during theme creation
- Theme context uses React Context for efficient updates
- Themed components use minimal re-renders through proper memoization

## Accessibility

The theming system includes built-in accessibility features:

- Semantic colors maintain WCAG contrast ratios
- High contrast mode support
- System theme detection
- Reduced motion preferences

## Future Enhancements

- Color palette generator
- Theme validation tools
- Visual theme editor
- Automatic dark mode variants
- Advanced color harmonies

This theming system provides a solid foundation for consistent, maintainable, and accessible styling across the R&R Books application.