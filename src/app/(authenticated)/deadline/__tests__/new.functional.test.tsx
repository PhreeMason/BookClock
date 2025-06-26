// Mock Toast first
jest.mock('react-native-toast-message', () => {
  const mockShow = jest.fn();
  return {
    __esModule: true,
    default: {
      show: mockShow,
    },
    // Store the mock function so we can access it in tests
    mockShow,
  };
});

import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import dayjs from 'dayjs';
import React from 'react';
import { Alert } from 'react-native';
import NewDeadLine from '../new';

// Get the mock function for use in tests
const mockToastShow = jest.mocked(require('react-native-toast-message')).mockShow;

// Mock the router
const mockRouter = {
  push: jest.fn(),
  back: jest.fn(),
  replace: jest.fn(),
};

jest.mock('expo-router', () => ({
  router: mockRouter,
}));

// Mock the deadline context
const mockAddDeadline = jest.fn();
jest.mock('@/contexts/DeadlineProvider', () => ({
  useDeadlines: () => ({
    addDeadline: mockAddDeadline,
  }),
}));

// Mock theme hook
jest.mock('@/hooks/useThemeColor', () => ({
  useThemeColor: jest.fn(() => '#000000'),
}));

// Mock Alert
jest.spyOn(Alert, 'alert');

