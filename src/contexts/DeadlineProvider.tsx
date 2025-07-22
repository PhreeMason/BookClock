import { useAddDeadline, useCompleteDeadline, useDeleteDeadline, useGetDeadlines, useSetAsideDeadline, useUpdateDeadline } from '@/hooks/useDeadlines';
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
import { PaceProvider, usePace } from './PaceProvider';

interface DeadlineContextType {
  // Data
  deadlines: ReadingDeadlineWithProgress[];
  activeDeadlines: ReadingDeadlineWithProgress[];
  overdueDeadlines: ReadingDeadlineWithProgress[];
  completedDeadlines: ReadingDeadlineWithProgress[];
  isLoading: boolean;
  error: Error | null;
  
  // Actions
  addDeadline: (params: {
    deadlineDetails: Omit<ReadingDeadlineInsert, 'user_id'>;
    progressDetails: ReadingDeadlineProgressInsert;
  }, onSuccess?: () => void, onError?: (error: Error) => void) => void;
  updateDeadline: (params: {
    deadlineDetails: ReadingDeadlineInsert;
    progressDetails: ReadingDeadlineProgressInsert;
  }, onSuccess?: () => void, onError?: (error: Error) => void) => void;
  deleteDeadline: (deadlineId: string, onSuccess?: () => void, onError?: (error: Error) => void) => void;
  completeDeadline: (deadlineId: string, onSuccess?: () => void, onError?: (error: Error) => void) => void;
  setAsideDeadline: (deadlineId: string, onSuccess?: () => void, onError?: (error: Error) => void) => void;
  
