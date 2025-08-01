import { describe, expect, it, jest, beforeEach } from '@jest/globals';
import { render, screen } from '@testing-library/react-native';
import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import { useDeadlines } from '@/contexts/DeadlineProvider';
import EditDeadline from '../[id]/edit';

// Mock the dependencies
jest.mock('expo-router', () => ({
    useLocalSearchParams: jest.fn(),
    router: {
        back: jest.fn(),
        replace: jest.fn(),
    },
}));

jest.mock('@/contexts/DeadlineProvider', () => ({
    useDeadlines: jest.fn(),
}));

jest.mock('@/theme', () => ({
    useTheme: () => ({
        theme: {
            background: '#ffffff',
            primary: '#007AFF',
        },
    }),
}));

jest.mock('react-native-toast-message', () => ({
    show: jest.fn(),
}));

jest.mock('react-native-safe-area-context', () => ({
    SafeAreaView: ({ children }: any) => children,
}));

// Mock the form components
jest.mock('@/components/forms', () => ({
    DeadlineFormStep1: ({ control, selectedFormat }: any) => {
        const { useWatch } = require('react-hook-form');
        const { Text, View } = require('react-native');
        const totalQuantity = useWatch({ control, name: 'totalQuantity' });
        const totalMinutes = useWatch({ control, name: 'totalMinutes' });
        
        return (
            <View>
                <Text testID="mock-form-step1">DeadlineFormStep1</Text>
                <Text testID="selected-format">{selectedFormat}</Text>
                <Text testID="total-quantity">{totalQuantity}</Text>
                <Text testID="total-minutes">{totalMinutes}</Text>
            </View>
        );
    },
    DeadlineFormStep2: () => {
        const { Text } = require('react-native');
        return <Text testID="mock-form-step2">DeadlineFormStep2</Text>;
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

const mockDeadline = {
    id: 'test-deadline-id',
    book_title: 'Test Audiobook',
    author: 'Test Author',
    format: 'audio' as const,
    source: 'library',
    deadline_date: '2024-12-31T23:59:59.000Z',
    flexibility: 'flexible',
    total_quantity: 1380, // 23 hours stored in minutes
    user_id: 'test-user',
    created_at: '2024-01-01T00:00:00.000Z',
    updated_at: '2024-01-01T00:00:00.000Z',
    progress: [
        {
            id: 'progress-1',
            current_progress: 315, // 5h 15m listened
            reading_deadline_id: 'test-deadline-id',
        }
    ]
};

describe('EditDeadline - Audiobook Time Conversion Bug', () => {
    beforeEach(() => {
        (useLocalSearchParams as jest.Mock).mockReturnValue({ id: 'test-deadline-id' });
        (useDeadlines as jest.Mock).mockReturnValue({
            deadlines: [mockDeadline],
            updateDeadline: jest.fn(),
        });
    });

    it('should correctly convert 23-hour audiobook total time to hours and minutes fields', async () => {
        render(<EditDeadline />);

        // Wait for the form to be populated
        await screen.findByTestId('mock-form-step1');

        // Currently this test will FAIL because the bug exists
        // The bug: totalMinutes gets set to 1380 instead of totalQuantity=23, totalMinutes=0
        
        // What we expect (correct behavior):
        expect(screen.getByTestId('total-quantity')).toHaveTextContent('23'); // 23 hours
        expect(screen.getByTestId('total-minutes')).toHaveTextContent('0');   // 0 remaining minutes
        
        // What currently happens (bug):
        // totalQuantity = 0 (default)
        // totalMinutes = 1380 (wrong - should be converted)
    });

    it('should correctly convert current listening progress for form display', async () => {
        render(<EditDeadline />);

        await screen.findByTestId('mock-form-step1');

        // The current progress is stored as 315 minutes (5h 15m)
        // For audiobooks, this should be converted to currentMinutes in the form
        // But we need to check how the form handles current progress display
        
        // This test documents the expected behavior for current progress
        // The form should show the progress correctly converted from total minutes
    });

    it('should handle audiobook with fractional hours correctly', () => {
        const fractionalHourDeadline = {
            ...mockDeadline,
            total_quantity: 750, // 12.5 hours = 12h 30m
        };

        (useDeadlines as jest.Mock).mockReturnValue({
            deadlines: [fractionalHourDeadline],
            updateDeadline: jest.fn(),
        });

        render(<EditDeadline />);

        // Expected: totalQuantity=12, totalMinutes=30
        // Current bug: totalMinutes=750
        expect(screen.getByTestId('total-quantity')).toHaveTextContent('12');
        expect(screen.getByTestId('total-minutes')).toHaveTextContent('30');
    });

    it('should handle audiobook under 1 hour correctly', () => {
        const shortAudiobook = {
            ...mockDeadline,
            total_quantity: 45, // 45 minutes
        };

        (useDeadlines as jest.Mock).mockReturnValue({
            deadlines: [shortAudiobook],
            updateDeadline: jest.fn(),
        });

        render(<EditDeadline />);

        // Expected: totalQuantity=0, totalMinutes=45
        // Current bug: totalMinutes=45 (this case might work, but totalQuantity should be 0)
        expect(screen.getByTestId('total-quantity')).toHaveTextContent('0');
        expect(screen.getByTestId('total-minutes')).toHaveTextContent('45');
    });
});