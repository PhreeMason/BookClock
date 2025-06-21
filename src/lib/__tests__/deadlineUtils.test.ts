import { ReadingDeadlineWithProgress } from '@/types/deadline';
import {
    calculateDaysLeft,
    calculateProgress,
    calculateProgressPercentage,
    formatProgressDisplay,
    getTotalReadingTimePerDay,
    getUnitForFormat,
    separateDeadlines,
    sortDeadlines
} from '../deadlineUtils';

// Mock data for testing
const createMockDeadline = (
  id: string,
  deadlineDate: string,
  format: 'physical' | 'ebook' | 'audio' = 'physical',
  totalQuantity: number = 300,
  progress: any[] = []
): ReadingDeadlineWithProgress => ({
  id,
  book_title: 'Test Book',
  author: 'Test Author',
  format,
  source: 'personal',
  deadline_date: deadlineDate,
  total_quantity: totalQuantity,
  flexibility: 'flexible',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  user_id: 'test-user-id',
  progress
});

const createMockProgress = (
  currentProgress: number,
  updatedAt: string = '2024-01-01T00:00:00Z'
) => ({
  id: '1',
  reading_deadline_id: '1',
  current_progress: currentProgress,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: updatedAt
});

describe('deadlineUtils', () => {
  describe('separateDeadlines', () => {
    const mockDate = new Date('2024-01-15T00:00:00Z');
    
    beforeEach(() => {
      jest.useFakeTimers();
      jest.setSystemTime(mockDate);
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should separate active and overdue deadlines', () => {
      const deadlines: ReadingDeadlineWithProgress[] = [
        createMockDeadline('1', '2024-01-20T00:00:00Z'), // future - active
        createMockDeadline('2', '2024-01-10T00:00:00Z'), // past - overdue
        createMockDeadline('3', '2024-01-25T00:00:00Z'), // future - active
        createMockDeadline('4', '2024-01-05T00:00:00Z'), // past - overdue
      ];

      const result = separateDeadlines(deadlines);

      expect(result.active).toHaveLength(2);
      expect(result.overdue).toHaveLength(2);
      expect(result.active.map(d => d.id)).toEqual(['1', '3']);
      expect(result.overdue.map(d => d.id)).toEqual(['4', '2']);
    });

    it('should handle empty array', () => {
      const result = separateDeadlines([]);
      expect(result.active).toHaveLength(0);
      expect(result.overdue).toHaveLength(0);
    });

    it('should handle all active deadlines', () => {
      const deadlines: ReadingDeadlineWithProgress[] = [
        createMockDeadline('1', '2024-01-20T00:00:00Z'),
        createMockDeadline('2', '2024-01-25T00:00:00Z'),
      ];

      const result = separateDeadlines(deadlines);
      expect(result.active).toHaveLength(2);
      expect(result.overdue).toHaveLength(0);
    });

    it('should handle all overdue deadlines', () => {
      const deadlines: ReadingDeadlineWithProgress[] = [
        createMockDeadline('1', '2024-01-10T00:00:00Z'),
        createMockDeadline('2', '2024-01-05T00:00:00Z'),
      ];

      const result = separateDeadlines(deadlines);
      expect(result.active).toHaveLength(0);
      expect(result.overdue).toHaveLength(2);
    });
  });

  describe('calculateDaysLeft', () => {
    const mockDate = new Date('2024-01-15T00:00:00Z');
    
    beforeEach(() => {
      jest.useFakeTimers();
      jest.setSystemTime(mockDate);
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should calculate days left correctly', () => {
      expect(calculateDaysLeft('2024-01-20T00:00:00Z')).toBe(5); // 5 days from mock date
      expect(calculateDaysLeft('2024-01-25T00:00:00Z')).toBe(10); // 10 days from mock date
      expect(calculateDaysLeft('2024-01-16T00:00:00Z')).toBe(1); // 1 day from mock date
    });

    it('should handle past dates', () => {
      expect(calculateDaysLeft('2024-01-10T00:00:00Z')).toBe(-5); // 5 days ago
      expect(calculateDaysLeft('2024-01-05T00:00:00Z')).toBe(-10); // 10 days ago
    });

    it('should handle same day', () => {
      expect(calculateDaysLeft('2024-01-15T00:00:00Z')).toBe(0);
    });

    it('should handle partial days correctly', () => {
      // Should round up to next day even if it's just a few hours difference
      expect(calculateDaysLeft('2024-01-15T23:59:59Z')).toBe(1);
      expect(calculateDaysLeft('2024-01-15T00:00:01Z')).toBe(1); // Just 1 second into the same day
    });
  });

  describe('calculateProgress', () => {
    it('should return 0 for empty progress array', () => {
      const deadline = createMockDeadline('1', '2024-01-20T00:00:00Z', 'physical', 300, []);
      expect(calculateProgress(deadline)).toBe(0);
    });

    it('should return the latest progress value', () => {
      const progress = [
        createMockProgress(50, '2024-01-01T00:00:00Z'),
        createMockProgress(100, '2024-01-02T00:00:00Z'),
        createMockProgress(75, '2024-01-03T00:00:00Z'),
      ];

      const deadline = createMockDeadline('1', '2024-01-20T00:00:00Z', 'physical', 300, progress);
      expect(calculateProgress(deadline)).toBe(75);
    });

    it('should handle progress with only created_at', () => {
      const progress = [
        {
          id: '1',
          reading_deadline_id: '1',
          current_progress: 50,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: null
        },
        {
          id: '2',
          reading_deadline_id: '1',
          current_progress: 100,
          created_at: '2024-01-02T00:00:00Z',
          updated_at: null
        }
      ];

      const deadline = createMockDeadline('1', '2024-01-20T00:00:00Z', 'physical', 300, progress);
      expect(calculateProgress(deadline)).toBe(100);
    });

    it('should handle progress with only updated_at', () => {
      const progress = [
        {
          id: '1',
          reading_deadline_id: '1',
          current_progress: 50,
          created_at: null,
          updated_at: '2024-01-01T00:00:00Z'
        },
        {
          id: '2',
          reading_deadline_id: '1',
          current_progress: 100,
          created_at: null,
          updated_at: '2024-01-02T00:00:00Z'
        }
      ];

      const deadline = createMockDeadline('1', '2024-01-20T00:00:00Z', 'physical', 300, progress);
      expect(calculateProgress(deadline)).toBe(100);
    });

    it('should handle progress with null current_progress', () => {
      const progress = [
        {
          id: '1',
          reading_deadline_id: '1',
          current_progress: null,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
        }
      ];

      const deadline = createMockDeadline('1', '2024-01-20T00:00:00Z', 'physical', 300, progress);
      expect(calculateProgress(deadline)).toBe(0);
    });
  });

  describe('calculateProgressPercentage', () => {
    it('should calculate percentage correctly for physical format', () => {
      const progress = [createMockProgress(150)];
      const deadline = createMockDeadline('1', '2024-01-20T00:00:00Z', 'physical', 300, progress);
      expect(calculateProgressPercentage(deadline)).toBe(50); // 150/300 = 50%
    });

    it('should calculate percentage correctly for ebook format', () => {
      const progress = [createMockProgress(200)];
      const deadline = createMockDeadline('1', '2024-01-20T00:00:00Z', 'ebook', 400, progress);
      expect(calculateProgressPercentage(deadline)).toBe(50); // 200/400 = 50%
    });

    it('should calculate percentage correctly for audio format', () => {
      const progress = [createMockProgress(90)];
      const deadline = createMockDeadline('1', '2024-01-20T00:00:00Z', 'audio', 180, progress);
      expect(calculateProgressPercentage(deadline)).toBe(50); // 90/180 = 50%
    });

    it('should handle zero progress', () => {
      const deadline = createMockDeadline('1', '2024-01-20T00:00:00Z', 'physical', 300, []);
      expect(calculateProgressPercentage(deadline)).toBe(0);
    });

    it('should handle complete progress', () => {
      const progress = [createMockProgress(300)];
      const deadline = createMockDeadline('1', '2024-01-20T00:00:00Z', 'physical', 300, progress);
      expect(calculateProgressPercentage(deadline)).toBe(100);
    });

    it('should handle over progress', () => {
      const progress = [createMockProgress(350)];
      const deadline = createMockDeadline('1', '2024-01-20T00:00:00Z', 'physical', 300, progress);
      expect(calculateProgressPercentage(deadline)).toBe(117); // 350/300 = 116.67% rounded to 117
    });

    it('should round percentage correctly', () => {
      const progress = [createMockProgress(67)];
      const deadline = createMockDeadline('1', '2024-01-20T00:00:00Z', 'physical', 100, progress);
      expect(calculateProgressPercentage(deadline)).toBe(67); // 67/100 = 67%
    });
  });

  describe('getUnitForFormat', () => {
    it('should return correct units for each format', () => {
      expect(getUnitForFormat('physical')).toBe('pages');
      expect(getUnitForFormat('ebook')).toBe('pages');
      expect(getUnitForFormat('audio')).toBe('minutes');
    });
  });

  describe('formatProgressDisplay', () => {
    it('should format physical format progress correctly', () => {
      expect(formatProgressDisplay('physical', 150)).toBe('150');
      expect(formatProgressDisplay('physical', 0)).toBe('0');
      expect(formatProgressDisplay('physical', 300)).toBe('300');
    });

    it('should format ebook format progress correctly', () => {
      expect(formatProgressDisplay('ebook', 200)).toBe('200');
      expect(formatProgressDisplay('ebook', 0)).toBe('0');
      expect(formatProgressDisplay('ebook', 400)).toBe('400');
    });

    it('should format audio format progress correctly', () => {
      expect(formatProgressDisplay('audio', 60)).toBe('1h 0m');
      expect(formatProgressDisplay('audio', 90)).toBe('1h 30m');
      expect(formatProgressDisplay('audio', 120)).toBe('2h 0m');
      expect(formatProgressDisplay('audio', 30)).toBe('30m');
      expect(formatProgressDisplay('audio', 0)).toBe('0m');
      expect(formatProgressDisplay('audio', 150)).toBe('2h 30m');
    });

    it('should handle edge cases for audio format', () => {
      expect(formatProgressDisplay('audio', 1)).toBe('1m');
      expect(formatProgressDisplay('audio', 59)).toBe('59m');
      expect(formatProgressDisplay('audio', 3600)).toBe('60h 0m'); // 60 hours
    });
  });

  describe('sortDeadlines', () => {
    it('should sort by due date first (earliest first)', () => {
      const deadline1 = createMockDeadline('1', '2024-01-20T00:00:00Z');
      const deadline2 = createMockDeadline('2', '2024-01-15T00:00:00Z');
      const deadline3 = createMockDeadline('3', '2024-01-25T00:00:00Z');

      const deadlines = [deadline1, deadline2, deadline3];
      deadlines.sort(sortDeadlines);

      expect(deadlines.map(d => d.id)).toEqual(['2', '1', '3']);
    });

    it('should sort by updated_at when due dates are equal (most recent first)', () => {
      const deadline1 = createMockDeadline('1', '2024-01-20T00:00:00Z');
      deadline1.updated_at = '2024-01-10T00:00:00Z';
      
      const deadline2 = createMockDeadline('2', '2024-01-20T00:00:00Z');
      deadline2.updated_at = '2024-01-15T00:00:00Z';
      
      const deadline3 = createMockDeadline('3', '2024-01-20T00:00:00Z');
      deadline3.updated_at = '2024-01-05T00:00:00Z';

      const deadlines = [deadline1, deadline2, deadline3];
      deadlines.sort(sortDeadlines);

      expect(deadlines.map(d => d.id)).toEqual(['2', '1', '3']);
    });

    it('should sort by created_at when updated_at dates are equal (most recent first)', () => {
      const deadline1 = createMockDeadline('1', '2024-01-20T00:00:00Z');
      deadline1.updated_at = '2024-01-10T00:00:00Z';
      deadline1.created_at = '2024-01-05T00:00:00Z';
      
      const deadline2 = createMockDeadline('2', '2024-01-20T00:00:00Z');
      deadline2.updated_at = '2024-01-10T00:00:00Z';
      deadline2.created_at = '2024-01-15T00:00:00Z';
      
      const deadline3 = createMockDeadline('3', '2024-01-20T00:00:00Z');
      deadline3.updated_at = '2024-01-10T00:00:00Z';
      deadline3.created_at = '2024-01-01T00:00:00Z';

      const deadlines = [deadline1, deadline2, deadline3];
      deadlines.sort(sortDeadlines);

      expect(deadlines.map(d => d.id)).toEqual(['2', '1', '3']);
    });

    it('should handle null updated_at and created_at values', () => {
      const deadline1 = createMockDeadline('1', '2024-01-20T00:00:00Z');
      deadline1.updated_at = null;
      deadline1.created_at = null;
      
      const deadline2 = createMockDeadline('2', '2024-01-20T00:00:00Z');
      deadline2.updated_at = '2024-01-10T00:00:00Z';
      deadline2.created_at = '2024-01-05T00:00:00Z';

      const deadlines = [deadline1, deadline2];
      deadlines.sort(sortDeadlines);

      expect(deadlines.map(d => d.id)).toEqual(['2', '1']);
    });

    it('should maintain stable sort for identical deadlines', () => {
      const deadline1 = createMockDeadline('1', '2024-01-20T00:00:00Z');
      const deadline2 = createMockDeadline('2', '2024-01-20T00:00:00Z');
      deadline2.updated_at = deadline1.updated_at;
      deadline2.created_at = deadline1.created_at;

      const deadlines = [deadline1, deadline2];
      deadlines.sort(sortDeadlines);

      // Should maintain original order for identical dates
      expect(deadlines.map(d => d.id)).toEqual(['1', '2']);
    });
  });

  describe('getTotalReadingTimePerDay', () => {
    const mockGetDeadlineCalculations = (deadline: ReadingDeadlineWithProgress) => ({
      unitsPerDay: deadline.format === 'audio' ? 30 : 15 // 30 minutes for audio, 15 pages for others
    });

    it('should return "No active deadlines" for empty array', () => {
      const result = getTotalReadingTimePerDay([], mockGetDeadlineCalculations);
      expect(result).toBe('No active deadlines');
    });

    it('should calculate total time for single audio deadline', () => {
      const deadline = createMockDeadline('1', '2024-01-20T00:00:00Z', 'audio', 180);
      const result = getTotalReadingTimePerDay([deadline], mockGetDeadlineCalculations);
      expect(result).toBe('30m/day needed');
    });

    it('should calculate total time for single physical deadline', () => {
      const deadline = createMockDeadline('1', '2024-01-20T00:00:00Z', 'physical', 300);
      const result = getTotalReadingTimePerDay([deadline], mockGetDeadlineCalculations);
      expect(result).toBe('23m/day needed'); // 15 pages * 1.5 minutes = 22.5 minutes, rounded to 23
    });

    it('should calculate total time for single ebook deadline', () => {
      const deadline = createMockDeadline('1', '2024-01-20T00:00:00Z', 'ebook', 400);
      const result = getTotalReadingTimePerDay([deadline], mockGetDeadlineCalculations);
      expect(result).toBe('23m/day needed'); // 15 pages * 1.5 minutes = 22.5 minutes, rounded to 23
    });

    it('should calculate total time for multiple deadlines', () => {
      const audioDeadline = createMockDeadline('1', '2024-01-20T00:00:00Z', 'audio', 180);
      const physicalDeadline = createMockDeadline('2', '2024-01-25T00:00:00Z', 'physical', 300);
      
      const result = getTotalReadingTimePerDay([audioDeadline, physicalDeadline], mockGetDeadlineCalculations);
      expect(result).toBe('53m/day needed'); // 30m + (15*1.5)m = 30m + 22.5m = 52.5m, rounded to 53
    });

    it('should format hours and minutes correctly', () => {
      const mockCalculations = (deadline: ReadingDeadlineWithProgress) => ({
        unitsPerDay: deadline.format === 'audio' ? 90 : 45 // 90 minutes for audio, 45 pages for others
      });

      const audioDeadline = createMockDeadline('1', '2024-01-20T00:00:00Z', 'audio', 180);
      const physicalDeadline = createMockDeadline('2', '2024-01-25T00:00:00Z', 'physical', 300);
      
      const result = getTotalReadingTimePerDay([audioDeadline, physicalDeadline], mockCalculations);
      expect(result).toBe('2h 38m/day needed'); // 90m + (45*1.5)m = 90m + 67.5m = 157.5m = 2h 37.5m, rounded to 2h 38m
    });

    it('should format hours and minutes with remainder', () => {
      const mockCalculations = (deadline: ReadingDeadlineWithProgress) => ({
        unitsPerDay: deadline.format === 'audio' ? 45 : 20 // 45 minutes for audio, 20 pages for others
      });

      const audioDeadline = createMockDeadline('1', '2024-01-20T00:00:00Z', 'audio', 180);
      const physicalDeadline = createMockDeadline('2', '2024-01-25T00:00:00Z', 'physical', 300);
      
      const result = getTotalReadingTimePerDay([audioDeadline, physicalDeadline], mockCalculations);
      expect(result).toBe('1h 15m/day needed'); // 45m + (20*1.5)m = 45m + 30m = 75m = 1h 15m
    });

    it('should round minutes correctly', () => {
      const mockCalculations = (deadline: ReadingDeadlineWithProgress) => ({
        unitsPerDay: deadline.format === 'audio' ? 30 : 12.7 // 30 minutes for audio, 12.7 pages for others
      });

      const physicalDeadline = createMockDeadline('1', '2024-01-20T00:00:00Z', 'physical', 300);
      
      const result = getTotalReadingTimePerDay([physicalDeadline], mockCalculations);
      expect(result).toBe('19m/day needed'); // 12.7 * 1.5 = 19.05, rounded to 19
    });

    it('should handle zero units per day', () => {
      const mockCalculations = (deadline: ReadingDeadlineWithProgress) => ({
        unitsPerDay: 0
      });

      const deadline = createMockDeadline('1', '2024-01-20T00:00:00Z', 'physical', 300);
      const result = getTotalReadingTimePerDay([deadline], mockCalculations);
      expect(result).toBe('0m/day needed');
    });
  });
}); 