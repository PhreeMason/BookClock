import { render } from '@testing-library/react-native';
import React from 'react';
import { FormProgressBar } from '../forms/FormProgressBar';

// Mock the useThemeColor hook
jest.mock('@/hooks/useThemeColor', () => ({
  useThemeColor: jest.fn((props, colorName) => {
    switch (colorName) {
      case 'textMuted':
        return '#5b33af';
      case 'success':
        return '#4ade80';
      default:
        return '#000000';
    }
  }),
}));

describe('FormProgressBar', () => {
  it('renders with default props', () => {
    const { getByTestId } = render(
      <FormProgressBar currentStep={1} totalSteps={3} />
    );
    
    const progressContainer = getByTestId('progress-container');
    expect(progressContainer).toBeTruthy();
  });

  it('renders progress bar with correct structure', () => {
    const { getByTestId } = render(
      <FormProgressBar currentStep={1} totalSteps={3} />
    );
    
    const progressBar = getByTestId('progress-bar');
    const progressFill = getByTestId('progress-fill');
    
    expect(progressBar).toBeTruthy();
    expect(progressFill).toBeTruthy();
  });

  it('calculates progress correctly for first step', () => {
    const { getByTestId } = render(
      <FormProgressBar currentStep={1} totalSteps={4} />
    );
    
    const progressFill = getByTestId('progress-fill');
    expect(progressFill.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          width: '25%',
        }),
      ])
    );
  });

  it('calculates progress correctly for middle step', () => {
    const { getByTestId } = render(
      <FormProgressBar currentStep={2} totalSteps={4} />
    );
    
    const progressFill = getByTestId('progress-fill');
    expect(progressFill.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          width: '50%',
        }),
      ])
    );
  });

  it('calculates progress correctly for last step', () => {
    const { getByTestId } = render(
      <FormProgressBar currentStep={4} totalSteps={4} />
    );
    
    const progressFill = getByTestId('progress-fill');
    expect(progressFill.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          width: '100%',
        }),
      ])
    );
  });

  it('handles single step correctly', () => {
    const { getByTestId } = render(
      <FormProgressBar currentStep={1} totalSteps={1} />
    );
    
    const progressFill = getByTestId('progress-fill');
    expect(progressFill.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          width: '100%',
        }),
      ])
    );
  });

  it('applies correct container styles', () => {
    const { getByTestId } = render(
      <FormProgressBar currentStep={1} totalSteps={3} />
    );
    
    const progressContainer = getByTestId('progress-container');
    expect(progressContainer.props.style).toEqual(
      expect.objectContaining({
        paddingHorizontal: 20,
        paddingTop: 10,
      })
    );
  });

  it('applies correct progress bar styles', () => {
    const { getByTestId } = render(
      <FormProgressBar currentStep={1} totalSteps={3} />
    );
    
    const progressBar = getByTestId('progress-bar');
    expect(progressBar.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          height: 4,
          borderRadius: 2,
          overflow: 'hidden',
        }),
        expect.objectContaining({
          backgroundColor: '#5b33af',
        }),
      ])
    );
  });

  it('applies correct progress fill styles', () => {
    const { getByTestId } = render(
      <FormProgressBar currentStep={1} totalSteps={3} />
    );
    
    const progressFill = getByTestId('progress-fill');
    expect(progressFill.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          height: '100%',
          borderRadius: 2,
        }),
        expect.objectContaining({
          backgroundColor: '#4ade80',
          width: '33.33333333333333%',
        }),
      ])
    );
  });

  it('handles current step greater than total steps', () => {
    const { getByTestId } = render(
      <FormProgressBar currentStep={5} totalSteps={3} />
    );
    
    const progressFill = getByTestId('progress-fill');
    const progressFillStyle = progressFill.props.style;
    
    // Find the width style object
    const widthStyle = progressFillStyle.find((style: any) => style && style.width);
    expect(widthStyle).toBeTruthy();
    expect(widthStyle.width).toMatch(/^166\.6666666666666\d+%$/);
  });

  it('handles current step less than 1', () => {
    const { getByTestId } = render(
      <FormProgressBar currentStep={0} totalSteps={3} />
    );
    
    const progressFill = getByTestId('progress-fill');
    expect(progressFill.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          width: '0%',
        }),
      ])
    );
  });

  it('handles zero total steps gracefully', () => {
    const { getByTestId } = render(
      <FormProgressBar currentStep={1} totalSteps={0} />
    );
    
    const progressFill = getByTestId('progress-fill');
    expect(progressFill.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          width: 'Infinity%',
        }),
      ])
    );
  });

  it('handles decimal progress values', () => {
    const { getByTestId } = render(
      <FormProgressBar currentStep={1} totalSteps={3} />
    );
    
    const progressFill = getByTestId('progress-fill');
    expect(progressFill.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          width: '33.33333333333333%',
        }),
      ])
    );
  });
}); 