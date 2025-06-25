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

  it('applies semiBold type styles', () => {
    const { getByText } = render(<ThemedText type="semiBold">Semi Bold Text</ThemedText>);
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

  it('applies body type styles', () => {
    const { getByText } = render(<ThemedText type="body">Body Text</ThemedText>);
    const textElement = getByText('Body Text');
    
    expect(textElement.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          fontSize: 16,
        }),
      ])
    );
  });

  it('applies bodyMuted type styles with muted color', () => {
    const { getByText } = render(<ThemedText type="bodyMuted">Muted Body Text</ThemedText>);
    const textElement = getByText('Muted Body Text');
    
    expect(textElement.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          fontSize: 16,
        }),
      ])
    );
    
    expect(mockUseThemeColor).toHaveBeenCalledWith(
      {},
      'textMuted'
    );
  });

  it('applies caption type styles', () => {
    const { getByText } = render(<ThemedText type="caption">Caption Text</ThemedText>);
    const textElement = getByText('Caption Text');
    
    expect(textElement.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          fontSize: 14,
        }),
      ])
    );
  });

  it('applies captionMuted type styles with muted color', () => {
    const { getByText } = render(<ThemedText type="captionMuted">Muted Caption</ThemedText>);
    const textElement = getByText('Muted Caption');
    
    expect(textElement.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          fontSize: 14,
        }),
      ])
    );
    
    expect(mockUseThemeColor).toHaveBeenCalledWith(
      {},
      'textMuted'
    );
  });

  it('applies label type styles', () => {
    const { getByText } = render(<ThemedText type="label">Label Text</ThemedText>);
    const textElement = getByText('Label Text');
    
    expect(textElement.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          fontSize: 14,
          fontWeight: '500',
          textTransform: 'uppercase',
          letterSpacing: 0.5,
        }),
      ])
    );
  });

  it('applies labelMuted type styles with muted color', () => {
    const { getByText } = render(<ThemedText type="labelMuted">Muted Label</ThemedText>);
    const textElement = getByText('Muted Label');
    
    expect(textElement.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          fontSize: 12,
          textTransform: 'uppercase',
          letterSpacing: 0.5,
        }),
      ])
    );
    
    expect(mockUseThemeColor).toHaveBeenCalledWith(
      {},
      'textMuted'
    );
  });

  it('applies button type styles', () => {
    const { getByText } = render(<ThemedText type="button">Button Text</ThemedText>);
    const textElement = getByText('Button Text');
    
    expect(textElement.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          fontSize: 16,
          fontWeight: '600',
        }),
      ])
    );
  });

  it('applies small type styles', () => {
    const { getByText } = render(<ThemedText type="small">Small Text</ThemedText>);
    const textElement = getByText('Small Text');
    
    expect(textElement.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          fontSize: 12,
        }),
      ])
    );
  });

  it('applies smallMuted type styles with muted color', () => {
    const { getByText } = render(<ThemedText type="smallMuted">Small Muted Text</ThemedText>);
    const textElement = getByText('Small Muted Text');
    
    expect(textElement.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          fontSize: 12,
        }),
      ])
    );
    
    expect(mockUseThemeColor).toHaveBeenCalledWith(
      {},
      'textMuted'
    );
  });

  it('applies link type styles', () => {
    const { getByText } = render(<ThemedText type="link">Link Text</ThemedText>);
    const textElement = getByText('Link Text');
    
    expect(textElement.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          fontSize: 16,
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

  it('calls useThemeColor with custom color', () => {
    render(<ThemedText color="textMuted">Color Test</ThemedText>);
    
    expect(mockUseThemeColor).toHaveBeenCalledWith(
      {},
      'textMuted'
    );
  });

  it('calls useThemeColor with correct parameters', () => {
    render(<ThemedText>Theme Test</ThemedText>);
    
    expect(mockUseThemeColor).toHaveBeenCalledWith(
      {},
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

  it('handles invalid type gracefully', () => {
    const { getByText } = render(
      <ThemedText type={'invalidType' as any}>Invalid Type</ThemedText>
    );
    const textElement = getByText('Invalid Type');
    
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