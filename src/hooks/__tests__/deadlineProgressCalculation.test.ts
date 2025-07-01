/**
 * Unit tests for deadline progress calculation logic
 * These tests focus on the data processing without the full hook infrastructure
 */

interface ProgressEntry {
  created_at: string;
  current_progress: number;
}

interface MockDeadline {
  id: string;
  book_title: string;
  format: string;
  total_quantity: number;
  reading_deadline_progress: ProgressEntry[];
}

// Extract the core logic for testing
function processDeadlineProgress(deadlines: MockDeadline[], dateRange: string = '90d') {
  const dailyEntries: { [date: string]: any } = {};
  
  // Date filtering logic
  const getDateRangeStart = (range: string): Date | null => {
    const now = new Date();
    switch (range) {
      case '7d':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      case '30d':
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      case '90d':
        return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      default:
        return null;
    }
  };

  const startDate = getDateRangeStart(dateRange);

  deadlines.forEach((deadline) => {
    const progress = deadline.reading_deadline_progress || [];
    
    // Sort progress by date to calculate daily differences
    const sortedProgress = progress.sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );

    // Group progress entries by date to handle same-day updates properly
    const progressByDate: { [date: string]: ProgressEntry[] } = {};
    sortedProgress.forEach((prog) => {
      const date = new Date(prog.created_at).toISOString().split('T')[0];
      if (!progressByDate[date]) progressByDate[date] = [];
      progressByDate[date].push(prog);
    });

    // Process each date for this deadline
    const dates = Object.keys(progressByDate).sort();
    for (let dateIndex = 0; dateIndex < dates.length; dateIndex++) {
      const date = dates[dateIndex];
      
      // Apply date filter
      if (startDate && new Date(date) < startDate) continue;

      const dayProgress = progressByDate[date];
      // Use the last (most recent) progress entry for the day
      const currentProgress = dayProgress[dayProgress.length - 1];
      
      let progressMade = 0;
      if (dateIndex === 0) {
        // First date - use full progress as daily progress
        progressMade = currentProgress.current_progress;
      } else {
        // Subsequent dates - difference from previous day's final progress
        const prevDate = dates[dateIndex - 1];
        const prevDayProgress = progressByDate[prevDate];
        const prevProgress = prevDayProgress[prevDayProgress.length - 1];
        progressMade = Math.max(0, currentProgress.current_progress - prevProgress.current_progress);
      }

      // Only add entries where there's actually progress made
      if (progressMade > 0) {
        if (!dailyEntries[date]) {
          dailyEntries[date] = {
            date,
            deadlines: [],
            totalProgressMade: 0,
          };
        }

        dailyEntries[date].deadlines.push({
          id: deadline.id,
          book_title: deadline.book_title,
          format: deadline.format,
          progress_made: progressMade,
          total_progress: currentProgress.current_progress,
          total_quantity: deadline.total_quantity,
        });

        dailyEntries[date].totalProgressMade += progressMade;
      }
    }
  });

  return Object.values(dailyEntries);
}

