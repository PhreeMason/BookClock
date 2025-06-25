import { palette } from '@/constants/palette';
import { useAddDeadline, useGetDeadlines } from '@/hooks/useDeadlines';
import {
    calculateCurrentProgress,
    calculateRemaining,
    calculateTotalQuantity,
    getPaceEstimate,
    getReadingEstimate
} from '@/lib/deadlineCalculations';
import { calculateDaysLeft, calculateProgress, calculateProgressPercentage, getTotalReadingTimePerDay, getUnitForFormat, separateDeadlines } from '@/lib/deadlineUtils';
import { ReadingDeadlineInsert, ReadingDeadlineProgressInsert, ReadingDeadlineWithProgress } from '@/types/deadline';
import React, { createContext, ReactNode, useContext } from 'react';

interface DeadlineContextType {
  // Data
  deadlines: ReadingDeadlineWithProgress[];
  activeDeadlines: ReadingDeadlineWithProgress[];
  overdueDeadlines: ReadingDeadlineWithProgress[];
  isLoading: boolean;
  error: Error | null;
  
  // Actions
  addDeadline: (params: {
    deadlineDetails: Omit<ReadingDeadlineInsert, 'user_id'>;
    progressDetails: ReadingDeadlineProgressInsert;
  }, onSuccess?: () => void, onError?: (error: Error) => void) => void;
  
  // Calculations for individual deadlines
  getDeadlineCalculations: (deadline: ReadingDeadlineWithProgress) => {
    currentProgress: number;
    totalQuantity: number;
    remaining: number;
    progressPercentage: number;
    daysLeft: number;
    unitsPerDay: number;
    urgencyLevel: 'overdue' | 'urgent' | 'good' | 'approaching';
    urgencyColor: string;
    statusMessage: string;
    readingEstimate: string;
    paceEstimate: string;
    unit: string;
  };
  
  // Utility functions
  calculateUnitsPerDay: (totalQuantity: number, currentProgress: number, daysLeft: number, format: 'physical' | 'ebook' | 'audio') => number;
  getUrgencyLevel: (daysLeft: number) => 'overdue' | 'urgent' | 'good' | 'approaching';
  getUrgencyColor: (urgencyLevel: string) => string;
  getStatusMessage: (urgencyLevel: string) => string;
  formatUnitsPerDay: (units: number, format: 'physical' | 'ebook' | 'audio') => string;
  
  // Counts
  activeCount: number;
  overdueCount: number;
  
  // Summary calculations
  getTotalReadingTimePerDay: () => string;
}

const DeadlineContext = createContext<DeadlineContextType | undefined>(undefined);

interface DeadlineProviderProps {
  children: ReactNode;
}

