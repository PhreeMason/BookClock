import dayjs from 'dayjs';
import { utcToLocalDate, formatDisplayDate, isDateBefore, calculateDaysLeft } from '../dateUtils';

describe('Timezone Edge Cases', () => {
  describe('Daylight Saving Time transitions', () => {
    it('should handle spring forward transition consistently', () => {
      // In 2024, DST starts March 10 in US (2 AM -> 3 AM)
      const beforeDST = '2024-03-09T23:00:00.000Z'; // 6 PM EST
      const afterDST = '2024-03-11T01:00:00.000Z';  // 9 PM EDT

      const date1 = utcToLocalDate(beforeDST);
      const date2 = utcToLocalDate(afterDST);

      expect(date1).toMatch(/^2024-03-0[9|10]$/);
      expect(date2).toMatch(/^2024-03-1[0|1]$/);
    });

    it('should handle fall back transition consistently', () => {
      // In 2024, DST ends November 3 in US (2 AM -> 1 AM)
      const beforeFallBack = '2024-11-02T23:00:00.000Z'; // 7 PM EDT
      const afterFallBack = '2024-11-04T01:00:00.000Z';  // 8 PM EST

      const date1 = utcToLocalDate(beforeFallBack);
      const date2 = utcToLocalDate(afterFallBack);

      expect(date1).toMatch(/^2024-11-0[2|3]$/);
      expect(date2).toMatch(/^2024-11-0[3|4]$/);
    });
  });

  describe('International Date Line scenarios', () => {
    it('should handle dates near International Date Line', () => {
      // Times that would cross the International Date Line
      const testCases = [
        '2024-03-15T11:00:00.000Z', // Noon UTC
        '2024-03-15T00:30:00.000Z', // Just after midnight UTC
        '2024-03-15T23:30:00.000Z', // Just before midnight UTC
      ];

      testCases.forEach(utcTime => {
        const localDate = utcToLocalDate(utcTime);
        
        // Should be valid date format
        expect(localDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        
        // Should be reasonable date (within 1 day of expected)
        const expectedDate = dayjs(utcTime).format('YYYY-MM-DD');
        const parsedLocal = dayjs(localDate);
        const parsedExpected = dayjs(expectedDate);
        
        const daysDiff = Math.abs(parsedLocal.diff(parsedExpected, 'day'));
        expect(daysDiff).toBeLessThanOrEqual(1);
      });
    });
  });

  describe('Midnight boundaries', () => {
    it('should consistently handle progress at exactly midnight UTC', () => {
      const midnightUTC = '2024-03-15T00:00:00.000Z';
      
      // Should be consistent across multiple calls
      const results = Array.from({ length: 10 }, () => utcToLocalDate(midnightUTC));
      const uniqueResults = new Set(results);
      
      expect(uniqueResults.size).toBe(1); // All should be the same
      
      const result = results[0];
      expect(['2024-03-14', '2024-03-15']).toContain(result);
    });

    it('should handle end-of-day boundaries', () => {
      const endOfDayUTC = '2024-03-15T23:59:59.999Z';
      
      const result = utcToLocalDate(endOfDayUTC);
      expect(['2024-03-15', '2024-03-16']).toContain(result);
    });
  });

  describe('Progress tracking edge cases', () => {
    it('should prevent the original bug: progress showing on wrong days', () => {
      // Simulate the real-world scenario that caused the bug
      const progressEntries = [
        { time: '2024-03-15T05:30:00.000Z', pages: 50 },  // Early morning UTC
        { time: '2024-03-15T22:45:00.000Z', pages: 25 },  // Late evening UTC  
        { time: '2024-03-16T02:15:00.000Z', pages: 30 },  // Very early next day UTC
      ];

      const dateGroups = progressEntries.reduce((acc, entry) => {
        const localDate = utcToLocalDate(entry.time);
        if (!acc[localDate]) acc[localDate] = [];
        acc[localDate].push(entry);
        return acc;
      }, {} as Record<string, typeof progressEntries>);

      // Should group sensibly - likely 1-2 dates depending on timezone
      const dates = Object.keys(dateGroups);
      expect(dates.length).toBeLessThanOrEqual(2);
      expect(dates.length).toBeGreaterThan(0);

      // Each date should be valid
      dates.forEach(date => {
        expect(date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        expect(dateGroups[date].length).toBeGreaterThan(0);
      });
    });

    it('should maintain chronological consistency across timezones', () => {
      // Entries in chronological order (UTC)
      const chronologicalTimes = [
        '2024-03-15T06:00:00.000Z',
        '2024-03-15T14:00:00.000Z', 
        '2024-03-15T22:00:00.000Z',
        '2024-03-16T04:00:00.000Z'
      ];

      const localDates = chronologicalTimes.map(utcToLocalDate);
      
      // Convert back to Date objects for comparison
      const dateObjects = localDates.map(date => new Date(date + 'T00:00:00'));
      
      // Should be in non-decreasing order
      for (let i = 1; i < dateObjects.length; i++) {
        expect(dateObjects[i].getTime()).toBeGreaterThanOrEqual(dateObjects[i-1].getTime());
      }
    });
  });

  describe('Calendar display consistency', () => {
    it('should ensure calendar dates match what users expect', () => {
      // Test dates that might appear in a calendar widget
      const calendarDates = [
        '2024-03-01T00:00:00.000Z', // Start of month
        '2024-03-15T12:00:00.000Z', // Mid month  
        '2024-03-31T23:59:59.999Z', // End of month
      ];

      calendarDates.forEach(utcDate => {
        const localDate = utcToLocalDate(utcDate);
        const displayDate = formatDisplayDate(utcDate, 'YYYY-MM-DD');
        
        // Both should produce the same date
        expect(localDate).toBe(displayDate);
      });
    });

    it('should handle leap year February correctly', () => {
      // 2024 is a leap year
      const leapDayUTC = '2024-02-29T12:00:00.000Z';
      
      const localDate = utcToLocalDate(leapDayUTC);
      expect(['2024-02-28', '2024-02-29', '2024-03-01']).toContain(localDate);
    });
  });

  describe('Deadline comparison edge cases', () => {
    beforeEach(() => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2024-03-15T12:00:00.000Z')); // Noon UTC
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should handle deadline at exactly same time in different timezones', () => {
      // A deadline set for "today" in user's timezone
      const todayInVariousTimezones = [
        '2024-03-15T00:00:00.000Z', // Midnight UTC
        '2024-03-15T05:00:00.000Z', // 5 AM UTC (could be midnight in EST)
        '2024-03-15T12:00:00.000Z', // Noon UTC (current time)
        '2024-03-15T18:00:00.000Z', // 6 PM UTC
      ];

      todayInVariousTimezones.forEach(deadline => {
        const isOverdue = isDateBefore(deadline);
        const daysLeft = calculateDaysLeft(deadline);
        
        // Should be consistent - either overdue or not
        expect(typeof isOverdue).toBe('boolean');
        expect(typeof daysLeft).toBe('number');
        
        // Days left should match overdue status
        if (isOverdue) {
          expect(daysLeft).toBeLessThan(0);
        } else {
          expect(daysLeft).toBeGreaterThanOrEqual(0);
        }
      });
    });

    it('should handle very close deadlines correctly', () => {
      // Deadlines very close to current time
      const closeDeadlines = [
        '2024-03-15T11:59:59.999Z', // 1 second before current
        '2024-03-15T12:00:00.000Z', // Exactly current time
        '2024-03-15T12:00:00.001Z', // 1 millisecond after current
      ];

      closeDeadlines.forEach(deadline => {
        const daysLeft = calculateDaysLeft(deadline);
        
        // Should be 0 or very close to 0
        expect(Math.abs(daysLeft)).toBeLessThanOrEqual(1);
      });
    });
  });

  describe('Database timestamp formats', () => {
    it('should handle various PostgreSQL/Supabase timestamp formats', () => {
      const dbFormats = [
        '2024-03-15T14:30:25.123456Z',      // Microsecond precision
        '2024-03-15T14:30:25.123Z',         // Millisecond precision
        '2024-03-15T14:30:25Z',             // Second precision
        '2024-03-15T14:30:25.000000+00:00', // With timezone
        '2024-03-15 14:30:25.123456+00',    // Space instead of T
      ];

      dbFormats.forEach(dbTimestamp => {
        expect(() => {
          const result = utcToLocalDate(dbTimestamp);
          expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        }).not.toThrow();
      });
    });
  });
});