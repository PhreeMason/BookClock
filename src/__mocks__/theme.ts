/**
 * Mock theme system for tests
 */

export const mockTheme = {
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
};

export const mockUseTheme = jest.fn(() => ({
  theme: mockTheme,
  themeMode: 'light' as const,
  setThemeMode: jest.fn(),
  availableThemes: ['light', 'dark', 'nature', 'ocean', 'sunset'] as const,
}));

// Mock the theme module
jest.mock('@/theme', () => ({
  useTheme: mockUseTheme,
  ThemeProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock themed components
export const MockThemedText = jest.fn(({ children, testID, ...props }: any) => {
  const React = require('react');
  const { Text } = require('react-native');
  return React.createElement(Text, { testID, ...props }, children);
});

export const MockThemedView = jest.fn(({ children, testID, ...props }: any) => {
  const React = require('react');
  const { View } = require('react-native');
  return React.createElement(View, { testID, ...props }, children);
});

export const MockThemedButton = jest.fn(({ title, testID, onPress, ...props }: any) => {
  const React = require('react');
  const { TouchableOpacity, Text } = require('react-native');
  return React.createElement(TouchableOpacity, { testID, onPress, ...props }, 
    React.createElement(Text, {}, title)
  );
});

export const MockThemedScrollView = jest.fn(({ children, testID, ...props }: any) => {
  const React = require('react');
  const { ScrollView } = require('react-native');
  return React.createElement(ScrollView, { testID, ...props }, children);
});