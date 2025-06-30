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
- **Achievement System** - 9 streak achievements from 25 to 1000+ consecutive reading days
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

- [Achievement System](docs/ACHIEVEMENTS.md) - Complete achievement system documentation and architecture
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

### User Pace Calculation (Two-Tier System)
# Tier 1: Recent Data Available
- Condition: ≥3 reading days in past 7 days
- Calculation: Rolling 7-day average of reading days only
- Method: Sum pages from reading days ÷ number of reading days
- Example: 150 pages across 5 reading days = 30 pages/day

# Tier 2: Insufficient Recent Data
- Condition: <3 reading days in past 7 days
- Fallback: Use 25 pages/day default
- Reasoning: Conservative approach prevents overcommitment

### Optional User Override (Phase 2)
- Setting: "Custom pace" option in settings
- Default: Auto-calculate (recommended)
- Fallback hierarchy: Custom pace → Recent data → 25 pages/day default

### Status Color Categories (Pace-Based)
- Green: Current pace ≥ required pace AND >0 days remaining
- Orange: Current pace < required pace AND gap ≤100% current pace AND >0 days remaining
- Red: Overdue OR impossible pace (>100% increase needed) OR 0% progress with <3 days remaining

### Core Calculations
- Required daily pace = Pages remaining ÷ Days remaining
- Reading day definition = Any day with >0 pages logged
- Minimum data threshold = 3 reading days for reliable pace calculation
