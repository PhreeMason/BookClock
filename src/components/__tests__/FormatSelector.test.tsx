import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import { FormatSelector } from '../forms/FormatSelector';

// Mock the ThemedText component
jest.mock('@/components/ThemedText', () => ({
  ThemedText: jest.fn(({ children, style, color, ...props }) => {
    const { Text } = require('react-native');
    
    // Apply color based on the color prop
    let colorStyle = {};
    if (color === 'primary') {
      colorStyle = { color: '#5c2eb8' };
    } else if (color === 'textMuted') {
      colorStyle = { color: '#5b33af' };
    }
    
    // Flatten the style array and merge with color style
    const flattenedStyle = Array.isArray(style) ? style.flat() : [style];
    const finalStyle = [...flattenedStyle, colorStyle];
    
    return (
      <Text testID="themed-text" style={finalStyle} {...props}>
        {children}
      </Text>
    );
  }),
}));

describe('FormatSelector', () => {
  const mockOnSelectFormat = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all format options', () => {
    const { getByText } = render(
      <FormatSelector
        selectedFormat="physical"
        onSelectFormat={mockOnSelectFormat}
      />
    );
    
    expect(getByText('Physical')).toBeTruthy();
    expect(getByText('E-book')).toBeTruthy();
    expect(getByText('Audio')).toBeTruthy();
  });

  it('applies selected text style to selected format', () => {
    const { getByText } = render(
      <FormatSelector
        selectedFormat="audio"
        onSelectFormat={mockOnSelectFormat}
      />
    );
    
    const selectedText = getByText('Audio');
    expect(selectedText.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          color: '#5c2eb8',
        }),
        expect.objectContaining({
          fontWeight: '600',
        }),
      ])
    );
  });

  it('applies unselected text style to non-selected formats', () => {
    const { getByText } = render(
      <FormatSelector
        selectedFormat="physical"
        onSelectFormat={mockOnSelectFormat}
      />
    );
    
    const unselectedText = getByText('E-book');
    expect(unselectedText.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          color: '#5b33af',
        }),
      ])
    );
  });

  it('calls onSelectFormat with correct format when Physical is pressed', () => {
    const { getByText } = render(
      <FormatSelector
        selectedFormat="ebook"
        onSelectFormat={mockOnSelectFormat}
      />
    );
    
    const physicalChip = getByText('Physical');
    fireEvent.press(physicalChip);
    
    expect(mockOnSelectFormat).toHaveBeenCalledWith('physical');
  });

  it('calls onSelectFormat with correct format when E-book is pressed', () => {
    const { getByText } = render(
      <FormatSelector
        selectedFormat="physical"
        onSelectFormat={mockOnSelectFormat}
      />
    );
    
    const ebookChip = getByText('E-book');
    fireEvent.press(ebookChip);
    
    expect(mockOnSelectFormat).toHaveBeenCalledWith('ebook');
  });

  it('calls onSelectFormat with correct format when Audio is pressed', () => {
    const { getByText } = render(
      <FormatSelector
        selectedFormat="physical"
        onSelectFormat={mockOnSelectFormat}
      />
    );
    
    const audioChip = getByText('Audio');
    fireEvent.press(audioChip);
    
    expect(mockOnSelectFormat).toHaveBeenCalledWith('audio');
  });

  it('handles multiple format selections correctly', () => {
    const { getByText, rerender } = render(
      <FormatSelector
        selectedFormat="physical"
        onSelectFormat={mockOnSelectFormat}
      />
    );
    
    // Initially Physical should be selected
    const physicalText = getByText('Physical');
    expect(physicalText.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          color: '#5c2eb8',
        }),
        expect.objectContaining({
          fontWeight: '600',
        }),
      ])
    );
    
    // Rerender with ebook selected
    rerender(
      <FormatSelector
        selectedFormat="ebook"
        onSelectFormat={mockOnSelectFormat}
      />
    );
    
    const ebookText = getByText('E-book');
    expect(ebookText.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          color: '#5c2eb8',
        }),
        expect.objectContaining({
          fontWeight: '600',
        }),
      ])
    );
    
    // Physical should now be unselected
    const physicalTextAfter = getByText('Physical');
    expect(physicalTextAfter.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          color: '#5b33af',
        }),
      ])
    );
  });
}); 