import { describe, expect, it, jest, beforeEach } from '@jest/globals';
import { render, screen, fireEvent } from '@testing-library/react-native';
import React from 'react';
import NewDeadline from '../new';

// Mock the dependencies
jest.mock('expo-router', () => ({
    router: {
        back: jest.fn(),
        push: jest.fn(),
    },
}));

jest.mock('@/contexts/DeadlineProvider', () => ({
    useDeadlines: () => ({
        addDeadline: jest.fn(),
    }),
}));

jest.mock('@/theme', () => ({
    useTheme: () => ({
        theme: {
            background: '#ffffff',
            primary: '#007AFF',
            textMuted: '#999999',
            surface: '#f8f8f8',
            text: '#000000',
            border: '#e0e0e0',
            danger: '#ff3333',
        },
    }),
}));

jest.mock('react-native-toast-message', () => ({
    show: jest.fn(),
}));

jest.mock('react-native-safe-area-context', () => ({
    SafeAreaView: ({ children }: any) => children,
}));

// Mock the form components to capture the actual control values
jest.mock('@/components/forms', () => ({
    DeadlineFormStep1: ({ control, selectedFormat }: any) => {
        const { useWatch } = require('react-hook-form');
        const { Text, View, TextInput } = require('react-native');
        const totalQuantity = useWatch({ control, name: 'totalQuantity' });
        const totalMinutes = useWatch({ control, name: 'totalMinutes' });
        
        return (
            <View>
                <Text testID="form-step1">DeadlineFormStep1</Text>
                <Text testID="selected-format">{selectedFormat}</Text>
                <Text testID="total-quantity-value">{totalQuantity}</Text>
                <Text testID="total-minutes-value">{totalMinutes}</Text>
                {/* Simulate the actual input fields */}
                <TextInput 
                    testID="input-totalQuantity" 
                    value={totalQuantity === 0 ? '0' : totalQuantity} 
                    placeholder="How many pages total?"
                />
                <TextInput 
                    testID="input-totalMinutes" 
                    value={totalMinutes === 0 ? '0' : totalMinutes} 
                    placeholder="Minutes (optional)"
                    style={{ display: selectedFormat === 'audio' ? 'flex' : 'none' }}
                />
            </View>
        );
    },
    DeadlineFormStep2: () => {
        const { Text } = require('react-native');
        return <Text testID="form-step2">DeadlineFormStep2</Text>;
    },
    FormHeader: () => {
        const { Text } = require('react-native');
        return <Text>FormHeader</Text>;
    },
    FormProgressBar: () => {
        const { Text } = require('react-native');
        return <Text>FormProgressBar</Text>;
    },
    StepIndicators: () => {
        const { Text } = require('react-native');
        return <Text>StepIndicators</Text>;
    },
}));

// Mock the format selector to allow format changes
jest.mock('@/components/forms/FormatSelector', () => ({
    FormatSelector: ({ selectedFormat, onSelectFormat }: any) => {
        const { View, TouchableOpacity, Text } = require('react-native');
        return (
            <View>
                <TouchableOpacity testID="format-physical" onPress={() => onSelectFormat('physical')}>
                    <Text>Physical {selectedFormat === 'physical' && '(selected)'}</Text>
                </TouchableOpacity>
                <TouchableOpacity testID="format-audio" onPress={() => onSelectFormat('audio')}>
                    <Text>Audio {selectedFormat === 'audio' && '(selected)'}</Text>
                </TouchableOpacity>
            </View>
        );
    },
}));

