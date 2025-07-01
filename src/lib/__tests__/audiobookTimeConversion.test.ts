import { describe, expect, it } from '@jest/globals';
import { convertMinutesToHoursAndMinutes, convertHoursAndMinutesToTotalMinutes } from '../audiobookTimeUtils';

describe('Audiobook Time Conversion', () => {
    describe('convertMinutesToHoursAndMinutes', () => {
        it('should convert exact hours correctly', () => {
            expect(convertMinutesToHoursAndMinutes(120)).toEqual({ hours: 2, minutes: 0 });
            expect(convertMinutesToHoursAndMinutes(60)).toEqual({ hours: 1, minutes: 0 });
            expect(convertMinutesToHoursAndMinutes(1380)).toEqual({ hours: 23, minutes: 0 });
        });

        it('should convert hours with remaining minutes correctly', () => {
            expect(convertMinutesToHoursAndMinutes(90)).toEqual({ hours: 1, minutes: 30 });
            expect(convertMinutesToHoursAndMinutes(185)).toEqual({ hours: 3, minutes: 5 });
            expect(convertMinutesToHoursAndMinutes(1425)).toEqual({ hours: 23, minutes: 45 });
        });

        it('should handle zero minutes', () => {
            expect(convertMinutesToHoursAndMinutes(0)).toEqual({ hours: 0, minutes: 0 });
        });

        it('should handle minutes less than an hour', () => {
            expect(convertMinutesToHoursAndMinutes(30)).toEqual({ hours: 0, minutes: 30 });
            expect(convertMinutesToHoursAndMinutes(59)).toEqual({ hours: 0, minutes: 59 });
        });

        it('should throw error for negative minutes', () => {
            expect(() => convertMinutesToHoursAndMinutes(-1)).toThrow('Total minutes cannot be negative');
            expect(() => convertMinutesToHoursAndMinutes(-60)).toThrow('Total minutes cannot be negative');
        });
    });

    describe('convertHoursAndMinutesToTotalMinutes', () => {
        it('should convert exact hours correctly', () => {
            expect(convertHoursAndMinutesToTotalMinutes(2, 0)).toBe(120);
            expect(convertHoursAndMinutesToTotalMinutes(1, 0)).toBe(60);
            expect(convertHoursAndMinutesToTotalMinutes(23, 0)).toBe(1380);
        });

        it('should convert hours with minutes correctly', () => {
            expect(convertHoursAndMinutesToTotalMinutes(1, 30)).toBe(90);
            expect(convertHoursAndMinutesToTotalMinutes(3, 5)).toBe(185);
            expect(convertHoursAndMinutesToTotalMinutes(23, 45)).toBe(1425);
        });

        it('should handle zero hours and minutes', () => {
            expect(convertHoursAndMinutesToTotalMinutes(0, 0)).toBe(0);
            expect(convertHoursAndMinutesToTotalMinutes(0)).toBe(0); // minutes parameter is optional
        });

        it('should handle minutes only', () => {
            expect(convertHoursAndMinutesToTotalMinutes(0, 30)).toBe(30);
            expect(convertHoursAndMinutesToTotalMinutes(0, 59)).toBe(59);
        });

        it('should handle optional minutes parameter', () => {
            expect(convertHoursAndMinutesToTotalMinutes(5)).toBe(300);
            expect(convertHoursAndMinutesToTotalMinutes(0)).toBe(0);
        });

        it('should throw error for negative values', () => {
            expect(() => convertHoursAndMinutesToTotalMinutes(-1, 0)).toThrow('Hours and minutes cannot be negative');
            expect(() => convertHoursAndMinutesToTotalMinutes(0, -1)).toThrow('Hours and minutes cannot be negative');
            expect(() => convertHoursAndMinutesToTotalMinutes(-1, -1)).toThrow('Hours and minutes cannot be negative');
        });

        it('should throw error for minutes >= 60', () => {
            expect(() => convertHoursAndMinutesToTotalMinutes(1, 60)).toThrow('Minutes must be less than 60');
            expect(() => convertHoursAndMinutesToTotalMinutes(0, 75)).toThrow('Minutes must be less than 60');
        });
    });

    describe('round-trip conversion', () => {
        it('should maintain consistency in round-trip conversions', () => {
            const testCases = [0, 30, 60, 90, 120, 185, 1380, 1425];
            
            testCases.forEach(totalMinutes => {
                const { hours, minutes } = convertMinutesToHoursAndMinutes(totalMinutes);
                const convertedBack = convertHoursAndMinutesToTotalMinutes(hours, minutes);
                expect(convertedBack).toBe(totalMinutes);
            });
        });
    });
});

describe('Edit Form Audiobook Integration', () => {
    describe('form value setting for audiobooks', () => {
        it('should correctly set form values for 23-hour audiobook', () => {
            const totalQuantity = 1380; // 23 hours in minutes (database value)
            const { hours, minutes } = convertMinutesToHoursAndMinutes(totalQuantity);
            
            expect(hours).toBe(23);
            expect(minutes).toBe(0);
            
            // These would be the correct form values
            // setValue('totalQuantity', hours);    // 23
            // setValue('totalMinutes', minutes);   // 0
        });

        it('should correctly set form values for 12h 30m audiobook', () => {
            const totalQuantity = 750; // 12.5 hours in minutes
            const { hours, minutes } = convertMinutesToHoursAndMinutes(totalQuantity);
            
            expect(hours).toBe(12);
            expect(minutes).toBe(30);
        });

        it('should correctly set form values for 45-minute audiobook', () => {
            const totalQuantity = 45; // 45 minutes
            const { hours, minutes } = convertMinutesToHoursAndMinutes(totalQuantity);
            
            expect(hours).toBe(0);
            expect(minutes).toBe(45);
        });
    });

    describe('current progress conversion', () => {
        it('should correctly convert current listening progress', () => {
            // Example: listened to 5 hours 15 minutes of a 10 hour book
            const currentProgressMinutes = 315; // 5h 15m in minutes
            const { hours, minutes } = convertMinutesToHoursAndMinutes(currentProgressMinutes);
            
            expect(hours).toBe(5);
            expect(minutes).toBe(15);
        });
    });
});