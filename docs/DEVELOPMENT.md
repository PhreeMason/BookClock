# Development Guidelines

## Code Organization

- **Keep components focused**: Each component should have a single responsibility
- **Extract utilities**: Move business logic to utility functions
- **Use TypeScript**: Define proper interfaces for all data structures
- **Follow naming conventions**: Use descriptive names for components and functions
- **Document APIs**: Add JSDoc comments for complex components
- **Modular Architecture**: Break down large components into focused sub-components

## Project Structure

### Core Directories

```
src/
├── app/                    # Expo Router app directory
│   ├── (auth)/            # Authentication routes
│   └── (authenticated)/   # Protected routes
├── components/            # Reusable UI components
│   ├── forms/            # Form-specific components
│   ├── progress/         # Progress tracking components
│   └── ui/               # General UI components
├── contexts/             # React Context providers
├── lib/                   # Utility functions and schemas
├── hooks/                 # Custom React hooks
├── types/                 # TypeScript type definitions
├── constants/             # App constants
└── assets/               # Static assets (images, fonts, etc.)
```

### Component Organization Patterns

#### Modular Component Design
When a component becomes too large (>200 lines), consider breaking it down:

1. **Identify Logical Sections**: Look for distinct UI sections or functionality
2. **Extract Sub-components**: Create focused components for each section
3. **Maintain Props Interface**: Keep the main component's API stable
4. **Group Related Components**: Place sub-components in dedicated folders

**Example: Progress Tracking Components**
```
components/progress/
├── ProgressHeader.tsx      # Simple header with icon/title
├── ProgressStats.tsx       # Statistics display
├── ProgressBar.tsx         # Visual progress indicator
├── ProgressInput.tsx       # Smart input with format handling
└── QuickActionButtons.tsx  # Quick update buttons
```

#### Component Responsibility Guidelines
- **Single Purpose**: Each component should have one clear responsibility
- **Reusability**: Design components to be reusable across different contexts
- **Props Interface**: Keep props minimal and focused
- **State Management**: Handle state at the appropriate level

## Best Practices

### Component Development
- Use themed components for consistent styling
- Implement proper TypeScript interfaces
- Add error boundaries where appropriate
- Test components thoroughly
- Follow the modular architecture pattern

### Enhanced Input Handling
- **Mixed Value Types**: Use CustomInput for forms that need string/number flexibility
- **Format-Specific Logic**: Implement format-aware input handling (e.g., audiobook time formatting)
- **Validation Integration**: Leverage Zod schemas with proper type coercion
- **User Experience**: Provide clear placeholder text and input examples

### State Management
- Use React hooks for local state
- Implement proper loading and error states
- Handle edge cases gracefully
- Use Context providers for shared state

### Progress Tracking Implementation
- **Historical Data**: Always create new progress entries (don't update existing)
- **Format Awareness**: Handle different formats (physical, ebook, audio) appropriately
- **Time Formatting**: Use utility functions for consistent time display
- **User Feedback**: Implement toast notifications for progress updates

### Performance
- Implement proper memoization where needed
- Optimize re-renders
- Use lazy loading for heavy components

### Accessibility
- Add proper accessibility labels
- Ensure keyboard navigation works
- Test with screen readers

### Testing Strategy
- **Unit Tests**: Test individual components and utilities
- **Integration Tests**: Test component interactions
- **Functional Tests**: Test complete user workflows
- **Mock Strategy**: Properly mock external dependencies

### Theme System Usage
- **Semantic Colors**: Use semantic color names from Colors.ts
- **Variant System**: Leverage ThemedButton variants for consistent styling
- **Theme Consistency**: Always use themed components over standard React Native components

### Form Architecture
- **Schema-First**: Define Zod schemas before building forms
- **Component Separation**: Keep form steps as separate components
- **Utility Functions**: Extract calculations to dedicated utility files
- **Type Safety**: Use TypeScript interfaces for all form data

## Code Quality Standards

### TypeScript Usage
- Define proper interfaces for all props
- Use strict type checking
- Avoid `any` types
- Implement proper error handling

### Component Props
- Use descriptive prop names
- Provide default values where appropriate
- Document complex props with JSDoc
- Keep prop interfaces minimal and focused

### Error Handling
- Implement proper error boundaries
- Provide meaningful error messages
- Handle loading states appropriately
- Use toast notifications for user feedback

### Code Style
- Follow consistent naming conventions
- Use meaningful variable names
- Keep functions small and focused
- Add comments for complex logic

## Architecture Patterns

### Modular Component Pattern
Break down large components into smaller, focused sub-components:

```typescript
// Instead of one large component
const LargeComponent = () => {
  // 300+ lines of code
};

// Use modular approach
const MainComponent = () => (
  <View>
    <ComponentHeader />
    <ComponentStats />
    <ComponentActions />
  </View>
);
```

### Smart Input Pattern
For inputs that need format-specific handling:

```typescript
const SmartInput = ({ format, ...props }) => {
  if (format === 'audio') {
    return <AudioTimeInput {...props} />;
  }
  return <StandardInput {...props} />;
};
```

### Progress Tracking Pattern
For components that track user progress:

```typescript
const ProgressComponent = ({ deadline }) => {
  const updateProgress = useUpdateDeadlineProgress();
  
  const handleUpdate = async (newProgress) => {
    await updateProgress.mutateAsync({
      reading_deadline_id: deadline.id,
      current_progress: newProgress
    });
  };
  
  return (
    <View>
      <ProgressDisplay />
      <ProgressInput onUpdate={handleUpdate} />
    </View>
  );
};