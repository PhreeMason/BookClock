import { ReadingDeadlineWithProgress } from '@/types/deadline';
import {
    calculateRequiredPace,
    calculateUserPace,
    formatPaceDisplay,
    getPaceBasedStatus,
    getRecentReadingDays
} from '../paceCalculations';

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
  describe('getRecentReadingDays', () => {
    it('should combine reading days from multiple deadlines', () => {
      const deadline1 = createMockDeadline('1', 'physical', 300, [
        { current_progress: 25, created_at: daysAgo(5) } // Small enough to count as daily reading
      ]);
      
      const deadline2 = createMockDeadline('2', 'physical', 400, [
        { current_progress: 30, created_at: daysAgo(5) } // Same day
      ]);

      const result = getRecentReadingDays([deadline1, deadline2]);
      
      expect(result).toHaveLength(1);
      expect(result[0].pagesRead).toBe(55); // 25 + 30 combined for same day
    });

    it('should handle mixed audio and physical books', () => {
      const physicalBook = createMockDeadline('1', 'physical', 300, [
        { current_progress: 25, created_at: daysAgo(3) } // Small enough to be counted as daily reading
      ]);
      
      const audioBook = createMockDeadline('2', 'audio', 600, [
        { current_progress: 30, created_at: daysAgo(3) } // 30 minutes - no conversion
      ]);

      const result = getRecentReadingDays([physicalBook, audioBook]);
      
      expect(result).toHaveLength(1);
      expect(result[0].pagesRead).toBe(25); // Only physical books count, audio handled separately
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

    it('should calculate required pace for audio books (no conversion)', () => {
      const result = calculateRequiredPace(300, 150, 5, 'audio');
      // 150 minutes remaining / 5 days = 30 minutes/day
      expect(result).toBe(30);
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

  describe('formatPaceDisplay', () => {
    it('should format physical book pace', () => {
      expect(formatPaceDisplay(25, 'physical')).toBe('25 pages/day');
      expect(formatPaceDisplay(33.7, 'physical')).toBe('34 pages/day'); // Rounded
    });

    it('should format ebook pace', () => {
      expect(formatPaceDisplay(30, 'ebook')).toBe('30 pages/day');
    });

    it('should format audio book pace (no conversion)', () => {
      expect(formatPaceDisplay(40, 'audio')).toBe('40m/day'); // 40 minutes directly
      expect(formatPaceDisplay(30, 'audio')).toBe('30m/day'); // 30 minutes directly
      expect(formatPaceDisplay(50, 'audio')).toBe('50m/day'); // 50 minutes directly
    });

    it('should handle edge cases for audio format', () => {
      expect(formatPaceDisplay(0, 'audio')).toBe('0m/day');
      expect(formatPaceDisplay(1, 'audio')).toBe('1m/day'); // 1 minute directly
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

      // Calculate user pace (only physical books counted for reading pace)
      const userPace = calculateUserPace(deadlines);
      expect(userPace.isReliable).toBe(true);
      expect(userPace.averagePace).toBeCloseTo(40, 1); // (40+40+40)/3 = 120/3 = 40 (audio not mixed in)

      // Calculate status for a new deadline
      const requiredPace = calculateRequiredPace(200, 50, 5, 'physical'); // Need 30 pages/day
      const status = getPaceBasedStatus(userPace.averagePace, requiredPace, 5, 25);
      
      expect(status.color).toBe('green'); // User pace (33.33) > required (30)
      expect(status.level).toBe('good');
    });
  });
});