export const DeadlineProvider: React.FC<DeadlineProviderProps> = ({ children }) => {
  const { data: deadlines = [], error, isLoading } = useGetDeadlines();
  const { mutate: addDeadlineMutation } = useAddDeadline();
  
  // Separate deadlines by active and overdue status
  const { active: activeDeadlines, overdue: overdueDeadlines } = separateDeadlines(deadlines);
  
  // Calculate units per day needed based on format
  const calculateUnitsPerDay = (
    totalQuantity: number, 
    currentProgress: number, 
    daysLeft: number, 
    format: 'physical' | 'ebook' | 'audio'
  ): number => {
    const total = calculateTotalQuantity(format, totalQuantity);
    const current = calculateCurrentProgress(format, currentProgress);
    const remaining = total - current;
    
    if (daysLeft <= 0) return remaining;
    return Math.ceil(remaining / daysLeft);
  };

  // Get color coding based on urgency
  const getUrgencyLevel = (daysLeft: number): 'overdue' | 'urgent' | 'good' | 'approaching' => {
    if (daysLeft <= 0) return 'overdue';
    if (daysLeft <= 7) return 'urgent';
    if (daysLeft <= 14) return 'approaching';
    return 'good';
  };

  const getUrgencyColor = (urgencyLevel: string): string => {
    switch (urgencyLevel) {
      case 'overdue': return palette.red[300];
      case 'urgent': return palette.red.DEFAULT;
      case 'good': return palette.green.DEFAULT;
      case 'approaching': return palette.orange.DEFAULT;
      default: return palette.celadon.DEFAULT;
    }
  };

  const getStatusMessage = (urgencyLevel: string): string => {
    if (urgencyLevel === 'overdue') return 'Return or renew';
    if (urgencyLevel === 'urgent') return 'Tough timeline';
    if (urgencyLevel === 'good') return "You're doing great";
    if (urgencyLevel === 'approaching') return 'A bit more daily';
    return 'Good';
  };

  // Format the units per day display based on format
  const formatUnitsPerDay = (units: number, format: 'physical' | 'ebook' | 'audio'): string => {
    if (format === 'audio') {
      const hours = Math.floor(units / 60);
      const minutes = units % 60;
      if (hours > 0) {
        return `${hours}h ${minutes}m/day needed`;
      }
      return `${minutes} minutes/day needed`;
    }
    const unit = getUnitForFormat(format);
    return `${units} ${unit}/day needed`;
  };

  // Comprehensive calculations for a single deadline
  const getDeadlineCalculations = (deadline: ReadingDeadlineWithProgress) => {
    const currentProgress = calculateProgress(deadline);
    const totalQuantity = calculateTotalQuantity(deadline.format, deadline.total_quantity);
    const remaining = calculateRemaining(
      deadline.format,
      deadline.total_quantity,
      undefined,
      currentProgress,
      undefined
    );
    const progressPercentage = calculateProgressPercentage(deadline);
    const daysLeft = calculateDaysLeft(deadline.deadline_date);
    const unitsPerDay = calculateUnitsPerDay(deadline.total_quantity, currentProgress, daysLeft, deadline.format);
    const urgencyLevel = getUrgencyLevel(daysLeft);
    const urgencyColor = getUrgencyColor(urgencyLevel);
    const statusMessage = getStatusMessage(urgencyLevel);
    const readingEstimate = getReadingEstimate(deadline.format, remaining);
    const paceEstimate = getPaceEstimate(deadline.format, new Date(deadline.deadline_date), remaining);
    const unit = getUnitForFormat(deadline.format);

    return {
      currentProgress,
      totalQuantity,
      remaining,
      progressPercentage,
      daysLeft,
      unitsPerDay,
      urgencyLevel,
      urgencyColor,
      statusMessage,
      readingEstimate,
      paceEstimate,
      unit
    };
  };

  const addDeadline = (params: {
    deadlineDetails: Omit<ReadingDeadlineInsert, 'user_id'>;
    progressDetails: ReadingDeadlineProgressInsert;
  }, onSuccess?: () => void, onError?: (error: Error) => void) => {
    addDeadlineMutation(params, {
      onSuccess: () => {
        onSuccess?.();
      },
      onError: (error) => {
        console.error("Error adding deadline:", error);
        onError?.(error);
      }
    });
  };

  const value: DeadlineContextType = {
    // Data
    deadlines,
    activeDeadlines,
    overdueDeadlines,
    isLoading,
    error,
    
    // Actions
    addDeadline,
    
    // Calculations
    getDeadlineCalculations,
    
    // Utility functions
    calculateUnitsPerDay,
    getUrgencyLevel,
    getUrgencyColor,
    getStatusMessage,
    formatUnitsPerDay,
    
    // Counts
    activeCount: activeDeadlines.length,
    overdueCount: overdueDeadlines.length,
    
    // Summary calculations
    getTotalReadingTimePerDay: () => {
      return getTotalReadingTimePerDay(activeDeadlines, getDeadlineCalculations);
    },
  };

  return (
    <DeadlineContext.Provider value={value}>
      {children}
    </DeadlineContext.Provider>
  );
};

export const useDeadlines = (): DeadlineContextType => {
  const context = useContext(DeadlineContext);
  if (context === undefined) {
    throw new Error('useDeadlines must be used within a DeadlineProvider');
  }
  return context;
}; 