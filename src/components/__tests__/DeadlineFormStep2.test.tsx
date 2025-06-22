import { render } from '@testing-library/react-native';
import React from 'react';
import { useForm } from 'react-hook-form';
import { View } from 'react-native';
import { DeadlineFormStep2 } from '../forms/DeadlineFormStep2';

// Mock the ThemedText component
jest.mock('@/components/ThemedText', () => ({
  ThemedText: jest.fn(({ children, style, ...props }) => {
    const { Text } = require('react-native');
    return (
      <Text testID="themed-text" style={style} {...props}>
        {children}
      </Text>
    );
  }),
}));

// Mock the CustomInput component
jest.mock('@/components/CustomInput', () => {
  const { TextInput } = require('react-native');
  return jest.fn(({ control, name, placeholder, keyboardType, style, ...props }) => {
    return (
      <TextInput
        testID={`input-${name}`}
        placeholder={placeholder}
        keyboardType={keyboardType}
        style={style}
        {...props}
      />
    );
  });
});

// Mock the PrioritySelector component
jest.mock('../forms/PrioritySelector', () => ({
  PrioritySelector: jest.fn(({ selectedPriority, onSelectPriority }) => {
    const { View, TouchableOpacity, Text } = require('react-native');
    return (
      <View testID="priority-selector">
        <TouchableOpacity
          testID="priority-flexible"
          onPress={() => onSelectPriority('flexible')}
        >
          <Text>Flexible</Text>
        </TouchableOpacity>
        <TouchableOpacity
          testID="priority-strict"
          onPress={() => onSelectPriority('strict')}
        >
          <Text>Strict</Text>
        </TouchableOpacity>
      </View>
    );
  }),
}));

// Mock DateTimePicker
jest.mock('@react-native-community/datetimepicker', () => {
  const { View, Text } = require('react-native');
  return jest.fn(({ value, mode, display, onChange, minimumDate }) => {
    return (
      <View testID="date-picker">
        <Text>DatePicker: {value.toDateString()}</Text>
      </View>
    );
  });
});

// Mock react-hook-form
jest.mock('react-hook-form', () => ({
  useForm: jest.fn(),
  Controller: jest.fn(({ control, name, render }) => {
    return render({
      field: { value: new Date('2024-12-31') },
      fieldState: { error: null },
    });
  }),
}));

const TestComponent = ({ 
  selectedFormat = 'physical' as 'physical' | 'ebook' | 'audio',
  selectedPriority = 'flexible' as 'flexible' | 'strict',
  onPriorityChange = jest.fn(),
  showDatePicker = false,
  onDatePickerToggle = jest.fn(),
  onDateChange = jest.fn(),
  deadline = new Date('2024-12-31'),
  paceEstimate = '',
  watchedValues = {}
}) => {
  const mockControl = {
    register: jest.fn(),
    handleSubmit: jest.fn(),
    formState: { errors: {} },
    watch: jest.fn(),
    setValue: jest.fn(),
    getValues: jest.fn(),
  } as any;

  (useForm as jest.Mock).mockReturnValue({
    control: mockControl,
    handleSubmit: jest.fn(),
    formState: { errors: {} },
    watch: jest.fn(),
    setValue: jest.fn(),
    getValues: jest.fn(),
  });

  return (
    <DeadlineFormStep2
      control={mockControl}
      selectedFormat={selectedFormat}
      selectedPriority={selectedPriority}
      onPriorityChange={onPriorityChange}
      showDatePicker={showDatePicker}
      onDatePickerToggle={onDatePickerToggle}
      onDateChange={onDateChange}
      deadline={deadline}
      paceEstimate={paceEstimate}
      watchedValues={watchedValues}
    />
  );
};

