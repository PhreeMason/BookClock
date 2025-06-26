import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import { SourceSelector } from '../forms/SourceSelector';

// Mock the ThemedText component
describe('SourceSelector', () => {
  const mockOnSelectSource = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all source options', () => {
    const { getByText } = render(
      <SourceSelector
        selectedSource="arc"
        onSelectSource={mockOnSelectSource}
      />
    );
    
    expect(getByText('📚 ARC')).toBeTruthy();
    expect(getByText('📖 Library')).toBeTruthy();
    expect(getByText('📗 Personal')).toBeTruthy();
  });


  it('calls onSelectSource with correct source when ARC is pressed', () => {
    const { getByText } = render(
      <SourceSelector
        selectedSource="library"
        onSelectSource={mockOnSelectSource}
      />
    );
    
    const arcChip = getByText('📚 ARC');
    fireEvent.press(arcChip);
    
    expect(mockOnSelectSource).toHaveBeenCalledWith('arc');
  });

  it('calls onSelectSource with correct source when Library is pressed', () => {
    const { getByText } = render(
      <SourceSelector
        selectedSource="arc"
        onSelectSource={mockOnSelectSource}
      />
    );
    
    const libraryChip = getByText('📖 Library');
    fireEvent.press(libraryChip);
    
    expect(mockOnSelectSource).toHaveBeenCalledWith('library');
  });

  it('calls onSelectSource with correct source when Personal is pressed', () => {
    const { getByText } = render(
      <SourceSelector
        selectedSource="arc"
        onSelectSource={mockOnSelectSource}
      />
    );
    
    const personalChip = getByText('📗 Personal');
    fireEvent.press(personalChip);
    
    expect(mockOnSelectSource).toHaveBeenCalledWith('personal');
  });

  it('handles multiple source selections correctly', () => {
    const { getByText, rerender } = render(
      <SourceSelector
        selectedSource="arc"
        onSelectSource={mockOnSelectSource}
      />
    );
    
    // Test that component re-renders correctly when source changes
    rerender(
      <SourceSelector
        selectedSource="library"
        onSelectSource={mockOnSelectSource}
      />
    );
    
    // Should still render all options after source change
    expect(getByText('📚 ARC')).toBeTruthy();
    expect(getByText('📖 Library')).toBeTruthy();
    expect(getByText('📗 Personal')).toBeTruthy();
  });
}); 