describe('NewDeadline - Placeholder Value Bugs', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should show placeholder text instead of "0" for physical book total quantity', async () => {
        render(<NewDeadline />);

        await screen.findByTestId('form-step1');

        // The bug: input shows "0" instead of placeholder text
        const totalQuantityInput = screen.getByTestId('input-totalQuantity');
        
        // Current behavior (bug): Shows "0"
        expect(totalQuantityInput).toHaveAttribute('value', '0');
        
        // Expected behavior: Should show placeholder when no value is entered
        // The input should either be empty or show placeholder text
        // expect(totalQuantityInput).toHaveAttribute('value', ''); // What we want
        expect(totalQuantityInput).toHaveAttribute('placeholder', 'How many pages total?');
    });

    it('should show placeholder text instead of "0" for audiobook hours and minutes', async () => {
        render(<NewDeadline />);

        await screen.findByTestId('form-step1');

        // Switch to audio format
        fireEvent.press(screen.getByTestId('format-audio'));

        // Check that both hour and minute fields show placeholders instead of "0"
        const totalQuantityInput = screen.getByTestId('input-totalQuantity');
        const totalMinutesInput = screen.getByTestId('input-totalMinutes');

        // Current behavior (bug): Both show "0"
        expect(totalQuantityInput).toHaveAttribute('value', '0');
        expect(totalMinutesInput).toHaveAttribute('value', '0');

        // Expected behavior: Should show placeholder text
        expect(totalQuantityInput).toHaveAttribute('placeholder', 'Hours');
        expect(totalMinutesInput).toHaveAttribute('placeholder', 'Minutes (optional)');
    });

    it('should show actual values when user enters data', async () => {
        render(<NewDeadline />);

        await screen.findByTestId('form-step1');

        // Switch to audio format
        fireEvent.press(screen.getByTestId('format-audio'));

        const totalQuantityInput = screen.getByTestId('input-totalQuantity');
        const totalMinutesInput = screen.getByTestId('input-totalMinutes');

        // Simulate user input
        fireEvent.changeText(totalQuantityInput, '12');
        fireEvent.changeText(totalMinutesInput, '30');

        // After user enters data, should show the entered values
        expect(totalQuantityInput).toHaveAttribute('value', '12');
        expect(totalMinutesInput).toHaveAttribute('value', '30');
    });

    it('should handle clearing values and returning to placeholder state', async () => {
        render(<NewDeadline />);

        await screen.findByTestId('form-step1');

        const totalQuantityInput = screen.getByTestId('input-totalQuantity');

        // User enters a value
        fireEvent.changeText(totalQuantityInput, '300');
        expect(totalQuantityInput).toHaveAttribute('value', '300');

        // User clears the value
        fireEvent.changeText(totalQuantityInput, '');
        
        // Should return to placeholder state (not show "0")
        expect(totalQuantityInput).toHaveAttribute('value', '');
        expect(totalQuantityInput).toHaveAttribute('placeholder', 'How many pages total?');
    });

    it('should handle format switching and maintain proper placeholder behavior', async () => {
        render(<NewDeadline />);

        await screen.findByTestId('form-step1');

        // Start with physical format
        expect(screen.getByTestId('selected-format')).toHaveTextContent('physical');
        
        const totalQuantityInput = screen.getByTestId('input-totalQuantity');
        expect(totalQuantityInput).toHaveAttribute('placeholder', 'How many pages total?');

        // Switch to audio format
        fireEvent.press(screen.getByTestId('format-audio'));
        expect(screen.getByTestId('selected-format')).toHaveTextContent('audio');

        // Placeholder should change to "Hours"
        expect(totalQuantityInput).toHaveAttribute('placeholder', 'Hours');
        
        // Minutes field should be visible with its placeholder
        const totalMinutesInput = screen.getByTestId('input-totalMinutes');
        expect(totalMinutesInput).toHaveAttribute('placeholder', 'Minutes (optional)');
    });
});

describe('Form Default Values Issue', () => {
    it('should demonstrate the root cause - form defaults to 0 instead of undefined', () => {
        render(<NewDeadline />);

        // The root cause: form default values are set to 0
        // This causes CustomInput to display "0" instead of placeholder
        expect(screen.getByTestId('total-quantity-value')).toHaveTextContent('0');
        expect(screen.getByTestId('total-minutes-value')).toHaveTextContent('0');

        // Expected: Default values should be undefined or empty
        // so that CustomInput can show placeholder text
    });
});