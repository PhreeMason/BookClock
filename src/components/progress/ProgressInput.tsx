import CustomInput from '@/components/shared/CustomInput';
import { useTheme } from '@/theme';
import React from 'react';
import { Control, Controller } from 'react-hook-form';
import { StyleSheet } from 'react-native';
import AudiobookProgressInput from './AudiobookProgressInput';

interface ProgressInputProps {
  format: 'physical' | 'ebook' | 'audio';
  control: Control<any>;
}

const ProgressInput: React.FC<ProgressInputProps> = ({
  format,
  control
}) => {
  const { theme } = useTheme();

  if (format === 'audio') {
    return (
      <Controller
        control={control}
        name="currentProgress"
        render={({ field: { value, onChange, onBlur } }) => (
          <AudiobookProgressInput
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            testID="audiobook-progress-input"
          />
        )}
      />
    );
  }

  return (
    <CustomInput
      control={control}
      name="currentProgress"
      inputType="integer"
      placeholder="Enter current progress"
      keyboardType="numeric"
      style={[styles.input, {color: theme.primary}]}
    />
  );
};

export default ProgressInput;

const styles = StyleSheet.create({
  input: {
    backgroundColor: 'white',
    fontSize: 22,
    fontFamily: 'Nunito-Bold',
  }
});
