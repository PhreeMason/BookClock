import React from 'react';
import { StyleSheet } from 'react-native';
import Toast from 'react-native-toast-message';
import { ThemedButton } from './ThemedButton';
import { ThemedView } from './ThemedView';
import { ReadingDeadlineWithProgress } from '@/types/deadline';

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
    } else {
      Toast.show({
        type: 'info',
        text1: 'Delete Book',
        text2: 'This feature is coming soon!',
        autoHide: true,
        visibilityTime: 2000,
        position: 'top',
      });
    }
  };

  return (
    <ThemedView style={styles.actionButtons}>
      <ThemedButton
        title="✓ Mark as Complete"
        backgroundColor="success"
        textColor="primary"
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
        title="🗑️ Delete Book"
        variant="danger"
        style={styles.deleteBtn}
        onPress={handleDelete}
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
