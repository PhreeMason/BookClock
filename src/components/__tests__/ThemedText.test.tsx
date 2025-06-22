import { render } from '@testing-library/react-native';
import React from 'react';
import { ThemedText } from '../ThemedText';

// Mock the useThemeColor hook
jest.mock('@/hooks/useThemeColor', () => ({
  useThemeColor: jest.fn(() => '#000000'), // Default mock color
}));

// Import the mocked hook to control its behavior in tests
const mockUseThemeColor = require('@/hooks/useThemeColor').useThemeColor;

describe('ThemedText', () => {
  beforeEach(() => {
    // Reset the mock before each test
    jest.clearAllMocks();
    mockUseThemeColor.mockReturnValue('#000000');
  });

  it('renders with default props', () => {
    const { getByText } = render(<ThemedText>Hello World</ThemedText>);
    
    expect(getByText('Hello World')).toBeTruthy();
  });

  it('renders with custom text content', () => {
    const testText = 'Custom text content';
    const { getByText } = render(<ThemedText>{testText}</ThemedText>);
    
    expect(getByText(testText)).toBeTruthy();
  });

  it('applies default type styles', () => {
    const { getByText } = render(<ThemedText>Default Text</ThemedText>);
    const textElement = getByText('Default Text');
    
    expect(textElement.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          fontSize: 16,
        }),
      ])
    );
  });

  it('applies title type styles', () => {
    const { getByText } = render(<ThemedText type="title">Title Text</ThemedText>);
    const textElement = getByText('Title Text');
    
    expect(textElement.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          fontSize: 32,
          fontWeight: 'bold',
        }),
      ])
    );
  });

  it('applies defaultSemiBold type styles', () => {
    const { getByText } = render(<ThemedText type="defaultSemiBold">Semi Bold Text</ThemedText>);
    const textElement = getByText('Semi Bold Text');
    
    expect(textElement.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          fontSize: 16,
          fontWeight: '600',
        }),
      ])
    );
  });

  it('applies subtitle type styles', () => {
    const { getByText } = render(<ThemedText type="subtitle">Subtitle Text</ThemedText>);
    const textElement = getByText('Subtitle Text');
    
    expect(textElement.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          fontSize: 20,
          fontWeight: 'bold',
        }),
      ])
    );
  });

  it('applies link type styles', () => {
    const { getByText } = render(<ThemedText type="link">Link Text</ThemedText>);
    const textElement = getByText('Link Text');
    
    expect(textElement.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          fontSize: 16,
          color: '#0a7ea4',
        }),
      ])
    );
  });

  it('uses Inter font family', () => {
    const { getByText } = render(<ThemedText>Font Test</ThemedText>);
    const textElement = getByText('Font Test');
    
    expect(textElement.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          fontFamily: 'Inter',
        }),
      ])
    );
  });

  it('calls useThemeColor with correct parameters', () => {
    render(<ThemedText>Theme Test</ThemedText>);
    
    expect(mockUseThemeColor).toHaveBeenCalledWith(
      { light: undefined, dark: undefined },
      'text'
    );
  });

  it('calls useThemeColor with custom light and dark colors', () => {
    const lightColor = '#ffffff';
    const darkColor = '#000000';
    
    render(
      <ThemedText lightColor={lightColor} darkColor={darkColor}>
        Custom Colors
      </ThemedText>
    );
    
    expect(mockUseThemeColor).toHaveBeenCalledWith(
      { light: lightColor, dark: darkColor },
      'text'
    );
  });

  it('applies theme color from useThemeColor hook', () => {
    const themeColor = '#ff0000';
    mockUseThemeColor.mockReturnValue(themeColor);
    
    const { getByText } = render(<ThemedText>Themed Text</ThemedText>);
    const textElement = getByText('Themed Text');
    
    expect(textElement.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          color: themeColor,
        }),
      ])
    );
  });

  it('applies custom style prop', () => {
    const customStyle = { marginTop: 10, paddingHorizontal: 5 };
    const { getByText } = render(
      <ThemedText style={customStyle}>Styled Text</ThemedText>
    );
    const textElement = getByText('Styled Text');
    
    expect(textElement.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining(customStyle),
      ])
    );
  });

  it('forwards additional TextProps', () => {
    const { getByText } = render(
      <ThemedText numberOfLines={2} testID="themed-text">
        Long text that should be truncated
      </ThemedText>
    );
    const textElement = getByText('Long text that should be truncated');
    
    expect(textElement.props.numberOfLines).toBe(2);
    expect(textElement.props.testID).toBe('themed-text');
  });

  it('combines type styles with custom styles correctly', () => {
    const customStyle = { marginTop: 20 };
    const { getByText } = render(
      <ThemedText type="title" style={customStyle}>
        Combined Styles
      </ThemedText>
    );
    const textElement = getByText('Combined Styles');
    
    // Should have both title styles and custom styles
    expect(textElement.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          fontSize: 32,
          fontWeight: 'bold',
        }),
        expect.objectContaining(customStyle),
      ])
    );
  });

  it('handles undefined type gracefully', () => {
    const { getByText } = render(
      <ThemedText type={undefined as any}>Undefined Type</ThemedText>
    );
    const textElement = getByText('Undefined Type');
    
    // Should default to 'default' type styles
    expect(textElement.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          fontSize: 16,
        }),
      ])
    );
  });

  it('preserves accessibility props', () => {
    const { getByText } = render(
      <ThemedText 
        accessible={true}
        accessibilityLabel="Test label"
        accessibilityHint="Test hint"
      >
        Accessible Text
      </ThemedText>
    );
    const textElement = getByText('Accessible Text');
    
    expect(textElement.props.accessible).toBe(true);
    expect(textElement.props.accessibilityLabel).toBe('Test label');
    expect(textElement.props.accessibilityHint).toBe('Test hint');
  });

  it('handles empty children', () => {
    const { toJSON } = render(<ThemedText />);
    
    expect(toJSON()).toBeTruthy();
  });
}); 