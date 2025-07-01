import { describe, expect, it } from '@jest/globals';
import { render, screen } from '@testing-library/react-native';
import React from 'react';
import { useForm } from 'react-hook-form';
import CustomInput from '../CustomInput';

// Mock the theme
jest.mock('@/theme', () => ({
    useTheme: () => ({
        theme: {
            textMuted: '#999999',
            surface: '#f8f8f8',
            text: '#000000',
            border: '#e0e0e0',
            danger: '#ff3333',
        },
    }),
}));

// Test form schema
type TestFormData = {
    totalQuantity: number;
    totalMinutes: number;
    optionalField?: number;
};

// Test component wrapper
const TestFormWrapper = ({ defaultValues }: { defaultValues: Partial<TestFormData> }) => {
    const { control } = useForm<TestFormData>({
        defaultValues: defaultValues as TestFormData,
    });

    return (
        <>
            <CustomInput
                control={control}
                name="totalQuantity"
                inputType="integer"
                placeholder="How many pages total?"
                testID="input-totalQuantity"
            />
            <CustomInput
                control={control}
                name="totalMinutes"
                inputType="integer"
                placeholder="Minutes (optional)"
                testID="input-totalMinutes"
            />
        </>
    );
};

describe('CustomInput Placeholder Behavior', () => {
    it('should show placeholder text when value is undefined', () => {
        render(<TestFormWrapper defaultValues={{}} />);
        
        const totalQuantityInput = screen.getByTestId('input-totalQuantity');
        
        // When value is undefined, should show placeholder
        expect(totalQuantityInput.props.value).toBe('');
        expect(totalQuantityInput.props.placeholder).toBe('How many pages total?');
    });

    it('should show "0" instead of placeholder when defaultValue is 0 (CURRENT BUG)', () => {
        render(<TestFormWrapper defaultValues={{ totalQuantity: 0, totalMinutes: 0 }} />);
        
        const totalQuantityInput = screen.getByTestId('input-totalQuantity');
        const totalMinutesInput = screen.getByTestId('input-totalMinutes');
        
        // Current behavior (BUG): Shows "0" instead of placeholder
        expect(totalQuantityInput.props.value).toBe('0');
        expect(totalMinutesInput.props.value).toBe('0');
        
        // Placeholder is still there, but not visible because value="0"
        expect(totalQuantityInput.props.placeholder).toBe('How many pages total?');
        expect(totalMinutesInput.props.placeholder).toBe('Minutes (optional)');
    });

    it('should show actual values when user enters non-zero numbers', () => {
        render(<TestFormWrapper defaultValues={{ totalQuantity: 300, totalMinutes: 45 }} />);
        
        const totalQuantityInput = screen.getByTestId('input-totalQuantity');
        const totalMinutesInput = screen.getByTestId('input-totalMinutes');
        
        // Should show actual entered values
        expect(totalQuantityInput.props.value).toBe('300');
        expect(totalMinutesInput.props.value).toBe('45');
    });

    it('should demonstrate the CustomInput value conversion logic', () => {
        // This test documents how CustomInput.tsx line 50 works:
        // value={typeof value === 'number' ? value.toString() : (value ?? '')}
        
        const testCases = [
            { input: undefined, expected: '' },
            { input: null, expected: '' },
            { input: 0, expected: '0' },  // This is the problem!
            { input: 300, expected: '300' },
            { input: '', expected: '' },
        ];

        testCases.forEach(({ input, expected }) => {
            const result = typeof input === 'number' ? input.toString() : (input ?? '');
            expect(result).toBe(expected);
        });
    });
});

describe('New Deadline Form Default Values Issue', () => {
    it('should demonstrate how new.tsx default values cause the placeholder bug', () => {
        // Current new.tsx defaultValues (lines 53-64):
        const currentDefaults = {
            totalQuantity: 0,     // ❌ This causes "0" to show instead of placeholder
            totalMinutes: 0,      // ❌ This causes "0" to show instead of placeholder
            currentMinutes: 0,    // ❌ This causes "0" to show instead of placeholder
            currentProgress: 0,   // ❌ This causes "0" to show instead of placeholder
        };

        // Expected defaultValues for proper placeholder behavior:
        const expectedDefaults = {
            totalQuantity: undefined,     // ✅ This would show placeholder
            totalMinutes: undefined,      // ✅ This would show placeholder
            currentMinutes: undefined,    // ✅ This would show placeholder
            currentProgress: undefined,   // ✅ This would show placeholder
        };

        // Demonstrate current behavior
        render(<TestFormWrapper defaultValues={currentDefaults} />);
        expect(screen.getByTestId('input-totalQuantity').props.value).toBe('0');
        expect(screen.getByTestId('input-totalMinutes').props.value).toBe('0');
    });
});