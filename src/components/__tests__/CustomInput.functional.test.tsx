import { zodResolver } from '@hookform/resolvers/zod';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import React from 'react';
import { useForm } from 'react-hook-form';
import { Text, View } from 'react-native';
import { z } from 'zod';
import CustomInput from '../CustomInput';

// Mock the theme hook
jest.mock('@/hooks/useThemeColor', () => ({
  useThemeColor: jest.fn(() => '#000000'),
}));

// Test schema similar to the actual deadline form
const testSchema = z.object({
  stringField: z.string().min(1, 'String field is required'),
  numberField: z.coerce.number().positive('Must be positive'),
  integerField: z.coerce.number().int().positive('Must be positive integer'),
  optionalField: z.string().optional(),
});

type TestFormData = z.infer<typeof testSchema>;

// Test component that uses CustomInput with real form
const TestFormComponent = ({ 
  onFormChange = jest.fn(),
  onFormSubmit = jest.fn(),
  defaultValues = {}
}: {
  onFormChange?: (data: any) => void;
  onFormSubmit?: (data: any) => void;
  defaultValues?: Partial<TestFormData>;
}) => {
  const { control, handleSubmit, watch, formState: { errors, isValid } } = useForm<TestFormData>({
    resolver: zodResolver(testSchema),
    defaultValues: {
      stringField: '',
      numberField: 0,
      integerField: 0,
      optionalField: '',
      ...defaultValues
    }
  });

  const watchedValues = watch();
  
  React.useEffect(() => {
    onFormChange({ values: watchedValues, errors, isValid });
  }, [watchedValues, errors, isValid, onFormChange]);

  return (
    <View>
      <CustomInput
        control={control}
        name="stringField"
        placeholder="Enter string"
        testID="string-input"
      />
      
      <CustomInput
        control={control}
        name="numberField"
        inputType="number"
        placeholder="Enter number"
        keyboardType="numeric"
        testID="number-input"
      />
      
      <CustomInput
        control={control}
        name="integerField"
        inputType="integer"
        placeholder="Enter integer"
        keyboardType="numeric"
        testID="integer-input"
      />
      
      <CustomInput
        control={control}
        name="optionalField"
        placeholder="Optional field"
        testID="optional-input"
      />

      {/* Display errors for testing */}
      {errors.stringField && <Text testID="string-error">{errors.stringField.message}</Text>}
      {errors.numberField && <Text testID="number-error">{errors.numberField.message}</Text>}
      {errors.integerField && <Text testID="integer-error">{errors.integerField.message}</Text>}
      
      {/* Submit button for testing */}
      <Text 
        testID="submit-button" 
        onPress={() => handleSubmit(onFormSubmit)()}
        style={{ opacity: isValid ? 1 : 0.5 }}
      >
        Submit
      </Text>
      
      {/* Form state display for testing */}
      <Text testID="form-valid">{isValid ? 'valid' : 'invalid'}</Text>
    </View>
  );
};

