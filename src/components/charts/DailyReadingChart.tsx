import { ThemedText, ThemedView } from '@/components/themed';
import { calculateRequiredPace } from '@/lib/paceCalculations';
import { useTheme } from '@/theme';
import { ReadingDeadlineWithProgress } from '@/types/deadline';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { BarChart } from 'react-native-gifted-charts';

interface DailyReadingChartProps {
  deadline: ReadingDeadlineWithProgress;
}

interface ReadingDay {
  date: string;
  progressRead: number;
  format: 'physical' | 'ebook' | 'audio';
}

const getBookReadingDays = (deadline: ReadingDeadlineWithProgress): ReadingDay[] => {
  const DAYS_TO_CONSIDER = 7;
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - DAYS_TO_CONSIDER);
  const cutoffTime = cutoffDate.getTime();
  
  let dailyProgress: { [date: string]: number } = {};

  // Sort progress updates by date
  if (!deadline.progress || !Array.isArray(deadline.progress)) return [];
  
  let progress = deadline.progress.slice().sort(
    (a, b) => new Date(a.created_at!).getTime() - new Date(b.created_at!).getTime()
  );

  if (progress.length === 0) return [];

  // Only count first progress if it's very small (likely represents actual reading that day)
  const firstProgress = progress[0];
  const firstDate = new Date(firstProgress.created_at);
  const INITIAL_PROGRESS_THRESHOLD = 50; // Only count if less than 50 pages/minutes
  
  if (firstDate.getTime() >= cutoffTime && 
      firstProgress.current_progress > 0 && 
      firstProgress.current_progress <= INITIAL_PROGRESS_THRESHOLD) {
    const dateStr = firstDate.toISOString().slice(0, 10);
    dailyProgress[dateStr] = firstProgress.current_progress;
  }

  // Calculate differences between consecutive progress entries
  for (let i = 1; i < progress.length; i++) {
    let prev = progress[i - 1];
    let curr = progress[i];

    let endDate = new Date(curr.created_at).getTime();
    
    // Skip if the end date is before the cutoff
    if (endDate < cutoffTime) continue;
    
    let progressDiff = curr.current_progress - prev.current_progress;

    // Only assign the progress to the end date (when progress was recorded)
    let endDateObj = new Date(endDate);
    if (endDateObj.getTime() >= cutoffTime) {
      let dateStr = endDateObj.toISOString().slice(0, 10);
      dailyProgress[dateStr] = (dailyProgress[dateStr] || 0) + progressDiff;
    }
  }

  // Convert dictionary to sorted array
  return Object.entries(dailyProgress)
    .map(([date, progressRead]) => ({
      date,
      progressRead: Number(progressRead.toFixed(2)),
      format: deadline.format as 'physical' | 'ebook' | 'audio'
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
};

const DailyReadingChart: React.FC<DailyReadingChartProps> = ({ deadline }) => {
  const { theme } = useTheme();
  
  // Get format-specific labels (moved up before early return)
  const getUnitLabel = (format: string) => {
    switch (format) {
      case 'audio': return 'min';
      case 'ebook': return '%';
      case 'physical': return 'pg';
      default: return 'pg';
    }
  };

  const getChartTitle = (format: string) => {
    switch (format) {
      case 'audio': return 'Daily Listening Progress (Last 7 Days)';
      case 'ebook': return 'Daily Reading Progress (Last 7 Days)';
      case 'physical': return 'Daily Reading Progress (Last 7 Days)';
      default: return 'Daily Reading Progress (Last 7 Days)';
    }
  };

  const getSubtitle = (format: string) => {
    switch (format) {
      case 'audio': return 'Minutes listened per day';
      case 'ebook': return 'Percentage read per day';
      case 'physical': return 'Pages read per day';
      default: return 'Progress per day';
    }
  };

  const unitLabel = getUnitLabel(deadline.format);
  const chartTitle = getChartTitle(deadline.format);
  const subtitle = getSubtitle(deadline.format);

  const recentDays = getBookReadingDays(deadline);
  
  // If no reading data, show empty state
  if (recentDays.length === 0) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText style={[styles.title, { color: theme.text }]}>Daily Reading Progress</ThemedText>
        <ThemedView style={styles.emptyState}>
          <ThemedText style={[styles.emptyStateText, { color: theme.textMuted }]}>
            No reading activity in the last 7 days
          </ThemedText>
          <ThemedText style={[styles.emptyStateSubtext, { color: theme.textMuted }]}>
            Start reading to see your daily progress
          </ThemedText>
        </ThemedView>
      </ThemedView>
    );
  }

  // Calculate daily minimum goal
  const currentProgress = deadline.progress?.length > 0 
    ? deadline.progress[deadline.progress.length - 1].current_progress 
    : 0;
  
  const deadlineDate = new Date(deadline.deadline_date);
  const today = new Date();
  const daysLeft = Math.max(1, Math.ceil((deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));
  
  const dailyMinimum = calculateRequiredPace(
    deadline.total_quantity,
    currentProgress,
    daysLeft,
    deadline.format
  );
  
  // Display daily minimum directly (no conversion needed)
  const displayDailyMinimum = dailyMinimum;

  // Prepare data for the chart
  const chartData = recentDays.map((day, index) => ({
    value: Math.round(day.progressRead),
    label: new Date(day.date).toLocaleDateString('en-US', { 
      month: 'numeric', 
      day: 'numeric' 
    }),
    frontColor: theme.primary,
    spacing: index === recentDays.length - 1 ? 0 : 2,
    labelWidth: 40,
    labelTextStyle: {
      color: theme.text,
      fontSize: 9,
      fontWeight: '400',
    },
  }));

  const maxValue = Math.max(...chartData.map(d => d.value), displayDailyMinimum);
  const yAxisMax = Math.ceil(maxValue * 1.2); // Add 20% padding

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={[styles.title, { color: theme.text }]}>
        {chartTitle}
      </ThemedText>
      
      <View style={styles.chartContainer}>
        <View testID="bar-chart">
          <BarChart
          data={chartData}
          width={300}
          height={180}
          barWidth={28}
          spacing={19}
          roundedTop
          hideRules
          xAxisThickness={2}
          yAxisThickness={2}
          xAxisColor={theme.border}
          yAxisColor={theme.border}
          yAxisTextStyle={{
            color: theme.textMuted,
            fontSize: 11,
          }}
          xAxisLabelTextStyle={{
            color: theme.textMuted,
            fontSize: 10,
            textAlign: 'left',
          }}
          noOfSections={4}
          maxValue={yAxisMax > 0 ? yAxisMax : 10}
          yAxisLabelSuffix={` ${unitLabel}`}
          showReferenceLine1
          referenceLine1Position={displayDailyMinimum}
          referenceLine1Config={{
            color: theme.accent,
            dashWidth: 3,
            dashGap: 2,
            thickness: 2,
            labelTextStyle: {
              color: theme.accent,
              fontSize: 10,
              fontWeight: '600',
            },
          }}
          isAnimated
          animationDuration={800}
          />
        </View>
      </View>
      
      <View style={styles.legendContainer}>
        <View style={styles.legendItem}>
          <View style={[styles.legendBar, { backgroundColor: theme.primary }]} />
          <ThemedText style={[styles.legendText, { color: theme.textMuted }]}>
            Daily Progress
          </ThemedText>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendLine, { backgroundColor: theme.accent }]} />
          <ThemedText style={[styles.legendText, { color: theme.textMuted }]}>
            Daily Goal ({displayDailyMinimum} {unitLabel})
          </ThemedText>
        </View>
      </View>
      
      <ThemedText style={[styles.subtitle, { color: theme.textMuted }]}>
        {subtitle}
      </ThemedText>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderRadius: 12,
    width: '100%',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  chartContainer: {
    alignItems: 'center',
    marginBottom: 12,
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginBottom: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendBar: {
    width: 3,
    height: 12,
    borderRadius: 1.5,
  },
  legendLine: {
    width: 12,
    height: 2,
  },
  legendText: {
    fontSize: 12,
  },
  subtitle: {
    fontSize: 12,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateSubtext: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default DailyReadingChart;