# Development Guidelines

## Code Organization

- **Keep components focused**: Each component should have a single responsibility
- **Extract utilities**: Move business logic to utility functions
- **Use TypeScript**: Define proper interfaces for all data structures
- **Follow naming conventions**: Use descriptive names for components and functions
- **Document APIs**: Add JSDoc comments for complex components

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
├── contexts/             # React Context providers
├── lib/                   # Utility functions and schemas
├── hooks/                 # Custom React hooks
├── types/                 # TypeScript type definitions
├── constants/             # App constants
└── assets/               # Static assets (images, fonts, etc.)
```

## Best Practices

### Component Development
- Use themed components for consistent styling
- Implement proper TypeScript interfaces
- Add error boundaries where appropriate
- Test components thoroughly

### State Management
- Use React hooks for local state
- Implement proper loading and error states
- Handle edge cases gracefully

### Performance
- Implement proper memoization where needed
- Optimize re-renders
- Use lazy loading for heavy components

### Accessibility
- Add proper accessibility labels
- Ensure keyboard navigation works
- Test with screen readers

## Testing

- Write unit tests for utility functions
- Test component behavior with user interactions
- Ensure proper error handling

## Deployment

- Follow semantic versioning
- Test on both iOS and Android
- Validate all user flows before release 