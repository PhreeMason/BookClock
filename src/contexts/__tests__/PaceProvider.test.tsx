import React from 'react';
import { render } from '@testing-library/react-native';
import { Text, View } from 'react-native';
import { PaceProvider, usePace } from '../PaceProvider';
import { ReadingDeadlineWithProgress } from '@/types/deadline';

// Helper function to create mock deadlines
const createMockDeadline = (
  id: string,
  format: 'physical' | 'ebook' | 'audio',
  totalQuantity: number,
  deadlineDate: string,
  progress: { current_progress: number; created_at: string; updated_at?: string }[]
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

const daysFromNow = (days: number): string => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString();
};

// Test component that uses the pace context
const TestComponent: React.FC = () => {
  const { userPaceData, formatPaceForFormat } = usePace();
  
  return (
    <View>
      <Text testID="user-pace">{userPaceData.averagePace}</Text>
      <Text testID="pace-method">{userPaceData.calculationMethod}</Text>
      <Text testID="pace-reliable">{userPaceData.isReliable.toString()}</Text>
      <Text testID="reading-days">{userPaceData.readingDaysCount}</Text>
      <Text testID="formatted-pace">{formatPaceForFormat(30, 'audio')}</Text>
    </View>
  );
};

// Test component that tests deadline pace status
const DeadlineTestComponent: React.FC<{ deadline: ReadingDeadlineWithProgress }> = ({ deadline }) => {
  const { getDeadlinePaceStatus } = usePace();
  const paceStatus = getDeadlinePaceStatus(deadline);
  
  return (
    <View>
      <Text testID="deadline-user-pace">{paceStatus.userPace}</Text>
      <Text testID="deadline-required-pace">{paceStatus.requiredPace}</Text>
      <Text testID="deadline-status-color">{paceStatus.status.color}</Text>
      <Text testID="deadline-status-level">{paceStatus.status.level}</Text>
      <Text testID="deadline-status-message">{paceStatus.statusMessage}</Text>
      <Text testID="deadline-days-left">{paceStatus.daysLeft}</Text>
      <Text testID="deadline-progress-percentage">{paceStatus.progressPercentage}</Text>
    </View>
  );
};

