import React, { useState, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import PagerView from 'react-native-pager-view';
import { ThemedView, ThemedText } from '@/components/themed';
import { useTheme } from '@/theme';
import { ReadingDeadlineWithProgress } from '@/types/deadline';
import ProgressAreaChart from './ProgressAreaChart';
import DailyReadingChart from './DailyReadingChart';

interface SwipeableChartsProps {
  deadline: ReadingDeadlineWithProgress;
}

const SwipeableCharts: React.FC<SwipeableChartsProps> = ({ deadline }) => {
  const { theme } = useTheme();
  const [currentPage, setCurrentPage] = useState(0);
  const pagerRef = useRef<PagerView>(null);

  const onPageSelected = (e: any) => {
    setCurrentPage(e.nativeEvent.position);
  };

  const switchToPage = (pageIndex: number) => {
    if (pagerRef.current && pageIndex !== currentPage) {
      pagerRef.current.setPage(pageIndex);
      setCurrentPage(pageIndex);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <PagerView
        ref={pagerRef}
        style={styles.pagerView}
        initialPage={0}
        onPageSelected={onPageSelected}
      >
        {/* Page 1: Area Chart - Cumulative Progress */}
        <View key="area" style={styles.page}>
          <ProgressAreaChart deadline={deadline} />
        </View>

        {/* Page 2: Bar Chart - Daily Reading */}
        <View key="bar" style={styles.page}>
          <DailyReadingChart deadline={deadline} />
        </View>
      </PagerView>

      {/* Page Indicators */}
      <View style={styles.indicatorContainer}>
        {[0, 1].map((index) => (
          <View
            key={index}
            style={[
              styles.indicator,
              {
                backgroundColor: currentPage === index ? theme.primary : theme.border,
              },
            ]}
          />
        ))}
      </View>

      {/* Chart Type Labels */}
      <View style={styles.labelContainer}>
        <TouchableOpacity 
          style={[styles.labelItem, { opacity: currentPage === 0 ? 1 : 0.5 }]}
          onPress={() => switchToPage(0)}
          activeOpacity={0.7}
        >
          <View style={[styles.labelIcon, { backgroundColor: theme.primary }]} />
          <View style={styles.labelTextContainer}>
            <ThemedText style={[styles.labelText, { color: theme.text }]}>
              Progress Over Time
            </ThemedText>
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.labelItem, { opacity: currentPage === 1 ? 1 : 0.5 }]}
          onPress={() => switchToPage(1)}
          activeOpacity={0.7}
        >
          <View style={[styles.labelBar, { backgroundColor: theme.primary }]} />
          <View style={styles.labelTextContainer}>
            <ThemedText style={[styles.labelText, { color: theme.text }]}>
              Daily Reading
            </ThemedText>
          </View>
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
    borderRadius: 12,
    overflow: 'hidden',
  },
  pagerView: {
    height: 380,
    width: '100%',
  },
  page: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 20,
  },
  indicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 8,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  labelItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  labelIcon: {
    width: 12,
    height: 2,
    borderRadius: 1,
  },
  labelBar: {
    width: 3,
    height: 12,
    borderRadius: 1.5,
  },
  labelTextContainer: {
    backgroundColor: 'transparent',
  },
  labelText: {
    fontSize: 12,
    fontWeight: '500',
    backgroundColor: 'transparent',
  },
});

export default SwipeableCharts;