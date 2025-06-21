import { render } from '@testing-library/react-native';
import React from 'react';
import { StepIndicators } from '../forms/StepIndicators';

describe('StepIndicators', () => {
  it('renders with default props', () => {
    const { getByTestId } = render(
      <StepIndicators currentStep={1} totalSteps={3} />
    );
    
    const stepsContainer = getByTestId('steps-container');
    expect(stepsContainer).toBeTruthy();
  });

  it('renders correct number of steps', () => {
    const totalSteps = 5;
    const { getAllByTestId } = render(
      <StepIndicators currentStep={1} totalSteps={totalSteps} />
    );
    
    const stepElements = getAllByTestId('step-indicator');
    expect(stepElements).toHaveLength(totalSteps);
  });

  it('applies active style to current step', () => {
    const currentStep = 2;
    const { getAllByTestId } = render(
      <StepIndicators currentStep={currentStep} totalSteps={3} />
    );
    
    const stepElements = getAllByTestId('step-indicator');
    const activeStep = stepElements[currentStep - 1]; // 0-indexed
    
    expect(activeStep.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          backgroundColor: '#4ade80',
        }),
      ])
    );
  });

  it('applies completed style to steps before current step', () => {
    const currentStep = 3;
    const { getAllByTestId } = render(
      <StepIndicators currentStep={currentStep} totalSteps={4} />
    );
    
    const stepElements = getAllByTestId('step-indicator');
    
    // Steps 1 and 2 should be completed (green)
    expect(stepElements[0].props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          backgroundColor: '#4ade80',
        }),
      ])
    );
    
    expect(stepElements[1].props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          backgroundColor: '#4ade80',
        }),
      ])
    );
  });

  it('applies default style to steps after current step', () => {
    const currentStep = 2;
    const { getAllByTestId } = render(
      <StepIndicators currentStep={currentStep} totalSteps={4} />
    );
    
    const stepElements = getAllByTestId('step-indicator');
    
    // Steps 3 and 4 should be default (gray)
    expect(stepElements[2].props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          backgroundColor: '#404040',
        }),
      ])
    );
    
    expect(stepElements[3].props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          backgroundColor: '#404040',
        }),
      ])
    );
  });

  it('handles single step correctly', () => {
    const { getAllByTestId } = render(
      <StepIndicators currentStep={1} totalSteps={1} />
    );
    
    const stepElements = getAllByTestId('step-indicator');
    expect(stepElements).toHaveLength(1);
    
    // Single step should be active
    expect(stepElements[0].props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          backgroundColor: '#4ade80',
        }),
      ])
    );
  });

  it('handles last step correctly', () => {
    const totalSteps = 3;
    const { getAllByTestId } = render(
      <StepIndicators currentStep={totalSteps} totalSteps={totalSteps} />
    );
    
    const stepElements = getAllByTestId('step-indicator');
    
    // All steps should be completed (green)
    stepElements.forEach(step => {
      expect(step.props.style).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            backgroundColor: '#4ade80',
          }),
        ])
      );
    });
  });

  it('applies correct container styles', () => {
    const { getByTestId } = render(
      <StepIndicators currentStep={1} totalSteps={3} />
    );
    
    const stepsContainer = getByTestId('steps-container');
    expect(stepsContainer.props.style).toEqual(
      expect.objectContaining({
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 8,
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#404040',
      })
    );
  });

  it('applies correct step styles', () => {
    const { getAllByTestId } = render(
      <StepIndicators currentStep={1} totalSteps={3} />
    );
    
    const stepElements = getAllByTestId('step-indicator');
    const firstStep = stepElements[0];
    
    // Check that the style array contains the expected base styles
    const stepStyles = firstStep.props.style;
    expect(stepStyles).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          width: 8,
          height: 8,
          borderRadius: 4,
        }),
      ])
    );
    
    // Check that the active step has the correct background color
    expect(stepStyles).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          backgroundColor: '#4ade80',
        }),
      ])
    );
  });

  it('handles zero total steps gracefully', () => {
    const { getByTestId, queryAllByTestId } = render(
      <StepIndicators currentStep={1} totalSteps={0} />
    );
    
    // Container should still exist
    const stepsContainer = getByTestId('steps-container');
    expect(stepsContainer).toBeTruthy();
    
    // But no step indicators should be rendered
    const stepElements = queryAllByTestId('step-indicator');
    expect(stepElements).toHaveLength(0);
  });

  it('handles current step greater than total steps', () => {
    const { getAllByTestId } = render(
      <StepIndicators currentStep={5} totalSteps={3} />
    );
    
    const stepElements = getAllByTestId('step-indicator');
    expect(stepElements).toHaveLength(3);
    
    // All steps should be completed since current step > total steps
    stepElements.forEach(step => {
      expect(step.props.style).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            backgroundColor: '#4ade80',
          }),
        ])
      );
    });
  });

  it('handles current step less than 1', () => {
    const { getAllByTestId } = render(
      <StepIndicators currentStep={0} totalSteps={3} />
    );
    
    const stepElements = getAllByTestId('step-indicator');
    expect(stepElements).toHaveLength(3);
    
    // All steps should be default since current step < 1
    stepElements.forEach(step => {
      expect(step.props.style).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            backgroundColor: '#404040',
          }),
        ])
      );
    });
  });
}); 