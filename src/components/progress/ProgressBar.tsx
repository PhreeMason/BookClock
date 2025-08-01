import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ThemedText, ThemedView } from '../themed';
import { formatDisplayDate } from '@/lib/dateUtils';

interface ProgressBarProps {
  progressPercentage: number;
  deadlineDate: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  progressPercentage,
  deadlineDate
}) => {
  const formatDeadlineDate = (dateString: string) => {
    return formatDisplayDate(dateString, 'MMMM D');
  };

  return (
    <View style={styles.progressBarContainer}>
      <ThemedView backgroundColor="primary" style={styles.progressBar}>
        <ThemedView
          backgroundColor="accent"
          style={[styles.progressFill, { width: `${progressPercentage}%` }]}
        />
      </ThemedView>
      <View style={styles.progressText}>
        <ThemedText color="textMuted">{progressPercentage}%</ThemedText>
        <ThemedText color="textMuted">
          Deadline: {formatDeadlineDate(deadlineDate)}
        </ThemedText>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  progressBarContainer: {
    marginBottom: 20,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    gap: 4,
    justifyContent: 'space-between',
    flexDirection: 'row',
  },
  deadlineContainer: {
    alignItems: 'center',
    marginTop: 8,
  },
  deadlineText: {
    fontSize: 14,
  },
});

export default ProgressBar;
