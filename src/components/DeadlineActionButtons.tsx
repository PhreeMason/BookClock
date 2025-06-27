import { useDeadlines } from '@/contexts/DeadlineProvider';
import { ReadingDeadlineWithProgress } from '@/types/deadline';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, StyleSheet } from 'react-native';
import Toast from 'react-native-toast-message';
import { ThemedButton, ThemedView } from './themed';

interface DeadlineActionButtonsProps {
  deadline: ReadingDeadlineWithProgress;
  onComplete?: () => void;
  onSetAside?: () => void;
  onDelete?: () => void;
}

const DeadlineActionButtons: React.FC<DeadlineActionButtonsProps> = ({
  deadline,
  onComplete,
  onSetAside,
  onDelete,
}) => {
  const { deleteDeadline } = useDeadlines();
  const [isDeleting, setIsDeleting] = useState(false);
  const handleComplete = () => {
    if (onComplete) {
      onComplete();
    } else {
      Toast.show({
        type: 'info',
        text1: 'Mark as Complete',
        text2: 'This feature is coming soon!',
        autoHide: true,
        visibilityTime: 2000,
        position: 'top',
      });
    }
  };

  const handleSetAside = () => {
    if (onSetAside) {
      onSetAside();
    } else {
      Toast.show({
        type: 'info',
        text1: 'Set Aside',
        text2: 'This feature is coming soon!',
        autoHide: true,
        visibilityTime: 2000,
        position: 'top',
      });
    }
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete();
      return;
    }

    // Show confirmation dialog
    Alert.alert(
      'Delete Deadline',
      `Are you sure you want to delete "${deadline.book_title}"? This action cannot be undone.`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setIsDeleting(true);
            deleteDeadline(
              deadline.id,
              // Success callback
              () => {
                setIsDeleting(false);
                Toast.show({
                  type: 'success',
                  text1: 'Deadline deleted',
                  text2: `"${deadline.book_title}" has been removed`,
                  autoHide: true,
                  visibilityTime: 2000,
                  position: 'top',
                  onHide: () => {
                    router.replace('/');
                  }
                });
              },
              // Error callback
              (error) => {
                setIsDeleting(false);
                Toast.show({
                  type: 'error',
                  text1: 'Failed to delete deadline',
                  text2: error.message || 'Please try again',
                  autoHide: true,
                  visibilityTime: 3000,
                  position: 'top'
                });
              }
            );
          },
        },
      ]
    );
  };

  return (
    <ThemedView style={styles.actionButtons}>
      <ThemedButton
        title="✓ Mark as Complete"
        variant="success"
        style={styles.completeBtn}
        onPress={handleComplete}
      />
      <ThemedButton
        title="📚 Set Aside"
        variant="secondary"
        style={styles.archiveBtn}
        onPress={handleSetAside}
      />
      <ThemedButton
        title={isDeleting ? "Deleting..." : "🗑️ Delete Deadline"}
        variant="dangerOutline"
        style={styles.deleteBtn}
        onPress={handleDelete}
        disabled={isDeleting}
      />
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  actionButtons: {
    gap: 12,
    marginTop: 24,
    paddingBottom: 32,
  },
  completeBtn: {
    marginBottom: 8,
  },
  archiveBtn: {
    marginBottom: 8,
  },
  deleteBtn: {
    marginBottom: 8,
  },
});

export default DeadlineActionButtons;
