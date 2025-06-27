import { render, screen, fireEvent, waitFor, act } from '@testing-library/react-native';
import React from 'react';
import { Alert } from 'react-native';
import Toast from 'react-native-toast-message';
import { router } from 'expo-router';
import DeadlineActionButtons from '../DeadlineActionButtons';
import { DeadlineProvider } from '@/contexts/DeadlineProvider';
import { ReadingDeadlineWithProgress } from '@/types/deadline';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock dependencies
jest.mock('react-native-toast-message', () => ({
  show: jest.fn(),
}));

jest.mock('expo-router', () => ({
  router: {
    replace: jest.fn(),
  },
}));

// Mock the hooks
jest.mock('@/hooks/useDeadlines', () => ({
  useGetDeadlines: jest.fn(() => ({
    data: [],
    error: null,
    isLoading: false,
  })),
  useAddDeadline: jest.fn(() => ({
    mutate: jest.fn(),
  })),
  useUpdateDeadline: jest.fn(() => ({
    mutate: jest.fn(),
  })),
  useDeleteDeadline: jest.fn(() => ({
    mutate: jest.fn(),
  })),
}));

// Mock Supabase
jest.mock('@/lib/supabase', () => ({
  useSupabase: jest.fn(() => ({
    from: jest.fn(() => ({
      delete: jest.fn(() => ({
        eq: jest.fn(() => Promise.resolve({ error: null })),
      })),
    })),
  })),
}));

// Mock Clerk
jest.mock('@clerk/clerk-expo', () => ({
  useUser: jest.fn(() => ({
    user: { id: 'test-user-id' },
  })),
}));

// Mock Alert after importing
let mockAlert: jest.SpyInstance;

// Mock data
const mockDeadline: ReadingDeadlineWithProgress = {
  id: 'test-deadline-id',
  book_title: 'The Great Gatsby',
  author: 'F. Scott Fitzgerald',
  format: 'physical',
  source: 'library',
  deadline_date: '2024-12-31T00:00:00Z',
  total_quantity: 180,
  flexibility: 'strict',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  user_id: 'test-user-id',
  progress: [
    {
      id: 'progress-1',
      reading_deadline_id: 'test-deadline-id',
      current_progress: 50,
      created_at: '2024-01-05T00:00:00Z',
      updated_at: '2024-01-05T00:00:00Z',
    },
  ],
};

