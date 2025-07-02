import React from 'react';
import { Control, Controller } from 'react-hook-form';
import CustomInput from '@/components/shared/CustomInput';
import AudiobookProgressInput from './AudiobookProgressInput';

interface ProgressInputProps {
  format: 'physical' | 'ebook' | 'audio';
  control: Control<any>;
}

const ProgressInput: React.FC<ProgressInputProps> = ({
  format,
  control
}) => {
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
    />
  );
};

export default ProgressInput;
