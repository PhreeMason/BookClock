import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ThemedText } from '../ThemedText';

const ProgressHeader: React.FC = () => {
  return (
    <View style={styles.sectionTitle}>
      <ThemedText style={styles.sectionIcon}>📊</ThemedText>
      <ThemedText type="subtitle">Reading Progress</ThemedText>
    </View>
  );
};

const styles = StyleSheet.create({
  sectionTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  sectionIcon: {
    fontSize: 20,
  },
});

export default ProgressHeader;
