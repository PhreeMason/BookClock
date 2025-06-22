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
          color: '#5c2eb8',
        }),
        expect.objectContaining({
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
          color: '#5b33af',
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
          color: '#5c2eb8',
        }),
        expect.objectContaining({
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
          color: '#5c2eb8',
        }),
        expect.objectContaining({
          fontWeight: '600',
        }),
      ])
    );
    
    // ARC should now be unselected
    const arcTextAfter = getByText('📚 ARC');
    expect(arcTextAfter.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          color: '#5b33af',
        }),
      ])
    );
  });
}); 