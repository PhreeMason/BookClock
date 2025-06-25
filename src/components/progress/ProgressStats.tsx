import { palette } from '@/constants/palette';
import { formatProgressDisplay } from '@/lib/deadlineUtils';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ThemedText } from '../ThemedText';

interface ProgressStatsProps {
  currentProgress: number;
  totalQuantity: number;
  remaining: number;
  format: 'physical' | 'ebook' | 'audio';
  urgencyLevel: 'overdue' | 'urgent' | 'good' | 'approaching';
}

const ProgressStats: React.FC<ProgressStatsProps> = ({
  currentProgress,
  totalQuantity,
  remaining,
  format,
  urgencyLevel
}) => {
  const urgencyColorMap = {
    'overdue': palette.red.DEFAULT,
    'urgent': palette.red[300],
    'good': palette.green.DEFAULT,
    'approaching': palette.orange.DEFAULT,
  };

  return (
    <View style={styles.progressStats}>
      <View style={styles.statItem}>
        <ThemedText type="subtitle" style={[styles.statNumber, { color: urgencyColorMap[urgencyLevel] }]}>
          {formatProgressDisplay(format, currentProgress)}
        </ThemedText>
        <ThemedText type="small" color="textMuted" style={styles.statLabel}>
         OF{' '}
         <ThemedText type="small" color="textMuted" style={{fontSize: 12}} >{formatProgressDisplay(format, totalQuantity)} </ThemedText>
         {format === 'audio' ? 'LISTENED' : 'READ'}
        </ThemedText>
      </View>
      <View style={styles.statItem}>
        <ThemedText type="subtitle" style={[styles.statNumber, { color: urgencyColorMap[urgencyLevel] }]}>
          {formatProgressDisplay(format, remaining)}
        </ThemedText>
        <ThemedText type="small" color="textMuted" style={styles.statLabel}>
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
