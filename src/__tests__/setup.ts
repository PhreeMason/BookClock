/**
 * Test setup file
 * This file is imported by Jest before running tests
 */

// Import the unified theme mock
import '../__mocks__/theme';

// Mock React Native modules that aren't available in test environment
jest.mock('react-native/Libraries/EventEmitter/NativeEventEmitter');

// Mock Expo modules
jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
  useLocalSearchParams: () => ({}),
  Link: ({ children }: { children: React.ReactNode }) => children,
  router: {
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  },
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve()),
}));

// Mock themed components globally
jest.mock('@/components/themed', () => ({
  ThemedText: require('../__mocks__/theme').MockThemedText,
  ThemedView: require('../__mocks__/theme').MockThemedView,
  ThemedButton: require('../__mocks__/theme').MockThemedButton,
  ThemedScrollView: require('../__mocks__/theme').MockThemedScrollView,
  ThemedKeyboardAvoidingView: require('../__mocks__/theme').MockThemedView,
}));

// Legacy mocks removed since those files no longer exist