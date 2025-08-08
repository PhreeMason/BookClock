/**
 * Centralized mocks for React Context Providers
 * This file contains mock implementations for context providers used across test files
 */

import React from 'react';

// DeadlineProvider mock
export const mockDeadlineContext = {
  deadlines: [],
  activebooks: [],
  overduebooks: [],
  completedDeadlines: [],
  isLoading: false,
  error: null,
  addDeadline: jest.fn(),
  updatebook: jest.fn(),
  deletebook: jest.fn(),
  completebook: jest.fn(),
  setAsidebook: jest.fn(),
  getDeadlineCalculations: jest.fn(() => ({
    currentProgress: 0,
    totalQuantity: 300,
    remaining: 300,
    progressPercentage: 0,
    daysLeft: 10,
    unitsPerDay: 30,
    urgencyLevel: 'good' as const,
    urgencyColor: '#4ADE80',
    statusMessage: 'On track',
    readingEstimate: '5 hours',
    paceEstimate: '30 pages/day',
    unit: 'pages',
    userPace: 25,
    requiredPace: 30,
    paceStatus: 'yellow' as const,
    paceMessage: 'Slightly behind pace',
  })),
  formatUnitsPerDay: jest.fn((units: number, format: string) => `${units} ${format === 'audio' ? 'min' : 'pages'}/day`),
  getTotalReadingTimePerDay: jest.fn(() => ({ hours: 1, minutes: 30 })),
  activeCount: 0,
  overdueCount: 0,
};

export const mockUsebooks = jest.fn(() => mockDeadlineContext);

export const MockDeadlineProvider = ({ children }: { children: React.ReactNode }) => {
  return React.createElement(React.Fragment, null, children);
};

jest.mock('@/contexts/DeadlineProvider', () => ({
  useDeadlines: mockUsebooks,
  DeadlineProvider: MockDeadlineProvider,
}));

// PaceProvider mock
export const mockPaceContext = {
  userPaceData: {
    pagesPerDay: 25,
    minutesPerDay: 60,
    readingSpeed: 250, // words per minute
    lastUpdated: new Date().toISOString(),
  },
  isLoading: false,
  error: null,
  updatePace: jest.fn(),
  calculateRequiredPace: jest.fn((remaining: number, days: number) => remaining / days),
  estimateReadingTime: jest.fn((pages: number) => pages * 2), // 2 minutes per page
};

export const mockUsePace = jest.fn(() => mockPaceContext);

export const MockPaceProvider = ({ children }: { children: React.ReactNode }) => {
  return React.createElement(React.Fragment, null, children);
};

jest.mock('@/contexts/PaceProvider', () => ({
  usePace: mockUsePace,
  PaceProvider: MockPaceProvider,
}));

// ThemeProvider mock (already exists but we'll enhance it)
export const mockThemeContext = {
  theme: {
    text: '#000000',
    background: '#ffffff',
    primary: '#0066cc',
    secondary: '#666666',
    accent: '#ff6600',
    textMuted: '#888888',
    surface: '#f5f5f5',
    surfaceHover: '#eeeeee',
    surfacePressed: '#e0e0e0',
    border: '#dddddd',
    borderHover: '#cccccc',
    danger: '#ff0000',
    dangerHover: '#cc0000',
    success: '#00aa00',
    successHover: '#008800',
    warning: '#ffaa00',
    warningHover: '#dd8800',
    info: '#0066cc',
    infoHover: '#004499',
    tokens: {
      spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48 },
      radius: { sm: 4, md: 8, lg: 12, xl: 16, full: 9999 },
      fontSize: { xs: 12, sm: 14, md: 16, lg: 18, xl: 24, xxl: 32 },
      fontWeight: { normal: '400', medium: '500', semibold: '600', bold: '700' },
      lineHeight: { tight: 1.25, normal: 1.5, relaxed: 1.75 },
      shadow: {
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      },
    },
    isDark: false,
  },
  themeMode: 'light' as const,
  setThemeMode: jest.fn(),
  availableThemes: ['light', 'dark', 'nature', 'ocean', 'sunset'] as const,
};

export const mockUseTheme = jest.fn(() => mockThemeContext);

jest.mock('@/theme', () => ({
  useTheme: mockUseTheme,
}));

// UI Component mocks
jest.mock('@/components/ui/IconSymbol', () => ({
  IconSymbol: ({ name }: { name: string }) => `Icon: ${name}`,
}));

// UserProvider mock (if exists)
export const mockUserContext = {
  user: {
    id: 'test-user-id',
    email: 'test@example.com',
    name: 'Test User',
    avatar: null,
  },
  isLoading: false,
  isAuthenticated: true,
  login: jest.fn(),
  logout: jest.fn(),
  updateProfile: jest.fn(),
};

export const mockUseUserContext = jest.fn(() => mockUserContext);

export const MockUserProvider = ({ children }: { children: React.ReactNode }) => {
  return React.createElement(React.Fragment, null, children);
};

// Helper functions to configure context values
export const configurebookContext = (overrides: Partial<typeof mockDeadlineContext>) => {
  mockUsebooks.mockReturnValue({
    ...mockDeadlineContext,
    ...overrides,
  });
};

export const configurePaceContext = (overrides: Partial<typeof mockPaceContext>) => {
  mockUsePace.mockReturnValue({
    ...mockPaceContext,
    ...overrides,
  });
};

export const configureThemeContext = (overrides: Partial<typeof mockThemeContext>) => {
  mockUseTheme.mockReturnValue({
    ...mockThemeContext,
    ...overrides,
  });
};

export const configureUserContext = (overrides: Partial<typeof mockUserContext>) => {
  mockUseUserContext.mockReturnValue({
    ...mockUserContext,
    ...overrides,
  });
};

// Utility function to reset all context mocks
export const resetContextMocks = () => {
  // Reset deadline context
  mockUsebooks.mockClear();
  mockDeadlineContext.addDeadline.mockClear();
  mockDeadlineContext.updatebook.mockClear();
  mockDeadlineContext.deletebook.mockClear();
  mockDeadlineContext.completebook.mockClear();
  mockDeadlineContext.setAsidebook.mockClear();
  mockDeadlineContext.getDeadlineCalculations.mockClear();
  mockDeadlineContext.formatUnitsPerDay.mockClear();
  mockDeadlineContext.getTotalReadingTimePerDay.mockClear();
  
  mockUsebooks.mockReturnValue(mockDeadlineContext);
  
  // Reset pace context
  mockUsePace.mockClear();
  mockPaceContext.updatePace.mockClear();
  mockPaceContext.calculateRequiredPace.mockClear();
  mockPaceContext.estimateReadingTime.mockClear();
  
  mockUsePace.mockReturnValue(mockPaceContext);
  
  // Reset theme context
  mockUseTheme.mockClear();
  mockThemeContext.setThemeMode.mockClear();
  
  mockUseTheme.mockReturnValue(mockThemeContext);
  
  // Reset user context
  mockUseUserContext.mockClear();
  mockUserContext.login.mockClear();
  mockUserContext.logout.mockClear();
  mockUserContext.updateProfile.mockClear();
  
  mockUseUserContext.mockReturnValue(mockUserContext);
};