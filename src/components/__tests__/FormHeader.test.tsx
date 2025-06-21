import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import { FormHeader } from '../forms/FormHeader';

// Mock the ThemedText and ThemedView components
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

jest.mock('@/components/ThemedView', () => ({
  ThemedView: jest.fn(({ children, style, ...props }) => {
    const { View } = require('react-native');
    return (
      <View testID="themed-view" style={style} {...props}>
        {children}
      </View>
    );
  }),
}));

describe('FormHeader', () => {
  const mockOnBack = jest.fn();
  const mockOnSkip = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders with required props', () => {
    const { getByText, getByTestId } = render(
      <FormHeader
        title="Test Header"
        onBack={mockOnBack}
        showBack={true}
      />
    );
    
    expect(getByText('Test Header')).toBeTruthy();
    expect(getByTestId('themed-view')).toBeTruthy();
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

  it('applies correct header styles', () => {
    const { getByTestId } = render(
      <FormHeader
        title="Test Header"
        onBack={mockOnBack}
        showBack={true}
      />
    );
    
    const header = getByTestId('themed-view');
    expect(header.props.style).toEqual(
      expect.objectContaining({
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#404040',
      })
    );
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
        color: '#ffffff',
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
        color: '#ffffff',
      })
    );
  });

  it('applies correct skip button text styles', () => {
    const { getByText } = render(
      <FormHeader
        title="Test Header"
        onBack={mockOnBack}
        showBack={true}
        onSkip={mockOnSkip}
        showSkip={true}
      />
    );
    
    const skipButtonText = getByText('Skip');
    expect(skipButtonText.props.style).toEqual(
      expect.objectContaining({
        fontSize: 16,
        color: '#4ade80',
        fontWeight: '600',
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