import { render } from '@testing-library/react-native';
import React from 'react';
import { ThemedView } from '../ThemedView';

// Mock the useThemeColor hook
jest.mock('@/hooks/useThemeColor', () => ({
  useThemeColor: jest.fn((props, backgroundColor) => {
    switch (backgroundColor) {
      case 'background':
        return '#ffffff';
      case 'card':
        return '#f5f5f5';
      case 'border':
        return '#e0e0e0';
      case 'primary':
        return '#007AFF';
      default:
        return '#000000';
    }
  }),
}));

describe('ThemedView', () => {
  it('renders with default background color', () => {
    const { getByTestId } = render(
      <ThemedView testID="themed-view">
        <></>
      </ThemedView>
    );

    const view = getByTestId('themed-view');
    expect(view.props.style).toEqual([
      { backgroundColor: '#ffffff' },
      undefined,
    ]);
  });

  it('renders with custom background color', () => {
    const { getByTestId } = render(
      <ThemedView testID="themed-view" backgroundColor="card">
        <></>
      </ThemedView>
    );

    const view = getByTestId('themed-view');
    expect(view.props.style).toEqual([
      { backgroundColor: '#f5f5f5' },
      undefined,
    ]);
  });

  it('renders with border color', () => {
    const { getByTestId } = render(
      <ThemedView testID="themed-view" backgroundColor="card" borderColor="border">
        <></>
      </ThemedView>
    );

    const view = getByTestId('themed-view');
    expect(view.props.style).toEqual([
      { backgroundColor: '#f5f5f5' },
      { borderColor: '#e0e0e0' },
      undefined,
    ]);
  });

  it('renders with only border color', () => {
    const { getByTestId } = render(
      <ThemedView testID="themed-view" borderColor="border">
        <></>
      </ThemedView>
    );

    const view = getByTestId('themed-view');
    expect(view.props.style).toEqual([
      { backgroundColor: '#ffffff' },
      { borderColor: '#e0e0e0' },
      undefined,
    ]);
  });

  it('renders with custom styles', () => {
    const customStyle = { padding: 20, borderRadius: 8 };
    const { getByTestId } = render(
      <ThemedView testID="themed-view" backgroundColor="primary" style={customStyle}>
        <></>
      </ThemedView>
    );

    const view = getByTestId('themed-view');
    expect(view.props.style).toEqual([
      { backgroundColor: '#007AFF' },
      undefined,
      customStyle,
    ]);
  });

  it('passes through other props', () => {
    const { getByTestId } = render(
      <ThemedView 
        testID="themed-view" 
        backgroundColor="card"
        accessible={true}
        accessibilityLabel="Test view"
      >
        <></>
      </ThemedView>
    );

    const view = getByTestId('themed-view');
    expect(view.props.accessible).toBe(true);
    expect(view.props.accessibilityLabel).toBe('Test view');
  });
});
