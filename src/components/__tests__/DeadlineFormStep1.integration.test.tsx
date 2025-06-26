import { render, fireEvent, waitFor } from '@testing-library/react-native';
import React from 'react';
import { useForm } from 'react-hook-form';
import { View } from 'react-native';
import { zodResolver } from '@hookform/resolvers/zod';
import { DeadlineFormStep1 } from '../forms/DeadlineFormStep1';
import { DeadlineFormData, deadlineFormSchema } from '@/lib/deadlineFormSchema';

// Mock the theme hook
jest.mock('@/hooks/useThemeColor', () => ({
  useThemeColor: jest.fn(() => '#000000'),
}));

// Mock ThemedText
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

// Mock CustomInput to properly pass through testID
jest.mock('@/components/CustomInput', () => {
  const React = require('react');
  const { Controller } = require('react-hook-form');
  const { TextInput, View } = require('react-native');
  
  return jest.fn(({ control, name, placeholder, keyboardType, inputType, ...props }: any) => {
    return (
      <Controller
        control={control}
        name={name}
        render={({ field: { value, onChange, onBlur } }: any) => (
          <View>
            <TextInput
              testID={`input-${name}`}
              placeholder={placeholder}
              keyboardType={keyboardType}
              value={typeof value === 'number' ? value.toString() : (value ?? '')}
              onChangeText={(text: string) => {
                if (inputType === 'integer') {
                  if (text.trim() === '') {
                    onChange(undefined);
                    return;
                  }
                  const numValue = parseInt(text, 10);
                  if (!isNaN(numValue) && numValue.toString() === text.trim()) {
                    onChange(numValue);
                  }
                } else if (inputType === 'number') {
                  if (text.trim() === '') {
                    onChange(undefined);
                    return;
                  }
                  const numValue = parseFloat(text);
                  if (!isNaN(numValue)) {
                    onChange(numValue);
                  }
                } else {
                  onChange(text);
                }
              }}
              onBlur={onBlur}
              {...props}
            />
            <View />
          </View>
        )}
      />
    );
  });
});

// Test wrapper component that provides form context
const FormTestWrapper = ({ 
  onFormChange = jest.fn(),
  defaultValues = {}
}: {
  onFormChange?: (data: any) => void;
  defaultValues?: Partial<DeadlineFormData>;
}) => {
  const [selectedFormat, setSelectedFormat] = React.useState<'physical' | 'ebook' | 'audio'>('physical');
  const [selectedSource, setSelectedSource] = React.useState<'arc' | 'library' | 'personal'>('arc');

  const { control, watch } = useForm<DeadlineFormData>({
    resolver: zodResolver(deadlineFormSchema),
    defaultValues: {
      bookTitle: '',
      bookAuthor: '',
      format: 'physical',
      source: 'arc',
      deadline: new Date(),
      totalQuantity: 0,
      totalMinutes: 0,
      currentMinutes: 0,
      currentProgress: 0,
      flexibility: 'flexible',
      ...defaultValues
    }
  });

  const watchedValues = watch();
  
  React.useEffect(() => {
    onFormChange(watchedValues);
  }, [watchedValues, onFormChange]);

  return (
    <View>
      <DeadlineFormStep1
        control={control}
        selectedFormat={selectedFormat}
        selectedSource={selectedSource}
        onFormatChange={setSelectedFormat}
        onSourceChange={setSelectedSource}
      />
    </View>
  );
};

