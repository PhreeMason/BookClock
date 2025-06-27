import React from 'react';
import { Control, UseFormSetValue } from 'react-hook-form';
import CustomInput from '../CustomInput';
import AudiobookProgressInput from './AudiobookProgressInput';

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
  if (format === 'audio') {
    return (
      <AudiobookProgressInput
        value={currentProgress}
        onChange={(minutes) => {
          setValue('currentProgress', minutes, { shouldValidate: true });
        }}
        testID="audiobook-progress-input"
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
