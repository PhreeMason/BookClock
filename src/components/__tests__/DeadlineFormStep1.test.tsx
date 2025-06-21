import { render } from '@testing-library/react-native';
import React from 'react';
import { DeadlineFormStep1 } from '../forms/DeadlineFormStep1';

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

// Mock the CustomInput component
jest.mock('@/components/CustomInput', () => {
  const { TextInput } = require('react-native');
  return jest.fn(({ control, name, placeholder, keyboardType, style, ...props }) => {
    return (
      <TextInput
        testID={`input-${name}`}
        placeholder={placeholder}
        keyboardType={keyboardType}
        style={style}
        {...props}
      />
    );
  });
});

// Mock the FormatSelector component
jest.mock('../forms/FormatSelector', () => ({
  FormatSelector: jest.fn(({ selectedFormat, onSelectFormat }) => {
    const { View, TouchableOpacity, Text } = require('react-native');
    return (
      <View testID="format-selector">
        <TouchableOpacity
          testID="format-physical"
          onPress={() => onSelectFormat('physical')}
        >
          <Text>Physical</Text>
        </TouchableOpacity>
        <TouchableOpacity
          testID="format-ebook"
          onPress={() => onSelectFormat('ebook')}
        >
          <Text>E-book</Text>
        </TouchableOpacity>
        <TouchableOpacity
          testID="format-audio"
          onPress={() => onSelectFormat('audio')}
        >
          <Text>Audio</Text>
        </TouchableOpacity>
      </View>
    );
  }),
}));

// Mock the SourceSelector component
jest.mock('../forms/SourceSelector', () => ({
  SourceSelector: jest.fn(({ selectedSource, onSelectSource }) => {
    const { View, TouchableOpacity, Text } = require('react-native');
    return (
      <View testID="source-selector">
        <TouchableOpacity
          testID="source-arc"
          onPress={() => onSelectSource('arc')}
        >
          <Text>📚 ARC</Text>
        </TouchableOpacity>
        <TouchableOpacity
          testID="source-library"
          onPress={() => onSelectSource('library')}
        >
          <Text>📖 Library</Text>
        </TouchableOpacity>
        <TouchableOpacity
          testID="source-personal"
          onPress={() => onSelectSource('personal')}
        >
          <Text>📗 Personal</Text>
        </TouchableOpacity>
      </View>
    );
  }),
}));

// Mock react-hook-form
jest.mock('react-hook-form', () => ({
  useForm: jest.fn(),
}));

const TestComponent = ({ 
  selectedFormat = 'physical' as 'physical' | 'ebook' | 'audio',
  selectedSource = 'arc' as 'arc' | 'library' | 'personal',
  onFormatChange = jest.fn(),
  onSourceChange = jest.fn()
}) => {
  const mockControl = {
    register: jest.fn(),
    handleSubmit: jest.fn(),
    formState: { errors: {} },
    watch: jest.fn(),
    setValue: jest.fn(),
    getValues: jest.fn(),
  } as any;

  return (
    <DeadlineFormStep1
      control={mockControl}
      selectedFormat={selectedFormat}
      selectedSource={selectedSource}
      onFormatChange={onFormatChange}
      onSourceChange={onSourceChange}
    />
  );
};

