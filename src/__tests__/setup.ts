/**
 * Test setup file
 * This file is imported by Jest before running tests
 */

// Import the unified theme mock
import '../__mocks__/theme';

// Mock React Native modules that aren't available in test environment
jest.mock('react-native/Libraries/EventEmitter/NativeEventEmitter');

// Note: Alert mocking is done per test file to avoid conflicts

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

// Global test cleanup to prevent worker process issues
afterEach(() => {
  // Clean up any timers after each test
  jest.clearAllTimers();
  
  // Force garbage collection of any pending async operations
  jest.clearAllMocks();
  
  // Clear any pending setTimeout/setInterval operations
  if (typeof global.gc === 'function') {
    global.gc();
  }
});

// Global cleanup on exit
afterAll(async () => {
  // Ensure everything is cleaned up when tests finish
  jest.useRealTimers();
  jest.clearAllTimers();
  jest.clearAllMocks();
  jest.restoreAllMocks();
  
  // Force cleanup of any remaining handles
  if (global.gc) {
    global.gc();
  }
  
  // Clear any remaining timeouts/intervals
  const maxId = setTimeout(() => {}, 0);
  for (let i = 1; i <= maxId; i++) {
    clearTimeout(i);
    clearInterval(i);
  }
  
  // Give async operations time to complete before exit
  await new Promise(resolve => setTimeout(resolve, 100));
});