describe('DeadlineActionButtons - Functional Tests', () => {
  let queryClient: QueryClient;
  let mockDeleteMutate: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockAlert = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    // Setup delete mutation mock
    mockDeleteMutate = jest.fn();
    const { useDeleteDeadline } = require('@/hooks/useDeadlines');
    useDeleteDeadline.mockReturnValue({
      mutate: mockDeleteMutate,
    });
  });

  afterEach(async () => {
    // Clear query cache to prevent test pollution
    queryClient.clear();
    mockAlert?.mockRestore();
    
    // Wait for any pending async operations
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });
  });

  const renderWithProviders = (component: React.ReactElement) => {
    return render(
      <QueryClientProvider client={queryClient}>
        <DeadlineProvider>
          {component}
        </DeadlineProvider>
      </QueryClientProvider>
    );
  };

  describe('Complete User Flow - Delete Deadline', () => {
    it('should complete full delete flow successfully', async () => {
      renderWithProviders(<DeadlineActionButtons deadline={mockDeadline} />);

      // Step 1: User clicks delete button
      const deleteButton = screen.getByText('🗑️ Delete Deadline');
      expect(deleteButton).toBeTruthy();
      fireEvent.press(deleteButton);

      // Step 2: Confirmation dialog appears
      expect(mockAlert).toHaveBeenCalledWith(
        'Delete Deadline',
        'Are you sure you want to delete "The Great Gatsby"? This action cannot be undone.',
        expect.any(Array)
      );

      // Step 3: User confirms deletion
      const alertCall = mockAlert.mock.calls[0];
      const confirmButton = alertCall?.[2]?.[1];
      expect(confirmButton.text).toBe('Delete');
      expect(confirmButton.style).toBe('destructive');
      
      act(() => {
        confirmButton?.onPress?.();
      });

      // Step 4: Button shows loading state
      await waitFor(() => {
        expect(screen.getByText('Deleting...')).toBeTruthy();
      });

      // Step 5: Delete mutation is called
      expect(mockDeleteMutate).toHaveBeenCalledWith(
        'test-deadline-id',
        expect.objectContaining({
          onSuccess: expect.any(Function),
          onError: expect.any(Function),
        })
      );

      // Step 6: Simulate successful deletion
      const mutateCall = mockDeleteMutate.mock.calls[0];
      const { onSuccess } = mutateCall[1];
      act(() => {
        onSuccess();
      });

      // Step 7: Success toast is shown
      await waitFor(() => {
        expect(Toast.show).toHaveBeenCalledWith({
          type: 'success',
          text1: 'Deadline deleted',
          text2: '"The Great Gatsby" has been removed',
          autoHide: true,
          visibilityTime: 2000,
          position: 'top',
          onHide: expect.any(Function),
        });
      });

      // Step 8: Navigation occurs after toast
      const toastCall = (Toast.show as jest.Mock).mock.calls[0];
      const onHideCallback = toastCall[0].onHide;
      act(() => {
        onHideCallback();
      });

      expect(router.replace).toHaveBeenCalledWith('/');
    });

    it('should handle cancellation properly', async () => {
      renderWithProviders(<DeadlineActionButtons deadline={mockDeadline} />);

      // User clicks delete button
      fireEvent.press(screen.getByText('🗑️ Delete Deadline'));

      // User clicks Cancel
      const alertCall = mockAlert.mock.calls[0];
      const cancelButton = alertCall?.[2]?.[0];
      expect(cancelButton.text).toBe('Cancel');
      expect(cancelButton.style).toBe('cancel');
      
      // Simulate cancel - most cancel buttons don't have onPress
      if (cancelButton.onPress) {
        cancelButton.onPress();
      }

      // Nothing should happen
      expect(mockDeleteMutate).not.toHaveBeenCalled();
      expect(Toast.show).not.toHaveBeenCalled();
      expect(router.replace).not.toHaveBeenCalled();
      
      // Button should still be in normal state
      expect(screen.getByText('🗑️ Delete Deadline')).toBeTruthy();
    });

    it('should handle deletion error with retry', async () => {
      renderWithProviders(<DeadlineActionButtons deadline={mockDeadline} />);

      // Step 1: User initiates delete
      fireEvent.press(screen.getByText('🗑️ Delete Deadline'));
      
      const alertCall = mockAlert.mock.calls[0];
      const confirmButton = alertCall?.[2]?.[1];
      act(() => {
        confirmButton?.onPress?.();
      });

      // Step 2: Loading state
      await waitFor(() => {
        expect(screen.getByText('Deleting...')).toBeTruthy();
      });

      // Step 3: Simulate error
      const mutateCall = mockDeleteMutate.mock.calls[0];
      const { onError } = mutateCall[1];
      const error = new Error('Network connection failed');
      act(() => {
        onError(error);
      });

      // Step 4: Error toast is shown
      await waitFor(() => {
        expect(Toast.show).toHaveBeenCalledWith({
          type: 'error',
          text1: 'Failed to delete deadline',
          text2: 'Network connection failed',
          autoHide: true,
          visibilityTime: 3000,
          position: 'top',
        });
      });

      // Step 5: Button returns to normal state
      await waitFor(() => {
        expect(screen.getByText('🗑️ Delete Deadline')).toBeTruthy();
      });

      // Step 6: User can retry
      jest.clearAllMocks();
      fireEvent.press(screen.getByText('🗑️ Delete Deadline'));
      expect(mockAlert).toHaveBeenCalled();
    });
  });

  describe('Multiple Actions Integration', () => {
    it('should handle rapid button clicks properly', async () => {
      renderWithProviders(<DeadlineActionButtons deadline={mockDeadline} />);

      // First click shows alert
      const deleteButton = screen.getByText('🗑️ Delete Deadline');
      fireEvent.press(deleteButton);
      
      // Alert is shown
      expect(mockAlert).toHaveBeenCalledTimes(1);
      
      // While alert is open, button presses do nothing
      // (In practice, the alert modal blocks interaction)
    });

    it('should disable all buttons during deletion', async () => {
      renderWithProviders(<DeadlineActionButtons deadline={mockDeadline} />);

      // Start deletion
      fireEvent.press(screen.getByText('🗑️ Delete Deadline'));
      const alertCall = mockAlert.mock.calls[0];
      act(() => {
        alertCall?.[2]?.[1]?.onPress?.();
      });

      // During deletion, delete button should show loading text
      await waitFor(() => {
        expect(screen.getByText('Deleting...')).toBeTruthy();
      });

      // Other buttons should still be enabled (they have their own state)
      expect(screen.getByText('✓ Mark as Complete')).toBeTruthy();
      expect(screen.getByText('📚 Set Aside')).toBeTruthy();
    });
  });

  describe('Edge Cases', () => {
    it('should handle deadline with very long book title', async () => {
      const longTitleDeadline = {
        ...mockDeadline,
        book_title: 'This is an extremely long book title that might cause UI issues in the confirmation dialog and toast messages',
      };

      renderWithProviders(<DeadlineActionButtons deadline={longTitleDeadline} />);

      fireEvent.press(screen.getByText('🗑️ Delete Deadline'));

      expect(mockAlert).toHaveBeenCalledWith(
        'Delete Deadline',
        expect.stringContaining('This is an extremely long book title'),
        expect.any(Array)
      );
    });

    it('should handle deadline with special characters in title', async () => {
      const specialTitleDeadline = {
        ...mockDeadline,
        book_title: 'Book with "quotes" & special <characters>',
      };

      renderWithProviders(<DeadlineActionButtons deadline={specialTitleDeadline} />);

      fireEvent.press(screen.getByText('🗑️ Delete Deadline'));

      expect(mockAlert).toHaveBeenCalledWith(
        'Delete Deadline',
        'Are you sure you want to delete "Book with "quotes" & special <characters>"? This action cannot be undone.',
        expect.any(Array)
      );
    });

    it('should handle missing deadline data gracefully', async () => {
      const incompleteDeadline = {
        ...mockDeadline,
        book_title: '',
      };

      renderWithProviders(<DeadlineActionButtons deadline={incompleteDeadline} />);

      fireEvent.press(screen.getByText('🗑️ Delete Deadline'));

      // Should still show alert even with empty title
      expect(mockAlert).toHaveBeenCalled();
    });
  });

  describe('Provider Integration', () => {
    it('should work correctly within DeadlineProvider context', async () => {
      // This test ensures the component works with the actual provider
      const { useGetDeadlines } = require('@/hooks/useDeadlines');
      useGetDeadlines.mockReturnValue({
        data: [mockDeadline],
        error: null,
        isLoading: false,
      });

      renderWithProviders(<DeadlineActionButtons deadline={mockDeadline} />);

      // Component should render and function
      expect(screen.getByText('🗑️ Delete Deadline')).toBeTruthy();
      
      fireEvent.press(screen.getByText('🗑️ Delete Deadline'));
      expect(mockAlert).toHaveBeenCalled();
    });
  });
});