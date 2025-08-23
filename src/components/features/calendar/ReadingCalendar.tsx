import { ThemedText, ThemedView } from '@/components/themed';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { DateRange, FormatFilter, useDeadlineHistory } from '@/hooks/useReadingHistory';
import { useTheme } from '@/theme';
import React, { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Calendar } from 'react-native-calendars';
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

  // Get all dates in range (including empty ones) for navigation
  const allDatesInRange = useMemo(() => {
    const dates: string[] = [];
    const endDate = new Date();
    let startDate: Date;

    switch (dateRange) {
      case '7d':
        startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(endDate.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        startDate = new Date(endDate.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      case 'all':
      default:
        // For 'all', use the earliest date from the data
        const earliestDate = data?.entries?.[0]?.date;
        startDate = earliestDate ? new Date(earliestDate) : new Date(endDate.getTime() - 90 * 24 * 60 * 60 * 1000);
    }

    // Generate all dates between start and end
    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const year = currentDate.getFullYear();
      const month = String(currentDate.getMonth() + 1).padStart(2, '0');
      const day = String(currentDate.getDate()).padStart(2, '0');
      dates.push(`${year}-${month}-${day}`);
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Add all dates that have actual data entries, even if they fall outside the range
    if (data?.entries) {
      data.entries.forEach(entry => {
        if (!dates.includes(entry.date)) {
          dates.push(entry.date);
        }
      });
    }

    return dates.sort();
  }, [dateRange, data?.entries]);
  

  const handleDayPress = (day: { dateString: string }) => {
    // Allow clicking on any date, not just ones with data
    setSelectedDate(day.dateString);
    setShowDetails(true);
  };

  const handleCloseDetails = () => {
    setShowDetails(false);
    setSelectedDate(null);
  };

  const handleDateChange = (newDate: string) => {
    setSelectedDate(newDate);
  };

  const selectedDayData = selectedDate && data?.entries
    ? data.entries.find(entry => entry.date === selectedDate) || {
        date: selectedDate,
        deadlines: [],
        statusChanges: [],
        totalProgressMade: 0,
      }
    : null;


  const currentDateIndex = selectedDate
    ? allDatesInRange.indexOf(selectedDate)
    : 0;

  // Memoize allDayData to prevent unnecessary recalculations
  const allDayData = useMemo(() => 
    allDatesInRange.map(date => {
      const existingEntry = data?.entries?.find(e => e.date === date);
      if (existingEntry) {
        return existingEntry;
      }
      // Create fallback that maintains same structure as DailyDeadlineEntry
      return {
        date,
        deadlines: [],
        statusChanges: [],
        totalProgressMade: 0,
      };
    }), [allDatesInRange, data?.entries]
  );

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
          <ThemedText color="textMuted" style={styles.legendTitle}>Progress Activity</ThemedText>
          <View style={styles.legendRow}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#007AFF' }]} />
              <ThemedText color="textMuted" style={styles.legendText}>Reading</ThemedText>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#FF9500' }]} />
              <ThemedText color="textMuted" style={styles.legendText}>Audio</ThemedText>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#AF52DE' }]} />
              <ThemedText color="textMuted" style={styles.legendText}>Mixed</ThemedText>
            </View>
          </View>
          
          <ThemedText color="textMuted" style={[styles.legendTitle, { marginTop: 12 }]}>Status Changes</ThemedText>
          <View style={styles.legendRow}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#6366F1' }]} />
              <ThemedText color="textMuted" style={styles.legendText}>Requested</ThemedText>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#10B981' }]} />
              <ThemedText color="textMuted" style={styles.legendText}>Approved</ThemedText>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#F59E0B' }]} />
              <ThemedText color="textMuted" style={styles.legendText}>Reading</ThemedText>
            </View>
          </View>
          <View style={styles.legendRow}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#059669' }]} />
              <ThemedText color="textMuted" style={styles.legendText}>Complete</ThemedText>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#FB923C' }]} />
              <ThemedText color="textMuted" style={styles.legendText}>Set Aside</ThemedText>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#EF4444' }]} />
              <ThemedText color="textMuted" style={styles.legendText}>Rejected</ThemedText>
            </View>
          </View>
          <View style={styles.legendRow}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#DC2626' }]} />
              <ThemedText color="textMuted" style={styles.legendText}>Deadline Due</ThemedText>
            </View>
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
            textDayFontFamily: 'Inter-Regular',
            textMonthFontFamily: 'Inter-Regular',
            textDayHeaderFontFamily: 'Inter-Regular',
            textDayFontSize: 14,
            textMonthFontSize: 16,
            textDayHeaderFontSize: 12,
          }}
          markedDates={calendarData}
          onDayPress={handleDayPress}
          markingType="multi-dot"
          firstDay={1} // Start week on Monday
          showWeekNumbers={false}
          enableSwipeMonths={true}
          hideArrows={false}
          hideExtraDays={false}
          disableMonthChange={false}
          hideDayNames={false}
          minDate="2020-01-01"
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
                  {data.summary.totalDeadlines}
                </ThemedText>
                <ThemedText color="textMuted" style={styles.summaryLabel}>
                  Total Deadlines
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
          availableDates={allDatesInRange}
          currentDateIndex={currentDateIndex}
          onDateChange={handleDateChange}
          allDayData={allDayData}
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
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  legendTitle: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    flexWrap: 'wrap',
    marginBottom: 4,
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
    fontSize: 11,
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