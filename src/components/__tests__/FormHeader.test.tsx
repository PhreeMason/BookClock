import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import { FormHeader } from '../forms/FormHeader';

// Mock the ThemedText and ThemedView components
// Mock the useThemeColor hook
describe('FormHeader', () => {
  const mockOnBack = jest.fn();
  const mockOnSkip = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders with required props', () => {
    const { getByText } = render(
      <FormHeader
        title="Test Header"
        onBack={mockOnBack}
        showBack={true}
      />
    );
    
    expect(getByText('Test Header')).toBeTruthy();
  });

  it('renders back button when showBack is true', () => {
    const { getByText } = render(
      <FormHeader
        title="Test Header"
        onBack={mockOnBack}
        showBack={true}
      />
    );
    
    expect(getByText('←')).toBeTruthy();
  });

  it('does not render back button when showBack is false', () => {
    const { queryByText } = render(
      <FormHeader
        title="Test Header"
        onBack={mockOnBack}
        showBack={false}
      />
    );
    
    expect(queryByText('←')).toBeNull();
  });

  it('calls onBack when back button is pressed', () => {
    const { getByText } = render(
      <FormHeader
        title="Test Header"
        onBack={mockOnBack}
        showBack={true}
      />
    );
    
    const backButton = getByText('←');
    fireEvent.press(backButton);
    
    expect(mockOnBack).toHaveBeenCalledTimes(1);
  });

  it('renders skip button when showSkip and onSkip are provided', () => {
    const { getByText } = render(
      <FormHeader
        title="Test Header"
        onBack={mockOnBack}
        showBack={true}
        onSkip={mockOnSkip}
        showSkip={true}
      />
    );
    
    expect(getByText('Skip')).toBeTruthy();
  });

  it('does not render skip button when showSkip is false', () => {
    const { queryByText } = render(
      <FormHeader
        title="Test Header"
        onBack={mockOnBack}
        showBack={true}
        onSkip={mockOnSkip}
        showSkip={false}
      />
    );
    
    expect(queryByText('Skip')).toBeNull();
  });

  it('does not render skip button when onSkip is not provided', () => {
    const { queryByText } = render(
      <FormHeader
        title="Test Header"
        onBack={mockOnBack}
        showBack={true}
        showSkip={true}
      />
    );
    
    expect(queryByText('Skip')).toBeNull();
  });

  it('calls onSkip when skip button is pressed', () => {
    const { getByText } = render(
      <FormHeader
        title="Test Header"
        onBack={mockOnBack}
        showBack={true}
        onSkip={mockOnSkip}
        showSkip={true}
      />
    );
    
    const skipButton = getByText('Skip');
    fireEvent.press(skipButton);
    
    expect(mockOnSkip).toHaveBeenCalledTimes(1);
  });


  it('applies correct title styles', () => {
    const { getByText } = render(
      <FormHeader
        title="Test Header"
        onBack={mockOnBack}
        showBack={true}
      />
    );
    
    const title = getByText('Test Header');
    expect(title.props.style).toEqual(
      expect.objectContaining({
        fontSize: 18,
        fontWeight: '600',
      })
    );
  });

  it('applies correct back button text styles', () => {
    const { getByText } = render(
      <FormHeader
        title="Test Header"
        onBack={mockOnBack}
        showBack={true}
      />
    );
    
    const backButtonText = getByText('←');
    expect(backButtonText.props.style).toEqual(
      expect.objectContaining({
        fontSize: 18,
      })
    );
  });


  it('handles long title text', () => {
    const longTitle = 'This is a very long title that might wrap to multiple lines';
    const { getByText } = render(
      <FormHeader
        title={longTitle}
        onBack={mockOnBack}
        showBack={true}
      />
    );
    
    expect(getByText(longTitle)).toBeTruthy();
  });

  it('handles empty title', () => {
    const { getByText } = render(
      <FormHeader
        title=""
        onBack={mockOnBack}
        showBack={true}
      />
    );
    
    expect(getByText('')).toBeTruthy();
  });

  it('renders with only title and no buttons', () => {
    const { getByText, queryByText } = render(
      <FormHeader
        title="Test Header"
        onBack={mockOnBack}
        showBack={false}
      />
    );
    
    expect(getByText('Test Header')).toBeTruthy();
    expect(queryByText('←')).toBeNull();
    expect(queryByText('Skip')).toBeNull();
  });
}); 