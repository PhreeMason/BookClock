import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import { PrioritySelector } from '../forms/PrioritySelector';

// Mock the ThemedText component
// Mock the useThemeColor hook
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