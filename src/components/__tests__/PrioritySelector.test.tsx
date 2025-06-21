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
        borderColor: '#4ade80',
        backgroundColor: 'rgba(74, 222, 128, 0.1)',
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
        borderColor: '#404040',
        backgroundColor: '#2d2d2d',
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
        backgroundColor: '#2d2d2d',
        borderWidth: 2,
        borderColor: '#404040',
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
      expect.objectContaining({
        fontSize: 24,
        marginBottom: 8,
      })
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
      expect.objectContaining({
        fontSize: 14,
        fontWeight: '600',
        color: '#ffffff',
      })
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
        borderColor: '#404040',
        backgroundColor: '#2d2d2d',
      })
    );
    
    expect(strictOption.props.style).toEqual(
      expect.objectContaining({
        borderColor: '#404040',
        backgroundColor: '#2d2d2d',
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
        borderColor: '#4ade80',
        backgroundColor: 'rgba(74, 222, 128, 0.1)',
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
    
    expect(getByText('🕐')).toBeTruthy(); // Flexible icon
    expect(getByText('⚡')).toBeTruthy(); // Strict icon
  });

  it('renders both labels correctly', () => {
    const { getByText } = render(
      <PrioritySelector
        selectedPriority="flexible"
        onSelectPriority={mockOnSelectPriority}
      />
    );
    
    expect(getByText('Flexible')).toBeTruthy();
    expect(getByText('Must Meet')).toBeTruthy();
  });
}); 