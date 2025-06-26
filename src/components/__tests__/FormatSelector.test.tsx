import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import { FormatSelector } from '../forms/FormatSelector';

// Mock the ThemedText component
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
    
    // Test that component re-renders correctly when format changes
    rerender(
      <FormatSelector
        selectedFormat="ebook"
        onSelectFormat={mockOnSelectFormat}
      />
    );
    
    // Should still render all options after format change
    expect(getByText('Physical')).toBeTruthy();
    expect(getByText('E-book')).toBeTruthy();
    expect(getByText('Audio')).toBeTruthy();
  });
}); 