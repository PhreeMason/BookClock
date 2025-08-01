import { ThemedButton, ThemedView } from '@/components/themed';
import { useDeadlines } from '@/contexts/DeadlineProvider';
import { ReadingDeadlineWithProgress } from '@/types/deadline';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, StyleSheet } from 'react-native';
import Toast from 'react-native-toast-message';

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
  const { deleteDeadline, completeDeadline, setAsideDeadline } = useDeadlines();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [isSettingAside, setIsSettingAside] = useState(false);
  const handleComplete = () => {
    if (onComplete) {
      onComplete();
    } else {
      setIsCompleting(true);
      completeDeadline(
        deadline.id,
        // Success callback
        () => {
          setIsCompleting(false);
          Toast.show({
            type: 'success',
            text1: 'Deadline completed!',
            text2: `Congratulations on finishing "${deadline.book_title}"!`,
            autoHide: true,
            visibilityTime: 3000,
            position: 'top',
            onHide: () => {
              router.replace('/');
            }
          });
        },
        // Error callback
        (error) => {
          setIsCompleting(false);
          Toast.show({
            type: 'error',
            text1: 'Failed to complete deadline',
            text2: error.message || 'Please try again',
            autoHide: true,
            visibilityTime: 3000,
            position: 'top'
          });
        }
      );
    }
  };

  const handleSetAside = () => {
    if (onSetAside) {
      onSetAside();
    } else {
      setIsSettingAside(true);
      setAsideDeadline(
        deadline.id,
        // Success callback
        () => {
          setIsSettingAside(false);
          Toast.show({
            type: 'success',
            text1: 'Book set aside',
            text2: `"${deadline.book_title}" has been set aside for later`,
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
          setIsSettingAside(false);
          Toast.show({
            type: 'error',
            text1: 'Failed to set aside deadline',
            text2: error.message || 'Please try again',
            autoHide: true,
            visibilityTime: 3000,
            position: 'top'
          });
        }
      );
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
        title={isCompleting ? "Completing..." : "✓ Mark as Complete"}
        variant="success"
        style={styles.completeBtn}
        onPress={handleComplete}
        disabled={isCompleting}
      />
      <ThemedButton
        title={isSettingAside ? "Setting aside..." : "📚 Set Aside"}
        variant="secondary"
        style={styles.archiveBtn}
        onPress={handleSetAside}
        disabled={isSettingAside}
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
