import { useThemeColor } from '@/hooks/useThemeColor';
import React, { useEffect, useState } from 'react';
import { Control, UseFormSetValue } from 'react-hook-form';
import { StyleSheet, TextInput, View } from 'react-native';
import CustomInput from '../CustomInput';

interface ProgressInputProps {
  format: 'physical' | 'ebook' | 'audio';
  control: Control<any>;
  setValue: UseFormSetValue<any>;
  currentProgress: number;
}

const ProgressInput: React.FC<ProgressInputProps> = ({
  format,
  control,
  setValue,
  currentProgress
}) => {
  const textMutedColor = useThemeColor({}, 'textMuted');
  const cardColor = useThemeColor({}, 'card');
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({}, 'border');

  // Helper functions for audiobook time conversion
  const convertMinutesToTimeString = (totalMinutes: number): string => {
    if (format === 'audio') {
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
      if (hours > 0) {
        return `${hours}h ${minutes}m`;
      }
      return `${minutes}m`;
    }
    return totalMinutes.toString();
  };

  const convertTimeStringToMinutes = (timeString: string): number => {
    if (format === 'audio') {
      // Parse formats like "2h 30m", "2h", "30m", or plain numbers
      const hourMatch = timeString.match(/(\d+)h/);
      const minuteMatch = timeString.match(/(\d+)m/);
      
      const hours = hourMatch ? parseInt(hourMatch[1]) : 0;
      const minutes = minuteMatch ? parseInt(minuteMatch[1]) : 0;
      
      // If no h or m found, treat as plain minutes
      if (!hourMatch && !minuteMatch) {
        const plainNumber = parseInt(timeString) || 0;
        return plainNumber;
      }
      
      return hours * 60 + minutes;
    }
    return parseInt(timeString) || 0;
  };

  // State for display value in input field
  const [displayValue, setDisplayValue] = useState<string>(
    convertMinutesToTimeString(currentProgress)
  );

  // Update display value when currentProgress changes
  useEffect(() => {
    setDisplayValue(convertMinutesToTimeString(currentProgress));
  }, [currentProgress, format]);

  // Handle input change for time format
  const handleInputChange = (text: string) => {
    setDisplayValue(text);
    const minutesValue = convertTimeStringToMinutes(text);
    setValue('currentProgress', minutesValue, { shouldValidate: true });
  };

  if (format === 'audio') {
    return (
      <View style={styles.inputContainer}>
        <TextInput
          value={displayValue}
          onChangeText={handleInputChange}
          placeholder="Enter time (e.g., 2h 30m)"
          keyboardType="default"
          placeholderTextColor={textMutedColor}
          style={[
            styles.customInput,
            { 
              backgroundColor: cardColor,
              color: textColor,
              borderColor: borderColor
            }
          ]}
        />
        <View style={{ height: 18 }} />
      </View>
    );
  }

  return (
    <CustomInput
      control={control}
      name="currentProgress"
      inputType="integer"
      placeholder="Enter current progress"
      keyboardType="numeric"
    />
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    marginBottom: 16,
  },
  customInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
});

export default ProgressInput;
