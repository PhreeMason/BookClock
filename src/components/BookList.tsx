import React from 'react';
import { FlatList, StyleSheet, Text } from 'react-native';
import { BookData, BookListItem } from './BookListItem';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';

interface BookListProps {
  books: BookData[];
  onBookPress?: (book: BookData) => void;
  emptyMessage?: string;
  showEmptyState?: boolean;
}

export function BookList({ 
  books, 
  onBookPress, 
  emptyMessage = "No books found", 
  showEmptyState = true 
}: BookListProps) {

  const renderEmptyState = () => {
    if (!showEmptyState) return null;
    
    return (
      <ThemedView style={styles.emptyContainer}>
        <Text style={styles.emptyText}>📚</Text>
        <ThemedText type="subtitle" style={styles.emptyTitle}>
          {emptyMessage}
        </ThemedText>
        <ThemedText style={styles.emptySubtitle}>
          Search should be at least 4 characters long
        </ThemedText>
      </ThemedView>
    );
  };

  const renderBookItem = ({ item }: { item: BookData }) => (
    <BookListItem 
      book={item} 
      onPress={onBookPress}
    />
  );

  const keyExtractor = (item: BookData) => `${item.api_source}_${item.api_id}`;

  if (books.length === 0) {
    return renderEmptyState();
  }

  return (
    <FlatList
      data={books}
      renderItem={renderBookItem}
      keyExtractor={keyExtractor}
      style={styles.list}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
      initialNumToRender={10}
      maxToRenderPerBatch={10}
      windowSize={10}
      removeClippedSubviews={true}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    flex: 1,
  },
  contentContainer: {
    paddingVertical: 8,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 64,
    borderColor: 'red',
    borderWidth: 1,
  },
  emptyText: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtitle: {
    textAlign: 'center',
    opacity: 0.6,
  },
}); 