import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import { ThemedText, ThemedView } from '@/components/themed';
import { useTheme } from '@/theme';
import { ReadingDeadlineWithProgress } from '@/types/deadline';

interface ProgressAreaChartProps {
  deadline: ReadingDeadlineWithProgress;
}

interface ProgressPoint {
  date: string;
  totalProgress: number;
  timestamp: number;
}

const getCumulativeProgress = (deadline: ReadingDeadlineWithProgress): ProgressPoint[] => {
  if (!deadline.progress || !Array.isArray(deadline.progress)) return [];
  
  // Sort progress updates by date
  const progress = deadline.progress.slice().sort(
    (a, b) => new Date(a.created_at!).getTime() - new Date(b.created_at!).getTime()
  );

  if (progress.length === 0) return [];

  // Convert to cumulative progress points with validation
  return progress
    .filter(entry => entry.created_at && typeof entry.current_progress === 'number')
    .map(entry => ({
      date: new Date(entry.created_at).toISOString().slice(0, 10),
      totalProgress: Math.max(0, entry.current_progress), // Ensure non-negative values
      timestamp: new Date(entry.created_at).getTime()
    }));
};

const ProgressAreaChart: React.FC<ProgressAreaChartProps> = ({ deadline }) => {
  const { theme } = useTheme();
  
  const progressPoints = getCumulativeProgress(deadline);
  
  // If no progress data, don't show the chart
  if (progressPoints.length === 0) {
    return null;
  }

  // Get format-specific labels
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
      case 'audio': return 'Listening Progress Over Time';
      case 'ebook': return 'Reading Progress Over Time';
      case 'physical': return 'Reading Progress Over Time';
      default: return 'Reading Progress Over Time';
    }
  };

  const getSubtitle = (format: string, total: number) => {
    const unit = getUnitLabel(format);
    switch (format) {
      case 'audio': return `Total progress toward ${total} ${unit}`;
      case 'ebook': return `Total progress toward 100${unit}`;
      case 'physical': return `Total progress toward ${total} ${unit}`;
      default: return `Total progress toward goal`;
    }
  };

  const unitLabel = getUnitLabel(deadline.format);
  const chartTitle = getChartTitle(deadline.format);
  const subtitle = getSubtitle(deadline.format, deadline.total_quantity);

  // Prepare data for the chart
  const chartData = progressPoints.map((point, index) => ({
    value: point.totalProgress,
    label: index === 0 || index === progressPoints.length - 1 ? 
      new Date(point.date).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      }) : '',
  }));

  // Add goal line if we have a target
  const goalValue = deadline.total_quantity || 0;
  const maxProgress = chartData.length > 0 ? Math.max(...chartData.map(d => d.value)) : 0;
  const yAxisMax = Math.max(goalValue, maxProgress, 1) * 1.1; // Add 10% padding, minimum 1

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={[styles.title, { color: theme.text }]}>
        {chartTitle}
      </ThemedText>
      
      <View style={styles.chartContainer}>
        <LineChart
          data={chartData}
          width={300}
          height={180}
          curved
          areaChart
          startFillColor={theme.primary}
          startOpacity={0.3}
          endFillColor={theme.primary}
          endOpacity={0.1}
          color={theme.primary}
          thickness={3}
          dataPointsColor={theme.primary}
          dataPointsRadius={4}
          hideDataPoints={chartData.length > 10}
          hideRules
          xAxisThickness={1}
          yAxisThickness={1}
          xAxisColor={theme.border}
          yAxisColor={theme.border}
          yAxisTextStyle={{
            color: theme.textMuted,
            fontSize: 10,
          }}
          xAxisLabelTextStyle={{
            color: theme.textMuted,
            fontSize: 10,
          }}
          noOfSections={4}
          maxValue={yAxisMax}
          yAxisLabelSuffix={` ${unitLabel}`}
          showReferenceLine1
          referenceLine1Position={goalValue}
          referenceLine1Config={{
            color: theme.accent,
            dashWidth: 3,
            dashGap: 2,
            thickness: 2,
          }}
          isAnimated
          animationDuration={1000}
          animateOnDataChange
        />
      </View>
      
      <View style={styles.legendContainer}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: theme.primary }]} />
          <ThemedText style={[styles.legendText, { color: theme.textMuted }]}>
            Current Progress
          </ThemedText>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendLine, { backgroundColor: theme.accent }]} />
          <ThemedText style={[styles.legendText, { color: theme.textMuted }]}>
            Goal ({goalValue} {unitLabel})
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
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
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
});

export default ProgressAreaChart;