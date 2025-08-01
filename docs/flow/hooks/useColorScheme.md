# useColorScheme Hook Flow Chart

## Overview
The `useColorScheme` hook provides color scheme detection for React Native applications, with special handling for web platforms to support static rendering.

## Flow Chart

```mermaid
flowchart TD
    A[useColorScheme Hook Called] --> B{Platform Check}
    B -->|Web Platform| C[Initialize hasHydrated State]
    B -->|Native Platform| D[Use React Native useColorScheme]
    
    C --> E[Set hasHydrated to false]
    E --> F[useEffect Triggered]
    F --> G[Set hasHydrated to true]
    G --> H{hasHydrated Check}
    H -->|true| I[Return Actual Color Scheme]
    H -->|false| J[Return 'light' as Default]
    
    D --> K[Return Native Color Scheme]
    
    I --> L[Return Color Scheme Value]
    J --> L
    K --> L
    
    L --> M[Component Re-renders with Color Scheme]
```

## Key Features

### Web Platform Handling
- **Hydration Support**: Prevents hydration mismatches by defaulting to 'light' until client-side hydration is complete
- **State Management**: Uses `useState` to track hydration status
- **Effect Cleanup**: Automatically updates hydration status on mount

### Native Platform Handling
- **Direct Passthrough**: Uses React Native's built-in `useColorScheme` hook
- **No Additional Logic**: Minimal overhead for native platforms

## Usage Pattern
```typescript
const colorScheme = useColorScheme();
// Returns: 'light' | 'dark' | null
```

## Dependencies
- `react-native` (for native platform)
- `react` (for web platform state management) 