describe('CustomInput Functional Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Input Functionality', () => {
    it('should handle string input correctly', async () => {
      const onFormChange = jest.fn();
      const { getByTestId } = render(
        <TestFormComponent onFormChange={onFormChange} />
      );

      const stringInput = getByTestId('string-input');
      
      fireEvent.changeText(stringInput, 'Hello World');
      
      await waitFor(() => {
        expect(stringInput.props.value).toBe('Hello World');
        expect(onFormChange).toHaveBeenCalledWith(
          expect.objectContaining({
            values: expect.objectContaining({
              stringField: 'Hello World'
            })
          })
        );
      });
    });

    it('should handle number input correctly', async () => {
      const onFormChange = jest.fn();
      const { getByTestId } = render(
        <TestFormComponent onFormChange={onFormChange} />
      );

      const numberInput = getByTestId('number-input');
      
      fireEvent.changeText(numberInput, '123.45');
      
      await waitFor(() => {
        expect(numberInput.props.value).toBe('123.45');
        expect(onFormChange).toHaveBeenCalledWith(
          expect.objectContaining({
            values: expect.objectContaining({
              numberField: 123.45
            })
          })
        );
      });
    });

    it('should handle integer input correctly', async () => {
      const onFormChange = jest.fn();
      const { getByTestId } = render(
        <TestFormComponent onFormChange={onFormChange} />
      );

      const integerInput = getByTestId('integer-input');
      
      fireEvent.changeText(integerInput, '42');
      
      await waitFor(() => {
        expect(integerInput.props.value).toBe('42');
        expect(onFormChange).toHaveBeenCalledWith(
          expect.objectContaining({
            values: expect.objectContaining({
              integerField: 42
            })
          })
        );
      });
    });
  });

  describe('Default Values', () => {
    it('should display default values correctly', async () => {
      const { getByTestId } = render(
        <TestFormComponent 
          defaultValues={{
            stringField: 'Default String',
            numberField: 99.9,
            integerField: 100
          }}
        />
      );

      await waitFor(() => {
        expect(getByTestId('string-input').props.value).toBe('Default String');
        expect(getByTestId('number-input').props.value).toBe('99.9');
        expect(getByTestId('integer-input').props.value).toBe('100');
      });
    });

    it('should handle zero default values', async () => {
      const { getByTestId } = render(
        <TestFormComponent 
          defaultValues={{
            numberField: 0,
            integerField: 0
          }}
        />
      );

      await waitFor(() => {
        expect(getByTestId('number-input').props.value).toBe('0');
        expect(getByTestId('integer-input').props.value).toBe('0');
      });
    });
  });

  describe('Form Validation Integration', () => {
    it('should show validation errors from Zod schema', async () => {
      const onFormChange = jest.fn();
      const { getByTestId, queryByTestId } = render(
        <TestFormComponent onFormChange={onFormChange} />
      );

      // Try to submit empty form
      const submitButton = getByTestId('submit-button');
      fireEvent.press(submitButton);

      await waitFor(() => {
        // Should show validation errors
        expect(queryByTestId('string-error')).toBeTruthy();
        expect(getByTestId('form-valid').children[0]).toBe('invalid');
      });
    });

    it('should validate positive numbers', async () => {
      const onFormChange = jest.fn();
      const { getByTestId, queryByTestId } = render(
        <TestFormComponent onFormChange={onFormChange} />
      );

      // Enter negative number
      const numberInput = getByTestId('number-input');
      fireEvent.changeText(numberInput, '-5');

      // Fill required string field
      const stringInput = getByTestId('string-input');
      fireEvent.changeText(stringInput, 'Valid String');

      const submitButton = getByTestId('submit-button');
      fireEvent.press(submitButton);

      await waitFor(() => {
        expect(queryByTestId('number-error')).toBeTruthy();
        expect(getByTestId('form-valid').children[0]).toBe('invalid');
      });
    });

    it('should pass validation with valid data', async () => {
      const onFormSubmit = jest.fn();
      const { getByTestId } = render(
        <TestFormComponent onFormSubmit={onFormSubmit} />
      );

      // Fill all required fields with valid data
      fireEvent.changeText(getByTestId('string-input'), 'Valid String');
      fireEvent.changeText(getByTestId('number-input'), '123.45');
      fireEvent.changeText(getByTestId('integer-input'), '42');

      await waitFor(() => {
        expect(getByTestId('form-valid').children[0]).toBe('valid');
      });

      // Submit form
      const submitButton = getByTestId('submit-button');
      fireEvent.press(submitButton);

      await waitFor(() => {
        expect(onFormSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            stringField: 'Valid String',
            numberField: 123.45,
            integerField: 42,
            optionalField: ''
          }),
          undefined
        );
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty string inputs', async () => {
      const onFormChange = jest.fn();
      const { getByTestId } = render(
        <TestFormComponent 
          onFormChange={onFormChange}
          defaultValues={{ integerField: 42 }}
        />
      );

      const integerInput = getByTestId('integer-input');
      
      // Clear the input
      fireEvent.changeText(integerInput, '');
      
      await waitFor(() => {
        // The form value should be undefined when cleared
        expect(onFormChange).toHaveBeenCalledWith(
          expect.objectContaining({
            values: expect.objectContaining({
              integerField: undefined
            })
          })
        );
      });
    });

    it('should handle invalid number formats gracefully', async () => {
      const onFormChange = jest.fn();
      const { getByTestId } = render(
        <TestFormComponent onFormChange={onFormChange} />
      );

      const numberInput = getByTestId('number-input');
      
      // Enter invalid number format
      fireEvent.changeText(numberInput, 'abc123');
      
      // Should not crash and should not update form with NaN
      await waitFor(() => {
        expect(onFormChange).toHaveBeenCalled();
        const lastCall = onFormChange.mock.calls[onFormChange.mock.calls.length - 1][0];
        expect(isNaN(lastCall.values.numberField)).toBe(false);
      });
    });

    it('should preserve input focus and cursor behavior', async () => {
      const { getByTestId } = render(<TestFormComponent />);

      const stringInput = getByTestId('string-input');
      
      // Simulate typing behavior
      fireEvent.changeText(stringInput, 'H');
      fireEvent.changeText(stringInput, 'He');
      fireEvent.changeText(stringInput, 'Hel');
      fireEvent.changeText(stringInput, 'Hell');
      fireEvent.changeText(stringInput, 'Hello');
      
      await waitFor(() => {
        expect(stringInput.props.value).toBe('Hello');
      });
    });
  });
});
