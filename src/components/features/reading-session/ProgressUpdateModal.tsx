import ReadingProgress from '@/components/shared/ReadingProgress';
import { ThemedText, ThemedView } from '@/components/themed';
import { useFetchBookById } from '@/hooks/useBooks';
import { useTheme } from '@/theme';
import { ReadingDeadlineWithProgress } from '@/types/deadline';
import React from 'react';
import { Image, Modal, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';


interface ProgressUpdateModalProps {
  visible: boolean;
  deadline: ReadingDeadlineWithProgress;
  sessionDuration: number; // in minutes
  onSubmit: () => void;
  onCancel: () => void;
}

export function ProgressUpdateModal({
  visible,
  deadline,
  sessionDuration,
  onSubmit,
  onCancel,
}: ProgressUpdateModalProps) {
  const { theme } = useTheme();
  
  // Fetch book data if deadline has a book_id
  const { data: bookData } = useFetchBookById(deadline?.book_id || null);
  
  const borderColor = theme.border;

  const formatSessionDuration = () => {
    if (sessionDuration >= 60) {
      const hours = Math.floor(sessionDuration / 60);
      const minutes = sessionDuration % 60;
      if (minutes === 0) {
        return `${hours} hour${hours !== 1 ? 's' : ''}`;
      }
      return `${hours} hour${hours !== 1 ? 's' : ''} and ${minutes} minute${minutes !== 1 ? 's' : ''}`;
    }
    return `${sessionDuration} minute${sessionDuration !== 1 ? 's' : ''}`;
  };

  const handleProgressSubmitted = () => {
    onSubmit();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onCancel}
    >
      <ThemedView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={[styles.header, { borderBottomColor: borderColor }]}>
          <TouchableOpacity onPress={onCancel} style={styles.cancelButton}>
            <ThemedText type="link" style={styles.cancelText}>
              Cancel
            </ThemedText>
          </TouchableOpacity>
          <ThemedText type="semiBold" style={styles.headerTitle}>
            Update Progress
          </ThemedText>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <ThemedView style={styles.sessionSummary}>
            <ThemedText type="title" style={styles.summaryTitle}>
              Great reading session! 📚
            </ThemedText>
            <ThemedText style={styles.summaryText}>
              You read for {formatSessionDuration()}
            </ThemedText>
          </ThemedView>

          <ThemedView style={styles.bookInfo}>
            {bookData?.cover_image_url && (
              <View style={styles.coverContainer}>
                <Image
                  source={{ uri: bookData.cover_image_url }}
                  style={styles.coverImage}
                  resizeMode="cover"
                />
              </View>
            )}
            
            <ThemedText type="subtitle" style={styles.bookTitle}>
              {deadline.book_title}
            </ThemedText>
          </ThemedView>

          <ReadingProgress 
            deadline={deadline}
            timeSpentReading={sessionDuration}
            onProgressSubmitted={handleProgressSubmitted}
          />
        </ScrollView>
      </ThemedView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
  },
  cancelButton: {
    marginRight: 8,
  },
  cancelText: {
    fontSize: 16,
  },
  headerTitle: {
    fontSize: 18,
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 60,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sessionSummary: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  summaryTitle: {
    textAlign: 'center',
    marginBottom: 8,
    fontSize: 22,
  },
  summaryText: {
    textAlign: 'center',
    fontSize: 16,
    opacity: 0.8,
  },
  bookInfo: {
    alignItems: 'center',
    marginBottom: 32,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  coverContainer: {
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  coverImage: {
    width: 100,
    height: 150,
    borderRadius: 8,
  },
  bookTitle: {
    textAlign: 'center',
    marginBottom: 8,
  },
});