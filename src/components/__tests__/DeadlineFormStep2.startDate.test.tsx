import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { DeadlineFormStep2 } from '../forms/DeadlineFormStep2';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { DeadlineFormData, deadlineFormSchema } from '@/lib/deadlineFormSchema';
import { View } from 'react-native';

// Mock the theme
jest.mock('@/theme', () => ({
  useTheme: () => ({
    theme: {
      surface: '#ffffff',
      border: '#cccccc',
      danger: '#ff0000',
      primary: '#0000ff',
      textMuted: '#666666',
    },
  }),
}));

// Mock DateTimePicker
jest.mock('@react-native-community/datetimepicker', () => {
  const React = require('react');
  const { View, Text, TouchableOpacity } = require('react-native');
  
  return {
    __esModule: true,
    default: ({ value, onChange, testID }: any) => (
      <View testID={testID}>
        <Text>{value?.toISOString()}</Text>
        <TouchableOpacity
          testID={`${testID}-change`}
          onPress={() => onChange({}, new Date('2025-01-08T12:00:00Z'))}
        >
          <Text>Change Date</Text>
        </TouchableOpacity>
      </View>
    ),
  };
});

// Wrapper component to provide form context
const TestWrapper = ({ 
  initialValues,
  children 
}: { 
  initialValues?: Partial<DeadlineFormData>,
  children: (props: any) => React.ReactElement 
}) => {
  const form = useForm<DeadlineFormData>({
    resolver: zodResolver(deadlineFormSchema),
    defaultValues: {
      bookTitle: 'Test Book',
      format: 'physical',
      source: 'personal',
      deadline: new Date('2025-02-15T12:00:00Z'),
      totalQuantity: 300,
      currentProgress: 0,
      flexibility: 'flexible',
      ...initialValues
    }
  });

  return (
    <View>
      {children({
        control: form.control,
        setValue: form.setValue,
        watch: form.watch,
        watchedValues: form.watch()
      })}
    </View>
  );
};

