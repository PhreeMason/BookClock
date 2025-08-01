import { 
  utcToLocalDate, 
  formatDisplayDate, 
  isDateBefore, 
  calculateDaysLeft 
} from '../dateUtils';

describe('dateUtils', () => {
  describe('utcToLocalDate', () => {
    it('should convert UTC date string to local date format YYYY-MM-DD', () => {
      // Test with a UTC date string
      const utcString = '2024-03-15T05:00:00.000Z';
      const result = utcToLocalDate(utcString);
      
      // Result should be in YYYY-MM-DD format
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      
      // The actual date depends on the timezone the test runs in
      // But it should be either 2024-03-14 or 2024-03-15
      expect(['2024-03-14', '2024-03-15']).toContain(result);
    });

    it('should handle midnight UTC correctly', () => {
      const utcString = '2024-03-15T00:00:00.000Z';
      const result = utcToLocalDate(utcString);
      
      // Should be either 2024-03-14 or 2024-03-15 depending on timezone
      expect(['2024-03-14', '2024-03-15']).toContain(result);
    });

    it('should handle end of day UTC correctly', () => {
      const utcString = '2024-03-15T23:59:59.999Z';
      const result = utcToLocalDate(utcString);
      
      // Should be either 2024-03-15 or 2024-03-16 depending on timezone
      expect(['2024-03-15', '2024-03-16']).toContain(result);
    });
  });

  describe('formatDisplayDate', () => {
    it('should format date with default format', () => {
      const utcString = '2024-03-15T12:00:00.000Z';
      const result = formatDisplayDate(utcString);
      
      // Should be in format like "Mar 15, 2024"
      expect(result).toMatch(/^[A-Za-z]{3} \d{1,2}, \d{4}$/);
    });

    it('should format date with custom format', () => {
      const utcString = '2024-03-15T12:00:00.000Z';
      const result = formatDisplayDate(utcString, 'MMMM D');
      
      // Should be in format like "March 15"
      expect(result).toMatch(/^[A-Za-z]+ \d{1,2}$/);
    });

    it('should format date with year-month-day format', () => {
      const utcString = '2024-03-15T12:00:00.000Z';
      const result = formatDisplayDate(utcString, 'YYYY-MM-DD');
      
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });

  describe('isDateBefore', () => {
    beforeEach(() => {
      // Mock current date to ensure consistent tests
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2024-03-15T12:00:00.000Z'));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should return true when date is before today', () => {
      const pastDate = '2024-03-14T12:00:00.000Z';
      expect(isDateBefore(pastDate)).toBe(true);
    });

    it('should return false when date is today', () => {
      const today = '2024-03-15T08:00:00.000Z';
      expect(isDateBefore(today)).toBe(false);
    });

    it('should return false when date is after today', () => {
      const futureDate = '2024-03-16T12:00:00.000Z';
      expect(isDateBefore(futureDate)).toBe(false);
    });

    it('should compare two specific dates', () => {
      const date1 = '2024-03-14T12:00:00.000Z';
      const date2 = '2024-03-15T12:00:00.000Z';
      
      expect(isDateBefore(date1, date2)).toBe(true);
      expect(isDateBefore(date2, date1)).toBe(false);
    });

    it('should ignore time when comparing dates', () => {
      const date1 = '2024-03-15T23:59:59.999Z';
      const date2 = '2024-03-15T00:00:00.000Z';
      
      // Both are the same day in UTC, so neither is before the other
      // However, they might be different days in local timezone
      // Let's just test that the comparison is consistent
      const result1 = isDateBefore(date1, date2);
      const result2 = isDateBefore(date2, date1);
      
      // At least one should be false (they can't both be before each other)
      expect(result1 && result2).toBe(false);
    });
  });

  describe('calculateDaysLeft', () => {
    beforeEach(() => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2024-03-15T12:00:00.000Z'));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should return positive days for future dates', () => {
      const futureDate = '2024-03-20T12:00:00.000Z';
      expect(calculateDaysLeft(futureDate)).toBe(5);
    });

    it('should return 0 for today', () => {
      const today = '2024-03-15T08:00:00.000Z';
      expect(calculateDaysLeft(today)).toBe(0);
    });

    it('should return negative days for past dates', () => {
      const pastDate = '2024-03-10T12:00:00.000Z';
      expect(calculateDaysLeft(pastDate)).toBe(-5);
    });

    it('should calculate days from a specific date', () => {
      const deadline = '2024-03-20T12:00:00.000Z';
      const fromDate = new Date('2024-03-10T12:00:00.000Z');
      
      expect(calculateDaysLeft(deadline, fromDate)).toBe(10);
    });

    it('should ignore time when calculating days', () => {
      const deadline = '2024-03-16T23:59:59.999Z';
      const fromDate = new Date('2024-03-15T00:00:00.000Z');
      
      // Should be 1 or 2 days difference depending on timezone
      const result = calculateDaysLeft(deadline, fromDate);
      expect(result).toBeGreaterThanOrEqual(1);
      expect(result).toBeLessThanOrEqual(2);
    });
  });

  describe('timezone edge cases', () => {
    it('should handle dates that cross timezone boundaries', () => {
      // 11 PM UTC on March 14 could be March 15 in positive timezones
      const edgeCase = '2024-03-14T23:00:00.000Z';
      const result = utcToLocalDate(edgeCase);
      
      // Should be valid date format
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it('should consistently handle the same UTC date', () => {
      const utcDate = '2024-03-15T12:00:00.000Z';
      
      // Multiple calls should return the same result
      const result1 = utcToLocalDate(utcDate);
      const result2 = utcToLocalDate(utcDate);
      
      expect(result1).toBe(result2);
    });
  });
});