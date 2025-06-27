import {
  extractReadingDays,
  getRecentReadingDays,
  calculateUserPace,
  calculateRequiredPace,
  getPaceBasedStatus,
  getPaceStatusMessage,
  formatPaceDisplay,
  UserPaceData,
  PaceBasedStatus
} from '../paceCalculations';
import { ReadingDeadlineWithProgress } from '@/types/deadline';

// Helper function to create mock deadlines
const createMockDeadline = (
  id: string,
  format: 'physical' | 'ebook' | 'audio',
  totalQuantity: number,
  progress: { current_progress: number; created_at: string; updated_at?: string }[]
): ReadingDeadlineWithProgress => ({
  id,
  book_title: 'Test Book',
  author: 'Test Author',
  format,
  source: 'personal',
  deadline_date: '2024-12-31T00:00:00Z',
  total_quantity: totalQuantity,
  flexibility: 'flexible',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  user_id: 'test-user',
  progress: progress.map((p, index) => ({
    id: `progress-${id}-${index}`,
    reading_deadline_id: id,
    current_progress: p.current_progress,
    created_at: p.created_at,
    updated_at: p.updated_at || p.created_at
  }))
});

// Helper to create dates relative to today
const daysAgo = (days: number): string => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString();
};

describe('paceCalculations', () => {
  describe('extractReadingDays', () => {
    it('should extract reading days from physical book progress within last 7 days', () => {
      const deadline = createMockDeadline('1', 'physical', 300, [
        { current_progress: 50, created_at: daysAgo(6) },
        { current_progress: 80, created_at: daysAgo(4) },
        { current_progress: 120, created_at: daysAgo(2) }
      ]);

      const result = extractReadingDays(deadline);
      
      expect(result).toEqual([
        { date: daysAgo(6).split('T')[0], pagesRead: 50, format: 'physical' },
        { date: daysAgo(4).split('T')[0], pagesRead: 30, format: 'physical' },
        { date: daysAgo(2).split('T')[0], pagesRead: 40, format: 'physical' }
      ]);
    });

    it('should convert audio book minutes to page equivalents', () => {
      const deadline = createMockDeadline('2', 'audio', 600, [
        { current_progress: 90, created_at: daysAgo(5) }, // 90 minutes = 60 page equivalents
        { current_progress: 150, created_at: daysAgo(3) } // 60 more minutes = 40 page equivalents
      ]);

      const result = extractReadingDays(deadline);
      
      expect(result).toEqual([
        { date: daysAgo(5).split('T')[0], pagesRead: 60, format: 'audio' }, // 90 / 1.5
        { date: daysAgo(3).split('T')[0], pagesRead: 40, format: 'audio' } // 60 / 1.5
      ]);
    });

    it('should filter out progress older than 7 days', () => {
      const deadline = createMockDeadline('3', 'physical', 300, [
        { current_progress: 50, created_at: daysAgo(10) }, // Too old
        { current_progress: 80, created_at: daysAgo(5) },  // Within range
        { current_progress: 120, created_at: daysAgo(3) }  // Within range
      ]);

      const result = extractReadingDays(deadline);
      
      expect(result).toHaveLength(2);
      expect(result[0].pagesRead).toBe(30); // 80 - 50 (baseline from 10 days ago)
      expect(result[1].pagesRead).toBe(40); // 120 - 80
    });

    it('should handle empty progress array', () => {
      const deadline = createMockDeadline('4', 'physical', 300, []);
      const result = extractReadingDays(deadline);
      expect(result).toEqual([]);
    });

    it('should handle negative progress changes (ignore them)', () => {
      const deadline = createMockDeadline('5', 'physical', 300, [
        { current_progress: 100, created_at: daysAgo(5) },
        { current_progress: 80, created_at: daysAgo(3) }, // Negative change
        { current_progress: 120, created_at: daysAgo(1) }
      ]);

      const result = extractReadingDays(deadline);
      
      expect(result).toHaveLength(2);
      expect(result[0].pagesRead).toBe(100); // First entry
      expect(result[1].pagesRead).toBe(40); // 120 - 80 (ignores negative change)
    });
  });

  describe('getRecentReadingDays', () => {
    it('should combine reading days from multiple deadlines', () => {
      const deadline1 = createMockDeadline('1', 'physical', 300, [
        { current_progress: 50, created_at: daysAgo(5) }
      ]);
      
      const deadline2 = createMockDeadline('2', 'physical', 400, [
        { current_progress: 30, created_at: daysAgo(5) } // Same day
      ]);

      const result = getRecentReadingDays([deadline1, deadline2]);
      
      expect(result).toHaveLength(1);
      expect(result[0].pagesRead).toBe(80); // 50 + 30 combined for same day
    });

    it('should handle mixed audio and physical books', () => {
      const physicalBook = createMockDeadline('1', 'physical', 300, [
        { current_progress: 50, created_at: daysAgo(3) }
      ]);
      
      const audioBook = createMockDeadline('2', 'audio', 600, [
        { current_progress: 90, created_at: daysAgo(3) } // 90 minutes = 60 page equivalents
      ]);

      const result = getRecentReadingDays([physicalBook, audioBook]);
      
      expect(result).toHaveLength(1);
      expect(result[0].pagesRead).toBe(110); // 50 + 60 page equivalents
    });
  });

  describe('calculateUserPace', () => {
    it('should use Tier 1 calculation when ≥3 reading days available', () => {
      const deadlines = [
        createMockDeadline('1', 'physical', 300, [
          { current_progress: 30, created_at: daysAgo(6) },
          { current_progress: 60, created_at: daysAgo(4) },
          { current_progress: 100, created_at: daysAgo(2) }
        ])
      ];

      const result = calculateUserPace(deadlines);
      
      expect(result.calculationMethod).toBe('recent_data');
      expect(result.isReliable).toBe(true);
      expect(result.readingDaysCount).toBe(3);
      expect(result.averagePace).toBe((30 + 30 + 40) / 3); // 33.33
    });

    it('should use Tier 2 fallback when <3 reading days available', () => {
      const deadlines = [
        createMockDeadline('1', 'physical', 300, [
          { current_progress: 50, created_at: daysAgo(5) },
          { current_progress: 80, created_at: daysAgo(3) }
        ])
      ];

      const result = calculateUserPace(deadlines);
      
      expect(result.calculationMethod).toBe('default_fallback');
      expect(result.isReliable).toBe(false);
      expect(result.readingDaysCount).toBe(2);
      expect(result.averagePace).toBe(25); // Default fallback
    });

    it('should handle empty deadlines array', () => {
      const result = calculateUserPace([]);
      
      expect(result.calculationMethod).toBe('default_fallback');
      expect(result.isReliable).toBe(false);
      expect(result.readingDaysCount).toBe(0);
      expect(result.averagePace).toBe(25);
    });
  });

  describe('calculateRequiredPace', () => {
    it('should calculate required pace for physical books', () => {
      const result = calculateRequiredPace(300, 100, 10, 'physical');
      expect(result).toBe(20); // 200 pages remaining / 10 days = 20 pages/day
    });

    it('should calculate required pace for audio books (convert to page equivalents)', () => {
      const result = calculateRequiredPace(300, 150, 5, 'audio');
      // 150 minutes remaining / 1.5 = 100 page equivalents / 5 days = 20 pages/day equivalent
      expect(result).toBe(20);
    });

    it('should handle zero days left', () => {
      const result = calculateRequiredPace(300, 100, 0, 'physical');
      expect(result).toBe(200); // All remaining content
    });

    it('should handle completed books', () => {
      const result = calculateRequiredPace(300, 300, 5, 'physical');
      expect(result).toBe(0); // No remaining content
    });
  });

  describe('getPaceBasedStatus', () => {
    it('should return red for overdue deadlines', () => {
      const result = getPaceBasedStatus(25, 30, -1, 50);
      
      expect(result.color).toBe('red');
      expect(result.level).toBe('overdue');
      expect(result.message).toBe('Return or renew');
    });

    it('should return red for 0% progress with <3 days remaining', () => {
      const result = getPaceBasedStatus(25, 30, 2, 0);
      
      expect(result.color).toBe('red');
      expect(result.level).toBe('impossible');
      expect(result.message).toBe('Start reading now');
    });

    it('should return red for impossible pace (>100% increase needed)', () => {
      const result = getPaceBasedStatus(20, 50, 5, 50); // Need 150% increase (30/20 = 1.5)
      
      expect(result.color).toBe('red');
      expect(result.level).toBe('impossible');
      expect(result.message).toBe('Pace too slow');
    });

    it('should return orange for achievable but challenging pace', () => {
      const result = getPaceBasedStatus(25, 35, 5, 50); // Need 40% increase (10/25 = 0.4)
      
      expect(result.color).toBe('orange');
      expect(result.level).toBe('approaching');
      expect(result.message).toBe('Pick up the pace');
    });

    it('should return green for on-track pace', () => {
      const result = getPaceBasedStatus(30, 25, 5, 50);
      
      expect(result.color).toBe('green');
      expect(result.level).toBe('good');
      expect(result.message).toBe("You're on track");
    });

    it('should return green for exactly meeting required pace', () => {
      const result = getPaceBasedStatus(25, 25, 5, 50);
      
      expect(result.color).toBe('green');
      expect(result.level).toBe('good');
      expect(result.message).toBe("You're on track");
    });
  });

  describe('getPaceStatusMessage', () => {
    const createUserPaceData = (
      averagePace: number, 
      method: 'recent_data' | 'default_fallback'
    ): UserPaceData => ({
      averagePace,
      readingDaysCount: method === 'recent_data' ? 5 : 2,
      isReliable: method === 'recent_data',
      calculationMethod: method
    });

    it('should return overdue message', () => {
      const userPaceData = createUserPaceData(25, 'recent_data');
      const status: PaceBasedStatus = { color: 'red', level: 'overdue', message: 'Return or renew' };
      
      const result = getPaceStatusMessage(userPaceData, 30, status);
      expect(result).toBe('Return or renew');
    });

    it('should return start reading message for unreliable data', () => {
      const userPaceData = createUserPaceData(25, 'default_fallback');
      const status: PaceBasedStatus = { color: 'red', level: 'impossible', message: 'Start reading now' };
      
      const result = getPaceStatusMessage(userPaceData, 50, status);
      expect(result).toBe('Start reading to track pace');
    });

    it('should return pace too ambitious for reliable impossible pace', () => {
      const userPaceData = createUserPaceData(20, 'recent_data');
      const status: PaceBasedStatus = { color: 'red', level: 'impossible', message: 'Pace too slow' };
      
      const result = getPaceStatusMessage(userPaceData, 50, status);
      expect(result).toBe('Pace too ambitious');
    });

    it('should return detailed pace increase message for orange status', () => {
      const userPaceData = createUserPaceData(25, 'recent_data');
      const status: PaceBasedStatus = { color: 'orange', level: 'approaching', message: 'Pick up the pace' };
      
      const result = getPaceStatusMessage(userPaceData, 35, status);
      expect(result).toBe('Need 10 more pages/day');
    });

    it('should return on track message for green status with reliable data', () => {
      const userPaceData = createUserPaceData(30, 'recent_data');
      const status: PaceBasedStatus = { color: 'green', level: 'good', message: "You're on track" };
      
      const result = getPaceStatusMessage(userPaceData, 25, status);
      expect(result).toBe('On track at 30 pages/day');
    });

    it('should return generic message for green status with unreliable data', () => {
      const userPaceData = createUserPaceData(25, 'default_fallback');
      const status: PaceBasedStatus = { color: 'green', level: 'good', message: "You're on track" };
      
      const result = getPaceStatusMessage(userPaceData, 20, status);
      expect(result).toBe("You're doing great");
    });
  });

  describe('formatPaceDisplay', () => {
    it('should format physical book pace', () => {
      expect(formatPaceDisplay(25, 'physical')).toBe('25 pages/day');
      expect(formatPaceDisplay(33.7, 'physical')).toBe('34 pages/day'); // Rounded
    });

    it('should format ebook pace', () => {
      expect(formatPaceDisplay(30, 'ebook')).toBe('30 pages/day');
    });

    it('should format audio book pace (convert page equivalents back to minutes)', () => {
      expect(formatPaceDisplay(40, 'audio')).toBe('1h 0m/day'); // 40 * 1.5 = 60 minutes = 1h
      expect(formatPaceDisplay(30, 'audio')).toBe('45m/day'); // 30 * 1.5 = 45 minutes
      expect(formatPaceDisplay(50, 'audio')).toBe('1h 15m/day'); // 50 * 1.5 = 75 minutes
    });

    it('should handle edge cases for audio format', () => {
      expect(formatPaceDisplay(0, 'audio')).toBe('0m/day');
      expect(formatPaceDisplay(1, 'audio')).toBe('2m/day'); // 1 * 1.5 = 1.5, rounded to 2
    });
  });

  describe('Integration tests', () => {
    it('should work end-to-end with realistic scenario', () => {
      // User has been reading consistently
      const deadlines = [
        createMockDeadline('book1', 'physical', 400, [
          { current_progress: 40, created_at: daysAgo(6) },
          { current_progress: 80, created_at: daysAgo(4) },
          { current_progress: 120, created_at: daysAgo(2) }
        ]),
        createMockDeadline('book2', 'audio', 300, [
          { current_progress: 45, created_at: daysAgo(5) }, // 30 page equivalents
          { current_progress: 90, created_at: daysAgo(3) }  // 30 page equivalents
        ])
      ];

      // Calculate user pace
      const userPace = calculateUserPace(deadlines);
      expect(userPace.isReliable).toBe(true);
      expect(userPace.averagePace).toBeCloseTo(36, 1); // (40+40+40+30+30)/5 = 180/5 = 36

      // Calculate status for a new deadline
      const requiredPace = calculateRequiredPace(200, 50, 5, 'physical'); // Need 30 pages/day
      const status = getPaceBasedStatus(userPace.averagePace, requiredPace, 5, 25);
      
      expect(status.color).toBe('green'); // User pace (33.33) > required (30)
      expect(status.level).toBe('good');
    });
  });
});