describe('DeadlineFormStep2 - Start Date Field', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2025-01-15T12:00:00Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should not show start date field when currentProgress is 0', () => {
    const { queryByText } = render(
      <TestWrapper initialValues={{ currentProgress: 0 }}>
        {(props) => (
          <DeadlineFormStep2
            {...props}
            selectedFormat="physical"
            selectedPriority="flexible"
            onPriorityChange={jest.fn()}
            showDatePicker={false}
            onDatePickerToggle={jest.fn()}
            onDateChange={jest.fn()}
            deadline={new Date('2025-02-15T12:00:00Z')}
            paceEstimate=""
          />
        )}
      </TestWrapper>
    );

    expect(queryByText('When did you start reading?')).toBeNull();
  });

  it('should show start date field when currentProgress > 0', async () => {
    const { getByText } = render(
      <TestWrapper initialValues={{ currentProgress: 50 }}>
        {(props) => (
          <DeadlineFormStep2
            {...props}
            selectedFormat="physical"
            selectedPriority="flexible"
            onPriorityChange={jest.fn()}
            showDatePicker={false}
            onDatePickerToggle={jest.fn()}
            onDateChange={jest.fn()}
            deadline={new Date('2025-02-15T12:00:00Z')}
            paceEstimate=""
          />
        )}
      </TestWrapper>
    );

    await waitFor(() => {
      expect(getByText('When did you start reading?')).toBeTruthy();
    });
  });

  it('should show start date field for audio format when currentMinutes > 0', async () => {
    const { getByText } = render(
      <TestWrapper initialValues={{ currentProgress: 0, currentMinutes: 30 }}>
        {(props) => (
          <DeadlineFormStep2
            {...props}
            selectedFormat="audio"
            selectedPriority="flexible"
            onPriorityChange={jest.fn()}
            showDatePicker={false}
            onDatePickerToggle={jest.fn()}
            onDateChange={jest.fn()}
            deadline={new Date('2025-02-15T12:00:00Z')}
            paceEstimate=""
          />
        )}
      </TestWrapper>
    );

    await waitFor(() => {
      expect(getByText('When did you start reading?')).toBeTruthy();
    });
  });

  it('should default to 7 days ago for significant progress', async () => {
    const mockSetValue = jest.fn();
    
    render(
      <TestWrapper initialValues={{ currentProgress: 100 }}>
        {(props) => (
          <DeadlineFormStep2
            {...props}
            setValue={mockSetValue}
            selectedFormat="physical"
            selectedPriority="flexible"
            onPriorityChange={jest.fn()}
            showDatePicker={false}
            onDatePickerToggle={jest.fn()}
            onDateChange={jest.fn()}
            deadline={new Date('2025-02-15T12:00:00Z')}
            paceEstimate=""
          />
        )}
      </TestWrapper>
    );

    await waitFor(() => {
      // Check that setValue was called with a date 7 days ago
      const expectedDate = new Date('2025-01-08T12:00:00Z'); // 7 days before Jan 15
      expect(mockSetValue).toHaveBeenCalledWith('startDate', expectedDate);
    });
  });

  it('should default to today for minimal progress', async () => {
    const mockSetValue = jest.fn();
    
    render(
      <TestWrapper initialValues={{ currentProgress: 10 }}>
        {(props) => (
          <DeadlineFormStep2
            {...props}
            setValue={mockSetValue}
            selectedFormat="physical"
            selectedPriority="flexible"
            onPriorityChange={jest.fn()}
            showDatePicker={false}
            onDatePickerToggle={jest.fn()}
            onDateChange={jest.fn()}
            deadline={new Date('2025-02-15T12:00:00Z')}
            paceEstimate=""
          />
        )}
      </TestWrapper>
    );

    await waitFor(() => {
      // Check that setValue was called with today's date
      const expectedDate = new Date('2025-01-15T12:00:00Z'); // Today
      expect(mockSetValue).toHaveBeenCalledWith('startDate', expectedDate);
    });
  });

  it('should toggle date picker when start date button is pressed', async () => {
    const { getByTestId } = render(
      <TestWrapper initialValues={{ currentProgress: 50 }}>
        {(props) => (
          <DeadlineFormStep2
            {...props}
            selectedFormat="physical"
            selectedPriority="flexible"
            onPriorityChange={jest.fn()}
            showDatePicker={false}
            onDatePickerToggle={jest.fn()}
            onDateChange={jest.fn()}
            deadline={new Date('2025-02-15T12:00:00Z')}
            paceEstimate=""
          />
        )}
      </TestWrapper>
    );

    await waitFor(() => {
      const button = getByTestId('start-date-picker-button');
      expect(button).toBeTruthy();
    });

    const button = getByTestId('start-date-picker-button');
    fireEvent.press(button);

    // After pressing, the date picker should be visible
    await waitFor(() => {
      expect(getByTestId('input-startDate')).toBeTruthy();
    });
  });

  it('should clear start date when progress is removed', async () => {
    const mockSetValue = jest.fn();
    
    const { rerender } = render(
      <TestWrapper initialValues={{ currentProgress: 50 }}>
        {(props) => (
          <DeadlineFormStep2
            {...props}
            setValue={mockSetValue}
            selectedFormat="physical"
            selectedPriority="flexible"
            onPriorityChange={jest.fn()}
            showDatePicker={false}
            onDatePickerToggle={jest.fn()}
            onDateChange={jest.fn()}
            deadline={new Date('2025-02-15T12:00:00Z')}
            paceEstimate=""
          />
        )}
      </TestWrapper>
    );

    // Wait for initial setup
    await waitFor(() => {
      expect(mockSetValue).toHaveBeenCalledWith('startDate', expect.any(Date));
    });

    // Clear the mock
    mockSetValue.mockClear();

    // Re-render with no progress
    rerender(
      <TestWrapper initialValues={{ currentProgress: 0 }}>
        {(props) => (
          <DeadlineFormStep2
            {...props}
            setValue={mockSetValue}
            selectedFormat="physical"
            selectedPriority="flexible"
            onPriorityChange={jest.fn()}
            showDatePicker={false}
            onDatePickerToggle={jest.fn()}
            onDateChange={jest.fn()}
            deadline={new Date('2025-02-15T12:00:00Z')}
            paceEstimate=""
          />
        )}
      </TestWrapper>
    );

    // Should clear the start date
    await waitFor(() => {
      expect(mockSetValue).toHaveBeenCalledWith('startDate', undefined);
    });
  });

  it('should show helper text explaining the purpose of the start date', async () => {
    const { getByText } = render(
      <TestWrapper initialValues={{ currentProgress: 50 }}>
        {(props) => (
          <DeadlineFormStep2
            {...props}
            selectedFormat="physical"
            selectedPriority="flexible"
            onPriorityChange={jest.fn()}
            showDatePicker={false}
            onDatePickerToggle={jest.fn()}
            onDateChange={jest.fn()}
            deadline={new Date('2025-02-15T12:00:00Z')}
            paceEstimate=""
          />
        )}
      </TestWrapper>
    );

    await waitFor(() => {
      expect(getByText("Since you've already started, we'll track your progress from this date for accurate pacing")).toBeTruthy();
    });
  });
});