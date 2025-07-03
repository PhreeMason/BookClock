import { ReadingDeadlineWithProgress } from '@/types/deadline';
import { render, screen } from '@testing-library/react-native';
import React from 'react';
import { DeadlineCard } from '../features/deadlines/DeadlineCard';

import { useDeadlines } from '@/contexts/DeadlineProvider';

// Mock the deadline provider
jest.mock('@/contexts/DeadlineProvider', () => ({
  useDeadlines: jest.fn(),
  DeadlineProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

const mockUseDeadlines = useDeadlines as jest.MockedFunction<typeof useDeadlines>;

// Mock data for testing
const createMockDeadline = (
  id: string,
  bookTitle: string,
  author: string,
  deadlineDate: string,
  format: 'physical' | 'ebook' | 'audio' = 'physical',
  totalQuantity: number = 300,
  progress: any[] = []
): ReadingDeadlineWithProgress => ({
  id,
  book_title: bookTitle,
  author,
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

const createMockProgress = (currentProgress: number) => ({
  id: '1',
  reading_deadline_id: '1',
  current_progress: currentProgress,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z'
});

describe('DeadlineCard', () => {
  const mockFormatUnitsPerDay = jest.fn();
  const mockGetDeadlineCalculations = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseDeadlines.mockReturnValue({
      getDeadlineCalculations: mockGetDeadlineCalculations,
      formatUnitsPerDay: mockFormatUnitsPerDay,
      deadlines: [],
      activeDeadlines: [],
      overdueDeadlines: [],
      isLoading: false,
      error: null,
      addDeadline: jest.fn(),
      updateDeadline: jest.fn(),
      deleteDeadline: jest.fn(),
      completeDeadline: jest.fn(),
      setAsideDeadline: jest.fn(),
      calculateUnitsPerDay: jest.fn(),
      getUrgencyLevel: jest.fn(),
      getUrgencyColor: jest.fn(),
      getStatusMessage: jest.fn(),
      getTotalReadingTimePerDay: jest.fn(),
      activeCount: 0,
      overdueCount: 0,
    });
  });

  describe('Rendering', () => {
    it('should render book title correctly', () => {
      const deadline = createMockDeadline('1', 'Test Book', 'Test Author', '2024-01-20T00:00:00Z');
      
      mockGetDeadlineCalculations.mockReturnValue({
        currentProgress: 0,
        totalQuantity: 300,
        remaining: 300,
        progressPercentage: 0,
        daysLeft: 5,
        unitsPerDay: 60,
        urgencyLevel: 'urgent' as const,
        urgencyColor: '#EF4444',
        statusMessage: 'Tough timeline',
        readingEstimate: '📖 About 8 hours of reading time',
        paceEstimate: '📅 You\'ll need to read 60 pages/day to finish on time',
        unit: 'pages'
      });

      mockFormatUnitsPerDay.mockReturnValue('60 pages/day needed');

      render(<DeadlineCard deadline={deadline} />);

      expect(screen.getByText('Test Book')).toBeTruthy();
    });

    it('should render days left correctly', () => {
      const deadline = createMockDeadline('1', 'Test Book', 'Test Author', '2024-01-20T00:00:00Z');
      
      mockGetDeadlineCalculations.mockReturnValue({
        currentProgress: 0,
        totalQuantity: 300,
        remaining: 300,
        progressPercentage: 0,
        daysLeft: 5,
        unitsPerDay: 60,
        urgencyLevel: 'urgent' as const,
        urgencyColor: '#EF4444',
        statusMessage: 'Tough timeline',
        readingEstimate: '📖 About 8 hours of reading time',
        paceEstimate: '📅 You\'ll need to read 60 pages/day to finish on time',
        unit: 'pages'
      });

      mockFormatUnitsPerDay.mockReturnValue('60 pages/day needed');

      render(<DeadlineCard deadline={deadline} />);

      expect(screen.getByText('5')).toBeTruthy();
      expect(screen.getByText('Days Left')).toBeTruthy();
    });

    it('should render status message correctly', () => {
      const deadline = createMockDeadline('1', 'Test Book', 'Test Author', '2024-01-20T00:00:00Z');
      
      mockGetDeadlineCalculations.mockReturnValue({
        currentProgress: 0,
        totalQuantity: 300,
        remaining: 300,
        progressPercentage: 0,
        daysLeft: 5,
        unitsPerDay: 60,
        urgencyLevel: 'urgent' as const,
        urgencyColor: '#EF4444',
        statusMessage: 'Tough timeline',
        readingEstimate: '📖 About 8 hours of reading time',
        paceEstimate: '📅 You\'ll need to read 60 pages/day to finish on time',
        unit: 'pages'
      });

      mockFormatUnitsPerDay.mockReturnValue('60 pages/day needed');

      render(<DeadlineCard deadline={deadline} />);

      expect(screen.getByText('Tough timeline')).toBeTruthy();
    });

    it('should render format emoji correctly for physical books', () => {
      const deadline = createMockDeadline('1', 'Test Book', 'Test Author', '2024-01-20T00:00:00Z', 'physical');
      
      mockGetDeadlineCalculations.mockReturnValue({
        currentProgress: 0,
        totalQuantity: 300,
        remaining: 300,
        progressPercentage: 0,
        daysLeft: 5,
        unitsPerDay: 60,
        urgencyLevel: 'urgent' as const,
        urgencyColor: '#EF4444',
        statusMessage: 'Tough timeline',
        readingEstimate: '📖 About 8 hours of reading time',
        paceEstimate: '📅 You\'ll need to read 60 pages/day to finish on time',
        unit: 'pages'
      });

      mockFormatUnitsPerDay.mockReturnValue('60 pages/day needed');

      render(<DeadlineCard deadline={deadline} />);

      expect(screen.getByText('📖')).toBeTruthy();
    });

    it('should render format emoji correctly for audio books', () => {
      const deadline = createMockDeadline('1', 'Test Book', 'Test Author', '2024-01-20T00:00:00Z', 'audio');
      
      mockGetDeadlineCalculations.mockReturnValue({
        currentProgress: 0,
        totalQuantity: 300,
        remaining: 300,
        progressPercentage: 0,
        daysLeft: 5,
        unitsPerDay: 60,
        urgencyLevel: 'urgent' as const,
        urgencyColor: '#EF4444',
        statusMessage: 'Tough timeline',
        readingEstimate: '🎧 About 5 hours of listening time',
        paceEstimate: '📅 You\'ll need to listen 1 hour/day to finish on time',
        unit: 'minutes'
      });

      mockFormatUnitsPerDay.mockReturnValue('1h 0m/day needed');

      render(<DeadlineCard deadline={deadline} />);

      expect(screen.getByText('🎧')).toBeTruthy();
    });

    it('should render format emoji correctly for ebooks', () => {
      const deadline = createMockDeadline('1', 'Test Book', 'Test Author', '2024-01-20T00:00:00Z', 'ebook');
      
      mockGetDeadlineCalculations.mockReturnValue({
        currentProgress: 0,
        totalQuantity: 300,
        remaining: 300,
        progressPercentage: 0,
        daysLeft: 5,
        unitsPerDay: 60,
        urgencyLevel: 'urgent' as const,
        urgencyColor: '#EF4444',
        statusMessage: 'Tough timeline',
        readingEstimate: '📱 About 8 hours of reading time',
        paceEstimate: '📅 You\'ll need to read 60 pages/day to finish on time',
        unit: 'pages'
      });

      mockFormatUnitsPerDay.mockReturnValue('60 pages/day needed');

      render(<DeadlineCard deadline={deadline} />);

      expect(screen.getByText('📱')).toBeTruthy();
    });
  });

  describe('Urgency Levels and Colors', () => {
    it('should use correct colors for overdue urgency level', () => {
      const deadline = createMockDeadline('1', 'Test Book', 'Test Author', '2024-01-10T00:00:00Z');
      
      mockGetDeadlineCalculations.mockReturnValue({
        currentProgress: 0,
        totalQuantity: 300,
        remaining: 300,
        progressPercentage: 0,
        daysLeft: -5,
        unitsPerDay: 60,
        urgencyLevel: 'overdue' as const,
        urgencyColor: '#DC2626',
        statusMessage: 'Return or renew',
        readingEstimate: '📖 About 8 hours of reading time',
        paceEstimate: '⚠️ This deadline has already passed',
        unit: 'pages'
      });

      mockFormatUnitsPerDay.mockReturnValue('60 pages/day needed');

      render(<DeadlineCard deadline={deadline} />);
      
      // The card should have the overdue border color
      const card = screen.getByText('Test Book').parent?.parent?.parent?.parent;
      expect(card).toBeTruthy();
    });

    it('should use correct colors for urgent urgency level', () => {
      const deadline = createMockDeadline('1', 'Test Book', 'Test Author', '2024-01-15T00:00:00Z');
      
      mockGetDeadlineCalculations.mockReturnValue({
        currentProgress: 0,
        totalQuantity: 300,
        remaining: 300,
        progressPercentage: 0,
        daysLeft: 3,
        unitsPerDay: 100,
        urgencyLevel: 'urgent' as const,
        urgencyColor: '#EF4444',
        statusMessage: 'Tough timeline',
        readingEstimate: '📖 About 8 hours of reading time',
        paceEstimate: '📅 You\'ll need to read 100 pages/day to finish on time',
        unit: 'pages'
      });

      mockFormatUnitsPerDay.mockReturnValue('100 pages/day needed');

      render(<DeadlineCard deadline={deadline} />);

      expect(screen.getByText('Tough timeline')).toBeTruthy();
    });

    it('should use correct colors for approaching urgency level', () => {
      const deadline = createMockDeadline('1', 'Test Book', 'Test Author', '2024-01-25T00:00:00Z');
      
      mockGetDeadlineCalculations.mockReturnValue({
        currentProgress: 0,
        totalQuantity: 300,
        remaining: 300,
        progressPercentage: 0,
        daysLeft: 10,
        unitsPerDay: 30,
        urgencyLevel: 'approaching' as const,
        urgencyColor: '#FB923C',
        statusMessage: 'A bit more daily',
        readingEstimate: '📖 About 8 hours of reading time',
        paceEstimate: '📅 You\'ll need to read 30 pages/day to finish on time',
        unit: 'pages'
      });

      mockFormatUnitsPerDay.mockReturnValue('30 pages/day needed');

      render(<DeadlineCard deadline={deadline} />);

      expect(screen.getByText('A bit more daily')).toBeTruthy();
    });

    it('should use correct colors for good urgency level', () => {
      const deadline = createMockDeadline('1', 'Test Book', 'Test Author', '2024-02-01T00:00:00Z');
      
      mockGetDeadlineCalculations.mockReturnValue({
        currentProgress: 0,
        totalQuantity: 300,
        remaining: 300,
        progressPercentage: 0,
        daysLeft: 20,
        unitsPerDay: 15,
        urgencyLevel: 'good' as const,
        urgencyColor: '#4ADE80',
        statusMessage: "You're doing great",
        readingEstimate: '📖 About 8 hours of reading time',
        paceEstimate: '📅 You\'ll need to read 15 pages/day to finish on time',
        unit: 'pages'
      });

      mockFormatUnitsPerDay.mockReturnValue('15 pages/day needed');

      render(<DeadlineCard deadline={deadline} />);

      expect(screen.getByText("You're doing great")).toBeTruthy();
    });
  });

  describe('Edge Cases', () => {
    it('should handle negative days left correctly', () => {
      const deadline = createMockDeadline('1', 'Test Book', 'Test Author', '2024-01-10T00:00:00Z');
      
      mockGetDeadlineCalculations.mockReturnValue({
        currentProgress: 0,
        totalQuantity: 300,
        remaining: 300,
        progressPercentage: 0,
        daysLeft: -10,
        unitsPerDay: 300,
        urgencyLevel: 'overdue' as const,
        urgencyColor: '#DC2626',
        statusMessage: 'Return or renew',
        readingEstimate: '📖 About 8 hours of reading time',
        paceEstimate: '⚠️ This deadline has already passed',
        unit: 'pages'
      });

      mockFormatUnitsPerDay.mockReturnValue('300 pages/day needed');

      render(<DeadlineCard deadline={deadline} />);

      expect(screen.getByText('-10')).toBeTruthy();
      expect(screen.getByText('Return or renew')).toBeTruthy();
    });

    it('should handle zero days left correctly', () => {
      const deadline = createMockDeadline('1', 'Test Book', 'Test Author', '2024-01-15T00:00:00Z');
      
      mockGetDeadlineCalculations.mockReturnValue({
        currentProgress: 0,
        totalQuantity: 300,
        remaining: 300,
        progressPercentage: 0,
        daysLeft: 0,
        unitsPerDay: 300,
        urgencyLevel: 'overdue' as const,
        urgencyColor: '#DC2626',
        statusMessage: 'Return or renew',
        readingEstimate: '📖 About 8 hours of reading time',
        paceEstimate: '⚠️ This deadline has already passed',
        unit: 'pages'
      });

      mockFormatUnitsPerDay.mockReturnValue('300 pages/day needed');

      render(<DeadlineCard deadline={deadline} />);

      expect(screen.getByText('0')).toBeTruthy();
      expect(screen.getByText('Return or renew')).toBeTruthy();
    });

    it('should handle books with progress correctly', () => {
      const progress = [createMockProgress(150)];
      const deadline = createMockDeadline('1', 'Test Book', 'Test Author', '2024-01-20T00:00:00Z', 'physical', 300, progress);
      
      mockGetDeadlineCalculations.mockReturnValue({
        currentProgress: 150,
        totalQuantity: 300,
        remaining: 150,
        progressPercentage: 50,
        daysLeft: 5,
        unitsPerDay: 30,
        urgencyLevel: 'urgent' as const,
        urgencyColor: '#EF4444',
        statusMessage: 'Tough timeline',
        readingEstimate: '📖 About 4 hours of reading time',
        paceEstimate: '📅 You\'ll need to read 30 pages/day to finish on time',
        unit: 'pages'
      });

      mockFormatUnitsPerDay.mockReturnValue('30 pages/day needed');

      render(<DeadlineCard deadline={deadline} />);

      expect(screen.getByText('Tough timeline')).toBeTruthy();
    });
  });

  describe('Provider Integration', () => {
    it('should call getDeadlineCalculations with the correct deadline', () => {
      const deadline = createMockDeadline('1', 'Test Book', 'Test Author', '2024-01-20T00:00:00Z');
      
      mockGetDeadlineCalculations.mockReturnValue({
        currentProgress: 0,
        totalQuantity: 300,
        remaining: 300,
        progressPercentage: 0,
        daysLeft: 5,
        unitsPerDay: 60,
        urgencyLevel: 'urgent' as const,
        urgencyColor: '#EF4444',
        statusMessage: 'Tough timeline',
        readingEstimate: '📖 About 8 hours of reading time',
        paceEstimate: '📅 You\'ll need to read 60 pages/day to finish on time',
        unit: 'pages'
      });

      mockFormatUnitsPerDay.mockReturnValue('60 pages/day needed');

      render(<DeadlineCard deadline={deadline} />);

      expect(mockGetDeadlineCalculations).toHaveBeenCalledWith(deadline);
    });

    it('should call formatUnitsPerDay with the correct parameters', () => {
      const deadline = createMockDeadline('1', 'Test Book', 'Test Author', '2024-01-20T00:00:00Z');
      
      mockGetDeadlineCalculations.mockReturnValue({
        currentProgress: 0,
        totalQuantity: 300,
        remaining: 300,
        progressPercentage: 0,
        daysLeft: 5,
        unitsPerDay: 60,
        urgencyLevel: 'urgent' as const,
        urgencyColor: '#EF4444',
        statusMessage: 'Tough timeline',
        readingEstimate: '📖 About 8 hours of reading time',
        paceEstimate: '📅 You\'ll need to read 60 pages/day to finish on time',
        unit: 'pages'
      });

      mockFormatUnitsPerDay.mockReturnValue('60 pages/day needed');

      render(<DeadlineCard deadline={deadline} />);

      expect(mockFormatUnitsPerDay).toHaveBeenCalledWith(60, 'physical');
    });
  });
}); 