import React, { useRef, useState, useEffect } from 'react';
import {
  Modal,
  StyleSheet,
  View,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import PagerView from 'react-native-pager-view';
import { ThemedText, ThemedView } from '@/components/themed';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useTheme } from '@/theme';
import { DailyDeadlineEntry, FormatFilter } from '@/hooks/useReadingHistory';
import { formatDisplayDate } from '@/lib/dateUtils';

interface ReadingDayDetailsProps {
  isVisible: boolean;
  onClose: () => void;
  dayData: DailyDeadlineEntry;
  selectedCategory: FormatFilter;
  availableDates?: string[];
  currentDateIndex?: number;
  onDateChange?: (date: string) => void;
  allDayData?: DailyDeadlineEntry[];
}

interface DayContentProps {
  dayData: DailyDeadlineEntry;
  selectedCategory: FormatFilter;
  theme: any;
}

// Component for rendering the content of a single day
const DayContent: React.FC<DayContentProps> = React.memo(({ dayData, selectedCategory, theme }) => {
  const formatProgress = (deadline: DailyDeadlineEntry['deadlines'][0]) => {
    if (deadline.format === 'audio') {
      const hours = Math.floor(deadline.progress_made / 60);
      const minutes = deadline.progress_made % 60;
      if (hours > 0) {
        return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
      }
      return `${minutes}m`;
    } else {
      return `${deadline.progress_made} pages`;
    }
  };

  const formatQuantity = (quantity: number, format: string) => {
    if (format === 'audio') {
      const hours = Math.floor(quantity / 60);
      const minutes = quantity % 60;
      if (hours > 0) {
        return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
      }
      return `${minutes}m`;
    } else {
      return `${quantity} pages`;
    }
  };

  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'physical':
        return 'book.closed';
      case 'ebook':
        return 'ipad';
      case 'audio':
        return 'headphones';
      default:
        return 'book.closed';
    }
  };

  const getFormatColor = (format: string) => {
    switch (format) {
      case 'physical':
        return theme.primary;
      case 'ebook':
        return theme.secondary;
      case 'audio':
        return theme.accent;
      default:
        return theme.primary;
    }
  };

  const filteredDeadlines = dayData.deadlines.filter(deadline => {
    if (selectedCategory === 'reading') {
      return deadline.format === 'physical' || deadline.format === 'ebook';
    } else if (selectedCategory === 'listening') {
      return deadline.format === 'audio';
    }
    return true; // 'all' or 'combined' category
  });

  // Calculate total progress for filtered deadlines only
  const filteredTotalProgress = filteredDeadlines.reduce((sum, deadline) => sum + deadline.progress_made, 0);
  
  // Format the total based on the selected category
  const formatTotalProgress = () => {
    if (selectedCategory === 'listening' && filteredTotalProgress > 0) {
      const hours = Math.floor(filteredTotalProgress / 60);
      const minutes = filteredTotalProgress % 60;
      if (hours > 0) {
        return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
      }
      return `${minutes}m`;
    } else if (selectedCategory === 'reading') {
      return `${filteredTotalProgress} pages`;
    }
    // For 'all' or 'combined', just show the number
    return Math.round(dayData.totalProgressMade);
  };

  return (
    <>
      {/* Summary Stats */}
      <ThemedView backgroundColor="card" borderColor="border" style={styles.section}>
        <View style={styles.sectionHeader}>
          <IconSymbol name="chart.bar" size={20} color={theme.primary} />
          <ThemedText type="semiBold" style={styles.sectionTitle}>
            Daily Summary
          </ThemedText>
        </View>
        
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <IconSymbol name="target" size={20} color={theme.primary} />
            <ThemedText style={styles.summaryValue}>
              {formatTotalProgress()}
            </ThemedText>
            <ThemedText color="textMuted" style={styles.summaryLabel}>
              Total Progress
            </ThemedText>
          </View>
          
          <View style={styles.summaryItem}>
            <IconSymbol name="calendar.badge.clock" size={20} color={theme.secondary} />
            <ThemedText style={styles.summaryValue}>
              {filteredDeadlines.length}
            </ThemedText>
            <ThemedText color="textMuted" style={styles.summaryLabel}>
              Deadlines Worked
            </ThemedText>
          </View>
          
          <View style={styles.summaryItem}>
            <IconSymbol name="checkmark.circle" size={20} color={theme.success} />
            <ThemedText style={styles.summaryValue}>
              {filteredDeadlines.filter(d => d.total_progress >= d.total_quantity).length}
            </ThemedText>
            <ThemedText color="textMuted" style={styles.summaryLabel}>
              Completed
            </ThemedText>
          </View>
        </View>
      </ThemedView>

      {/* Deadlines List */}
      <ThemedView backgroundColor="card" borderColor="border" style={styles.section}>
        <View style={styles.sectionHeader}>
          <IconSymbol name="list.bullet" size={20} color={theme.primary} />
          <ThemedText type="semiBold" style={styles.sectionTitle}>
            Deadlines Worked On
          </ThemedText>
        </View>

        {filteredDeadlines.length > 0 ? (
          <View style={styles.booksList}>
            {filteredDeadlines.map((deadline, index) => (
              <View key={`${deadline.id}-${index}`} style={styles.bookItem}>
                <View style={styles.bookHeader}>
                  <IconSymbol
                    name={getFormatIcon(deadline.format)}
                    size={18}
                    color={getFormatColor(deadline.format)}
                  />
                  <View style={styles.bookInfo}>
                    <ThemedText type="semiBold" style={styles.bookTitle} numberOfLines={2}>
                      {deadline.book_title}
                    </ThemedText>
                    {deadline.author && (
                      <ThemedText color="textMuted" style={styles.bookAuthor}>
                        by {deadline.author}
                      </ThemedText>
                    )}
                    <ThemedText color="textMuted" style={styles.bookAuthor}>
                      Due: {formatDisplayDate(deadline.deadline_date)}
                    </ThemedText>
                  </View>
                </View>

                <View style={styles.progressContainer}>
                  <ThemedText style={styles.progressText}>
                    Progress: {formatProgress(deadline)}
                  </ThemedText>
                  <ThemedText color="textMuted" style={styles.pageRange}>
                    Total: {formatQuantity(deadline.total_progress, deadline.format)}/{formatQuantity(deadline.total_quantity, deadline.format)} ({Math.round((deadline.total_progress / deadline.total_quantity) * 100)}%)
                  </ThemedText>
                  <ThemedText color="textMuted" style={styles.pageRange}>
                    Source: {deadline.source}
                  </ThemedText>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <IconSymbol name="calendar.badge.exclamationmark" size={32} color={theme.textMuted} />
            <ThemedText color="textMuted" style={styles.emptyText}>
              No deadline progress recorded for this day
            </ThemedText>
          </View>
        )}
      </ThemedView>
    </>
  );
});

DayContent.displayName = 'DayContent';

const ReadingDayDetails: React.FC<ReadingDayDetailsProps> = ({
  isVisible,
  onClose,
  dayData,
  selectedCategory,
  availableDates = [],
  currentDateIndex = 0,
  onDateChange,
  allDayData = [],
}) => {
  const { theme } = useTheme();
  const pagerRef = useRef<PagerView>(null);
  const [currentPage, setCurrentPage] = useState(currentDateIndex);

  useEffect(() => {
    if (currentDateIndex !== currentPage && pagerRef.current) {
      // Use setTimeout to ensure PagerView is fully mounted
      setTimeout(() => {
        pagerRef.current?.setPage(currentDateIndex);
        setCurrentPage(currentDateIndex);
      }, 0);
    }
  }, [currentDateIndex, currentPage]);

  const handlePageSelected = (e: any) => {
    const newIndex = e.nativeEvent.position;
    setCurrentPage(newIndex);
    if (onDateChange && availableDates[newIndex]) {
      onDateChange(availableDates[newIndex]);
    }
  };

  const navigateToPrevious = () => {
    if (currentPage > 0) {
      const newIndex = currentPage - 1;
      pagerRef.current?.setPage(newIndex);
      setCurrentPage(newIndex);
      if (onDateChange && availableDates[newIndex]) {
        onDateChange(availableDates[newIndex]);
      }
    }
  };

  const navigateToNext = () => {
    if (currentPage < availableDates.length - 1) {
      const newIndex = currentPage + 1;
      pagerRef.current?.setPage(newIndex);
      setCurrentPage(newIndex);
      if (onDateChange && availableDates[newIndex]) {
        onDateChange(availableDates[newIndex]);
      }
    }
  };

  const formatDate = (dateString: string) => {
    // Parse YYYY-MM-DD format safely to avoid timezone issues
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day); // Month is 0-indexed
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatShortDate = (dateString: string) => {
    // Parse YYYY-MM-DD format safely to avoid timezone issues
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day); // Month is 0-indexed
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  // If we don't have navigation data, render the original single-day view
  if (!availableDates || availableDates.length === 0) {
    return (
    <Modal
      visible={isVisible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <ThemedView backgroundColor="background" style={styles.container}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: theme.border }]}>
          <View style={styles.headerContent}>
            <ThemedText type="semiBold" style={styles.headerTitle}>
              {formatDate(dayData.date)}
            </ThemedText>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <IconSymbol
                name="xmark"
                size={Platform.OS === 'ios' ? 24 : 28}
                color={theme.text}
              />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <DayContent dayData={dayData} selectedCategory={selectedCategory} theme={theme} />
        </ScrollView>
      </ThemedView>
    </Modal>
    );
  }

  // Render the swipeable multi-day view
  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <ThemedView backgroundColor="background" style={styles.container}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: theme.border }]}>
          <View style={styles.headerContent}>
            <ThemedText type="semiBold" style={styles.headerTitle}>
              {formatDate(
                availableDates[currentPage] || dayData.date
              )}
            </ThemedText>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <IconSymbol
                name="xmark"
                size={Platform.OS === 'ios' ? 24 : 28}
                color={theme.text}
              />
            </TouchableOpacity>
          </View>
        </View>

        <PagerView
          ref={pagerRef}
          style={styles.pagerView}
          initialPage={currentDateIndex}
          onPageSelected={handlePageSelected}
          scrollEnabled={true}
          overdrag={true}
        >
          {availableDates.map((date, index) => {
            const currentDayData = allDayData.find((d) => d.date === date) || dayData;
            // Only render content for current page and adjacent pages for performance
            const shouldRender = Math.abs(index - currentPage) <= 1;
            
            return (
              <View key={date} style={styles.pageContainer}>
                {shouldRender ? (
                  <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                    <DayContent
                      dayData={currentDayData}
                      selectedCategory={selectedCategory}
                      theme={theme}
                    />
                  </ScrollView>
                ) : (
                  <View style={styles.content} />
                )}
              </View>
            );
          })}
        </PagerView>

        {/* Navigation Buttons */}
        <View style={[styles.navigationContainer, { borderTopColor: theme.border }]}>
          <TouchableOpacity
            style={[styles.navButton, currentPage === 0 && styles.navButtonDisabled]}
            onPress={navigateToPrevious}
            disabled={currentPage === 0}
          >
            <IconSymbol
              name="chevron.left"
              size={24}
              color={currentPage === 0 ? theme.textMuted : theme.primary}
            />
            <ThemedText
              style={[styles.navButtonText, currentPage === 0 && { color: theme.textMuted }]}
            >
              {currentPage > 0 ? formatShortDate(availableDates[currentPage - 1]) : 'Previous'}
            </ThemedText>
          </TouchableOpacity>

          <View style={styles.pageIndicator}>
            <ThemedText color="textMuted" style={styles.pageIndicatorText}>
              {currentPage + 1} of {availableDates.length}
            </ThemedText>
          </View>

          <TouchableOpacity
            style={[
              styles.navButton,
              styles.navButtonRight,
              currentPage === availableDates.length - 1 && styles.navButtonDisabled,
            ]}
            onPress={navigateToNext}
            disabled={currentPage === availableDates.length - 1}
          >
            <ThemedText
              style={[
                styles.navButtonText,
                currentPage === availableDates.length - 1 && { color: theme.textMuted },
              ]}
            >
              {currentPage < availableDates.length - 1 ? formatShortDate(availableDates[currentPage + 1]) : 'Next'}
            </ThemedText>
            <IconSymbol
              name="chevron.right"
              size={24}
              color={currentPage === availableDates.length - 1 ? theme.textMuted : theme.primary}
            />
          </TouchableOpacity>
        </View>
      </ThemedView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 18,
    flex: 1,
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  section: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    marginLeft: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
    gap: 16,
  },
  summaryItem: {
    alignItems: 'center',
    minWidth: 80,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 8,
    marginBottom: 4,
    textAlign: 'center',
  },
  summaryLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  booksList: {
    gap: 16,
  },
  bookItem: {
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  bookHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  bookInfo: {
    flex: 1,
    marginLeft: 12,
  },
  bookTitle: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 2,
  },
  bookAuthor: {
    fontSize: 14,
    lineHeight: 18,
  },
  progressContainer: {
    marginLeft: 30,
    marginBottom: 8,
  },
  progressText: {
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 2,
  },
  pageRange: {
    fontSize: 13,
  },
  noteContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginLeft: 30,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  noteText: {
    fontSize: 14,
    lineHeight: 20,
    marginLeft: 8,
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 12,
    maxWidth: 200,
  },
  pagerView: {
    flex: 1,
  },
  pageContainer: {
    flex: 1,
  },
  navigationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    minWidth: 100,
  },
  navButtonRight: {
    justifyContent: 'flex-end',
  },
  navButtonDisabled: {
    opacity: 0.5,
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: '500',
    marginHorizontal: 4,
  },
  pageIndicator: {
    alignItems: 'center',
  },
  pageIndicatorText: {
    fontSize: 14,
  },
});

export default ReadingDayDetails;