import { formatProgressDisplay } from '@/lib/deadlineUtils';
import { useTheme } from '@/theme';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ThemedText } from '../themed';

interface ProgressStatsProps {
  currentProgress: number;
  totalQuantity: number;
  remaining: number;
  format: 'physical' | 'ebook' | 'audio';
  urgencyLevel: 'overdue' | 'urgent' | 'good' | 'approaching' | 'impossible';
}

const ProgressStats: React.FC<ProgressStatsProps> = ({
  currentProgress,
  totalQuantity,
  remaining,
  format,
  urgencyLevel
}) => {
  const { theme } = useTheme();
  const urgencyColorMap = {
    'overdue': theme.danger,
    'urgent': theme.warning,
    'good': theme.success,
    'approaching': theme.warning,
    'impossible': theme.danger, // Same as overdue
  };

  return (
    <View style={styles.progressStats}>
      <View style={styles.statItem}>
        <ThemedText type="subtitle" style={[styles.statNumber, { color: urgencyColorMap[urgencyLevel] }]}>
          {formatProgressDisplay(format, currentProgress)}
        </ThemedText>
        <ThemedText type="caption" color="textMuted" style={styles.statLabel}>
         OF{' '}
         <ThemedText type="caption" color="textMuted" style={{fontSize: 12}} >{formatProgressDisplay(format, totalQuantity)} </ThemedText>
         {format === 'audio' ? 'LISTENED' : 'READ'}
        </ThemedText>
      </View>
      <View style={styles.statItem}>
        <ThemedText type="subtitle" style={[styles.statNumber, { color: urgencyColorMap[urgencyLevel] }]}>
          {formatProgressDisplay(format, remaining)}
        </ThemedText>
        <ThemedText type="caption" color="textMuted" style={styles.statLabel}>
          {format === 'audio' ? 'REMAINING' : 'LEFT'}
        </ThemedText>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  progressStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    marginBottom: 4,
  },
  statLabel: {
    letterSpacing: 1,
  },
});

export default ProgressStats;
