import React from 'react';
import { StyleSheet } from 'react-native';
import { ThemedButton } from './ThemedButton';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';

interface DeadlineViewHeaderProps {
  title?: string;
  onBack: () => void;
  onEdit: () => void;
}

const DeadlineViewHeader: React.FC<DeadlineViewHeaderProps> = ({
  title = "Book Details",
  onBack,
  onEdit,
}) => {
  return (
    <ThemedView backgroundColor="card" style={styles.header}>
      <ThemedButton
        title="← Back"
        variant="ghost"
        backgroundColor="transparent"
        textColor="primary"
        onPress={onBack}
      />
      <ThemedText type="subtitle">
        {title}
      </ThemedText>
      <ThemedButton
        title="Edit"
        variant="ghost"
        backgroundColor="transparent"
        textColor="primary"
        onPress={onEdit}
      />
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  header: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
});

export default DeadlineViewHeader;
