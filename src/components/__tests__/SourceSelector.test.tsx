import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import { SourceSelector } from '../forms/SourceSelector';

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

  it('applies selected text style to selected source', () => {
    const { getByText } = render(
      <SourceSelector
        selectedSource="personal"
        onSelectSource={mockOnSelectSource}
      />
    );
    
    const selectedText = getByText('📗 Personal');
    expect(selectedText.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          color: '#1a1a1a',
          fontWeight: '600',
        }),
      ])
    );
  });

  it('applies unselected text style to non-selected sources', () => {
    const { getByText } = render(
      <SourceSelector
        selectedSource="arc"
        onSelectSource={mockOnSelectSource}
      />
    );
    
    const unselectedText = getByText('📖 Library');
    expect(unselectedText.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          color: '#b0b0b0',
        }),
      ])
    );
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
    
    // Initially ARC should be selected
    const arcText = getByText('📚 ARC');
    expect(arcText.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          color: '#1a1a1a',
          fontWeight: '600',
        }),
      ])
    );
    
    // Rerender with library selected
    rerender(
      <SourceSelector
        selectedSource="library"
        onSelectSource={mockOnSelectSource}
      />
    );
    
    const libraryText = getByText('📖 Library');
    expect(libraryText.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          color: '#1a1a1a',
          fontWeight: '600',
        }),
      ])
    );
    
    // ARC should now be unselected
    const arcTextAfter = getByText('📚 ARC');
    expect(arcTextAfter.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          color: '#b0b0b0',
        }),
      ])
    );
  });
}); 