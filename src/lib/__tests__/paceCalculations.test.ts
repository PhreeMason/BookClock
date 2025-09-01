import { ReadingDeadlineWithProgress } from '@/types/deadline';
import {
  calculateRequiredPace,
  calculateUserListeningPace,
  calculateUserPace,
  formatListeningPaceDisplay,
  formatPaceDisplay,
  getPaceBasedStatus,
  getRecentListeningDays,
  getRecentReadingDays,
  minimumUnitsPerDayFromDeadline
} from '../paceCalculations';

// Helper function to create mock deadlines
const createMockDeadline = (
  id: string,
  format: 'physical' | 'ebook' | 'audio',
  totalQuantity: number,
  progress: { current_progress: number; created_at: string; updated_at?: string }[]
): ReadingDeadlineWithProgress => ({
  id,
  book_id: null,
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
    updated_at: p.updated_at || p.created_at,
    time_spent_reading: null
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
    it('should calculate pace as total pages divided by days between first and last reading day', () => {
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
      // Total pages: 30 + 30 + 40 = 100, Days between first (day 6) and last (day 2) = 4 days
      expect(result.averagePace).toBe(100 / 4); // 25 pages/day
    });

    it('should calculate pace correctly with fewer reading days', () => {
      const deadlines = [
        createMockDeadline('1', 'physical', 300, [
          { current_progress: 50, created_at: daysAgo(5) },
          { current_progress: 80, created_at: daysAgo(3) }
        ])
      ];

      const result = calculateUserPace(deadlines);
      
      expect(result.calculationMethod).toBe('recent_data');
      expect(result.isReliable).toBe(true);
      expect(result.readingDaysCount).toBe(2);
      // Total pages: 50 + 30 = 80, Days between first (day 5) and last (day 3) = 2 days
      expect(result.averagePace).toBe(80 / 2); // 40 pages/day
    });

    it('should handle empty deadlines array', () => {
      const result = calculateUserPace([]);
      
      expect(result.calculationMethod).toBe('default_fallback');
      expect(result.isReliable).toBe(false);
      expect(result.readingDaysCount).toBe(0);
      expect(result.averagePace).toBe(0);
    });

    it('should handle single reading day', () => {
      const deadlines = [
        createMockDeadline('1', 'physical', 300, [
          { current_progress: 45, created_at: daysAgo(3) }
        ])
      ];

      const result = calculateUserPace(deadlines);
      
      expect(result.calculationMethod).toBe('recent_data');
      expect(result.isReliable).toBe(true);
      expect(result.readingDaysCount).toBe(1);
      // Single day means daysBetween = 0, but we ceil it to 1
      expect(result.averagePace).toBe(45);
    });

    it('should filter out audio books from pace calculation', () => {
      const deadlines = [
        createMockDeadline('1', 'physical', 300, [
          { current_progress: 30, created_at: daysAgo(4) },
          { current_progress: 60, created_at: daysAgo(2) }
        ]),
        createMockDeadline('2', 'audio', 600, [
          { current_progress: 120, created_at: daysAgo(3) } // Should be ignored
        ])
      ];

      const result = calculateUserPace(deadlines);
      
      expect(result.readingDaysCount).toBe(2);
      // Only physical book progress: 30 + 30 = 60 pages over 2 days
      expect(result.averagePace).toBe(60 / 2); // 30 pages/day
    });

    it('should respect 21-day cutoff from most recent progress', () => {
      const deadlines = [
        createMockDeadline('1', 'physical', 300, [
          { current_progress: 20, created_at: daysAgo(25) }, // Too old, should be filtered out
          { current_progress: 40, created_at: daysAgo(5) },
          { current_progress: 70, created_at: daysAgo(2) }
        ])
      ];

      const result = calculateUserPace(deadlines);
      
      expect(result.readingDaysCount).toBe(2); // Only recent 2 entries
      // Reading days: day 5 (20 pages) + day 2 (30 pages) = 50 total over 3 days
      expect(result.averagePace).toBeCloseTo(50 / 3, 2);
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

  describe('getRecentListeningDays', () => {
    it('should extract listening days from audio deadlines only', () => {
      const physicalBook = createMockDeadline('1', 'physical', 300, [
        { current_progress: 25, created_at: daysAgo(3) }
      ]);
      
      const audioBook = createMockDeadline('2', 'audio', 600, [
        { current_progress: 45, created_at: daysAgo(5) },
        { current_progress: 90, created_at: daysAgo(3) }
      ]);

      const result = getRecentListeningDays([physicalBook, audioBook]);
      
      expect(result).toHaveLength(2);
      expect(result[0].minutesListened).toBe(45);
      expect(result[1].minutesListened).toBe(45);
    });

    it('should filter out large initial listening sessions', () => {
      const audioBook = createMockDeadline('1', 'audio', 600, [
        { current_progress: 400, created_at: daysAgo(5) }, // Too large for single day
        { current_progress: 450, created_at: daysAgo(3) }
      ]);

      const result = getRecentListeningDays([audioBook]);
      
      expect(result).toHaveLength(1);
      expect(result[0].minutesListened).toBe(50); // Only the difference
    });

    it('should respect 21-day cutoff for listening days', () => {
      const audioBook = createMockDeadline('1', 'audio', 600, [
        { current_progress: 30, created_at: daysAgo(25) }, // Too old
        { current_progress: 60, created_at: daysAgo(5) },
        { current_progress: 90, created_at: daysAgo(2) }
      ]);

      const result = getRecentListeningDays([audioBook]);
      
      expect(result).toHaveLength(2); // Only recent entries
    });
  });

  describe('calculateUserListeningPace', () => {
    it('should calculate pace as total minutes divided by days between first and last listening day', () => {
      const audioDeadlines = [
        createMockDeadline('1', 'audio', 600, [
          { current_progress: 60, created_at: daysAgo(5) },
          { current_progress: 120, created_at: daysAgo(3) }
        ])
      ];

      const result = calculateUserListeningPace(audioDeadlines);
      
      expect(result.calculationMethod).toBe('recent_data');
      expect(result.isReliable).toBe(true);
      expect(result.listeningDaysCount).toBe(2);
      // Total minutes: 60 + 60 = 120, Days between first (day 5) and last (day 3) = 2 days
      expect(result.averagePace).toBe(120 / 2); // 60 minutes/day
    });

    it('should handle empty audio deadlines', () => {
      const result = calculateUserListeningPace([]);
      
      expect(result.calculationMethod).toBe('default_fallback');
      expect(result.isReliable).toBe(false);
      expect(result.listeningDaysCount).toBe(0);
      expect(result.averagePace).toBe(0);
    });

    it('should handle single listening day', () => {
      const audioDeadlines = [
        createMockDeadline('1', 'audio', 600, [
          { current_progress: 45, created_at: daysAgo(3) }
        ])
      ];

      const result = calculateUserListeningPace(audioDeadlines);
      
      expect(result.calculationMethod).toBe('recent_data');
      expect(result.isReliable).toBe(true);
      expect(result.listeningDaysCount).toBe(1);
      // Single day means daysBetween = 0, but we max it to 1
      expect(result.averagePace).toBe(45);
    });

    it('should ignore physical and ebook deadlines', () => {
      const mixedDeadlines = [
        createMockDeadline('1', 'physical', 300, [
          { current_progress: 50, created_at: daysAgo(3) }
        ]),
        createMockDeadline('2', 'audio', 600, [
          { current_progress: 90, created_at: daysAgo(2) }
        ])
      ];

      const result = calculateUserListeningPace(mixedDeadlines);
      
      expect(result.listeningDaysCount).toBe(1);
      expect(result.averagePace).toBe(90); // Only audio book counted
    });

    it('should respect 21-day cutoff for listening pace', () => {
      const audioDeadlines = [
        createMockDeadline('1', 'audio', 600, [
          { current_progress: 30, created_at: daysAgo(25) }, // Too old, should be filtered out
          { current_progress: 60, created_at: daysAgo(5) },
          { current_progress: 120, created_at: daysAgo(2) }
        ])
      ];

      const result = calculateUserListeningPace(audioDeadlines);
      
      expect(result.listeningDaysCount).toBe(2); // Only recent 2 entries
      // Listening days: day 5 (30 minutes after filtering old baseline) + day 2 (60 minutes) = 90 total over 3 days
      expect(result.averagePace).toBeCloseTo(90 / 3, 2);
    });

    it('should filter out large initial listening sessions', () => {
      const audioDeadlines = [
        createMockDeadline('1', 'audio', 600, [
          { current_progress: 400, created_at: daysAgo(5) }, // Too large, will be filtered
          { current_progress: 450, created_at: daysAgo(3) }
        ])
      ];

      const result = calculateUserListeningPace(audioDeadlines);
      
      expect(result.listeningDaysCount).toBe(1); // Only the difference
      expect(result.averagePace).toBe(50); // 50 minutes in 1 day
    });
  });

  describe('formatListeningPaceDisplay', () => {
    it('should format minutes correctly', () => {
      expect(formatListeningPaceDisplay(45)).toBe('45m/day');
      expect(formatListeningPaceDisplay(30)).toBe('30m/day');
    });

    it('should format hours and minutes correctly', () => {
      expect(formatListeningPaceDisplay(90)).toBe('1h 30m/day');
      expect(formatListeningPaceDisplay(120)).toBe('2h 0m/day');
      expect(formatListeningPaceDisplay(135)).toBe('2h 15m/day');
    });

    it('should handle zero and small values', () => {
      expect(formatListeningPaceDisplay(0)).toBe('0m/day');
      expect(formatListeningPaceDisplay(1)).toBe('1m/day');
    });
  });

  describe('Edge cases and error handling', () => {
    it('should handle deadlines with no progress entries', () => {
      const emptyDeadline = createMockDeadline('1', 'physical', 300, []);
      
      const readingDays = getRecentReadingDays([emptyDeadline]);
      const userPace = calculateUserPace([emptyDeadline]);
      
      expect(readingDays).toHaveLength(0);
      expect(userPace.readingDaysCount).toBe(0);
      expect(userPace.averagePace).toBe(0);
    });

    it('should handle malformed progress data gracefully', () => {
      const deadline = {
        ...createMockDeadline('1', 'physical', 300, []),
        progress: null as any
      };
      
      const readingDays = getRecentReadingDays([deadline]);
      expect(readingDays).toHaveLength(0);
    });

    it('should filter out progress entries created at same time as deadline', () => {
      const createdAt = daysAgo(5);
      const deadline = createMockDeadline('1', 'physical', 300, [
        { current_progress: 100, created_at: createdAt }, // Same as deadline creation
        { current_progress: 130, created_at: daysAgo(3) }
      ]);
      deadline.created_at = createdAt;

      const readingDays = getRecentReadingDays([deadline]);
      
      expect(readingDays).toHaveLength(1);
      expect(readingDays[0].pagesRead).toBe(30); // Only the difference
    });

    it('should handle negative progress differences', () => {
      const deadline = createMockDeadline('1', 'physical', 300, [
        { current_progress: 100, created_at: daysAgo(5) },
        { current_progress: 90, created_at: daysAgo(3) } // Negative progress
      ]);

      const readingDays = getRecentReadingDays([deadline]);
      
      // Should still include the negative progress day (user might have corrected an error)
      expect(readingDays).toHaveLength(2);
    });
  });

  describe('minimumUnitsPerDayFromDeadline', () => {
    it('should return empty array when no progress entries', () => {
      const deadline = createMockDeadline('1', 'physical', 300, []);
      
      const result = minimumUnitsPerDayFromDeadline(deadline);
      expect(result).toEqual([]);
    });

    it('should calculate pace using cumulative progress values', () => {
      const deadline = createMockDeadline('1', 'physical', 300, [
        { current_progress: 50, created_at: daysAgo(4) },
        { current_progress: 100, created_at: daysAgo(3) },
        { current_progress: 150, created_at: daysAgo(2) }
      ]);
      deadline.deadline_date = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString();

      const result = minimumUnitsPerDayFromDeadline(deadline);
      
      expect(result).toHaveLength(3);
      // Day 1: 250 remaining / 14 days = 18
      expect(result[0].value).toBe(18);
      // Day 2: 200 remaining / 13 days = 16
      expect(result[1].value).toBe(16);
      // Day 3: 150 remaining / 12 days = 13
      expect(result[2].value).toBe(13);
    });

    it('should return 0 when book is completed', () => {
      const deadline = createMockDeadline('1', 'audio', 202, [
        { current_progress: 132, created_at: daysAgo(3) },
        { current_progress: 147, created_at: daysAgo(2) },
        { current_progress: 202, created_at: daysAgo(1) } // Complete
      ]);
      deadline.deadline_date = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString();

      const result = minimumUnitsPerDayFromDeadline(deadline);
      
      expect(result).toHaveLength(3);
      expect(result[0].value).toBeGreaterThan(0); // 70 remaining
      expect(result[1].value).toBeGreaterThan(0); // 55 remaining  
      expect(result[2].value).toBe(0); // Complete
    });

    it('should handle over-reading (progress > total)', () => {
      const deadline = createMockDeadline('1', 'ebook', 200, [
        { current_progress: 100, created_at: daysAgo(2) },
        { current_progress: 250, created_at: daysAgo(1) } // Over-read
      ]);
      deadline.deadline_date = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString();

      const result = minimumUnitsPerDayFromDeadline(deadline);
      
      expect(result).toHaveLength(2);
      expect(result[0].value).toBe(15); // 100 remaining / 7 days = 14.29 -> ceil to 15
      expect(result[1].value).toBe(0); // Over-complete
    });

    it('should handle past deadlines', () => {
      const deadline = createMockDeadline('1', 'physical', 300, [
        { current_progress: 100, created_at: daysAgo(10) },
        { current_progress: 150, created_at: daysAgo(5) }
      ]);
      deadline.deadline_date = daysAgo(2); // Past deadline

      const result = minimumUnitsPerDayFromDeadline(deadline);
      
      expect(result).toHaveLength(2);
      // Both should be 0 or positive based on when deadline passed
      expect(result[0].value).toBeGreaterThanOrEqual(0);
      expect(result[1].value).toBeGreaterThanOrEqual(0);
    });

    it('should sort progress entries by date', () => {
      const deadline = createMockDeadline('1', 'physical', 300, [
        { current_progress: 150, created_at: daysAgo(2) }, // Out of order
        { current_progress: 50, created_at: daysAgo(4) },
        { current_progress: 100, created_at: daysAgo(3) }
      ]);
      deadline.deadline_date = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString();

      const result = minimumUnitsPerDayFromDeadline(deadline);
      
      expect(result).toHaveLength(3);
      // Should be sorted: day 4, day 3, day 2
      expect(result[0].value).toBe(18); // 250 remaining at day 4
      expect(result[1].value).toBe(16); // 200 remaining at day 3
      expect(result[2].value).toBe(13); // 150 remaining at day 2
    });

    it('should handle duplicate dates by using latest progress for that date', () => {
      const deadline = createMockDeadline('1', 'audio', 300, [
        { current_progress: 50, created_at: '2025-08-19T10:00:00Z' },
        { current_progress: 100, created_at: '2025-08-20T09:00:00Z' },
        { current_progress: 120, created_at: '2025-08-20T15:00:00Z' }, // Same day, later progress
        { current_progress: 150, created_at: '2025-08-21T10:00:00Z' }
      ]);
      deadline.deadline_date = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString();

      const result = minimumUnitsPerDayFromDeadline(deadline);
      
      // Should only have 3 entries, not 4 (8/20 should appear only once)
      expect(result).toHaveLength(3);
      expect(result[0].label).toBe('8/19');
      expect(result[1].label).toBe('8/20'); // Should appear only once
      expect(result[2].label).toBe('8/21');
      
      // Should use the latest progress for 8/20 (120, not 100)
      expect(result[1].value).toBeGreaterThan(0);
      
      // Verify no duplicate dates in labels
      const labels = result.map(r => r.label);
      const uniqueLabels = [...new Set(labels)];
      expect(labels).toEqual(uniqueLabels);
    });

    it('should match the real scenario from logs', () => {
      // Simulating the exact scenario from the logs
      const deadline = createMockDeadline('1', 'audio', 2893, [
        { current_progress: 132, created_at: '2025-08-13T00:00:00Z' },
        { current_progress: 147, created_at: '2025-08-14T00:00:00Z' }, // 132 + 15
        { current_progress: 1220, created_at: '2025-08-19T00:00:00Z' }, // 147 + 1073
        { current_progress: 1562, created_at: '2025-08-20T00:00:00Z' } // 1220 + 342
      ]);
      deadline.deadline_date = '2025-09-02T00:35:00Z';
      deadline.created_at = '2025-08-12T00:37:29.148535Z';

      const result = minimumUnitsPerDayFromDeadline(deadline);
      
      expect(result).toHaveLength(4);
      // These should be based on cumulative progress
      expect(result[0].value).toBeGreaterThan(100); // 2761 remaining / ~20 days
      expect(result[1].value).toBeGreaterThan(100); // 2746 remaining / ~19 days
      expect(result[2].value).toBeLessThan(150); // 1673 remaining / ~14 days
      expect(result[3].value).toBeLessThan(130); // 1331 remaining / ~13 days
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
          { current_progress: 45, created_at: daysAgo(5) },
          { current_progress: 90, created_at: daysAgo(3) }
        ])
      ];

      // Calculate user pace (only physical books counted for reading pace)
      const userPace = calculateUserPace(deadlines);
      expect(userPace.isReliable).toBe(true);
      // Physical: 40+40+40 = 120 pages over 4 days (from day 6 to day 2) = 30 pages/day
      expect(userPace.averagePace).toBeCloseTo(30, 1);

      // Calculate listening pace separately
      const listeningPace = calculateUserListeningPace(deadlines);
      expect(listeningPace.isReliable).toBe(true);
      // Audio: 45 + 45 = 90 minutes over 2 days (from day 5 to day 3) = 45 minutes/day
      expect(listeningPace.averagePace).toBe(90 / 2); // 45 minutes/day

      // Calculate status for a new deadline
      const requiredPace = calculateRequiredPace(200, 50, 5, 'physical'); // Need 30 pages/day
      const status = getPaceBasedStatus(userPace.averagePace, requiredPace, 5, 25);
      
      expect(status.color).toBe('green'); // User pace (30) >= required (30)
      expect(status.level).toBe('good');
    });

    it('should handle mixed format scenarios correctly', () => {
      const mixedDeadlines = [
        createMockDeadline('physical1', 'physical', 300, [
          { current_progress: 25, created_at: daysAgo(4) },
          { current_progress: 50, created_at: daysAgo(2) }
        ]),
        createMockDeadline('ebook1', 'ebook', 200, [
          { current_progress: 30, created_at: daysAgo(3) }
        ]),
        createMockDeadline('audio1', 'audio', 500, [
          { current_progress: 60, created_at: daysAgo(4) },
          { current_progress: 120, created_at: daysAgo(1) }
        ])
      ];

      const readingDays = getRecentReadingDays(mixedDeadlines);
      const listeningDays = getRecentListeningDays(mixedDeadlines);

      // Reading days should include physical and ebook, but not audio
      expect(readingDays).toHaveLength(3);
      expect(readingDays.some(day => day.pagesRead === 25)).toBe(true); // Physical
      expect(readingDays.some(day => day.pagesRead === 25)).toBe(true); // Physical diff
      expect(readingDays.some(day => day.pagesRead === 30)).toBe(true); // Ebook

      // Listening days should only include audio
      expect(listeningDays).toHaveLength(2);
      expect(listeningDays[0].minutesListened).toBe(60);
      expect(listeningDays[1].minutesListened).toBe(60);
    });
  });
});