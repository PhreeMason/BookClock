import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import { FormatSelector } from '../forms/FormatSelector';

// Mock the ThemedText component
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

// Mock the useThemeColor hook
jest.mock('@/hooks/useThemeColor', () => ({
  useThemeColor: jest.fn((props, colorName) => {
    // Handle custom light/dark color override
    if (props.light && props.dark) {
      return props.light; // Return light color for testing
    }
    
    // Return different colors based on the colorName
    switch (colorName) {
      case 'card':
        return '#e3f1e4';
      case 'textMuted':
        return '#5b33af';
      case 'primary':
        return '#5c2eb8';
      default:
        return '#000000';
    }
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

  it('applies selected style to selected format', () => {
    const { getByTestId } = render(
      <FormatSelector
        selectedFormat="ebook"
        onSelectFormat={mockOnSelectFormat}
      />
    );
    
    const ebookChip = getByTestId('format-chip-ebook');
    
    expect(ebookChip.props.style).toEqual(
      expect.objectContaining({
        backgroundColor: 'rgba(92, 46, 184, 0.1)',
      })
    );
  });

  it('applies unselected style to non-selected formats', () => {
    const { getByTestId } = render(
      <FormatSelector
        selectedFormat="physical"
        onSelectFormat={mockOnSelectFormat}
      />
    );
    
    const ebookChip = getByTestId('format-chip-ebook');
    
    expect(ebookChip.props.style).toEqual(
      expect.objectContaining({
        backgroundColor: '#e3f1e4',
      })
    );
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

  it('calls onSelectFormat with correct format when physical is pressed', () => {
    const { getByTestId } = render(
      <FormatSelector
        selectedFormat="ebook"
        onSelectFormat={mockOnSelectFormat}
      />
    );
    
    const physicalChip = getByTestId('format-chip-physical');
    fireEvent.press(physicalChip);
    
    expect(mockOnSelectFormat).toHaveBeenCalledWith('physical');
  });

  it('calls onSelectFormat with correct format when ebook is pressed', () => {
    const { getByTestId } = render(
      <FormatSelector
        selectedFormat="physical"
        onSelectFormat={mockOnSelectFormat}
      />
    );
    
    const ebookChip = getByTestId('format-chip-ebook');
    fireEvent.press(ebookChip);
    
    expect(mockOnSelectFormat).toHaveBeenCalledWith('ebook');
  });

  it('calls onSelectFormat with correct format when audio is pressed', () => {
    const { getByTestId } = render(
      <FormatSelector
        selectedFormat="physical"
        onSelectFormat={mockOnSelectFormat}
      />
    );
    
    const audioChip = getByTestId('format-chip-audio');
    fireEvent.press(audioChip);
    
    expect(mockOnSelectFormat).toHaveBeenCalledWith('audio');
  });

  it('applies correct container styles', () => {
    const { getByTestId } = render(
      <FormatSelector
        selectedFormat="physical"
        onSelectFormat={mockOnSelectFormat}
      />
    );
    
    const container = getByTestId('format-selector');
    expect(container.props.style).toEqual(
      expect.objectContaining({
        flexDirection: 'row',
        gap: 8,
        marginTop: 8,
      })
    );
  });

  it('applies correct chip styles', () => {
    const { getByTestId } = render(
      <FormatSelector
        selectedFormat="physical"
        onSelectFormat={mockOnSelectFormat}
      />
    );
    
    const chip = getByTestId('format-chip-ebook');
    
    expect(chip.props.style).toEqual(
      expect.objectContaining({
        backgroundColor: '#e3f1e4',
        borderRadius: 20,
        padding: 8,
        paddingHorizontal: 16,
      })
    );
  });

  it('applies correct chip text styles', () => {
    const { getByText } = render(
      <FormatSelector
        selectedFormat="physical"
        onSelectFormat={mockOnSelectFormat}
      />
    );
    
    const chipText = getByText('E-book');
    expect(chipText.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          fontSize: 14,
        }),
      ])
    );
  });

  it('handles multiple format selections correctly', () => {
    const { getByTestId, rerender } = render(
      <FormatSelector
        selectedFormat="physical"
        onSelectFormat={mockOnSelectFormat}
      />
    );
    
    // Initially physical should be selected
    const physicalChip = getByTestId('format-chip-physical');
    expect(physicalChip.props.style).toEqual(
      expect.objectContaining({
        backgroundColor: 'rgba(92, 46, 184, 0.1)',
      })
    );
    
    // Rerender with ebook selected
    rerender(
      <FormatSelector
        selectedFormat="ebook"
        onSelectFormat={mockOnSelectFormat}
      />
    );
    
    const ebookChip = getByTestId('format-chip-ebook');
    expect(ebookChip.props.style).toEqual(
      expect.objectContaining({
        backgroundColor: 'rgba(92, 46, 184, 0.1)',
      })
    );
    
    // Physical should now be unselected
    const physicalChipAfter = getByTestId('format-chip-physical');
    expect(physicalChipAfter.props.style).toEqual(
      expect.objectContaining({
        backgroundColor: '#e3f1e4',
      })
    );
  });

  it('maintains selection state after multiple interactions', () => {
    const { getByTestId, rerender } = render(
      <FormatSelector
        selectedFormat="physical"
        onSelectFormat={mockOnSelectFormat}
      />
    );
    
    // Select audio
    const audioChip = getByTestId('format-chip-audio');
    fireEvent.press(audioChip);
    
    // Rerender with new selection
    rerender(
      <FormatSelector
        selectedFormat="audio"
        onSelectFormat={mockOnSelectFormat}
      />
    );
    
    // Verify audio is now selected
    const selectedAudioChip = getByTestId('format-chip-audio');
    expect(selectedAudioChip.props.style).toEqual(
      expect.objectContaining({
        backgroundColor: 'rgba(92, 46, 184, 0.1)',
      })
    );
  });
}); 