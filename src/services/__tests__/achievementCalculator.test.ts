import { AchievementCalculator, CalculatorContext } from '../achievementCalculator';
import { Database } from '@/types/supabase';
import dayjs from 'dayjs';

type Achievement = Database['public']['Tables']['achievements']['Row'];

describe('AchievementCalculator - Streak Achievements', () => {
  const createMockContext = (readingDates: string[]): CalculatorContext => {
    const deadlines = readingDates.map((date, index) => ({
      id: `deadline_${index}`,
      progress: [{
        id: `progress_${index}`,
        created_at: `${date}T12:00:00Z`,
        updated_at: `${date}T12:00:00Z`,
        current_progress: 10 + index,
        reading_deadline_id: `deadline_${index}`
      }]
    }));

    return {
      activeDeadlines: deadlines,
      userId: 'test-user'
    };
  };

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

  describe('25-day streak (dedicated_reader)', () => {
    it('should achieve 25-day streak achievement', () => {
      // Create 25 consecutive days of reading
      const readingDates = Array.from({ length: 25 }, (_, i) => 
        dayjs().subtract(24 - i, 'day').format('YYYY-MM-DD')
      );
      
      const context = createMockContext(readingDates);
      const calculator = new AchievementCalculator(context);
      const achievement = createMockAchievement('dedicated_reader', 25);
      
      const result = calculator.calculateProgress(achievement);
      
      expect(result.achieved).toBe(true);
      expect(result.current).toBe(25);
      expect(result.max).toBe(25);
      expect(result.percentage).toBe(100);
    });

    it('should not achieve 25-day streak with 24 days', () => {
      const readingDates = Array.from({ length: 24 }, (_, i) => 
        dayjs().subtract(23 - i, 'day').format('YYYY-MM-DD')
      );
      
      const context = createMockContext(readingDates);
      const calculator = new AchievementCalculator(context);
      const achievement = createMockAchievement('dedicated_reader', 25);
      
      const result = calculator.calculateProgress(achievement);
      
      expect(result.achieved).toBe(false);
      expect(result.current).toBe(24);
      expect(result.percentage).toBe(96);
    });
  });

  describe('50-day streak (reading_habit_master)', () => {
    it('should achieve 50-day streak achievement', () => {
      const readingDates = Array.from({ length: 50 }, (_, i) => 
        dayjs().subtract(49 - i, 'day').format('YYYY-MM-DD')
      );
      
      const context = createMockContext(readingDates);
      const calculator = new AchievementCalculator(context);
      const achievement = createMockAchievement('reading_habit_master', 50);
      
      const result = calculator.calculateProgress(achievement);
      
      expect(result.achieved).toBe(true);
      expect(result.current).toBe(50);
      expect(result.max).toBe(50);
      expect(result.percentage).toBe(100);
    });
  });

  describe('75-day streak (reading_champion)', () => {
    it('should achieve 75-day streak achievement', () => {
      const readingDates = Array.from({ length: 75 }, (_, i) => 
        dayjs().subtract(74 - i, 'day').format('YYYY-MM-DD')
      );
      
      const context = createMockContext(readingDates);
      const calculator = new AchievementCalculator(context);
      const achievement = createMockAchievement('reading_champion', 75);
      
      const result = calculator.calculateProgress(achievement);
      
      expect(result.achieved).toBe(true);
      expect(result.current).toBe(75);
      expect(result.max).toBe(75);
      expect(result.percentage).toBe(100);
    });
  });

  describe('100-day streak (century_reader)', () => {
    it('should achieve 100-day streak achievement', () => {
      const readingDates = Array.from({ length: 100 }, (_, i) => 
        dayjs().subtract(99 - i, 'day').format('YYYY-MM-DD')
      );
      
      const context = createMockContext(readingDates);
      const calculator = new AchievementCalculator(context);
      const achievement = createMockAchievement('century_reader', 100);
      
      const result = calculator.calculateProgress(achievement);
      
      expect(result.achieved).toBe(true);
      expect(result.current).toBe(100);
      expect(result.max).toBe(100);
      expect(result.percentage).toBe(100);
    });
  });

  describe('365-day streak (year_long_scholar)', () => {
    it('should achieve 365-day streak achievement', () => {
      const readingDates = Array.from({ length: 365 }, (_, i) => 
        dayjs().subtract(364 - i, 'day').format('YYYY-MM-DD')
      );
      
      const context = createMockContext(readingDates);
      const calculator = new AchievementCalculator(context);
      const achievement = createMockAchievement('year_long_scholar', 365);
      
      const result = calculator.calculateProgress(achievement);
      
      expect(result.achieved).toBe(true);
      expect(result.current).toBe(365);
      expect(result.max).toBe(365);
      expect(result.percentage).toBe(100);
    });

    it('should show progress toward 365-day streak', () => {
      const readingDates = Array.from({ length: 200 }, (_, i) => 
        dayjs().subtract(199 - i, 'day').format('YYYY-MM-DD')
      );
      
      const context = createMockContext(readingDates);
      const calculator = new AchievementCalculator(context);
      const achievement = createMockAchievement('year_long_scholar', 365);
      
      const result = calculator.calculateProgress(achievement);
      
      expect(result.achieved).toBe(false);
      expect(result.current).toBe(200);
      expect(result.max).toBe(365);
      expect(result.percentage).toBeCloseTo(54.79, 1);
    });
  });

  describe('1000-day streak (reading_legend)', () => {
    it('should achieve 1000-day streak achievement', () => {
      const readingDates = Array.from({ length: 1000 }, (_, i) => 
        dayjs().subtract(999 - i, 'day').format('YYYY-MM-DD')
      );
      
      const context = createMockContext(readingDates);
      const calculator = new AchievementCalculator(context);
      const achievement = createMockAchievement('reading_legend', 1000);
      
      const result = calculator.calculateProgress(achievement);
      
      expect(result.achieved).toBe(true);
      expect(result.current).toBe(1000);
      expect(result.max).toBe(1000);
      expect(result.percentage).toBe(100);
    });
  });

  describe('Streak calculation edge cases', () => {
    it('should handle gaps in reading dates correctly', () => {
      // 10 days, then gap, then 5 days - should only count current 5-day streak
      const recentDates = Array.from({ length: 5 }, (_, i) => 
        dayjs().subtract(4 - i, 'day').format('YYYY-MM-DD')
      );
      const olderDates = Array.from({ length: 10 }, (_, i) => 
        dayjs().subtract(20 - i, 'day').format('YYYY-MM-DD')
      );
      
      const context = createMockContext([...recentDates, ...olderDates]);
      const calculator = new AchievementCalculator(context);
      const achievement = createMockAchievement('dedicated_reader', 25);
      
      const result = calculator.calculateProgress(achievement);
      
      // Should recognize the max historical streak of 10, not current streak of 5
      expect(result.current).toBe(10); // Uses maxStreak for achievement progress
      expect(result.achieved).toBe(false);
    });

    it('should handle single day reading', () => {
      const readingDates = [dayjs().format('YYYY-MM-DD')];
      
      const context = createMockContext(readingDates);
      const calculator = new AchievementCalculator(context);
      const achievement = createMockAchievement('dedicated_reader', 25);
      
      const result = calculator.calculateProgress(achievement);
      
      expect(result.current).toBe(1);
      expect(result.achieved).toBe(false);
      expect(result.percentage).toBe(4);
    });

    it('should handle no reading data', () => {
      const context = createMockContext([]);
      const calculator = new AchievementCalculator(context);
      const achievement = createMockAchievement('dedicated_reader', 25);
      
      const result = calculator.calculateProgress(achievement);
      
      expect(result.current).toBe(0);
      expect(result.achieved).toBe(false);
      expect(result.percentage).toBe(0);
    });

    it('should handle multiple progress entries per day correctly', () => {
      const today = dayjs().format('YYYY-MM-DD');
      const context: CalculatorContext = {
        activeDeadlines: [{
          id: 'test-deadline',
          progress: [
            {
              id: 'progress-1',
              created_at: `${today}T08:00:00Z`,
              updated_at: `${today}T08:00:00Z`,
              current_progress: 10,
              reading_deadline_id: 'test-deadline'
            },
            {
              id: 'progress-2',
              created_at: `${today}T20:00:00Z`,
              updated_at: `${today}T20:00:00Z`,
              current_progress: 20,
              reading_deadline_id: 'test-deadline'
            }
          ]
        }],
        userId: 'test-user'
      };
      
      const calculator = new AchievementCalculator(context);
      const achievement = createMockAchievement('dedicated_reader', 25);
      
      const result = calculator.calculateProgress(achievement);
      
      // Should count as 1 day of reading, not 2
      expect(result.current).toBe(1);
    });
  });

  describe('All streak achievements', () => {
    it('should correctly identify achievement levels for different streak lengths', () => {
      const testCases = [
        { days: 25, achievements: ['dedicated_reader'] },
        { days: 50, achievements: ['dedicated_reader', 'reading_habit_master'] },
        { days: 75, achievements: ['dedicated_reader', 'reading_habit_master', 'reading_champion'] },
        { days: 100, achievements: ['dedicated_reader', 'reading_habit_master', 'reading_champion', 'century_reader'] },
        { days: 180, achievements: ['dedicated_reader', 'reading_habit_master', 'reading_champion', 'century_reader', 'half_year_scholar'] },
        { days: 365, achievements: ['dedicated_reader', 'reading_habit_master', 'reading_champion', 'century_reader', 'half_year_scholar', 'year_long_scholar'] },
        { days: 1000, achievements: ['dedicated_reader', 'reading_habit_master', 'reading_champion', 'century_reader', 'half_year_scholar', 'year_long_scholar', 'reading_hero', 'reading_myth', 'reading_legend'] }
      ];

      testCases.forEach(({ days, achievements }) => {
        const readingDates = Array.from({ length: days }, (_, i) => 
          dayjs().subtract(days - 1 - i, 'day').format('YYYY-MM-DD')
        );
        
        const context = createMockContext(readingDates);
        const calculator = new AchievementCalculator(context);
        
        // Test each achievement that should be unlocked
        achievements.forEach(achievementId => {
          const targets = {
            'dedicated_reader': 25,
            'reading_habit_master': 50,
            'reading_champion': 75,
            'century_reader': 100,
            'half_year_scholar': 180,
            'year_long_scholar': 365,
            'reading_hero': 500,
            'reading_myth': 750,
            'reading_legend': 1000
          };
          
          const achievement = createMockAchievement(achievementId, targets[achievementId as keyof typeof targets]);
          const result = calculator.calculateProgress(achievement);
          
          expect(result.achieved).toBe(true);
        });
      });
    });
  });
});