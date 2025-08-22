import { utcToLocalDate } from '@/lib/dateUtils';
import dayjs from 'dayjs';

// Test the critical getLocalDateString function that was causing the bug
describe('useReadingHistory date conversion', () => {
  describe('getLocalDateString function replacement', () => {
    it('should convert UTC timestamps to local dates correctly', () => {
      // Simulate the bug scenario: Progress recorded at different times in UTC
      const testCases = [
        {
          name: 'Morning EST recording',
          utc: '2024-03-15T10:00:00.000Z', // 6 AM EST or 5 AM EDT
          expectedLocal: dayjs('2024-03-15T10:00:00.000Z').format('YYYY-MM-DD')
        },
        {
          name: 'Evening EST recording', 
          utc: '2024-03-15T23:00:00.000Z', // 7 PM EST or 6 PM EDT
          expectedLocal: dayjs('2024-03-15T23:00:00.000Z').format('YYYY-MM-DD')
        },
        {
          name: 'Late night recording (next day in some zones)',
          utc: '2024-03-15T03:00:00.000Z', // 11 PM EST prev day or 10 PM EDT prev day
          expectedLocal: dayjs('2024-03-15T03:00:00.000Z').format('YYYY-MM-DD')
        }
      ];

      testCases.forEach(({ utc, expectedLocal }) => {
        const result = utcToLocalDate(utc);
        
        // The result should match what Day.js produces locally
        expect(result).toBe(expectedLocal);
        
        // Should be valid date format
        expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      });
    });

    it('should handle database-style timestamps', () => {
      // Test formats that would come from Supabase/PostgreSQL
      const dbTimestamps = [
        '2024-03-15T14:30:25.123456Z',
        '2024-03-15T00:00:00Z',
        '2024-03-15T23:59:59.999Z'
      ];

      dbTimestamps.forEach(timestamp => {
        const result = utcToLocalDate(timestamp);
        
        // Should be valid date format
        expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        
        // Should not throw
        expect(() => new Date(result)).not.toThrow();
      });
    });

    it('should be consistent across multiple calls', () => {
      const utcTimestamp = '2024-03-15T18:45:30.000Z';
      
      const results = Array.from({ length: 5 }, () => utcToLocalDate(utcTimestamp));
      
      // All results should be identical
      expect(new Set(results).size).toBe(1);
    });

    it('should match Day.js behavior exactly', () => {
      const testTimestamp = '2024-03-15T12:00:00.000Z';
      
      const ourResult = utcToLocalDate(testTimestamp);
      const dayjsResult = dayjs(testTimestamp).format('YYYY-MM-DD');
      
      expect(ourResult).toBe(dayjsResult);
    });
  });

  describe('progress tracking scenarios', () => {
    it('should group progress entries by correct local date', () => {
      // Simulate progress entries that might be grouped incorrectly with UTC dates
      const progressEntries = [
        { created_at: '2024-03-15T04:00:00.000Z', progress: 50 }, // Very early morning UTC
        { created_at: '2024-03-15T14:00:00.000Z', progress: 75 }, // Afternoon UTC
        { created_at: '2024-03-15T23:30:00.000Z', progress: 100 }, // Late evening UTC
        { created_at: '2024-03-16T02:00:00.000Z', progress: 25 }, // Next day, early UTC
      ];

      // Group by local date using our function
      const groupedByLocal = progressEntries.reduce((acc, entry) => {
        const localDate = utcToLocalDate(entry.created_at);
        if (!acc[localDate]) acc[localDate] = [];
        acc[localDate].push(entry);
        return acc;
      }, {} as Record<string, typeof progressEntries>);

      // Each date should have at least one entry
      Object.keys(groupedByLocal).forEach(date => {
        expect(groupedByLocal[date].length).toBeGreaterThan(0);
        expect(date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      });

      // Should not be more than 2 different dates (depending on timezone)
      expect(Object.keys(groupedByLocal).length).toBeLessThanOrEqual(2);
    });

    it('should handle edge case of progress at exactly midnight UTC', () => {
      const midnightUTC = '2024-03-15T00:00:00.000Z';
      const result = utcToLocalDate(midnightUTC);
      
      // Should be either 2024-03-14 or 2024-03-15 depending on timezone
      expect(['2024-03-14', '2024-03-15']).toContain(result);
    });
  });

  describe('chart display scenarios', () => {
    it('should prevent progress from showing on wrong calendar days', () => {
      // This was the main bug: progress showing on wrong days in charts
      const progressMadeAt = '2024-03-15T23:45:00.000Z'; // Late evening UTC
      
      const localDate = utcToLocalDate(progressMadeAt);
      const displayDate = dayjs(progressMadeAt).format('YYYY-MM-DD');
      
      // Our function should match Day.js behavior
      expect(localDate).toBe(displayDate);
      
      // Should be a valid date that makes sense
      expect(localDate).toMatch(/^2024-03-(15|16)$/);
    });

    it('should maintain chronological order across timezone boundaries', () => {
      const chronologicalEntries = [
        '2024-03-14T22:00:00.000Z',
        '2024-03-15T02:00:00.000Z',
        '2024-03-15T10:00:00.000Z',
        '2024-03-15T18:00:00.000Z'
      ];

      const localDates = chronologicalEntries.map(utcToLocalDate);
      
      // Dates should be in non-decreasing order (accounting for timezone shifts)
      for (let i = 1; i < localDates.length; i++) {
        const prevDate = new Date(localDates[i - 1]);
        const currDate = new Date(localDates[i]);
        
        // Current should be same day or later
        expect(currDate.getTime()).toBeGreaterThanOrEqual(prevDate.getTime());
      }
    });
  });
});