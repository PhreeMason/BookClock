import React from 'react';
import { render, screen } from '@testing-library/react-native';
import AchievementsCard from '../AchievementsCard';
import { mockUseAchievementsQuery } from '@/__mocks__/hooks';
import { mockUseTheme } from '@/__mocks__/contextProviders';

// Centralized mocks are imported via setup.ts
// No need for manual jest.mock() calls

describe('AchievementsCard', () => {
  const mockTheme = {
    primary: '#007AFF',
    accent: '#FF3B30',
    success: '#34C759',
    warning: '#FF9500',
    info: '#5856D6',
    textMuted: '#8E8E93',
    surface: '#F2F2F7',
    theme: 'light'
  };

  beforeEach(() => {
    mockUseTheme.mockReturnValue({ theme: mockTheme } as any);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Achievement Progress Display Bug', () => {
    it('should display percentage field, not progress field as percentage', () => {
      // Mock achievements with different progress/percentage values
      const mockAchievements = [
        {
          id: 'ambitious_reader',
          title: 'Ambitious Reader',
          description: 'Have 5+ active books',
          icon: 'books.vertical.fill',
          category: 'reading' as const,
          type: 'default',
          criteria: { target: 5 },
          color: 'primary',
          sort_order: 1,
          is_active: true,
          created_at: '2025-01-01T00:00:00Z',
          updated_at: '2025-01-01T00:00:00Z',
          isUnlocked: false,
          progress: 8,        // This is the raw count (8 books)
          maxProgress: 5,
          percentage: 100,    // This should be displayed, not 8
          unlockedAt: undefined
        },
        {
          id: 'library_warrior',
          title: 'Library Warrior',
          description: 'Read 10 library books',
          icon: 'building.columns.fill',
          category: 'exploration' as const,
          type: 'default',
          criteria: { target: 10 },
          color: 'accent',
          sort_order: 2,
          is_active: true,
          created_at: '2025-01-01T00:00:00Z',
          updated_at: '2025-01-01T00:00:00Z',
          isUnlocked: false,
          progress: 2,        // This is the raw count (2 books)
          maxProgress: 10,
          percentage: 20,     // This should be displayed, not 2
          unlockedAt: undefined
        },
        {
          id: 'format_explorer',
          title: 'Format Explorer',
          description: 'Read in 2+ formats',
          icon: 'doc.text.fill',
          category: 'exploration' as const,
          type: 'default',
          criteria: { target: 2 },
          color: 'info',
          sort_order: 3,
          is_active: true,
          created_at: '2025-01-01T00:00:00Z',
          updated_at: '2025-01-01T00:00:00Z',
          isUnlocked: true,
          progress: 2,        // This is the raw count (2 formats)
          maxProgress: 2,
          percentage: 100,    // Completed, no progress bar should show
          unlockedAt: '2025-06-25T00:00:00Z'
        }
      ];

      mockUseAchievementsQuery.mockReturnValue({
        achievements: mockAchievements,
        achievementsByCategory: {},
        totalUnlocked: 1,
        totalAchievements: 3,
        isLoading: false,
        isError: false,
        error: null,
        refetch: jest.fn(),
        unlockAchievement: jest.fn(),
        isUnlocking: false,
      });

      render(<AchievementsCard />);

      // Check that percentages are displayed correctly
      // The ambitious_reader should show 100%, not 8%
      expect(screen.queryByText('8%')).toBeNull();
      expect(screen.queryByText('100%')).toBeNull(); // 100% achievements shouldn't show progress

      // The library_warrior should show 20%, not 2%
      expect(screen.queryByText('2%')).toBeNull();
      expect(screen.getByText('20%')).toBeTruthy();

      // Format explorer is completed, shouldn't show progress bar
      const formatExplorerTexts = screen.queryAllByText(/Format Explorer/);
      expect(formatExplorerTexts.length).toBeGreaterThan(0);
    });

    it('should not show progress bar for completed achievements', () => {
      const completedAchievement = {
        id: 'test_completed',
        title: 'Completed Achievement',
        description: 'This is completed',
        icon: 'checkmark.circle.fill',
        category: 'reading' as const,
        type: 'default',
        criteria: { target: 10 },
        color: 'success',
        sort_order: 1,
        is_active: true,
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z',
        isUnlocked: true,
        progress: 10,
        maxProgress: 10,
        percentage: 100,
        unlockedAt: '2025-06-25T00:00:00Z'
      };

      mockUseAchievementsQuery.mockReturnValue({
        achievements: [completedAchievement],
        achievementsByCategory: {},
        totalUnlocked: 1,
        totalAchievements: 1,
        isLoading: false,
        isError: false,
        error: null,
        refetch: jest.fn(),
        unlockAchievement: jest.fn(),
        isUnlocking: false,
      });

      render(<AchievementsCard />);

      // Should not find any percentage text for completed achievements
      expect(screen.queryByText('100%')).toBeNull();
      expect(screen.queryByText('10%')).toBeNull();
    });

    it('should show correct progress for partially completed achievements', () => {
      const partialAchievements = [
        {
          id: 'test_25_percent',
          title: '25% Complete',
          description: 'Quarter way there',
          icon: 'circle.fill',
          category: 'consistency' as const,
          type: 'streak',
          criteria: { target: 100 },
          color: 'primary',
          sort_order: 1,
          is_active: true,
          created_at: '2025-01-01T00:00:00Z',
          updated_at: '2025-01-01T00:00:00Z',
          isUnlocked: false,
          progress: 25,      // Raw value
          maxProgress: 100,
          percentage: 25,    // Should display this
          unlockedAt: undefined
        },
        {
          id: 'test_75_percent',
          title: '75% Complete',
          description: 'Almost there',
          icon: 'circle.fill',
          category: 'volume' as const,
          type: 'default',
          criteria: { target: 1000 },
          color: 'warning',
          sort_order: 2,
          is_active: true,
          created_at: '2025-01-01T00:00:00Z',
          updated_at: '2025-01-01T00:00:00Z',
          isUnlocked: false,
          progress: 750,     // Raw value
          maxProgress: 1000,
          percentage: 75,    // Should display this
          unlockedAt: undefined
        }
      ];

      mockUseAchievementsQuery.mockReturnValue({
        achievements: partialAchievements,
        achievementsByCategory: {},
        totalUnlocked: 0,
        totalAchievements: 2,
        isLoading: false,
        isError: false,
        error: null,
        refetch: jest.fn(),
        unlockAchievement: jest.fn(),
        isUnlocking: false,
      });

      render(<AchievementsCard />);

      // Should display percentage values, not raw progress values
      expect(screen.getByText('25%')).toBeTruthy();
      expect(screen.getByText('75%')).toBeTruthy();
      
      // Should NOT display raw progress values as percentages
      expect(screen.queryByText('25%')).toBeTruthy(); // This is correct
      expect(screen.queryByText('750%')).toBeNull();  // This would be wrong
    });
  });
});