describe('DeadlineFormStep2', () => {
  const mockOnPriorityChange = jest.fn();
  const mockOnDatePickerToggle = jest.fn();
  const mockOnDateChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the intro text', () => {
    const { getByText } = render(
      <TestComponent
        onPriorityChange={mockOnPriorityChange}
        onDatePickerToggle={mockOnDatePickerToggle}
        onDateChange={mockOnDateChange}
      />
    );
    
    expect(getByText('When do you need to finish, and what are the details?')).toBeTruthy();
  });

  it('renders deadline date input', () => {
    const { getByText } = render(
      <TestComponent
        onPriorityChange={mockOnPriorityChange}
        onDatePickerToggle={mockOnDatePickerToggle}
        onDateChange={mockOnDateChange}
      />
    );
    
    expect(getByText('Deadline Date *')).toBeTruthy();
  });

  it('renders current progress input', () => {
    const { getByTestId } = render(
      <TestComponent
        onPriorityChange={mockOnPriorityChange}
        onDatePickerToggle={mockOnDatePickerToggle}
        onDateChange={mockOnDateChange}
      />
    );
    
    expect(getByTestId('input-currentProgress')).toBeTruthy();
  });

  it('renders priority selector', () => {
    const { getByTestId } = render(
      <TestComponent
        onPriorityChange={mockOnPriorityChange}
        onDatePickerToggle={mockOnDatePickerToggle}
        onDateChange={mockOnDateChange}
      />
    );
    
    expect(getByTestId('priority-selector')).toBeTruthy();
  });

  it('shows "Pages Already Read" label for physical format', () => {
    const { getByText } = render(
      <TestComponent
        selectedFormat="physical"
        onPriorityChange={mockOnPriorityChange}
        onDatePickerToggle={mockOnDatePickerToggle}
        onDateChange={mockOnDateChange}
      />
    );
    
    expect(getByText('Pages Already Read')).toBeTruthy();
  });

  it('shows "Pages Already Read" label for ebook format', () => {
    const { getByText } = render(
      <TestComponent
        selectedFormat="ebook"
        onPriorityChange={mockOnPriorityChange}
        onDatePickerToggle={mockOnDatePickerToggle}
        onDateChange={mockOnDateChange}
      />
    );
    
    expect(getByText('Pages Already Read')).toBeTruthy();
  });

  it('shows "Time Already Listened" label for audio format', () => {
    const { getByText } = render(
      <TestComponent
        selectedFormat="audio"
        onPriorityChange={mockOnPriorityChange}
        onDatePickerToggle={mockOnDatePickerToggle}
        onDateChange={mockOnDateChange}
      />
    );
    
    expect(getByText('Time Already Listened')).toBeTruthy();
  });

  it('renders minutes input for audio format', () => {
    const { getByTestId } = render(
      <TestComponent
        selectedFormat="audio"
        onPriorityChange={mockOnPriorityChange}
        onDatePickerToggle={mockOnDatePickerToggle}
        onDateChange={mockOnDateChange}
      />
    );
    
    expect(getByTestId('input-currentMinutes')).toBeTruthy();
  });

  it('does not render minutes input for non-audio formats', () => {
    const { queryByTestId } = render(
      <TestComponent
        selectedFormat="physical"
        onPriorityChange={mockOnPriorityChange}
        onDatePickerToggle={mockOnDatePickerToggle}
        onDateChange={mockOnDateChange}
      />
    );
    
    expect(queryByTestId('input-currentMinutes')).toBeNull();
  });

  it('renders pace estimate when provided', () => {
    const paceEstimate = 'You need to read 15 pages per day';
    const { getByText } = render(
      <TestComponent
        onPriorityChange={mockOnPriorityChange}
        onDatePickerToggle={mockOnDatePickerToggle}
        onDateChange={mockOnDateChange}
        paceEstimate={paceEstimate}
      />
    );
    
    expect(getByText(paceEstimate)).toBeTruthy();
  });

  it('does not render pace estimate when not provided', () => {
    const { queryByTestId } = render(
      <TestComponent
        onPriorityChange={mockOnPriorityChange}
        onDatePickerToggle={mockOnDatePickerToggle}
        onDateChange={mockOnDateChange}
        paceEstimate=""
      />
    );
    
    // The estimate container should not be rendered
    expect(queryByTestId('estimate-container')).toBeNull();
  });

  it('renders helper text for deadline date', () => {
    const { getByText } = render(
      <TestComponent
        onPriorityChange={mockOnPriorityChange}
        onDatePickerToggle={mockOnDatePickerToggle}
        onDateChange={mockOnDateChange}
      />
    );
    
    expect(getByText('When do you need to finish reading this book? (Past dates will be marked as overdue)')).toBeTruthy();
  });

  it('renders helper text for current progress', () => {
    const { getByText } = render(
      <TestComponent
        onPriorityChange={mockOnPriorityChange}
        onDatePickerToggle={mockOnDatePickerToggle}
        onDateChange={mockOnDateChange}
      />
    );
    
    expect(getByText('How much have you already finished?')).toBeTruthy();
  });

  it('renders helper text for deadline flexibility', () => {
    const { getByText } = render(
      <TestComponent
        onPriorityChange={mockOnPriorityChange}
        onDatePickerToggle={mockOnDatePickerToggle}
        onDateChange={mockOnDateChange}
      />
    );
    
    expect(getByText('Can this deadline be adjusted if needed?')).toBeTruthy();
  });

  it('renders all form labels', () => {
    const { getByText } = render(
      <TestComponent
        onPriorityChange={mockOnPriorityChange}
        onDatePickerToggle={mockOnDatePickerToggle}
        onDateChange={mockOnDateChange}
      />
    );
    
    expect(getByText('Deadline Date *')).toBeTruthy();
    expect(getByText('Pages Already Read')).toBeTruthy();
    expect(getByText('Deadline Flexibility')).toBeTruthy();
  });

  it('renders summary card with ready message', () => {
    const { getByText } = render(
      <TestComponent
        onPriorityChange={mockOnPriorityChange}
        onDatePickerToggle={mockOnDatePickerToggle}
        onDateChange={mockOnDateChange}
      />
    );
    
    expect(getByText('✓ Ready to Add')).toBeTruthy();
  });

  it('shows date picker when showDatePicker is true', () => {
    const { getByTestId } = render(
      <TestComponent
        showDatePicker={true}
        onPriorityChange={mockOnPriorityChange}
        onDatePickerToggle={mockOnDatePickerToggle}
        onDateChange={mockOnDateChange}
      />
    );
    
    expect(getByTestId('date-picker')).toBeTruthy();
  });

  it('does not show date picker when showDatePicker is false', () => {
    const { queryByTestId } = render(
      <TestComponent
        showDatePicker={false}
        onPriorityChange={mockOnPriorityChange}
        onDatePickerToggle={mockOnDatePickerToggle}
        onDateChange={mockOnDateChange}
      />
    );
    
    expect(queryByTestId('date-picker')).toBeNull();
  });

  it('passes correct props to PrioritySelector', () => {
    const { getByTestId } = render(
      <TestComponent
        selectedPriority="strict"
        onPriorityChange={mockOnPriorityChange}
        onDatePickerToggle={mockOnDatePickerToggle}
        onDateChange={mockOnDateChange}
      />
    );
    
    const prioritySelector = getByTestId('priority-selector');
    expect(prioritySelector).toBeTruthy();
  });

  it('renders section dividers', () => {
    const { UNSAFE_getAllByType } = render(
      <TestComponent
        onPriorityChange={mockOnPriorityChange}
        onDatePickerToggle={mockOnDatePickerToggle}
        onDateChange={mockOnDateChange}
      />
    );
    
    // Should have multiple View components for section dividers
    const views = UNSAFE_getAllByType(View);
    expect(views.length).toBeGreaterThan(0);
  });
}); 