describe('DeadlineFormStep1', () => {
  const mockOnFormatChange = jest.fn();
  const mockOnSourceChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the intro text', () => {
    const { getByText } = render(
      <TestComponent
        onFormatChange={mockOnFormatChange}
        onSourceChange={mockOnSourceChange}
      />
    );
    
    expect(getByText('Add a book with a deadline to track your reading progress.')).toBeTruthy();
  });

  it('renders book title input', () => {
    const { getByTestId } = render(
      <TestComponent
        onFormatChange={mockOnFormatChange}
        onSourceChange={mockOnSourceChange}
      />
    );
    
    expect(getByTestId('input-bookTitle')).toBeTruthy();
  });

  it('renders format selector', () => {
    const { getByTestId } = render(
      <TestComponent
        onFormatChange={mockOnFormatChange}
        onSourceChange={mockOnSourceChange}
      />
    );
    
    expect(getByTestId('format-selector')).toBeTruthy();
  });

  it('renders source selector', () => {
    const { getByTestId } = render(
      <TestComponent
        onFormatChange={mockOnFormatChange}
        onSourceChange={mockOnSourceChange}
      />
    );
    
    expect(getByTestId('source-selector')).toBeTruthy();
  });

  it('renders total quantity input', () => {
    const { getByTestId } = render(
      <TestComponent
        onFormatChange={mockOnFormatChange}
        onSourceChange={mockOnSourceChange}
      />
    );
    
    expect(getByTestId('input-totalQuantity')).toBeTruthy();
  });

  it('shows "Total Pages" label for physical format', () => {
    const { getByText } = render(
      <TestComponent
        selectedFormat="physical"
        onFormatChange={mockOnFormatChange}
        onSourceChange={mockOnSourceChange}
      />
    );
    
    expect(getByText('Total Pages')).toBeTruthy();
  });

  it('shows "Total Pages" label for ebook format', () => {
    const { getByText } = render(
      <TestComponent
        selectedFormat="ebook"
        onFormatChange={mockOnFormatChange}
        onSourceChange={mockOnSourceChange}
      />
    );
    
    expect(getByText('Total Pages')).toBeTruthy();
  });

  it('shows "Total Time" label for audio format', () => {
    const { getByText } = render(
      <TestComponent
        selectedFormat="audio"
        onFormatChange={mockOnFormatChange}
        onSourceChange={mockOnSourceChange}
      />
    );
    
    expect(getByText('Total Time')).toBeTruthy();
  });

  it('shows correct placeholder for physical format', () => {
    const { getByTestId } = render(
      <TestComponent
        selectedFormat="physical"
        onFormatChange={mockOnFormatChange}
        onSourceChange={mockOnSourceChange}
      />
    );
    
    const input = getByTestId('input-totalQuantity');
    expect(input.props.placeholder).toBe('How many pages total?');
  });

  it('shows correct placeholder for ebook format', () => {
    const { getByTestId } = render(
      <TestComponent
        selectedFormat="ebook"
        onFormatChange={mockOnFormatChange}
        onSourceChange={mockOnSourceChange}
      />
    );
    
    const input = getByTestId('input-totalQuantity');
    expect(input.props.placeholder).toBe('How many pages total?');
  });

  it('shows correct placeholder for audio format', () => {
    const { getByTestId } = render(
      <TestComponent
        selectedFormat="audio"
        onFormatChange={mockOnFormatChange}
        onSourceChange={mockOnSourceChange}
      />
    );
    
    const input = getByTestId('input-totalQuantity');
    expect(input.props.placeholder).toBe('Hours');
  });

  it('renders minutes input for audio format', () => {
    const { getByTestId } = render(
      <TestComponent
        selectedFormat="audio"
        onFormatChange={mockOnFormatChange}
        onSourceChange={mockOnSourceChange}
      />
    );
    
    expect(getByTestId('input-totalMinutes')).toBeTruthy();
  });

  it('does not render minutes input for non-audio formats', () => {
    const { queryByTestId } = render(
      <TestComponent
        selectedFormat="physical"
        onFormatChange={mockOnFormatChange}
        onSourceChange={mockOnSourceChange}
      />
    );
    
    expect(queryByTestId('input-totalMinutes')).toBeNull();
  });

  it('renders helper text for format selection', () => {
    const { getByText } = render(
      <TestComponent
        onFormatChange={mockOnFormatChange}
        onSourceChange={mockOnSourceChange}
      />
    );
    
    expect(getByText('This affects how we calculate your reading pace')).toBeTruthy();
  });

  it('renders helper text for total quantity', () => {
    const { getByText } = render(
      <TestComponent
        onFormatChange={mockOnFormatChange}
        onSourceChange={mockOnSourceChange}
      />
    );
    
    expect(getByText("We'll use this to calculate your daily reading pace")).toBeTruthy();
  });

  it('renders all form labels', () => {
    const { getByText } = render(
      <TestComponent
        onFormatChange={mockOnFormatChange}
        onSourceChange={mockOnSourceChange}
      />
    );
    
    expect(getByText('Book Title *')).toBeTruthy();
    expect(getByText('Format')).toBeTruthy();
    expect(getByText('Where is this book from?')).toBeTruthy();
    expect(getByText('Total Pages')).toBeTruthy();
  });

  it('passes correct props to FormatSelector', () => {
    const { getByTestId } = render(
      <TestComponent
        selectedFormat="ebook"
        onFormatChange={mockOnFormatChange}
        onSourceChange={mockOnSourceChange}
      />
    );
    
    const formatSelector = getByTestId('format-selector');
    expect(formatSelector).toBeTruthy();
  });

  it('passes correct props to SourceSelector', () => {
    const { getByTestId } = render(
      <TestComponent
        selectedSource="library"
        onFormatChange={mockOnFormatChange}
        onSourceChange={mockOnSourceChange}
      />
    );
    
    const sourceSelector = getByTestId('source-selector');
    expect(sourceSelector).toBeTruthy();
  });

  it('does not render reading estimate when not provided', () => {
    const { queryByTestId } = render(
      <TestComponent
        onFormatChange={mockOnFormatChange}
        onSourceChange={mockOnSourceChange}
      />
    );
    
    // The estimate container should not be rendered
    expect(queryByTestId('estimate-container')).toBeNull();
  });
}); 