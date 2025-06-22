# Themed Components Migration Guide

## Overview

We've refactored the themed components (`ThemedText`, `ThemedView`, `ThemedButton`, `ThemedScrollView`, `ThemedKeyboardAvoidingView`, `Loader`) to use the theme hook internally and accept color props with sensible defaults. This eliminates the need for components to call `useThemeColor` directly.

## Enhanced Color Support

All themed components now support three types of color values:

1. **Theme Colors**: Standard theme colors like `'text'`, `'primary'`, `'background'`, etc.
2. **Palette Colors**: Direct palette color variants like `'chryslerBlue.500'`, `'amethyst.200'`, `'celadon.DEFAULT'`, etc.
3. **Direct Hex Values**: Any hex color string like `'#ff0000'`

### Available Palette Colors

- `chryslerBlue`: `DEFAULT`, `100`, `200`, `300`, `400`, `500`, `600`, `700`, `800`, `900`
- `amethyst`: `DEFAULT`, `100`, `200`, `300`, `400`, `500`, `600`, `700`, `800`, `900`
- `celadon`: `DEFAULT`, `100`, `200`, `300`, `400`, `500`, `600`, `700`, `800`, `900`
- `teaGreen`: `DEFAULT`, `100`, `200`, `300`, `400`, `500`, `600`, `700`, `800`, `900`
- `honeydew`: `DEFAULT`, `100`, `200`, `300`, `400`, `500`, `600`, `700`, `800`, `900`
- `red`: `DEFAULT`, `100`, `200`, `300`, `400`, `500`

### Examples

```tsx
// Theme colors
<ThemedText color="primary">Primary text</ThemedText>
<ThemedView backgroundColor="card">Card background</ThemedView>

// Palette colors
<ThemedText color="chryslerBlue.500">Custom blue text</ThemedText>
<ThemedView backgroundColor="amethyst.200">Custom purple background</ThemedView>

// Direct hex values
<ThemedText color="#ff0000">Red text</ThemedText>
<ThemedView backgroundColor="#00ff00">Green background</ThemedView>
```

## New API

### ThemedText

**Before:**
```tsx
import { useThemeColor } from '@/hooks/useThemeColor';

const MyComponent = () => {
  const textColor = useThemeColor({}, 'textMuted');
  
  return (
    <ThemedText style={[styles.text, { color: textColor }]}>
      Hello World
    </ThemedText>
  );
};
```

**After:**
```tsx
const MyComponent = () => {
  return (
    <ThemedText color="textMuted" style={styles.text}>
      Hello World
    </ThemedText>
  );
};
```

**Available Props:**
- `color?: ColorValue` - Text color (defaults to 'text')
- `backgroundColor?: ColorValue` - Background color
- `borderColor?: ColorValue` - Border color
- `type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link'` - Predefined text styles
- `lightColor?: string` - Override light mode color
- `darkColor?: string` - Override dark mode color

### ThemedView

**Before:**
```tsx
import { useThemeColor } from '@/hooks/useThemeColor';

const MyComponent = () => {
  const backgroundColor = useThemeColor({}, 'background');
  const borderColor = useThemeColor({}, 'border');
  
  return (
    <ThemedView style={[styles.container, { backgroundColor, borderColor }]}>
      Content
    </ThemedView>
  );
};
```

**After:**
```tsx
const MyComponent = () => {
  return (
    <ThemedView backgroundColor="background" borderColor="border" style={styles.container}>
      Content
    </ThemedView>
  );
};
```

**Available Props:**
- `backgroundColor?: ColorValue` - Background color (defaults to 'background')
- `borderColor?: ColorValue` - Border color
- `lightColor?: string` - Override light mode color
- `darkColor?: string` - Override dark mode color

### ThemedButton

**Before:**
```tsx
import { useThemeColor } from '@/hooks/useThemeColor';

const MyComponent = () => {
  const backgroundColor = useThemeColor({}, 'primary');
  const textColor = useThemeColor({}, 'primaryForeground');
  
  return (
    <ThemedButton 
      title="Click me"
      style={[styles.button, { backgroundColor }]}
      textStyle={{ color: textColor }}
    />
  );
};
```

