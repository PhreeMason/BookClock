import React from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';

export interface BookData {
  api_id: string;
  api_source: string;
  bookUrl: string;
  cover_image_url: string;
  title: string;
  publication_date: string | null;
  rating: number;
  source: string;
  epub_url: string;
  metadata: {
    goodreads_id: string;
    edition_count: number | null;
    ratings_count: number;
    series: string | null;
    series_number: number | null;
    authors: string[];
  };
}

interface BookListItemProps {
  book: BookData;
  onPress?: (book: BookData) => void;
}

export function BookListItem({ book, onPress }: BookListItemProps) {
  const formatRating = (rating: number) => {
    return rating.toFixed(2);
  };

  const formatPublicationDate = (date: string | null) => {
    if (!date) return 'Unknown';
    return new Date(date).getFullYear().toString();
  };

  const getAuthorsText = (authors: string[]) => {
    if (authors.length === 0) return 'Unknown Author';
    if (authors.length === 1) return authors[0];
    if (authors.length === 2) return authors.join(' & ');
    return `${authors[0]} & ${authors.length - 1} others`;
  };

  const formatRatingsCount = (count: number) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        pressed && styles.pressed
      ]}
      onPress={() => onPress?.(book)}
    >
      <ThemedView style={styles.content}>
        {/* Book Cover */}
        <View style={styles.coverContainer}>
          {book.cover_image_url ? (
            <Image
              source={{ uri: book.cover_image_url }}
              style={styles.cover}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.placeholderCover}>
              <ThemedText style={styles.placeholderText}>📚</ThemedText>
            </View>
          )}
        </View>

        {/* Book Info */}
        <View style={styles.infoContainer}>
          <ThemedText type="defaultSemiBold" style={styles.title} numberOfLines={2}>
            {book.title}
          </ThemedText>
          
          <ThemedText style={styles.author} numberOfLines={1}>
            by {getAuthorsText(book.metadata.authors)}
          </ThemedText>

          {book.metadata.series && (
            <ThemedText style={styles.series} numberOfLines={1}>
              {book.metadata.series} #{book.metadata.series_number}
            </ThemedText>
          )}

          <View style={styles.detailsRow}>
            <View style={styles.ratingContainer}>
              <ThemedText style={styles.rating}>
                ⭐ {formatRating(book.rating)}
              </ThemedText>
              <ThemedText style={styles.ratingsCount}>
                ({formatRatingsCount(book.metadata.ratings_count)})
              </ThemedText>
            </View>
            
            <ThemedText style={styles.year}>
              {formatPublicationDate(book.publication_date)}
            </ThemedText>
          </View>
        </View>
      </ThemedView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  pressed: {
    opacity: 0.7,
  },
  content: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
  },
  coverContainer: {
    marginRight: 12,
  },
  cover: {
    width: 60,
    height: 90,
    borderRadius: 6,
  },
  placeholderCover: {
    width: 60,
    height: 90,
    borderRadius: 6,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 24,
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
  },
  author: {
    fontSize: 14,
    opacity: 0.7,
  },
  series: {
    fontSize: 12,
    opacity: 0.6,
    fontStyle: 'italic',
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: 14,
    fontWeight: '600',
  },
  ratingsCount: {
    fontSize: 12,
    opacity: 0.6,
    marginLeft: 4,
  },
  year: {
    fontSize: 12,
    opacity: 0.6,
  },
}); 