  // Calculations for individual deadlines (updated with pace-based logic)
  getDeadlineCalculations: (deadline: ReadingDeadlineWithProgress) => {
    currentProgress: number;
    totalQuantity: number;
    remaining: number;
    progressPercentage: number;
    daysLeft: number;
    unitsPerDay: number;
    urgencyLevel: 'overdue' | 'urgent' | 'good' | 'approaching' | 'impossible';
    urgencyColor: string;
    statusMessage: string;
    readingEstimate: string;
    paceEstimate: string;
    unit: string;
    // New pace-based fields
    userPace: number;
    requiredPace: number;
    paceStatus: 'green' | 'orange' | 'red';
    paceMessage: string;
  };

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

// Internal component that needs pace context
const DeadlineProviderInternal: React.FC<DeadlineProviderProps> = ({ children }) => {
  const { data: deadlines = [], error, isLoading } = useGetDeadlines();
  const { mutate: addDeadlineMutation } = useAddDeadline();
  const { mutate: updateDeadlineMutation } = useUpdateDeadline();
  const { mutate: deleteDeadlineMutation } = useDeleteDeadline();
  const { mutate: completeDeadlineMutation } = useCompleteDeadline();
  const { mutate: setAsideDeadlineMutation } = useSetAsideDeadline();
  
  // Access pace calculations
  const { getDeadlinePaceStatus } = usePace();
  
  // Separate deadlines by active and overdue status
  const { active: activeDeadlines, overdue: overdueDeadlines, completed: completedDeadlines } = separateDeadlines(deadlines);
  
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

  // Format the units per day display based on format
  const formatUnitsPerDay = (units: number, format: 'physical' | 'ebook' | 'audio'): string => {
    if (format === 'audio') {
      const hours = Math.floor(units / 60);
      const minutes = units % 60;
      if (hours > 0) {
        return minutes > 0 ? `${hours}h ${minutes}m/day needed` : `${hours}h/day needed`;
      }
      return `${minutes} minutes/day needed`;
    }
    const unit = getUnitForFormat(format);
    return `${units} ${unit}/day needed`;
  };

  // Comprehensive calculations for a single deadline (enhanced with pace-based logic)
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
    const readingEstimate = getReadingEstimate(deadline.format, remaining);
    const paceEstimate = getPaceEstimate(deadline.format, new Date(deadline.deadline_date), remaining);
    const unit = getUnitForFormat(deadline.format);

    // Get pace-based calculations
    const paceData = getDeadlinePaceStatus(deadline);
    
    // Map pace status to urgency level for backward compatibility
    const paceToUrgencyMap: Record<string, 'overdue' | 'urgent' | 'good' | 'approaching' | 'impossible'> = {
      'overdue': 'overdue',
      'impossible': 'impossible',
      'good': 'good',
      'approaching': 'approaching'
    };
    
    const urgencyLevel = paceToUrgencyMap[paceData.status.level] || (daysLeft <= 7 ? 'urgent' : 'good');
    
    // Map pace color to urgency color
    const paceColorToUrgencyColorMap: Record<string, string> = {
      'green': '#10b981',
      'orange': '#f59e0b',
      'red': '#ef4444'
    };
    
    const urgencyColor = paceColorToUrgencyColorMap[paceData.status.color] || '#7bc598';

    return {
      currentProgress,
      totalQuantity,
      remaining,
      progressPercentage,
      daysLeft,
      unitsPerDay,
      urgencyLevel,
      urgencyColor,
      statusMessage: paceData.statusMessage,
      readingEstimate,
      paceEstimate,
      unit,
      // New pace-based fields
      userPace: paceData.userPace,
      requiredPace: paceData.requiredPace,
      paceStatus: paceData.status.color,
      paceMessage: paceData.statusMessage
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

  const updateDeadline = (params: {
    deadlineDetails: ReadingDeadlineInsert;
    progressDetails: ReadingDeadlineProgressInsert;
  }, onSuccess?: () => void, onError?: (error: Error) => void) => {
    updateDeadlineMutation(params, {
      onSuccess: () => {
        onSuccess?.();
      },
      onError: (error) => {
        console.error("Error updating deadline:", error);
        onError?.(error);
      }
    });
  };

  const deleteDeadline = (deadlineId: string, onSuccess?: () => void, onError?: (error: Error) => void) => {
    deleteDeadlineMutation(deadlineId, {
      onSuccess: () => {
        onSuccess?.();
      },
      onError: (error) => {
        console.error("Error deleting deadline:", error);
        onError?.(error);
      }
    });
  };

  const completeDeadline = (deadlineId: string, onSuccess?: () => void, onError?: (error: Error) => void) => {
    completeDeadlineMutation(deadlineId, {
      onSuccess: () => {
        onSuccess?.();
      },
      onError: (error) => {
        console.error("Error completing deadline:", error);
        onError?.(error);
      }
    });
  };

  const setAsideDeadline = (deadlineId: string, onSuccess?: () => void, onError?: (error: Error) => void) => {
    setAsideDeadlineMutation(deadlineId, {
      onSuccess: () => {
        onSuccess?.();
      },
      onError: (error) => {
        console.error("Error setting aside deadline:", error);
        onError?.(error);
      }
    });
  };

  const value: DeadlineContextType = {
    // Data
    deadlines,
    activeDeadlines,
    overdueDeadlines,
    completedDeadlines,
    isLoading,
    error,
    
    // Actions
    addDeadline,
    updateDeadline,
    deleteDeadline,
    completeDeadline,
    setAsideDeadline,
    
    getDeadlineCalculations,
    
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

// Main DeadlineProvider that wraps both pace and deadline logic
export const DeadlineProvider: React.FC<DeadlineProviderProps> = ({ children }) => {
  const { data: deadlines = [] } = useGetDeadlines({includeNonActive: true});
  
  return (
    <PaceProvider deadlines={deadlines}>
      <DeadlineProviderInternal>
        {children}
      </DeadlineProviderInternal>
    </PaceProvider>
  );
};

export const useDeadlines = (): DeadlineContextType => {
  const context = useContext(DeadlineContext);
  if (context === undefined) {
    throw new Error('useDeadlines must be used within a DeadlineProvider');
  }
  return context;
}; 