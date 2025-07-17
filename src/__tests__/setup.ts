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
  
  // Only reset to real timers if we're not in a test that explicitly uses fake timers
  // This prevents conflicts with tests that specifically need fake timers
  const testPath = expect.getState().testPath;
  const needsFakeTimers = testPath && (
    testPath.includes('ReadingDayDetails.navigation.test.tsx') ||
    testPath.includes('timer') ||
    testPath.includes('fake')
  );
  
  if (!needsFakeTimers) {
    jest.useRealTimers();
  }
  
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
  
  // Clear any remaining timeouts/intervals more aggressively
  const activeHandles = (process as any)._getActiveHandles?.() || [];
  const activeRequests = (process as any)._getActiveRequests?.() || [];
  
  // Clear all active timers
  activeHandles.forEach((handle: any) => {
    if (handle && typeof handle.unref === 'function') {
      handle.unref();
    }
  });
  
  // Clear all active requests
  activeRequests.forEach((request: any) => {
    if (request && typeof request.abort === 'function') {
      request.abort();
    }
  });
  
  // Flush any remaining promise chains
  await Promise.resolve();
  await Promise.resolve(); // Double flush for nested promises
});