describe('NewDeadline Functional Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRouter.push.mockClear();
    mockAddDeadline.mockClear();
    mockToastShow.mockClear();
  });

  describe('Form Input Functionality', () => {
    it('should allow user to fill out complete form and submit successfully', async () => {
      const { getByTestId, getByText } = render(<NewDeadLine />);

      // Step 1: Fill out book details
      const bookTitleInput = getByTestId('input-bookTitle');
      const authorInput = getByTestId('input-bookAuthor');
      const totalQuantityInput = getByTestId('input-totalQuantity');

      await act(async () => {
        fireEvent.changeText(bookTitleInput, 'Test Book Title');
        fireEvent.changeText(authorInput, 'Test Author');
        fireEvent.changeText(totalQuantityInput, '300');
      });

      // Verify inputs are updated
      expect(bookTitleInput.props.value).toBe('Test Book Title');
      expect(authorInput.props.value).toBe('Test Author');
      expect(totalQuantityInput.props.value).toBe('300');

      // Select format
      const physicalFormatChip = getByTestId('format-chip-physical');
      await act(async () => {
        fireEvent.press(physicalFormatChip);
      });

      // Go to next step
      const nextButton = getByText('Continue');
      await act(async () => {
        fireEvent.press(nextButton);
      });

      // Step 2: Set deadline
      await waitFor(() => {
        expect(getByText('Set Deadline')).toBeTruthy();
      });

      // Select deadline flexibility
      const flexibleOption = getByTestId('priority-option-flexible');
      await act(async () => {
        fireEvent.press(flexibleOption);
      });

      // Submit form
      const createButton = getByText('Add Book');
      await act(async () => {
        fireEvent.press(createButton);
      });

      // Verify submission
      await waitFor(() => {
        expect(mockAddDeadline).toHaveBeenCalledWith(
          expect.objectContaining({
            deadlineDetails: expect.objectContaining({
              book_title: 'Test Book Title',
              author: 'Test Author',
              format: 'physical',
              source: 'arc',
              flexibility: 'flexible',
              total_quantity: 300,
              deadline_date: expect.any(String),
            }),
            progressDetails: expect.objectContaining({
              current_progress: 0,
              id: '',
              reading_deadline_id: '',
            }),
          }),
          expect.any(Function), // success callback
          expect.any(Function)  // error callback
        );
      });
    });

    it('should handle numeric input validation correctly', async () => {
      const { getByTestId } = render(<NewDeadLine />);

      const totalQuantityInput = getByTestId('input-totalQuantity');

      // Test valid integer input
      await act(async () => {
        fireEvent.changeText(totalQuantityInput, '250');
      });
      expect(totalQuantityInput.props.value).toBe('250');

      // Test zero input
      await act(async () => {
        fireEvent.changeText(totalQuantityInput, '0');
      });
      expect(totalQuantityInput.props.value).toBe('0');

      // Test empty input
      await act(async () => {
        fireEvent.changeText(totalQuantityInput, '');
      });
      expect(totalQuantityInput.props.value).toBe('0');
    });

    it('should handle audio format with minutes input', async () => {
      const { getByTestId } = render(<NewDeadLine />);

      // Select audio format
      const audioFormatChip = getByTestId('format-chip-audio');
      await act(async () => {
        fireEvent.press(audioFormatChip);
      });

      // Verify minutes input appears
      await waitFor(() => {
        const minutesInput = getByTestId('input-totalMinutes');
        expect(minutesInput).toBeTruthy();
      });

      // Test minutes input
      const totalQuantityInput = getByTestId('input-totalQuantity');
      const minutesInput = getByTestId('input-totalMinutes');

      await act(async () => {
        fireEvent.changeText(totalQuantityInput, '8'); // 8 hours
        fireEvent.changeText(minutesInput, '30'); // 30 minutes
      });

      expect(totalQuantityInput.props.value).toBe('8');
      expect(minutesInput.props.value).toBe('30');
    });

    it('should prevent submission with invalid data', async () => {
      const { getByText } = render(<NewDeadLine />);

      // Try to go to next step without required fields
      const nextButton = getByText('Continue');
      await act(async () => {
        fireEvent.press(nextButton);
      });

      // Should still be on step 1 (form validation prevents progression)
      expect(getByText('Book Details')).toBeTruthy();
      expect(mockAddDeadline).not.toHaveBeenCalled();
    });

    it('should handle form reset and navigation', async () => {
      const { getByTestId, getByText } = render(<NewDeadLine />);

      // Fill out some data
      const bookTitleInput = getByTestId('input-bookTitle');
      await act(async () => {
        fireEvent.changeText(bookTitleInput, 'Test Book');
      });

      // Go to step 2
      const totalQuantityInput = getByTestId('input-totalQuantity');
      await act(async () => {
        fireEvent.changeText(totalQuantityInput, '200');
      });

      const nextButton = getByText('Continue');
      await act(async () => {
        fireEvent.press(nextButton);
      });

      // Go back to step 1
      const backButton = getByText('Back');
      await act(async () => {
        fireEvent.press(backButton);
      });

      // Verify data is preserved
      await waitFor(() => {
        expect(getByTestId('input-bookTitle').props.value).toBe('Test Book');
        expect(getByTestId('input-totalQuantity').props.value).toBe('200');
      });
    });
  });

  describe('Form State Management', () => {
    it('should maintain form state across step navigation', async () => {
      const { getByTestId, getByText } = render(<NewDeadLine />);

      // Fill out step 1
      await act(async () => {
        fireEvent.changeText(getByTestId('input-bookTitle'), 'Persistent Book');
        fireEvent.changeText(getByTestId('input-totalQuantity'), '400');
        fireEvent.press(getByTestId('format-chip-ebook'));
      });

      // Navigate to step 2
      const nextButton = getByText('Continue');
      await act(async () => {
        fireEvent.press(nextButton);
      });

      // Wait for step 2 to render
      await waitFor(() => {
        expect(getByTestId('date-picker-button')).toBeTruthy();
      });

      // Navigate back to step 1
      const backButton = getByText('Back');
      await act(async () => {
        fireEvent.press(backButton);
      });

      // Verify all data is preserved
      await waitFor(() => {
        expect(getByTestId('input-bookTitle').props.value).toBe('Persistent Book');
        expect(getByTestId('input-totalQuantity').props.value).toBe('400');
      });
    });

    it('should update pace estimate when form values change', async () => {
      const { getByTestId, getByText } = render(<NewDeadLine />);

      // Fill required fields to enable pace calculation
      await act(async () => {
        fireEvent.changeText(getByTestId('input-bookTitle'), 'Test Book');
        fireEvent.changeText(getByTestId('input-totalQuantity'), '300');
      });

      // Navigate to step 2 to see pace estimate
      const nextButton = getByText('Continue');
      await act(async () => {
        fireEvent.press(nextButton);
      });

      // Wait for step 2 to render
      await waitFor(() => {
        expect(getByTestId('date-picker-button')).toBeTruthy();
      });

      // Verify pace estimate is displayed (should contain reading pace info)
      await waitFor(() => {
        // The pace estimate should be visible somewhere in step 2
        expect(getByText(/pages\/day/i) || getByText(/day/i)).toBeTruthy();
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle submission errors gracefully', async () => {
      // Mock addDeadline to call the error callback
      mockAddDeadline.mockImplementation((params, onSuccess, onError) => {
        if (onError) {
          onError(new Error('Submission failed'));
        }
      });

      const { getByTestId, getByText } = render(<NewDeadLine />);

      // Fill out form quickly to get to submission
      const bookTitleInput = getByTestId('input-bookTitle');
      const authorInput = getByTestId('input-bookAuthor');
      const totalQuantityInput = getByTestId('input-totalQuantity');

      fireEvent.changeText(bookTitleInput, 'Test Book');
      fireEvent.changeText(authorInput, 'Test Author');
      fireEvent.changeText(totalQuantityInput, '300');

      // Navigate to step 2
      const nextButton = getByText('Continue');
      await act(async () => {
        fireEvent.press(nextButton);
      });

      // Wait for step 2 to render
      await waitFor(() => {
        expect(getByTestId('date-picker-button')).toBeTruthy();
      });

      // Open date picker and set deadline
      const datePickerButton = getByTestId('date-picker-button');
      fireEvent.press(datePickerButton);
      
      // Wait for date picker to appear and interact with it
      await waitFor(() => {
        expect(getByTestId('input-deadline')).toBeTruthy();
      });

      const datePicker = getByTestId('input-deadline');
      const futureDate = dayjs().add(7, 'day').toDate();
      fireEvent(datePicker, 'onChange', { nativeEvent: { timestamp: futureDate.getTime() } }, futureDate);

      const submitButton = getByText('Add Book');
      fireEvent.press(submitButton);

      // Verify error handling (should show toast)
      await waitFor(() => {
        expect(mockToastShow).toHaveBeenCalledWith(
          expect.objectContaining({
            type: 'error',
            text1: 'Failed to add deadline',
            text2: expect.any(String),
          })
        );
      });
    });
  });
});
