import { separateDeadlines, calculateDaysLeft } from '../deadlineUtils';
import { ReadingDeadlineWithProgress } from '@/types/deadline';
import { isDateBefore, calculateDaysLeft as calculateDaysLeftUtil } from '../dateUtils';

// Mock the dateUtils functions
jest.mock('../dateUtils', () => ({
  isDateBefore: jest.fn(),
  calculateDaysLeft: jest.fn()
}));

const mockIsDateBefore = isDateBefore as jest.MockedFunction<typeof isDateBefore>;
const mockCalculateDaysLeftUtil = calculateDaysLeftUtil as jest.MockedFunction<typeof calculateDaysLeftUtil>;

const createMockDeadline = (
  id: string, 
  deadline_date: string, 
  status?: { status: 'reading' | 'complete' | 'set_aside'; created_at: string; id: number; reading_deadline_id: string | null }[]
): ReadingDeadlineWithProgress => ({
  id,
  user_id: 'user1',
  book_title: `Book ${id}`,
  author: 'Test Author',
  deadline_date,
  total_quantity: 300,
  format: 'physical' as const,
  source: 'personal' as const,
  flexibility: 'flexible' as const,
  created_at: '2024-03-01T00:00:00.000Z',
  updated_at: '2024-03-01T00:00:00.000Z',
  progress: [],
  status
});

describe('deadlineUtils date handling', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('separateDeadlines', () => {

    it('should separate active, overdue, and completed deadlines correctly', () => {
      const deadlines = [
        // Active deadline (not overdue)
        createMockDeadline('1', '2024-03-20T00:00:00.000Z'),
        
        // Overdue deadline
        createMockDeadline('2', '2024-03-10T00:00:00.000Z'),
        
        // Completed deadline
        createMockDeadline('3', '2024-03-15T00:00:00.000Z', [
          { status: 'reading', created_at: '2024-03-01T00:00:00.000Z', id: 1, reading_deadline_id: '3' },
          { status: 'complete', created_at: '2024-03-14T00:00:00.000Z', id: 2, reading_deadline_id: '3' }
        ]),
        
        // Set aside deadline
        createMockDeadline('4', '2024-03-25T00:00:00.000Z', [
          { status: 'reading', created_at: '2024-03-01T00:00:00.000Z', id: 3, reading_deadline_id: '4' },
          { status: 'set_aside', created_at: '2024-03-10T00:00:00.000Z', id: 4, reading_deadline_id: '4' }
        ])
      ];

      // Mock date comparisons
      mockIsDateBefore
        .mockReturnValueOnce(false) // deadline 1 is not overdue
        .mockReturnValueOnce(true)  // deadline 2 is overdue
        .mockReturnValueOnce(false) // deadline 3 not checked (completed)
        .mockReturnValueOnce(false); // deadline 4 not checked (set aside)

      const result = separateDeadlines(deadlines);

      expect(result.active).toHaveLength(1);
      expect(result.active[0].id).toBe('1');

      expect(result.overdue).toHaveLength(1);
      expect(result.overdue[0].id).toBe('2');

      expect(result.completed).toHaveLength(2);
      expect(result.completed.map(d => d.id)).toContain('3');
      expect(result.completed.map(d => d.id)).toContain('4');
    });

    it('should handle deadlines without status array', () => {
      const deadlines = [
        createMockDeadline('1', '2024-03-20T00:00:00.000Z'), // No status
        createMockDeadline('2', '2024-03-10T00:00:00.000Z')  // No status
      ];

      mockIsDateBefore
        .mockReturnValueOnce(false) // not overdue
        .mockReturnValueOnce(true); // overdue

      const result = separateDeadlines(deadlines);

      expect(result.active).toHaveLength(1);
      expect(result.overdue).toHaveLength(1);
      expect(result.completed).toHaveLength(0);
    });

    it('should handle empty status array', () => {
      const deadlines = [
        createMockDeadline('1', '2024-03-20T00:00:00.000Z', [])
      ];

      mockIsDateBefore.mockReturnValueOnce(false);

      const result = separateDeadlines(deadlines);

      expect(result.active).toHaveLength(1);
      expect(result.completed).toHaveLength(0);
    });

    it('should use latest status when multiple status entries exist', () => {
      const deadline = createMockDeadline('1', '2024-03-20T00:00:00.000Z', [
        { status: 'reading', created_at: '2024-03-01T00:00:00.000Z', id: 1, reading_deadline_id: '1' },
        { status: 'set_aside', created_at: '2024-03-05T00:00:00.000Z', id: 2, reading_deadline_id: '1' },
        { status: 'reading', created_at: '2024-03-10T00:00:00.000Z', id: 3, reading_deadline_id: '1' }, // Latest status
      ]);

      mockIsDateBefore.mockReturnValueOnce(false);

      const result = separateDeadlines([deadline]);

      // Should be active because latest status is 'reading'
      expect(result.active).toHaveLength(1);
      expect(result.completed).toHaveLength(0);
    });
  });

  describe('calculateDaysLeft', () => {
    it('should delegate to dateUtils calculateDaysLeft', () => {
      const testDate = '2024-03-20T00:00:00.000Z';
      const expectedDays = 5;

      mockCalculateDaysLeftUtil.mockReturnValue(expectedDays);

      const result = calculateDaysLeft(testDate);

      expect(mockCalculateDaysLeftUtil).toHaveBeenCalledWith(testDate);
      expect(result).toBe(expectedDays);
    });

    it('should handle negative days for overdue deadlines', () => {
      const overdueDate = '2024-03-10T00:00:00.000Z';
      const expectedDays = -5;

      mockCalculateDaysLeftUtil.mockReturnValue(expectedDays);

      const result = calculateDaysLeft(overdueDate);

      expect(result).toBe(expectedDays);
    });
  });

  describe('integration with real dateUtils', () => {
    // These tests use the real dateUtils functions
    beforeEach(() => {
      jest.unmock('../dateUtils');
      jest.resetModules();
    });

    it('should properly categorize deadlines based on real date comparisons', async () => {
      // Re-import with real functions
      const { separateDeadlines: realSeparateDeadlines } = await import('../deadlineUtils');
      
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2024-03-15T12:00:00.000Z'));

      const deadlines = [
        createMockDeadline('future', '2024-03-20T00:00:00.000Z'),
        createMockDeadline('past', '2024-03-10T00:00:00.000Z'),
        createMockDeadline('today', '2024-03-15T18:00:00.000Z'),
      ];

      const result = realSeparateDeadlines(deadlines);

      expect(result.active).toHaveLength(2); // future and today
      expect(result.overdue).toHaveLength(1); // past
      expect(result.completed).toHaveLength(0);

      jest.useRealTimers();
    });
  });

  describe('timezone consistency', () => {
    it('should handle timezone edge cases in deadline separation', () => {
      const deadline = createMockDeadline('edge', '2024-03-15T04:00:00.000Z'); // Early morning UTC

      // Mock as not overdue
      mockIsDateBefore.mockReturnValue(false);

      const result = separateDeadlines([deadline]);

      expect(result.active).toHaveLength(1);
      expect(mockIsDateBefore).toHaveBeenCalledWith(deadline.deadline_date);
    });
  });
});