import { sampleDeadlines } from '@/__tests__/fixtures/sampleDeadlines';
import { Database } from '@/types/supabase';
import dayjs from 'dayjs';
import { AchievementCalculator, CalculatorContext } from '../achievementCalculator';

type Achievement = Database['public']['Tables']['achievements']['Row'];

describe('AchievementCalculator - Sample Data Tests', () => {
  const createMockAchievement = (id: string, target: number): Achievement => ({
    id,
    title: `Test ${id}`,
    description: `Test achievement for ${target} days`,
    icon: 'test.icon',
    category: 'consistency',
    type: 'streak',
    criteria: { target, type: 'max_streak' } as any,
    color: '#000000',
    sort_order: 100,
    is_active: true,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z'
  });

  const context: CalculatorContext = {
    activeDeadlines: sampleDeadlines,
    userId: 'user_2yqCu9TotmCYVGwIJlnr5XfOMxJ'
  };

  const calculator = new AchievementCalculator(context);

  describe('Sample data streak analysis', () => {
    it('should analyze reading dates from sample data', () => {
      // Extract all reading dates from sample data
      const readingDates = new Set<string>();
      sampleDeadlines.forEach(deadline => {
        if (deadline.progress && deadline.progress.length > 0) {
          deadline.progress.forEach(entry => {
            const date = dayjs(entry.created_at).format('YYYY-MM-DD');
            readingDates.add(date);
          });
        }
      });

      expect(readingDates.size).toBeGreaterThan(0);
    });

    it('should calculate current streak from sample data', () => {
      const achievement = createMockAchievement('consistency_champion', 7);
      const result = calculator.calculateProgress(achievement);
      
      // Log the results for debugging
      
      expect(result.current).toBeGreaterThanOrEqual(0);
      expect(result.max).toBe(7);
      expect(result.percentage).toBeGreaterThanOrEqual(0);
      expect(result.percentage).toBeLessThanOrEqual(100);
    });

    it('should test 25-day streak achievement with sample data', () => {
      const achievement = createMockAchievement('dedicated_reader', 25);
      const result = calculator.calculateProgress(achievement);
      
      expect(result.current).toBeGreaterThanOrEqual(0);
      expect(result.max).toBe(25);
      expect(result.achieved).toBe(result.current >= 25);
    });

    it('should test 50-day streak achievement with sample data', () => {
      const achievement = createMockAchievement('reading_habit_master', 50);
      const result = calculator.calculateProgress(achievement);
      
      expect(result.current).toBeGreaterThanOrEqual(0);
      expect(result.max).toBe(50);
      expect(result.achieved).toBe(result.current >= 50);
    });

    it('should test 100-day streak achievement with sample data', () => {
      const achievement = createMockAchievement('century_reader', 100);
      const result = calculator.calculateProgress(achievement);
      
      expect(result.current).toBeGreaterThanOrEqual(0);
      expect(result.max).toBe(100);
      expect(result.achieved).toBe(result.current >= 100);
    });

    it('should test all streak achievements with sample data', () => {
      const streakAchievements = [
        { id: 'dedicated_reader', target: 25 },
        { id: 'reading_habit_master', target: 50 },
        { id: 'reading_champion', target: 75 },
        { id: 'century_reader', target: 100 },
        { id: 'half_year_scholar', target: 180 },
        { id: 'year_long_scholar', target: 365 },
        { id: 'reading_hero', target: 500 },
        { id: 'reading_myth', target: 750 },
        { id: 'reading_legend', target: 1000 }
      ];

      const results = streakAchievements.map(({ id, target }) => {
        const achievement = createMockAchievement(id, target);
        const result = calculator.calculateProgress(achievement);
        
        return {
          id,
          target,
          current: result.current,
          achieved: result.achieved,
          percentage: result.percentage
        };
      });

      // All results should be valid
      results.forEach(result => {
        expect(result.current).toBeGreaterThanOrEqual(0);
        expect(result.percentage).toBeGreaterThanOrEqual(0);
        expect(result.percentage).toBeLessThanOrEqual(100);
        expect(result.achieved).toBe(result.current >= result.target);
      });

      // Check logical progression - if a higher target is achieved, lower ones should be too
      for (let i = 1; i < results.length; i++) {
        if (results[i].achieved) {
          expect(results[i - 1].achieved).toBe(true);
        }
      }
    });
  });

  describe('Sample data reading activity verification', () => {
    it('should identify reading activity patterns', () => {
      const readingActivity: { [date: string]: number } = {};
      
      sampleDeadlines.forEach(deadline => {
        if (deadline.progress && deadline.progress.length > 0) {
          deadline.progress.forEach(entry => {
            const date = dayjs(entry.created_at).format('YYYY-MM-DD');
            readingActivity[date] = (readingActivity[date] || 0) + 1;
          });
        }
      });

      const activitySummary = Object.entries(readingActivity)
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => a.date.localeCompare(b.date));

      expect(activitySummary.length).toBeGreaterThan(0);
      
      // Verify each day has at least 1 reading activity
      activitySummary.forEach(({ count }) => {
        expect(count).toBeGreaterThanOrEqual(1);
      });
    });

    it('should calculate streak based on sample data dates', () => {
      // Get unique reading dates
      const readingDates = new Set<string>();
      sampleDeadlines.forEach(deadline => {
        if (deadline.progress && deadline.progress.length > 0) {
          deadline.progress.forEach(entry => {
            const date = dayjs(entry.created_at).format('YYYY-MM-DD');
            readingDates.add(date);
          });
        }
      });

      const sortedDates = Array.from(readingDates).sort();
      // Calculate streak manually for verification
      let maxStreak = 0;
      let currentStreak = 0;
      let previousDate: dayjs.Dayjs | null = null;

      for (const dateStr of sortedDates) {
        const currentDate = dayjs(dateStr);
        
        if (previousDate && currentDate.diff(previousDate, 'day') === 1) {
          currentStreak++;
        } else {
          maxStreak = Math.max(maxStreak, currentStreak);
          currentStreak = 1;
        }
        
        previousDate = currentDate;
      }
      maxStreak = Math.max(maxStreak, currentStreak);

      // Test the calculator against our manual calculation
      const achievement = createMockAchievement('dedicated_reader', 25); // Uses maxStreak
      const result = calculator.calculateProgress(achievement);
      
      // The calculator should find the streak we calculated manually
      expect(result.current).toBe(maxStreak);
    });
  });
});