import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import AudiobookProgressInput from '../AudiobookProgressInput';

describe('AudiobookProgressInput Simple Tests', () => {
  const mockOnChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders with initial value', () => {
    const { getByPlaceholderText } = render(
      <AudiobookProgressInput 
        value={182} 
        onChange={mockOnChange}
      />
    );
    
    const input = getByPlaceholderText('e.g., 3h 2m or 3:02');
    expect(input.props.value).toBe('3h 2m');
  });

  it('calls onChange when user enters valid time', () => {
    const { getByPlaceholderText } = render(
      <AudiobookProgressInput 
        value={0} 
        onChange={mockOnChange}
      />
    );
    
    const input = getByPlaceholderText('e.g., 3h 2m or 3:02');
    fireEvent.changeText(input, '3h 2m');
    
    expect(mockOnChange).toHaveBeenCalledWith(182);
  });

  it('handles various time formats', () => {
    const { getByPlaceholderText } = render(
      <AudiobookProgressInput 
        value={0} 
        onChange={mockOnChange}
      />
    );
    
    const input = getByPlaceholderText('e.g., 3h 2m or 3:02');
    
    // Test colon format
    fireEvent.changeText(input, '3:02');
    expect(mockOnChange).toHaveBeenCalledWith(182);
    
    // Test minutes only
    fireEvent.changeText(input, '45m');
    expect(mockOnChange).toHaveBeenCalledWith(45);
    
    // Test plain number
    fireEvent.changeText(input, '120');
    expect(mockOnChange).toHaveBeenCalledWith(120);
  });

  it('does not call onChange for invalid input', () => {
    const { getByPlaceholderText } = render(
      <AudiobookProgressInput 
        value={60} 
        onChange={mockOnChange}
      />
    );
    
    const input = getByPlaceholderText('e.g., 3h 2m or 3:02');
    fireEvent.changeText(input, 'invalid input');
    
    // Should not have called onChange with invalid input
    expect(mockOnChange).not.toHaveBeenCalledWith(expect.any(Number));
  });

  it('formats value correctly on blur', async () => {
    const { getByPlaceholderText } = render(
      <AudiobookProgressInput 
        value={0} 
        onChange={mockOnChange}
      />
    );
    
    const input = getByPlaceholderText('e.g., 3h 2m or 3:02');
    
    fireEvent.changeText(input, '150'); // 150 minutes
    fireEvent(input, 'blur');
    
    // Should format as 2h 30m
    expect(input.props.value).toBe('2h 30m');
  });
});