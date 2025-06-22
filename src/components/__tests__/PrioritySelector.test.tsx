import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import { PrioritySelector } from '../forms/PrioritySelector';

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

describe('PrioritySelector', () => {
  const mockOnSelectPriority = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all priority options', () => {
    const { getByText } = render(
      <PrioritySelector
        selectedPriority="flexible"
        onSelectPriority={mockOnSelectPriority}
      />
    );
    
    expect(getByText('Flexible')).toBeTruthy();
    expect(getByText('Must Meet')).toBeTruthy();
    expect(getByText('🕐')).toBeTruthy();
    expect(getByText('⚡')).toBeTruthy();
  });

  it('applies selected style to selected priority', () => {
    const { getByTestId } = render(
      <PrioritySelector
        selectedPriority="strict"
        onSelectPriority={mockOnSelectPriority}
      />
    );
    
    const strictOption = getByTestId('priority-option-strict');
    
    expect(strictOption.props.style).toEqual(
      expect.objectContaining({
        borderColor: '#5c2eb8',
        backgroundColor: 'rgba(92, 46, 184, 0.1)',
      })
    );
  });

  it('applies unselected style to non-selected priorities', () => {
    const { getByTestId } = render(
      <PrioritySelector
        selectedPriority="flexible"
        onSelectPriority={mockOnSelectPriority}
      />
    );
    
    const strictOption = getByTestId('priority-option-strict');
    
    expect(strictOption.props.style).toEqual(
      expect.objectContaining({
        borderColor: '#5b33af',
        backgroundColor: '#e3f1e4',
      })
    );
  });

  it('calls onSelectPriority with correct priority when flexible is pressed', () => {
    const { getByTestId } = render(
      <PrioritySelector
        selectedPriority="strict"
        onSelectPriority={mockOnSelectPriority}
      />
    );
    
    const flexibleOption = getByTestId('priority-option-flexible');
    fireEvent.press(flexibleOption);
    
    expect(mockOnSelectPriority).toHaveBeenCalledWith('flexible');
  });

  it('calls onSelectPriority with correct priority when strict is pressed', () => {
    const { getByTestId } = render(
      <PrioritySelector
        selectedPriority="flexible"
        onSelectPriority={mockOnSelectPriority}
      />
    );
    
    const strictOption = getByTestId('priority-option-strict');
    fireEvent.press(strictOption);
    
    expect(mockOnSelectPriority).toHaveBeenCalledWith('strict');
  });

  it('applies correct container styles', () => {
    const { getByTestId } = render(
      <PrioritySelector
        selectedPriority="flexible"
        onSelectPriority={mockOnSelectPriority}
      />
    );
    
    const container = getByTestId('priority-options');
    expect(container.props.style).toEqual(
      expect.objectContaining({
        flexDirection: 'row',
        gap: 12,
        marginTop: 8,
      })
    );
  });

  it('applies correct option styles', () => {
    const { getByTestId } = render(
      <PrioritySelector
        selectedPriority="flexible"
        onSelectPriority={mockOnSelectPriority}
      />
    );
    
    const option = getByTestId('priority-option-strict');
    
    expect(option.props.style).toEqual(
      expect.objectContaining({
        flex: 1,
        backgroundColor: '#e3f1e4',
        borderWidth: 2,
        borderColor: '#5b33af',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
      })
    );
  });

  it('applies correct icon styles', () => {
    const { getByText } = render(
      <PrioritySelector
        selectedPriority="flexible"
        onSelectPriority={mockOnSelectPriority}
      />
    );
    
    const icon = getByText('⚡');
    expect(icon.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          fontSize: 24,
          marginBottom: 8,
        }),
      ])
    );
  });

  it('applies correct label styles', () => {
    const { getByText } = render(
      <PrioritySelector
        selectedPriority="flexible"
        onSelectPriority={mockOnSelectPriority}
      />
    );
    
    const label = getByText('Must Meet');
    expect(label.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          fontWeight: '600',
        }),
      ])
    );
  });

  it('handles selecting the same priority again', () => {
    const { getByTestId } = render(
      <PrioritySelector
        selectedPriority="flexible"
        onSelectPriority={mockOnSelectPriority}
      />
    );
    
    const flexibleOption = getByTestId('priority-option-flexible');
    fireEvent.press(flexibleOption);
    
    expect(mockOnSelectPriority).toHaveBeenCalledWith('flexible');
  });

  it('renders with no priority selected initially', () => {
    const { getByTestId } = render(
      <PrioritySelector
        selectedPriority=""
        onSelectPriority={mockOnSelectPriority}
      />
    );
    
    // All options should be unselected
    const flexibleOption = getByTestId('priority-option-flexible');
    const strictOption = getByTestId('priority-option-strict');
    
    expect(flexibleOption.props.style).toEqual(
      expect.objectContaining({
        borderColor: '#5b33af',
        backgroundColor: '#e3f1e4',
      })
    );
    
    expect(strictOption.props.style).toEqual(
      expect.objectContaining({
        borderColor: '#5b33af',
        backgroundColor: '#e3f1e4',
      })
    );
  });

  it('maintains selection state after multiple interactions', () => {
    const { getByTestId, rerender } = render(
      <PrioritySelector
        selectedPriority="flexible"
        onSelectPriority={mockOnSelectPriority}
      />
    );
    
    // Select strict
    const strictOption = getByTestId('priority-option-strict');
    fireEvent.press(strictOption);
    
    // Rerender with new selection
    rerender(
      <PrioritySelector
        selectedPriority="strict"
        onSelectPriority={mockOnSelectPriority}
      />
    );
    
    // Verify strict is now selected
    const selectedStrictOption = getByTestId('priority-option-strict');
    expect(selectedStrictOption.props.style).toEqual(
      expect.objectContaining({
        borderColor: '#5c2eb8',
        backgroundColor: 'rgba(92, 46, 184, 0.1)',
      })
    );
  });

  it('renders both icons correctly', () => {
    const { getByText } = render(
      <PrioritySelector
        selectedPriority="flexible"
        onSelectPriority={mockOnSelectPriority}
      />
    );
    
    expect(getByText('🕐')).toBeTruthy();
    expect(getByText('⚡')).toBeTruthy();
  });

  it('applies opacity to unselected icons', () => {
    const { getByText } = render(
      <PrioritySelector
        selectedPriority="flexible"
        onSelectPriority={mockOnSelectPriority}
      />
    );
    
    const strictIcon = getByText('⚡');
    expect(strictIcon.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          opacity: 0.5,
        }),
      ])
    );
  });

  it('applies opacity to unselected labels', () => {
    const { getByText } = render(
      <PrioritySelector
        selectedPriority="flexible"
        onSelectPriority={mockOnSelectPriority}
      />
    );
    
    const strictLabel = getByText('Must Meet');
    expect(strictLabel.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          opacity: 0.7,
        }),
      ])
    );
  });
}); 