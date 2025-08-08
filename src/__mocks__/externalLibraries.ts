/**
 * Centralized mocks for external libraries
 * This file contains mock implementations for third-party libraries
 * that are commonly used across test files.
 */

// Expo Router Mock
export const mockRouter = {
  push: jest.fn(),
  replace: jest.fn(),
  back: jest.fn(),
  setParams: jest.fn(),
  canGoBack: jest.fn(() => true),
};

export const mockUseRouter = jest.fn(() => mockRouter);
export const mockUseLocalSearchParams = jest.fn(() => ({}));
export const mockUseGlobalSearchParams = jest.fn(() => ({}));
export const mockLink = jest.fn(({ children }: { children: React.ReactNode }) => children);

// Apply expo-router mock
jest.mock('expo-router', () => ({
  router: mockRouter,
  useRouter: mockUseRouter,
  useLocalSearchParams: mockUseLocalSearchParams,
  useGlobalSearchParams: mockUseGlobalSearchParams,
  Link: mockLink,
}));

// React Native Toast Message Mock
export const mockToast = {
  show: jest.fn(),
  hide: jest.fn(),
};

jest.mock('react-native-toast-message', () => mockToast);

// Clerk Authentication Mock
export const mockUser = {
  id: 'test-user-id',
  emailAddresses: [{ emailAddress: 'test@example.com' }],
  fullName: 'Test User',
  firstName: 'Test',
  lastName: 'User',
};

export const mockUseUser = jest.fn(() => ({
  user: mockUser,
  isLoaded: true,
  isSignedIn: true,
}));

export const mockUseAuth = jest.fn(() => ({
  userId: 'test-user-id',
  isLoaded: true,
  isSignedIn: true,
  signOut: jest.fn(),
}));

export const mockClerk = {
  useUser: mockUseUser,
  useAuth: mockUseAuth,
};

jest.mock('@clerk/clerk-expo', () => mockClerk);

// React Native Safe Area Context Mock
export const mockUseSafeAreaInsets = jest.fn(() => ({
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
}));

export const mockSafeAreaProvider = jest.fn(({ children }: { children: React.ReactNode }) => children);

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: mockUseSafeAreaInsets,
  SafeAreaProvider: mockSafeAreaProvider,
  SafeAreaView: jest.fn(({ children }: { children: React.ReactNode }) => children),
}));

// React Hook Form Mock
export const mockControl = {
  register: jest.fn(),
  unregister: jest.fn(),
  getFieldState: jest.fn(),
  _subjects: {
    state: { next: jest.fn() },
    values: { next: jest.fn() },
    array: { next: jest.fn() },
  },
};

export const mockUseForm = jest.fn(() => ({
  control: mockControl,
  handleSubmit: jest.fn((fn) => fn),
  register: jest.fn(),
  setValue: jest.fn(),
  getValues: jest.fn(),
  watch: jest.fn(),
  reset: jest.fn(),
  formState: {
    errors: {},
    isSubmitting: false,
    isValid: true,
  },
}));

export const mockController = jest.fn(({ render }: any) => render({
  field: {
    onChange: jest.fn(),
    onBlur: jest.fn(),
    value: '',
    name: 'test',
  },
  fieldState: {
    error: undefined,
  },
}));

jest.mock('react-hook-form', () => ({
  useForm: mockUseForm,
  Controller: mockController,
  useController: jest.fn(),
}));

// Expo Symbols Mock
export const mockSymbolView = jest.fn(({ children }: any) => children);

jest.mock('expo-symbols', () => ({
  SymbolView: mockSymbolView,
}));

// Utility function to reset all external library mocks
export const resetExternalMocks = () => {
  // Reset expo-router
  mockRouter.push.mockClear();
  mockRouter.replace.mockClear();
  mockRouter.back.mockClear();
  mockRouter.setParams.mockClear();
  mockRouter.canGoBack.mockClear();
  mockUseRouter.mockClear();
  mockUseLocalSearchParams.mockClear();
  mockUseGlobalSearchParams.mockClear();
  
  // Reset toast
  mockToast.show.mockClear();
  mockToast.hide.mockClear();
  
  // Reset clerk - restore to default signed-in state
  mockUseUser.mockClear();
  mockUseUser.mockReturnValue({
    user: mockUser,
    isLoaded: true,
    isSignedIn: true,
  });
  
  mockUseAuth.mockClear();
  mockUseAuth.mockReturnValue({
    userId: 'test-user-id',
    isLoaded: true,
    isSignedIn: true,
    signOut: jest.fn(),
  });
  
  // Reset safe area
  mockUseSafeAreaInsets.mockClear();
  mockUseSafeAreaInsets.mockReturnValue({
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  });
  
  // Reset react-hook-form
  mockUseForm.mockClear();
  mockController.mockClear();
};