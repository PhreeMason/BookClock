import React from 'react';
import {
  Modal,
  StyleSheet,
  View,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import { ThemedText, ThemedView } from '@/components/themed';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useTheme } from '@/theme';
import { DailyDeadlineEntry, FormatFilter } from '@/hooks/useReadingHistory';

interface ReadingDayDetailsProps {
  isVisible: boolean;
  onClose: () => void;
  dayData: DailyDeadlineEntry;
  selectedCategory: FormatFilter;
}

const ReadingDayDetails: React.FC<ReadingDayDetailsProps> = ({
  isVisible,
  onClose,
  dayData,
  selectedCategory,
}) => {
  const { theme } = useTheme();

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

  const formatProgress = (deadline: DailyDeadlineEntry['deadlines'][0]) => {
    if (deadline.format === 'audio') {
      const hours = Math.floor(deadline.progress_made / 60);
      const minutes = deadline.progress_made % 60;
      if (hours > 0) {
        return `${hours}h ${minutes}m`;
      }
      return `${minutes}m`;
    } else {
      return `${deadline.progress_made} pages`;
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
                  {Math.round(dayData.totalProgressMade)}
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
                          Due: {new Date(deadline.deadline_date).toLocaleDateString()}
                        </ThemedText>
                      </View>
                    </View>

                    <View style={styles.progressContainer}>
                      <ThemedText style={styles.progressText}>
                        Progress: {formatProgress(deadline)}
                      </ThemedText>
                      <ThemedText color="textMuted" style={styles.pageRange}>
                        Total: {deadline.total_progress}/{deadline.total_quantity} ({Math.round((deadline.total_progress / deadline.total_quantity) * 100)}%)
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
        </ScrollView>
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
});

export default ReadingDayDetails;