describe('DeadlineFormStep1 Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Form Input Functionality', () => {
    it('should render form with default values', async () => {
      const onFormChange = jest.fn();
      const { getByTestId } = render(
        <FormTestWrapper 
          onFormChange={onFormChange}
          defaultValues={{ totalQuantity: 100 }}
        />
      );
      
      await waitFor(() => {
        const totalQuantityInput = getByTestId('input-totalQuantity');
        expect(totalQuantityInput.props.value).toBe('100');
      });
    });

    it('should update form when book title is changed', async () => {
      const onFormChange = jest.fn();
      const { getByTestId } = render(
        <FormTestWrapper onFormChange={onFormChange} />
      );
      
      const bookTitleInput = getByTestId('input-bookTitle');
      fireEvent.changeText(bookTitleInput, 'Test Book Title');
      
      await waitFor(() => {
        expect(onFormChange).toHaveBeenCalledWith(
          expect.objectContaining({
            bookTitle: 'Test Book Title'
          })
        );
      });
    });

    it('should update form when total quantity is changed', async () => {
      const onFormChange = jest.fn();
      const { getByTestId } = render(
        <FormTestWrapper onFormChange={onFormChange} />
      );
      
      const totalQuantityInput = getByTestId('input-totalQuantity');
      fireEvent.changeText(totalQuantityInput, '250');
      
      await waitFor(() => {
        expect(onFormChange).toHaveBeenCalledWith(
          expect.objectContaining({
            totalQuantity: 250
          })
        );
      });
    });

    it('should update form when author is changed', async () => {
      const onFormChange = jest.fn();
      const { getByTestId } = render(
        <FormTestWrapper onFormChange={onFormChange} />
      );
      
      const authorInput = getByTestId('input-bookAuthor');
      fireEvent.changeText(authorInput, 'Test Author');
      
      await waitFor(() => {
        expect(onFormChange).toHaveBeenCalledWith(
          expect.objectContaining({
            bookAuthor: 'Test Author'
          })
        );
      });
    });

    it('should handle zero values correctly', async () => {
      const onFormChange = jest.fn();
      const { getByTestId } = render(
        <FormTestWrapper onFormChange={onFormChange} />
      );
      
      const totalQuantityInput = getByTestId('input-totalQuantity');
      fireEvent.changeText(totalQuantityInput, '0');
      
      await waitFor(() => {
        expect(onFormChange).toHaveBeenCalledWith(
          expect.objectContaining({
            totalQuantity: 0
          })
        );
      });
    });

    it('should not update form with invalid integer values', async () => {
      const onFormChange = jest.fn();
      const { getByTestId } = render(
        <FormTestWrapper 
          onFormChange={onFormChange}
          defaultValues={{ totalQuantity: 100 }}
        />
      );
      
      // Clear initial calls
      onFormChange.mockClear();
      
      const totalQuantityInput = getByTestId('input-totalQuantity');
      fireEvent.changeText(totalQuantityInput, '12.5'); // Invalid integer
      
      // Should not update with invalid value
      await waitFor(() => {
        expect(onFormChange).not.toHaveBeenCalledWith(
          expect.objectContaining({
            totalQuantity: 12.5
          })
        );
      });
    });
  });

  describe('Audio Format Specific Fields', () => {
    it('should show minutes input for audio format', async () => {
      const { getByTestId } = render(
        <FormTestWrapper />
      );
      
      // Change to audio format
      const audioFormatButton = getByTestId('format-chip-audio');
      fireEvent.press(audioFormatButton);
      
      await waitFor(() => {
        const minutesInput = getByTestId('input-totalMinutes');
        expect(minutesInput).toBeTruthy();
      });
    });

    it('should update minutes field for audio format', async () => {
      const onFormChange = jest.fn();
      const { getByTestId } = render(
        <FormTestWrapper onFormChange={onFormChange} />
      );
      
      // Change to audio format
      const audioFormatButton = getByTestId('format-chip-audio');
      fireEvent.press(audioFormatButton);
      
      await waitFor(() => {
        const minutesInput = getByTestId('input-totalMinutes');
        fireEvent.changeText(minutesInput, '30');
        
        expect(onFormChange).toHaveBeenCalledWith(
          expect.objectContaining({
            totalMinutes: 30
          })
        );
      });
    });
  });

  describe('Form Validation', () => {
    it('should handle empty string inputs correctly', async () => {
      const onFormChange = jest.fn();
      const { getByTestId } = render(
        <FormTestWrapper 
          onFormChange={onFormChange}
          defaultValues={{ totalQuantity: 100 }}
        />
      );
      
      const totalQuantityInput = getByTestId('input-totalQuantity');
      fireEvent.changeText(totalQuantityInput, '');
      
      await waitFor(() => {
        expect(onFormChange).toHaveBeenCalledWith(
          expect.objectContaining({
            totalQuantity: undefined
          })
        );
      });
    });
  });
});