**After:**
```tsx
const MyComponent = () => {
  return (
    <ThemedButton 
      title="Click me"
      backgroundColor="primary"
      textColor="primaryForeground"
      style={styles.button}
    />
  );
};
```

**Available Props:**
- `backgroundColor?: ColorValue` - Button background color
- `textColor?: ColorValue` - Text color
- `borderColor?: ColorValue` - Border color
- `variant?: 'primary' | 'secondary' | 'danger' | 'ghost'` - Predefined button styles

### ThemedScrollView & ThemedKeyboardAvoidingView

**Before:**
```tsx
import { useThemeColor } from '@/hooks/useThemeColor';

const MyComponent = () => {
  const backgroundColor = useThemeColor({}, 'background');
  
  return (
    <ThemedScrollView style={[styles.scrollView, { backgroundColor }]}>
      Content
    </ThemedScrollView>
  );
};
```

**After:**
```tsx
const MyComponent = () => {
  return (
    <ThemedScrollView backgroundColor="background" style={styles.scrollView}>
      Content
    </ThemedScrollView>
  );
};
```

**Available Props:**
- `backgroundColor?: ColorValue` - Background color (defaults to 'background')
- `lightColor?: string` - Override light mode color
- `darkColor?: string` - Override dark mode color

### Loader

**Before:**
```tsx
import { useThemeColor } from '@/hooks/useThemeColor';

const MyComponent = () => {
  const indicatorColor = useThemeColor({}, 'primary');
  
  return (
    <Loader 
      text="Loading..."
      lightColor={indicatorColor}
      darkColor={indicatorColor}
    />
  );
};
```

**After:**
```tsx
const MyComponent = () => {
  return (
    <Loader 
      text="Loading..."
      indicatorColor="primary"
    />
  );
};
```

**Available Props:**
- `indicatorColor?: ColorValue` - Activity indicator color (defaults to 'primary')
- `lightColor?: string` - Override light mode color
- `darkColor?: string` - Override dark mode color

## Available Theme Colors

The following colors are available from the theme:

- `text` - Primary text color
- `textMuted` - Muted text color
- `background` - Background color
- `card` - Card background color
- `cardOverlay` - Card overlay color
- `border` - Border color
- `primary` - Primary brand color
- `primaryForeground` - Text color on primary background
- `ring` - Focus ring color
- `icon` - Icon color
- `tabIconDefault` - Default tab icon color
- `tabIconSelected` - Selected tab icon color
- `danger` - Danger/error color

## Benefits

1. **Cleaner Components**: No need to call `useThemeColor` in every component
2. **Better Type Safety**: Color props are typed to valid theme colors
3. **Consistent API**: All themed components follow the same pattern
4. **Easier Maintenance**: Theme logic is centralized in the components
5. **Better Performance**: Fewer hook calls in component trees
6. **Flexible Color System**: Support for theme colors, palette variants, and direct hex values

## Migration Checklist

- [x] ThemedText - ✅ Complete
- [x] ThemedView - ✅ Complete
- [x] ThemedButton - ✅ Complete
- [x] ThemedScrollView - ✅ Complete
- [x] ThemedKeyboardAvoidingView - ✅ Complete
- [x] Loader - ✅ Complete
- [x] Header - ✅ Updated to use new API
- [x] ActiveReads - ✅ Updated to use new API
- [x] OverdueReads - ✅ Updated to use new API
- [x] SignOutButton - ✅ Updated to use new API
- [x] CustomInput - ✅ Updated to use new API
- [x] SourceSelector - ✅ Updated to use new API
- [x] PrioritySelector - ✅ Updated to use new API
- [x] FormatSelector - ✅ Updated to use new API
- [x] DeadlineFormStep2 - ✅ Updated to use new API
- [x] App screens (index.tsx, settings.tsx) - ✅ Updated to use new API

## Migration Complete! 🎉

All components have been successfully migrated to use the new themed component API. The codebase now has:

- ✅ Consistent theming across all components
- ✅ Support for palette color variants
- ✅ Better type safety with ColorValue types
- ✅ Reduced useThemeColor hook calls
- ✅ Cleaner, more maintainable code 