describe('PaceProvider', () => {
  afterEach(() => {
    // Clean up after each test to prevent leaks
    jest.clearAllTimers();
  });

  afterAll(() => {
    // Ensure all resources are cleaned up
    jest.clearAllTimers();
    jest.clearAllMocks();
    jest.restoreAllMocks();
    jest.useRealTimers();
  });

  describe('User Pace Calculation', () => {
    it('should use Tier 1 calculation with sufficient recent data', () => {
      const deadlines = [
        createMockDeadline('1', 'physical', 300, daysFromNow(10), [
          { current_progress: 30, created_at: daysAgo(6) },
          { current_progress: 60, created_at: daysAgo(4) },
          { current_progress: 100, created_at: daysAgo(2) }
        ])
      ];

      const renderResult = render(
        <PaceProvider deadlines={deadlines}>
          <TestComponent />
        </PaceProvider>
      );
      const { getByTestId } = renderResult;

      // Should use recent data: (30 + 30 + 40) / 3 = 33.33
      expect(getByTestId('user-pace').props.children).toBeCloseTo(33.33, 1);
      expect(getByTestId('pace-method').props.children).toBe('recent_data');
      expect(getByTestId('pace-reliable').props.children).toBe('true');
      expect(getByTestId('reading-days').props.children).toBe(3);
    });

    it('should use Tier 2 fallback with insufficient recent data', () => {
      const deadlines = [
        createMockDeadline('1', 'physical', 300, daysFromNow(10), [
          { current_progress: 50, created_at: daysAgo(5) },
          { current_progress: 80, created_at: daysAgo(3) }
        ])
      ];

      const renderResult = render(
        <PaceProvider deadlines={deadlines}>
          <TestComponent />
        </PaceProvider>
      );
      const { getByTestId } = renderResult;

      expect(getByTestId('user-pace').props.children).toBe(25);
      expect(getByTestId('pace-method').props.children).toBe('default_fallback');
      expect(getByTestId('pace-reliable').props.children).toBe('false');
      expect(getByTestId('reading-days').props.children).toBe(2);
    });

    it('should handle empty deadlines array', () => {
      const { getByTestId } = render(
        <PaceProvider deadlines={[]}>
          <TestComponent />
        </PaceProvider>
      );

      expect(getByTestId('user-pace').props.children).toBe(25);
      expect(getByTestId('pace-method').props.children).toBe('default_fallback');
      expect(getByTestId('pace-reliable').props.children).toBe('false');
      expect(getByTestId('reading-days').props.children).toBe(0);
    });

    it('should combine progress from multiple books including audio conversion', () => {
      const deadlines = [
        createMockDeadline('physical', 'physical', 300, daysFromNow(10), [
          { current_progress: 40, created_at: daysAgo(5) }
        ]),
        createMockDeadline('audio', 'audio', 600, daysFromNow(10), [
          { current_progress: 90, created_at: daysAgo(5) } // 90 minutes = 60 page equivalents
        ])
      ];

      const renderResult = render(
        <PaceProvider deadlines={deadlines}>
          <TestComponent />
        </PaceProvider>
      );
      const { getByTestId } = renderResult;

      // Should combine: 40 pages + 60 page equivalents = 100 total for 1 day = 100 pages/day
      // But since we only have 1 reading day, should fall back to default
      expect(getByTestId('user-pace').props.children).toBe(25);
      expect(getByTestId('pace-method').props.children).toBe('default_fallback');
      expect(getByTestId('reading-days').props.children).toBe(1);
    });
  });

  describe('Deadline Pace Status', () => {
    const mockDeadlines = [
      createMockDeadline('existing', 'physical', 300, daysFromNow(10), [
        { current_progress: 30, created_at: daysAgo(6) },
        { current_progress: 60, created_at: daysAgo(4) },
        { current_progress: 100, created_at: daysAgo(2) }
      ])
    ];

    it('should return green status for achievable pace', () => {
      const deadline = createMockDeadline('test', 'physical', 200, daysFromNow(10), [
        { current_progress: 50, created_at: daysAgo(1) }
      ]);

      const renderResult = render(
        <PaceProvider deadlines={mockDeadlines}>
          <DeadlineTestComponent deadline={deadline} />
        </PaceProvider>
      );
      const { getByTestId } = renderResult;

      // User pace is ~33 pages/day, required pace is (200-50)/10 = 15 pages/day
      expect(getByTestId('deadline-user-pace').props.children).toBeCloseTo(33.33, 1);
      expect(getByTestId('deadline-required-pace').props.children).toBe(15);
      expect(getByTestId('deadline-status-color').props.children).toBe('green');
      expect(getByTestId('deadline-status-level').props.children).toBe('good');
      expect(getByTestId('deadline-days-left').props.children).toBe(10);
    });

    it('should return orange status for challenging but achievable pace', () => {
      const deadline = createMockDeadline('test', 'physical', 300, daysFromNow(5), [
        { current_progress: 50, created_at: daysAgo(1) }
      ]);

      const renderResult = render(
        <PaceProvider deadlines={mockDeadlines}>
          <DeadlineTestComponent deadline={deadline} />
        </PaceProvider>
      );
      const { getByTestId } = renderResult;

      // User pace is ~33 pages/day, required pace is (300-50)/5 = 50 pages/day
      // Increase needed: (50-33)/33 = 51% < 100%, so orange
      expect(getByTestId('deadline-required-pace').props.children).toBe(50);
      expect(getByTestId('deadline-status-color').props.children).toBe('orange');
      expect(getByTestId('deadline-status-level').props.children).toBe('approaching');
    });

    it('should return red status for impossible pace', () => {
      const deadline = createMockDeadline('test', 'physical', 400, daysFromNow(3), [
        { current_progress: 50, created_at: daysAgo(1) }
      ]);

      const renderResult = render(
        <PaceProvider deadlines={mockDeadlines}>
          <DeadlineTestComponent deadline={deadline} />
        </PaceProvider>
      );
      const { getByTestId } = renderResult;

      // User pace is ~33 pages/day, required pace is (400-50)/3 = 117 pages/day
      // Increase needed: (117-33)/33 = 254% > 100%, so red (impossible)
      expect(getByTestId('deadline-required-pace').props.children).toBe(117);
      expect(getByTestId('deadline-status-color').props.children).toBe('red');
      expect(getByTestId('deadline-status-level').props.children).toBe('impossible');
    });

    it('should return red status for overdue deadline', () => {
      const deadline = createMockDeadline('test', 'physical', 200, daysAgo(2), [
        { current_progress: 100, created_at: daysAgo(5) }
      ]);

      const renderResult = render(
        <PaceProvider deadlines={mockDeadlines}>
          <DeadlineTestComponent deadline={deadline} />
        </PaceProvider>
      );
      const { getByTestId } = renderResult;

      expect(getByTestId('deadline-days-left').props.children).toBe(-2);
      expect(getByTestId('deadline-status-color').props.children).toBe('red');
      expect(getByTestId('deadline-status-level').props.children).toBe('overdue');
    });

    it('should return red status for 0% progress with <3 days remaining', () => {
      const deadline = createMockDeadline('test', 'physical', 200, daysFromNow(2), []);

      const renderResult = render(
        <PaceProvider deadlines={mockDeadlines}>
          <DeadlineTestComponent deadline={deadline} />
        </PaceProvider>
      );
      const { getByTestId } = renderResult;

      expect(getByTestId('deadline-progress-percentage').props.children).toBe(0);
      expect(getByTestId('deadline-days-left').props.children).toBe(2);
      expect(getByTestId('deadline-status-color').props.children).toBe('red');
      expect(getByTestId('deadline-status-level').props.children).toBe('impossible');
    });

    it('should handle audio book deadline with proper conversion', () => {
      const deadline = createMockDeadline('audio-test', 'audio', 300, daysFromNow(10), [
        { current_progress: 150, created_at: daysAgo(1) } // 150 minutes progress
      ]);

      const renderResult = render(
        <PaceProvider deadlines={mockDeadlines}>
          <DeadlineTestComponent deadline={deadline} />
        </PaceProvider>
      );
      const { getByTestId } = renderResult;

      // Required pace: (300-150 minutes) / 1.5 / 10 days = 100 page equivalents / 10 = 10 pages/day equivalent
      expect(getByTestId('deadline-required-pace').props.children).toBe(10);
      expect(getByTestId('deadline-status-color').props.children).toBe('green'); // User pace ~33 > required 10
    });
  });

  describe('Utility Functions', () => {
    const mockDeadlines = [
      createMockDeadline('1', 'physical', 300, daysFromNow(10), [
        { current_progress: 30, created_at: daysAgo(6) },
        { current_progress: 60, created_at: daysAgo(4) },
        { current_progress: 100, created_at: daysAgo(2) }
      ])
    ];

    it('should format pace correctly for different formats', () => {
      const { getByTestId } = render(
        <PaceProvider deadlines={mockDeadlines}>
          <TestComponent />
        </PaceProvider>
      );

      // 30 page equivalents * 1.5 = 45 minutes
      expect(getByTestId('formatted-pace').props.children).toBe('45m/day');
    });

    it('should provide reliability information', () => {
      const TestReliabilityComponent: React.FC = () => {
        const { getUserPaceReliability, getUserPaceMethod } = usePace();
        
        return (
          <View>
            <Text testID="reliability">{getUserPaceReliability().toString()}</Text>
            <Text testID="method">{getUserPaceMethod()}</Text>
          </View>
        );
      };

      const renderResult = render(
        <PaceProvider deadlines={mockDeadlines}>
          <TestReliabilityComponent />
        </PaceProvider>
      );
      const { getByTestId } = renderResult;

      expect(getByTestId('reliability').props.children).toBe('true');
      expect(getByTestId('method').props.children).toBe('recent_data');
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid deadline data gracefully', () => {
      const invalidDeadline = {
        ...createMockDeadline('invalid', 'physical', 300, daysFromNow(10), []),
        progress: undefined as any
      };

      const renderResult = render(
        <PaceProvider deadlines={[invalidDeadline]}>
          <DeadlineTestComponent deadline={invalidDeadline} />
        </PaceProvider>
      );
      const { getByTestId } = renderResult;

      // Should not crash and should fall back to defaults
      expect(getByTestId('deadline-user-pace').props.children).toBe(25);
      expect(getByTestId('deadline-status-color').props.children).toBe('orange'); // Invalid progress data results in orange status
    });

    it('should handle deadlines with malformed progress data', () => {
      const deadlineWithBadProgress = createMockDeadline('bad', 'physical', 300, daysFromNow(10), [
        { current_progress: undefined as any, created_at: daysAgo(5) },
        { current_progress: 50, created_at: '' }, // Empty date
      ]);

      const renderResult = render(
        <PaceProvider deadlines={[deadlineWithBadProgress]}>
          <TestComponent />
        </PaceProvider>
      );
      const { getByTestId } = renderResult;

      // Should fall back to default due to insufficient valid data
      expect(getByTestId('user-pace').props.children).toBe(25);
      expect(getByTestId('pace-method').props.children).toBe('default_fallback');
    });
  });

  describe('Provider Integration', () => {
    it('should throw error when used outside provider', () => {
      const TestOutsideProvider = () => {
        try {
          usePace();
          return <Text testID="no-error">No error</Text>;
        } catch (error) {
          return <Text testID="error">{(error as Error).message}</Text>;
        }
      };

      const renderResult = render(<TestOutsideProvider />);
      const { getByTestId } = renderResult;
      
      expect(getByTestId('error').props.children).toBe(
        'usePace must be used within a PaceProvider'
      );
    });

    it('should update when deadlines prop changes', () => {
      const initialDeadlines = [
        createMockDeadline('1', 'physical', 300, daysFromNow(10), [
          { current_progress: 30, created_at: daysAgo(5) }
        ])
      ];

      const updatedDeadlines = [
        createMockDeadline('1', 'physical', 300, daysFromNow(10), [
          { current_progress: 30, created_at: daysAgo(6) },
          { current_progress: 60, created_at: daysAgo(4) },
          { current_progress: 100, created_at: daysAgo(2) }
        ])
      ];

      const renderResult = render(
        <PaceProvider deadlines={initialDeadlines}>
          <TestComponent />
        </PaceProvider>
      );
      const { rerender, getByTestId } = renderResult;

      // Initially should use default (insufficient data)
      expect(getByTestId('pace-method').props.children).toBe('default_fallback');

      // Update with more data
      rerender(
        <PaceProvider deadlines={updatedDeadlines}>
          <TestComponent />
        </PaceProvider>
      );

      // Should now use recent data
      expect(getByTestId('pace-method').props.children).toBe('recent_data');
      expect(getByTestId('reading-days').props.children).toBe(3);
    });
  });
});