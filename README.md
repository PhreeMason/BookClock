# R-R-Books

A React Native app for tracking reading deadlines and progress with comprehensive progress tracking and modular component architecture.

## Quick Start

```bash
# Install dependencies
npm install

# Start the development server
npm start
```

## Project Structure

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
└── assets/               # Static assets
```

## Key Features

- **Reading Deadline Tracking** - Create and manage reading deadlines with flexible or strict scheduling
- **Progress Monitoring** - Track reading progress with format-specific displays (pages, time, etc.)
- **Multi-format Support** - Physical books, ebooks, and audiobooks with appropriate time formatting
- **Modular Architecture** - Component-based design with focused responsibilities
- **Progress History** - Historical progress tracking with database persistence
- **Smart Input Handling** - Audiobook time formatting with flexible input parsing
- **Theme System** - Comprehensive light/dark theme support with semantic colors
- **OAuth Authentication** - Google and Apple sign-in integration

## Recent Architectural Improvements

### Modular Component Design
- **Progress Components**: Broke down monolithic ReadingProgress into focused sub-components
- **Deadline View Components**: Separated deadline view into reusable header, actions, and hero sections
- **Enhanced Themed Components**: Added success variant and improved ThemedButton with multiple variants

### Progress Tracking Enhancements
- **Time Format Consistency**: Audiobook progress displays in user-friendly "Xh Ym" format
- **Smart Input Parsing**: Flexible time input supporting multiple formats ("2h 30m", "2h", "30m")
- **Historical Tracking**: Complete progress history with database persistence
- **Toast Notifications**: Better user feedback with descriptive success/error messages

### Type Safety & Form Handling
- **Mixed Value Support**: CustomInput handles both string and number values seamlessly
- **Zod Integration**: Proper form validation with type coercion
- **Enhanced Error Handling**: Comprehensive error states and user feedback

## Development

See [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md) for detailed guidelines.

## Documentation

- [Component API Reference](docs/COMPONENTS.md) - Complete component documentation
- [Form Architecture](docs/FORMS.md) - Form system and best practices
- [Development Guidelines](docs/DEVELOPMENT.md) - Coding standards and practices
- [Progress Tracking System](docs/PROGRESS_TRACKING.md) - Comprehensive progress tracking guide
- [Deadline Provider](docs/DEADLINE_PROVIDER.md) - Context provider documentation

## Testing

The app includes comprehensive test coverage for components and functionality:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch
