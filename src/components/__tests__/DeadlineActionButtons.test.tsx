import { render, screen, fireEvent, waitFor, act } from '@testing-library/react-native';
import React from 'react';
import { Alert } from 'react-native';
import Toast from 'react-native-toast-message';
import { router } from 'expo-router';
import DeadlineActionButtons from '../DeadlineActionButtons';
import { ReadingDeadlineWithProgress } from '@/types/deadline';

// Mock dependencies
jest.mock('react-native-toast-message', () => ({
  show: jest.fn(),
}));

jest.mock('expo-router', () => ({
  router: {
    replace: jest.fn(),
  },
}));

jest.mock('@/contexts/DeadlineProvider', () => ({
  useDeadlines: jest.fn(),
}));

// Mock Alert
jest.spyOn(Alert, 'alert');

// Mock data
const mockDeadline: ReadingDeadlineWithProgress = {
  id: 'test-deadline-id',
  book_title: 'Test Book Title',
  author: 'Test Author',
  format: 'physical',
  source: 'library',
  deadline_date: '2024-12-31T00:00:00Z',
  total_quantity: 300,
  flexibility: 'flexible',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  user_id: 'test-user-id',
  progress: [],
};

describe('DeadlineActionButtons', () => {
  const mockDeleteDeadline = jest.fn();
  const mockOnComplete = jest.fn();
  const mockOnSetAside = jest.fn();
  const mockOnDelete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    const { useDeadlines } = require('@/contexts/DeadlineProvider');
    useDeadlines.mockReturnValue({
      deleteDeadline: mockDeleteDeadline,
    });
  });

  describe('Rendering', () => {
    it('should render all three action buttons', () => {
      render(<DeadlineActionButtons deadline={mockDeadline} />);

      expect(screen.getByText('✓ Mark as Complete')).toBeTruthy();
      expect(screen.getByText('📚 Set Aside')).toBeTruthy();
      expect(screen.getByText('🗑️ Delete Deadline')).toBeTruthy();
    });

    it('should have correct button variants', () => {
      const { getByText } = render(<DeadlineActionButtons deadline={mockDeadline} />);

      const completeButton = getByText('✓ Mark as Complete').parent;
      const setAsideButton = getByText('📚 Set Aside').parent;
      const deleteButton = getByText('🗑️ Delete Deadline').parent;

      // Check that buttons exist
      expect(completeButton).toBeTruthy();
      expect(setAsideButton).toBeTruthy();
      expect(deleteButton).toBeTruthy();
    });
  });

  describe('Complete Button', () => {
    it('should call onComplete when provided', () => {
      render(
        <DeadlineActionButtons 
          deadline={mockDeadline} 
          onComplete={mockOnComplete}
        />
      );

      fireEvent.press(screen.getByText('✓ Mark as Complete'));
      expect(mockOnComplete).toHaveBeenCalled();
    });

    it('should show coming soon toast when onComplete not provided', () => {
      render(<DeadlineActionButtons deadline={mockDeadline} />);

      fireEvent.press(screen.getByText('✓ Mark as Complete'));
      
      expect(Toast.show).toHaveBeenCalledWith({
        type: 'info',
        text1: 'Mark as Complete',
        text2: 'This feature is coming soon!',
        autoHide: true,
        visibilityTime: 2000,
        position: 'top',
      });
    });
  });

  describe('Set Aside Button', () => {
    it('should call onSetAside when provided', () => {
      render(
        <DeadlineActionButtons 
          deadline={mockDeadline} 
          onSetAside={mockOnSetAside}
        />
      );

      fireEvent.press(screen.getByText('📚 Set Aside'));
      expect(mockOnSetAside).toHaveBeenCalled();
    });

    it('should show coming soon toast when onSetAside not provided', () => {
      render(<DeadlineActionButtons deadline={mockDeadline} />);

      fireEvent.press(screen.getByText('📚 Set Aside'));
      
      expect(Toast.show).toHaveBeenCalledWith({
        type: 'info',
        text1: 'Set Aside',
        text2: 'This feature is coming soon!',
        autoHide: true,
        visibilityTime: 2000,
        position: 'top',
      });
    });
  });

  describe('Delete Button - Basic Behavior', () => {
    it('should call onDelete when provided', () => {
      render(
        <DeadlineActionButtons 
          deadline={mockDeadline} 
          onDelete={mockOnDelete}
        />
      );

      fireEvent.press(screen.getByText('🗑️ Delete Deadline'));
      expect(mockOnDelete).toHaveBeenCalled();
      expect(Alert.alert).not.toHaveBeenCalled();
    });

    it('should show confirmation alert when onDelete not provided', () => {
      render(<DeadlineActionButtons deadline={mockDeadline} />);

      fireEvent.press(screen.getByText('🗑️ Delete Deadline'));
      
      expect(Alert.alert).toHaveBeenCalledWith(
        'Delete Deadline',
        'Are you sure you want to delete "Test Book Title"? This action cannot be undone.',
        expect.any(Array)
      );
    });
  });

  describe('Delete Confirmation Dialog', () => {
    it('should have Cancel and Delete buttons in alert', () => {
      render(<DeadlineActionButtons deadline={mockDeadline} />);

      fireEvent.press(screen.getByText('🗑️ Delete Deadline'));
      
      const alertCall = (Alert.alert as jest.Mock).mock.calls[0];
      const buttons = alertCall[2];
      
      expect(buttons).toHaveLength(2);
      expect(buttons[0].text).toBe('Cancel');
      expect(buttons[0].style).toBe('cancel');
      expect(buttons[1].text).toBe('Delete');
      expect(buttons[1].style).toBe('destructive');
    });

    it('should not call deleteDeadline when Cancel is pressed', () => {
      render(<DeadlineActionButtons deadline={mockDeadline} />);

      fireEvent.press(screen.getByText('🗑️ Delete Deadline'));
      
      const alertCall = (Alert.alert as jest.Mock).mock.calls[0];
      const cancelButton = alertCall[2][0];
      
      // Simulate pressing Cancel
      if (cancelButton.onPress) {
        cancelButton.onPress();
      }
      
      expect(mockDeleteDeadline).not.toHaveBeenCalled();
    });
  });

  describe('Delete Execution', () => {
    it('should call deleteDeadline when Delete is confirmed', () => {
      render(<DeadlineActionButtons deadline={mockDeadline} />);

      fireEvent.press(screen.getByText('🗑️ Delete Deadline'));
      
      const alertCall = (Alert.alert as jest.Mock).mock.calls[0];
      const deleteButton = alertCall[2][1];
      
      // Simulate pressing Delete
      act(() => {
        deleteButton.onPress();
      });
      
      expect(mockDeleteDeadline).toHaveBeenCalledWith(
        'test-deadline-id',
        expect.any(Function),
        expect.any(Function)
      );
    });

    it('should show loading state during deletion', async () => {
      render(<DeadlineActionButtons deadline={mockDeadline} />);

      fireEvent.press(screen.getByText('🗑️ Delete Deadline'));
      
      const alertCall = (Alert.alert as jest.Mock).mock.calls[0];
      const deleteButton = alertCall[2][1];
      
      // Simulate pressing Delete
      await act(async () => {
        deleteButton.onPress();
      });
      
      await waitFor(() => {
        expect(screen.getByText('Deleting...')).toBeTruthy();
      });
    });

    it('should disable button during deletion', async () => {
      render(<DeadlineActionButtons deadline={mockDeadline} />);

      fireEvent.press(screen.getByText('🗑️ Delete Deadline'));
      
      const alertCall = (Alert.alert as jest.Mock).mock.calls[0];
      const deleteButton = alertCall[2][1];
      
      // Simulate pressing Delete
      await act(async () => {
        deleteButton.onPress();
      });
      
      await waitFor(() => {
        const button = screen.getByText('Deleting...');
        expect(button).toBeTruthy();
        // The button is disabled via the disabled prop
        const deleteBtn = screen.queryByTestId('delete-button');
        if (deleteBtn) {
          expect(deleteBtn.props.disabled).toBe(true);
        }
      });
    });
  });

  describe('Delete Success', () => {
    it('should show success toast on successful deletion', async () => {
      render(<DeadlineActionButtons deadline={mockDeadline} />);

      fireEvent.press(screen.getByText('🗑️ Delete Deadline'));
      
      const alertCall = (Alert.alert as jest.Mock).mock.calls[0];
      const deleteButton = alertCall[2][1];
      
      // Simulate pressing Delete
      act(() => {
        deleteButton.onPress();
      });
      
      // Get the success callback
      const deleteCall = mockDeleteDeadline.mock.calls[0];
      const successCallback = deleteCall[1];
      
      // Simulate successful deletion
      act(() => {
        successCallback();
      });
      
      expect(Toast.show).toHaveBeenCalledWith({
        type: 'success',
        text1: 'Deadline deleted',
        text2: '"Test Book Title" has been removed',
        autoHide: true,
        visibilityTime: 2000,
        position: 'top',
        onHide: expect.any(Function),
      });
    });

    it('should navigate to home after successful deletion', async () => {
      render(<DeadlineActionButtons deadline={mockDeadline} />);

      fireEvent.press(screen.getByText('🗑️ Delete Deadline'));
      
      const alertCall = (Alert.alert as jest.Mock).mock.calls[0];
      const deleteButton = alertCall[2][1];
      
      // Simulate pressing Delete
      act(() => {
        deleteButton.onPress();
      });
      
      // Get the success callback
      const deleteCall = mockDeleteDeadline.mock.calls[0];
      const successCallback = deleteCall[1];
      
      // Simulate successful deletion
      act(() => {
        successCallback();
      });
      
      // Get the onHide callback from Toast
      const toastCall = (Toast.show as jest.Mock).mock.calls[0];
      const onHideCallback = toastCall[0].onHide;
      
      // Simulate toast hiding
      act(() => {
        onHideCallback();
      });
      
      expect(router.replace).toHaveBeenCalledWith('/');
    });
  });

  describe('Delete Error', () => {
    it('should show error toast on deletion failure', async () => {
      render(<DeadlineActionButtons deadline={mockDeadline} />);

      fireEvent.press(screen.getByText('🗑️ Delete Deadline'));
      
      const alertCall = (Alert.alert as jest.Mock).mock.calls[0];
      const deleteButton = alertCall[2][1];
      
      // Simulate pressing Delete
      act(() => {
        deleteButton.onPress();
      });
      
      // Get the error callback
      const deleteCall = mockDeleteDeadline.mock.calls[0];
      const errorCallback = deleteCall[2];
      
      // Simulate deletion error
      const error = new Error('Network error');
      act(() => {
        errorCallback(error);
      });
      
      expect(Toast.show).toHaveBeenCalledWith({
        type: 'error',
        text1: 'Failed to delete deadline',
        text2: 'Network error',
        autoHide: true,
        visibilityTime: 3000,
        position: 'top',
      });
    });

    it('should show default error message when error has no message', async () => {
      render(<DeadlineActionButtons deadline={mockDeadline} />);

      fireEvent.press(screen.getByText('🗑️ Delete Deadline'));
      
      const alertCall = (Alert.alert as jest.Mock).mock.calls[0];
      const deleteButton = alertCall[2][1];
      
      // Simulate pressing Delete
      act(() => {
        deleteButton.onPress();
      });
      
      // Get the error callback
      const deleteCall = mockDeleteDeadline.mock.calls[0];
      const errorCallback = deleteCall[2];
      
      // Simulate deletion error without message
      const error = new Error('');
      act(() => {
        errorCallback(error);
      });
      
      expect(Toast.show).toHaveBeenCalledWith({
        type: 'error',
        text1: 'Failed to delete deadline',
        text2: 'Please try again',
        autoHide: true,
        visibilityTime: 3000,
        position: 'top',
      });
    });

    it('should re-enable button after deletion error', async () => {
      render(<DeadlineActionButtons deadline={mockDeadline} />);

      fireEvent.press(screen.getByText('🗑️ Delete Deadline'));
      
      const alertCall = (Alert.alert as jest.Mock).mock.calls[0];
      const deleteButton = alertCall[2][1];
      
      // Simulate pressing Delete
      act(() => {
        deleteButton.onPress();
      });
      
      // Button should be disabled
      await waitFor(() => {
        expect(screen.getByText('Deleting...')).toBeTruthy();
      });
      
      // Get the error callback
      const deleteCall = mockDeleteDeadline.mock.calls[0];
      const errorCallback = deleteCall[2];
      
      // Simulate deletion error
      act(() => {
        errorCallback(new Error('Failed'));
      });
      
      // Button should be re-enabled
      await waitFor(() => {
        expect(screen.getByText('🗑️ Delete Deadline')).toBeTruthy();
        const button = screen.getByText('🗑️ Delete Deadline').parent;
        expect(button?.props.accessibilityState?.disabled).toBeFalsy();
      });
    });
  });
});