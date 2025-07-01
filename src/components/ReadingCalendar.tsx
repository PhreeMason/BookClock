import React, { useState } from 'react';
import { StyleSheet, View, Platform } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { ThemedText, ThemedView } from '@/components/themed';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useTheme } from '@/theme';
import { useDeadlineHistory, DateRange, FormatFilter } from '@/hooks/useReadingHistory';
import ReadingDayDetails from './ReadingDayDetails';

interface ReadingCalendarProps {
  selectedCategory: FormatFilter;
  dateRange?: DateRange;
}

const ReadingCalendar: React.FC<ReadingCalendarProps> = ({ 
  selectedCategory, 
  dateRange = '90d' 
}) => {
  const { theme } = useTheme();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  const { data, isLoading, error, calendarData } = useDeadlineHistory({
    dateRange,
    formatFilter: selectedCategory,
  });

  const handleDayPress = (day: { dateString: string }) => {
    if (!data?.entries) return;
    const dayData = data.entries.find(entry => entry.date === day.dateString);
    if (dayData) {
      setSelectedDate(day.dateString);
      setShowDetails(true);
    }
  };

  const handleCloseDetails = () => {
    setShowDetails(false);
    setSelectedDate(null);
  };

  const selectedDayData = selectedDate && data?.entries
    ? data.entries.find(entry => entry.date === selectedDate)
    : null;

  if (isLoading) {
    return (
      <ThemedView backgroundColor="card" borderColor="border" style={styles.section}>
        <View style={styles.sectionHeader}>
          <IconSymbol name="calendar" size={24} color={theme.primary} />
          <ThemedText type="semiBold" style={styles.sectionTitle}>
            Deadline Progress Calendar
          </ThemedText>
        </View>
        <View style={styles.loadingContainer}>
          <ThemedText color="textMuted">Loading calendar...</ThemedText>
        </View>
      </ThemedView>
    );
  }

  if (error) {
    return (
      <ThemedView backgroundColor="card" borderColor="border" style={styles.section}>
        <View style={styles.sectionHeader}>
          <IconSymbol name="calendar" size={24} color={theme.primary} />
          <ThemedText type="semiBold" style={styles.sectionTitle}>
            Deadline Progress Calendar
          </ThemedText>
        </View>
        <View style={styles.errorContainer}>
          <IconSymbol name="exclamationmark.triangle" size={20} color={theme.warning} />
          <ThemedText color="textMuted" style={styles.errorText}>
            Unable to load calendar data
          </ThemedText>
        </View>
      </ThemedView>
    );
  }

  return (
    <>
      <ThemedView backgroundColor="card" borderColor="border" style={styles.section}>
        <View style={styles.sectionHeader}>
          <IconSymbol name="calendar" size={24} color={theme.primary} />
          <ThemedText type="semiBold" style={styles.sectionTitle}>
            Deadline Progress Calendar
          </ThemedText>
        </View>

        <View style={styles.legendContainer}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#007AFF' }]} />
            <ThemedText color="textMuted" style={styles.legendText}>Reading Deadlines</ThemedText>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#FF9500' }]} />
            <ThemedText color="textMuted" style={styles.legendText}>Audio Deadlines</ThemedText>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#AF52DE' }]} />
            <ThemedText color="textMuted" style={styles.legendText}>Mixed Deadlines</ThemedText>
          </View>
        </View>

        <Calendar
          style={[styles.calendar, { backgroundColor: theme.surface }]}
          theme={{
            backgroundColor: theme.surface,
            calendarBackground: theme.surface,
            textSectionTitleColor: theme.textMuted,
            textSectionTitleDisabledColor: theme.textMuted,
            selectedDayBackgroundColor: theme.primary,
            selectedDayTextColor: theme.background,
            todayTextColor: theme.primary,
            dayTextColor: theme.text,
            textDisabledColor: theme.textMuted,
            dotColor: theme.primary,
            selectedDotColor: theme.background,
            arrowColor: theme.primary,
            disabledArrowColor: theme.textMuted,
            monthTextColor: theme.text,
            indicatorColor: theme.primary,
            textDayFontFamily: Platform.OS === 'ios' ? 'Inter-Regular' : 'Inter-Regular',
            textMonthFontFamily: Platform.OS === 'ios' ? 'Inter-Regular' : 'Inter-Regular',
            textDayHeaderFontFamily: Platform.OS === 'ios' ? 'Inter-Regular' : 'Inter-Regular',
            textDayFontSize: 14,
            textMonthFontSize: 16,
            textDayHeaderFontSize: 12,
          }}
          markedDates={calendarData}
          onDayPress={handleDayPress}
          markingType="dot"
          firstDay={1} // Start week on Monday
          showWeekNumbers={false}
          enableSwipeMonths={true}
          hideArrows={false}
          hideExtraDays={false}
          disableMonthChange={false}
          hideDayNames={false}
          minDate="2020-01-01"
          maxDate={new Date().toISOString().split('T')[0]}
        />

        {data?.summary && (
          <View style={styles.summaryContainer}>
            <ThemedText color="textMuted" style={styles.summaryTitle}>
              {dateRange === '7d' ? 'Last 7 days' : 
               dateRange === '30d' ? 'Last 30 days' : 
               dateRange === '90d' ? 'Last 90 days' : 
               dateRange === '1y' ? 'Last year' : 'All time'}
            </ThemedText>
            <View style={styles.summaryRow}>
              <View style={styles.summaryItem}>
                <ThemedText style={styles.summaryValue}>
                  {data.summary.totalDays}
                </ThemedText>
                <ThemedText color="textMuted" style={styles.summaryLabel}>
                  Active Days
                </ThemedText>
              </View>
              <View style={styles.summaryItem}>
                <ThemedText style={styles.summaryValue}>
                  {Math.round(data.summary.totalProgressMade)}
                </ThemedText>
                <ThemedText color="textMuted" style={styles.summaryLabel}>
                  Progress Made
                </ThemedText>
              </View>
              <View style={styles.summaryItem}>
                <ThemedText style={styles.summaryValue}>
                  {data.summary.activeDeadlines}
                </ThemedText>
                <ThemedText color="textMuted" style={styles.summaryLabel}>
                  Active Deadlines
                </ThemedText>
              </View>
            </View>
          </View>
        )}
      </ThemedView>

      {showDetails && selectedDayData && (
        <ReadingDayDetails
          isVisible={showDetails}
          onClose={handleCloseDetails}
          dayData={selectedDayData}
          selectedCategory={selectedCategory}
        />
      )}
    </>
  );
};

const styles = StyleSheet.create({
  section: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 20,
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    marginLeft: 12,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  errorText: {
    fontSize: 14,
    marginLeft: 8,
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
    gap: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4,
  },
  legendText: {
    fontSize: 12,
  },
  calendar: {
    borderRadius: 8,
    paddingBottom: 8,
  },
  summaryContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  summaryTitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
  },
});

export default ReadingCalendar;