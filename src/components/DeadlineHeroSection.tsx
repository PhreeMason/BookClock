import React from 'react';
import { StyleSheet } from 'react-native';
import { ThemedView } from './themed';
import { DeadlineCard } from './DeadlineCard';
import { ReadingDeadlineWithProgress } from '@/types/deadline';

interface DeadlineHeroSectionProps {
  deadline: ReadingDeadlineWithProgress;
}

const DeadlineHeroSection: React.FC<DeadlineHeroSectionProps> = ({
  deadline,
}) => {
  return (
    <ThemedView style={styles.heroCardContainer}>
      <DeadlineCard deadline={deadline} disableNavigation={true} />
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  heroCardContainer: {
    marginBottom: 24,
  },
});

export default DeadlineHeroSection;
