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
        backgroundColor: '#4ade80',
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
        backgroundColor: '#404040',
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
          color: '#1a1a1a',
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
          color: '#b0b0b0',
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
        backgroundColor: '#404040',
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
          color: '#b0b0b0',
        }),
      ])
    );
  });

  it('handles selecting the same format again', () => {
    const { getByTestId } = render(
      <FormatSelector
        selectedFormat="physical"
        onSelectFormat={mockOnSelectFormat}
      />
    );
    
    const physicalChip = getByTestId('format-chip-physical');
    fireEvent.press(physicalChip);
    
    expect(mockOnSelectFormat).toHaveBeenCalledWith('physical');
  });

  it('renders with no format selected initially', () => {
    const { getByTestId } = render(
      <FormatSelector
        selectedFormat=""
        onSelectFormat={mockOnSelectFormat}
      />
    );
    
    // All chips should be unselected
    const physicalChip = getByTestId('format-chip-physical');
    const ebookChip = getByTestId('format-chip-ebook');
    const audioChip = getByTestId('format-chip-audio');
    
    expect(physicalChip.props.style).toEqual(
      expect.objectContaining({
        backgroundColor: '#404040',
      })
    );
    
    expect(ebookChip.props.style).toEqual(
      expect.objectContaining({
        backgroundColor: '#404040',
      })
    );
    
    expect(audioChip.props.style).toEqual(
      expect.objectContaining({
        backgroundColor: '#404040',
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
    
    // Select ebook
    const ebookChip = getByTestId('format-chip-ebook');
    fireEvent.press(ebookChip);
    
    // Rerender with new selection
    rerender(
      <FormatSelector
        selectedFormat="ebook"
        onSelectFormat={mockOnSelectFormat}
      />
    );
    
    // Verify ebook is now selected
    const selectedEbookChip = getByTestId('format-chip-ebook');
    expect(selectedEbookChip.props.style).toEqual(
      expect.objectContaining({
        backgroundColor: '#4ade80',
      })
    );
  });
}); 