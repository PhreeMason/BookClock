import { formatDisplayDate } from '@/lib/dateUtils';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import LinearProgressBar from '../shared/LinearProgressBar';
import { ThemedText } from '../themed';

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
      <LinearProgressBar 
        progressPercentage={progressPercentage}
        height={12}
        borderRadius={4}
        showShimmer={true}
      />
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
  progressText: {
    gap: 4,
    justifyContent: 'space-between',
    flexDirection: 'row',
    marginTop: 8,
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
