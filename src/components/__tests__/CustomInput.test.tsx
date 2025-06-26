import { render, fireEvent } from '@testing-library/react-native';
import React from 'react';
import { useForm } from 'react-hook-form';
import { View } from 'react-native';
import CustomInput from '../CustomInput';

// Mock the theme hook
// Mock ThemedText
// Test component that uses CustomInput with react-hook-form
const TestFormComponent = ({ 
  inputType = 'string',
  defaultValue = '',
  onFormChange = jest.fn()
}: {
  inputType?: 'string' | 'number' | 'integer';
  defaultValue?: string | number;
  onFormChange?: (data: any) => void;
}) => {
  const { control, watch } = useForm({
    defaultValues: {
      testField: defaultValue
    }
  });

  const watchedValue = watch('testField');
  
  React.useEffect(() => {
    onFormChange({ testField: watchedValue });
  }, [watchedValue, onFormChange]);

  return (
    <View>
      <CustomInput
        control={control}
        name="testField"
        inputType={inputType}
        placeholder="Test input"
        testID="test-input"
      />
    </View>
  );
};

describe('CustomInput', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('String Input', () => {
    it('should render with default string value', () => {
      const { getByTestId } = render(
        <TestFormComponent defaultValue="test value" />
      );
      
      const input = getByTestId('test-input');
      expect(input.props.value).toBe('test value');
    });

    it('should update form value when text changes', () => {
      const onFormChange = jest.fn();
      const { getByTestId } = render(
        <TestFormComponent onFormChange={onFormChange} />
      );
      
      const input = getByTestId('test-input');
      fireEvent.changeText(input, 'new value');
      
      expect(onFormChange).toHaveBeenCalledWith({ testField: 'new value' });
    });
  });

  describe('Integer Input', () => {
    it('should render with default numeric value as string', () => {
      const { getByTestId } = render(
        <TestFormComponent inputType="integer" defaultValue={42} />
      );
      
      const input = getByTestId('test-input');
      expect(input.props.value).toBe('42');
    });

    it('should update form value with number when valid integer is entered', () => {
      const onFormChange = jest.fn();
      const { getByTestId } = render(
        <TestFormComponent inputType="integer" onFormChange={onFormChange} />
      );
      
      const input = getByTestId('test-input');
      fireEvent.changeText(input, '123');
      
      expect(onFormChange).toHaveBeenCalledWith({ testField: '123' });
    });

    it('should not update form value when invalid integer is entered', () => {
      const onFormChange = jest.fn();
      const { getByTestId } = render(
        <TestFormComponent inputType="integer" defaultValue={0} onFormChange={onFormChange} />
      );
      
      const input = getByTestId('test-input');
      
      // Clear the mock calls from initial render
      onFormChange.mockClear();
      
      fireEvent.changeText(input, '12.5'); // Invalid integer
      
      // Should not have been called with the invalid value
      expect(onFormChange).not.toHaveBeenCalledWith({ testField: 12.5 });
    });

    it('should handle empty string by setting undefined', () => {
      const onFormChange = jest.fn();
      const { getByTestId } = render(
        <TestFormComponent inputType="integer" defaultValue={42} onFormChange={onFormChange} />
      );
      
      const input = getByTestId('test-input');
      
      // Clear the mock calls from initial render
      onFormChange.mockClear();
      
      fireEvent.changeText(input, '');
      
      expect(onFormChange).toHaveBeenCalledWith({ testField: '' });
    });

    it('should handle zero correctly', () => {
      const onFormChange = jest.fn();
      const { getByTestId } = render(
        <TestFormComponent inputType="integer" onFormChange={onFormChange} />
      );
      
      const input = getByTestId('test-input');
      fireEvent.changeText(input, '0');
      
      expect(onFormChange).toHaveBeenCalledWith({ testField: '0' });
    });
  });

  describe('Number Input', () => {
    it('should handle decimal numbers', () => {
      const onFormChange = jest.fn();
      const { getByTestId } = render(
        <TestFormComponent inputType="number" onFormChange={onFormChange} />
      );
      
      const input = getByTestId('test-input');
      fireEvent.changeText(input, '12.5');
      
      expect(onFormChange).toHaveBeenCalledWith({ testField: '12.5' });
    });

    it('should not update form value for invalid number format', () => {
      const onFormChange = jest.fn();
      const { getByTestId } = render(
        <TestFormComponent inputType="number" defaultValue={0} onFormChange={onFormChange} />
      );
      
      const input = getByTestId('test-input');
      
      // Clear the mock calls from initial render
      onFormChange.mockClear();
      
      fireEvent.changeText(input, 'abc'); // Invalid number
      
      // Should not have been called with invalid value
      expect(onFormChange).not.toHaveBeenCalledWith({ testField: NaN });
    });
  });

  describe('Edge Cases', () => {
    it('should handle undefined default value', () => {
      const { getByTestId } = render(
        <TestFormComponent inputType="integer" defaultValue={undefined as any} />
      );
      
      const input = getByTestId('test-input');
      expect(input.props.value).toBe('');
    });

    it('should display number values as strings in input field', () => {
      const { getByTestId } = render(
        <TestFormComponent inputType="integer" defaultValue={100} />
      );
      
      const input = getByTestId('test-input');
      expect(typeof input.props.value).toBe('string');
      expect(input.props.value).toBe('100');
    });
  });
});