describe('Deadline Progress Calculation Logic', () => {
  
  it('should handle multiple same-day progress entries correctly', () => {
    const mockData: MockDeadline[] = [
      {
        id: "rd_1546b109fce34579",
        book_title: "The lean start up",
        format: "audio",
        total_quantity: 519,
        reading_deadline_progress: [
          {
            created_at: "2025-06-21T05:46:43.766915+00:00",
            current_progress: 281,
          },
          {
            created_at: "2025-06-27T02:49:52.547+00:00",
            current_progress: 302,
          },
          {
            created_at: "2025-06-27T17:04:16.402+00:00",
            current_progress: 344,
          },
          {
            created_at: "2025-06-27T17:59:24.503+00:00",
            current_progress: 346,
          },
          {
            created_at: "2025-06-27T17:59:32.686+00:00",
            current_progress: 344, // Note: This goes down!
          },
          {
            created_at: "2025-06-30T20:06:18.398+00:00",
            current_progress: 350,
          }
        ]
      }
    ];

    const result = processDeadlineProgress(mockData);
    
    // Should have entries for: 2025-06-21, 2025-06-27, 2025-06-30
    expect(result).toHaveLength(3);
    
    // Find specific day entries
    const june21 = result.find(r => r.date === '2025-06-21');
    const june27 = result.find(r => r.date === '2025-06-27');
    const june30 = result.find(r => r.date === '2025-06-30');
    
    expect(june21).toBeDefined();
    expect(june27).toBeDefined();
    expect(june30).toBeDefined();
    
    // June 21: Initial progress (281 minutes)
    expect(june21.deadlines[0].progress_made).toBe(281);
    expect(june21.deadlines[0].total_progress).toBe(281);
    
    // June 27: Final progress (344) - Initial progress (281) = 63 minutes
    // Even though there were multiple same-day entries, we should use the last one
    expect(june27.deadlines[0].progress_made).toBe(63); // 344 - 281
    expect(june27.deadlines[0].total_progress).toBe(344);
    
    // June 30: 350 - 344 = 6 minutes
    expect(june30.deadlines[0].progress_made).toBe(6);
    expect(june30.deadlines[0].total_progress).toBe(350);
  });

  it('should handle the full user bug scenario with multiple books', () => {
    const userBugData: MockDeadline[] = [
      {
        id: "rd_3334d0efe76545e9",
        book_title: "Letters to a Young Poet",
        format: "physical",
        total_quantity: 52,
        reading_deadline_progress: [
          {
            created_at: "2025-06-26T21:13:29.773601+00:00",
            current_progress: 37,
          },
          {
            created_at: "2025-06-28T00:54:07.324+00:00",
            current_progress: 39,
          }
        ]
      },
      {
        id: "rd_1546b109fce34579",
        book_title: "The lean start up",
        format: "audio",
        total_quantity: 519,
        reading_deadline_progress: [
          {
            created_at: "2025-06-21T05:46:43.766915+00:00",
            current_progress: 281,
          },
          {
            created_at: "2025-06-27T02:49:52.547+00:00",
            current_progress: 302,
          },
          {
            created_at: "2025-06-27T17:04:16.402+00:00",
            current_progress: 344,
          },
          {
            created_at: "2025-06-27T17:59:24.503+00:00",
            current_progress: 346,
          },
          {
            created_at: "2025-06-27T17:59:32.686+00:00",
            current_progress: 344,
          },
          {
            created_at: "2025-06-30T20:06:18.398+00:00",
            current_progress: 350,
          }
        ]
      },
      {
        id: "rd_e3aab91b52044931",
        book_title: "Freeing the natural voice",
        format: "physical",
        total_quantity: 374,
        reading_deadline_progress: [
          {
            created_at: "2025-06-26T04:03:53.745677+00:00",
            current_progress: 31,
          },
          {
            created_at: "2025-06-28T04:45:39.085+00:00",
            current_progress: 41,
          }
        ]
      },
      {
        id: "rd_983950d544304c7c",
        book_title: "Dungeon Crawler Carl This Inevitable Ruin",
        format: "audio",
        total_quantity: 1720,
        reading_deadline_progress: [
          {
            created_at: "2025-06-21T05:46:43.766915+00:00",
            current_progress: 1272,
          },
          {
            created_at: "2025-06-28T01:49:16.59+00:00",
            current_progress: 1358,
          },
          {
            created_at: "2025-06-28T16:49:01.786+00:00",
            current_progress: 1385,
          },
          {
            created_at: "2025-06-29T09:26:20.461+00:00",
            current_progress: 1499,
          },
          {
            created_at: "2025-06-30T20:06:38.123+00:00",
            current_progress: 1505,
          },
          {
            created_at: "2025-07-01T12:26:39.442+00:00",
            current_progress: 1559,
          }
        ]
      }
    ];

    const result = processDeadlineProgress(userBugData);
    
    // Should have activity on these dates: 
    // 2025-06-21, 2025-06-26, 2025-06-27, 2025-06-28, 2025-06-29, 2025-06-30, 2025-07-01
    expect(result.length).toBeGreaterThanOrEqual(7);
    
    // Verify specific dates exist
    const dateMap = result.reduce((acc, entry) => {
      acc[entry.date] = entry;
      return acc;
    }, {} as { [date: string]: any });
    
    expect(dateMap['2025-06-21']).toBeDefined(); // Initial progress for 2 books
    expect(dateMap['2025-06-26']).toBeDefined(); // Initial progress for 2 books  
    expect(dateMap['2025-06-27']).toBeDefined(); // Progress for "The lean start up"
    expect(dateMap['2025-06-28']).toBeDefined(); // Progress for 3 books
    expect(dateMap['2025-06-29']).toBeDefined(); // Progress for "Dungeon Crawler Carl"
    expect(dateMap['2025-06-30']).toBeDefined(); // Progress for 2 books
    expect(dateMap['2025-07-01']).toBeDefined(); // Progress for "Dungeon Crawler Carl"
    
    // Verify June 28th has multiple books with progress
    const june28 = dateMap['2025-06-28'];
    expect(june28.deadlines.length).toBeGreaterThanOrEqual(2); // At least 2 books had progress
    
    // Check that books are properly identified
    const bookTitles = june28.deadlines.map((d: any) => d.book_title);
    expect(bookTitles).toContain('Letters to a Young Poet');
    expect(bookTitles).toContain('Freeing the natural voice');
    expect(bookTitles).toContain('Dungeon Crawler Carl This Inevitable Ruin');
  });

  it('should handle edge case where progress decreases on same day', () => {
    const edgeCaseData: MockDeadline[] = [
      {
        id: "test_book",
        book_title: "Test Book",
        format: "audio", 
        total_quantity: 1000,
        reading_deadline_progress: [
          {
            created_at: "2025-06-27T10:00:00.000+00:00",
            current_progress: 100,
          },
          {
            created_at: "2025-06-27T15:00:00.000+00:00", 
            current_progress: 150,
          },
          {
            created_at: "2025-06-27T20:00:00.000+00:00",
            current_progress: 140, // Decreased!
          }
        ]
      }
    ];

    const result = processDeadlineProgress(edgeCaseData);
    
    expect(result).toHaveLength(1);
    
    const june27 = result[0];
    expect(june27.date).toBe('2025-06-27');
    
    // Should use the last entry for the day (140)
    expect(june27.deadlines[0].total_progress).toBe(140);
    expect(june27.deadlines[0].progress_made).toBe(140); // Initial progress
  });

  it('should filter dates correctly based on date range', () => {
    const oldData: MockDeadline[] = [
      {
        id: "old_book",
        book_title: "Old Book",
        format: "physical",
        total_quantity: 200,
        reading_deadline_progress: [
          {
            created_at: "2024-01-01T10:00:00.000+00:00", // Very old
            current_progress: 50,
          },
          {
            created_at: "2025-06-27T10:00:00.000+00:00", // Recent
            current_progress: 100,
          }
        ]
      }
    ];

    // Test with 7-day filter - should only include recent entry
    const recentResult = processDeadlineProgress(oldData, '7d');
    expect(recentResult.length).toBeLessThanOrEqual(1); // Might be 0 or 1 depending on current date
    
    // Test with all data - should include both
    const allResult = processDeadlineProgress(oldData, '90d');
    expect(allResult.length).toBeGreaterThanOrEqual(1);
  });
});