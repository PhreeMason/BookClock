import { ExternalLink } from "@/components/ExternalLink";
import { Loader } from "@/components/Loader";
import { ThemedScrollView } from "@/components/ThemedScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useGetBookData } from "@/hooks/useBooks";
import { BookData } from "@/types/book";
import { useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import { Image, Pressable, StyleSheet, View } from "react-native";

const BookDisplayScreen: React.FC = () => {
  const { api_id } = useLocalSearchParams<{ api_id: string }>();
  const { data, isLoading, error } = useGetBookData(api_id as string);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  if (isLoading) {
    return <Loader text="Loading book details..." fullScreen />;
  }

  if (error) {
    return (
      <ThemedView style={styles.errorContainer}>
        <ThemedText style={styles.errorText}>
          Error loading book details
        </ThemedText>
        <ThemedText style={styles.errorDetail}>
          {error instanceof Error ? error.message : "An unknown error occurred"}
        </ThemedText>
      </ThemedView>
    );
  }

  if (!data) {
    return (
      <ThemedView style={styles.errorContainer}>
        <ThemedText style={styles.errorText}>No book data available</ThemedText>
      </ThemedView>
    );
  }

  // Type-safe data casting
  const bookData = data as BookData;

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const stripHtmlTags = (html: string): string => {
    return html.replace(/<[^>]*>/g, "").replace(/&amp;/g, "&");
  };

  const formatAuthors = (authors: string[]): string => {
    return authors.join(", ");
  };

  const formatRatingCount = (count: number): string => {
    return count.toLocaleString();
  };

  const capitalizeFormat = (format: string): string => {
    return format.charAt(0).toUpperCase() + format.slice(1);
  };

  const extractGoodreadsId = (apiId: string): string => {
    return apiId.split("-")[0];
  };

  const truncateDescription = (text: string, maxLength: number = 200): string => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + "...";
  };

  const shouldShowMoreButton = (text: string, maxLength: number = 200): boolean => {
    return text.length > maxLength;
  };

  return (
    <ThemedScrollView style={styles.container}>
      {/* Header with Book Cover */}
      <ThemedView style={styles.header}>
        {bookData.cover_image_url ? (
          <Image
            source={{ uri: bookData.cover_image_url }}
            style={styles.coverImage}
            resizeMode="contain"
          />
        ) : (
          <View style={styles.placeholderCover}>
            <ThemedText style={styles.placeholderText}>📚</ThemedText>
          </View>
        )}
        
        <View style={styles.headerInfo}>
          <ThemedText type="title" style={styles.title}>
            {bookData.title}
          </ThemedText>

          {bookData.metadata?.authors &&
            bookData.metadata.authors.length > 0 && (
              <ThemedText type="subtitle" style={styles.author}>
                by {formatAuthors(bookData.metadata.authors)}
              </ThemedText>
            )}

          {bookData.rating && (
            <View style={styles.ratingContainer}>
              <ThemedText style={styles.rating}>
                ⭐ {bookData.rating}
              </ThemedText>
              {bookData.metadata?.rating_count && (
                <ThemedText style={styles.ratingCount}>
                  ({formatRatingCount(bookData.metadata.rating_count)} ratings)
                </ThemedText>
              )}
            </View>
          )}
        </View>
      </ThemedView>

      {/* Description with Show More */}
      {bookData.description && (
        <ThemedView style={styles.section}>
          <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
            Description
          </ThemedText>
          <ThemedText style={styles.description}>
            {isDescriptionExpanded 
              ? stripHtmlTags(bookData.description)
              : truncateDescription(stripHtmlTags(bookData.description))
            }
          </ThemedText>
          {shouldShowMoreButton(stripHtmlTags(bookData.description)) && (
            <Pressable
              style={styles.showMoreButton}
              onPress={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
            >
              <ThemedText type="link" style={styles.showMoreText}>
                {isDescriptionExpanded ? "Show less" : "Show more"}
              </ThemedText>
            </Pressable>
          )}
        </ThemedView>
      )}

      {/* Book Details */}
      <ThemedView style={styles.section}>
        <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
          Details
        </ThemedText>

        {bookData.publication_date && (
          <View style={styles.detailRow}>
            <ThemedText style={styles.detailLabel}>Published:</ThemedText>
            <ThemedText style={styles.detailValue}>
              {formatDate(bookData.publication_date)}
            </ThemedText>
          </View>
        )}

        {bookData.total_pages && (
          <View style={styles.detailRow}>
            <ThemedText style={styles.detailLabel}>Pages:</ThemedText>
            <ThemedText style={styles.detailValue}>
              {bookData.total_pages}
            </ThemedText>
          </View>
        )}

        {bookData.language && (
          <View style={styles.detailRow}>
            <ThemedText style={styles.detailLabel}>Language:</ThemedText>
            <ThemedText style={styles.detailValue}>
              {bookData.language}
            </ThemedText>
          </View>
        )}

        {bookData.publisher && (
          <View style={styles.detailRow}>
            <ThemedText style={styles.detailLabel}>Publisher:</ThemedText>
            <ThemedText style={styles.detailValue}>
              {bookData.publisher}
            </ThemedText>
          </View>
        )}

        {bookData.isbn13 && (
          <View style={styles.detailRow}>
            <ThemedText style={styles.detailLabel}>ISBN-13:</ThemedText>
            <ThemedText style={styles.detailValue}>
              {bookData.isbn13}
            </ThemedText>
          </View>
        )}

        {bookData.format && (
          <View style={styles.detailRow}>
            <ThemedText style={styles.detailLabel}>Format:</ThemedText>
            <ThemedText style={styles.detailValue}>
              {capitalizeFormat(bookData.format)}
            </ThemedText>
          </View>
        )}
      </ThemedView>

      {/* Genres */}
      {bookData.genres && bookData.genres.length > 0 && (
        <ThemedView style={styles.section}>
          <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
            Genres
          </ThemedText>
          <View style={styles.genresContainer}>
            {bookData.genres.map((genre: string, index: number) => (
              <ThemedView key={index} style={styles.genreTag}>
                <ThemedText style={styles.genreText}>{genre}</ThemedText>
              </ThemedView>
            ))}
          </View>
        </ThemedView>
      )}

      {/* Series */}
      {bookData.metadata?.series && (
        <ThemedView style={styles.section}>
          <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
            Series
          </ThemedText>
          <ThemedText style={styles.detailValue}>
            {bookData.metadata.series}
          </ThemedText>
        </ThemedView>
      )}

      {/* Awards */}
      {bookData.metadata?.awards && (
        <ThemedView style={styles.section}>
          <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
            Awards
          </ThemedText>
          <ThemedText style={styles.detailValue}>
            {stripHtmlTags(bookData.metadata.awards)}
          </ThemedText>
        </ThemedView>
      )}

      {/* External Links */}
      {bookData.source === "goodreads" && (
        <ThemedView style={styles.section}>
          <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
            External Links
          </ThemedText>
          <ExternalLink
            href={`https://www.goodreads.com/book/show/${extractGoodreadsId(
              bookData.api_id
            )}`}
          >
            <ThemedText type="link" style={styles.linkText}>
              View on Goodreads
            </ThemedText>
          </ExternalLink>
        </ThemedView>
      )}
    </ThemedScrollView>
  );
};

export default BookDisplayScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  errorText: {
    fontSize: 18,
    color: "red",
    textAlign: "center",
    marginBottom: 8,
  },
  errorDetail: {
    fontSize: 14,
    color: "gray",
    textAlign: "center",
  },
  header: {
    flexDirection: "row",
    marginBottom: 24,
    gap: 16,
  },
  coverImage: {
    width: 120,
    height: 180,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  placeholderCover: {
    width: 120,
    height: 180,
    borderRadius: 8,
    backgroundColor: "rgba(0, 0, 0, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    fontSize: 24,
    opacity: 0.6,
  },
  headerInfo: {
    flex: 1,
    justifyContent: "flex-start",
  },
  title: {
    marginBottom: 8,
  },
  author: {
    marginBottom: 12,
    opacity: 0.8,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  rating: {
    fontSize: 16,
    fontWeight: "600",
  },
  ratingCount: {
    fontSize: 14,
    opacity: 0.7,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    opacity: 0.9,
    marginBottom: 8,
  },
  showMoreButton: {
    alignSelf: "flex-start",
    paddingVertical: 4,
  },
  showMoreText: {
    fontSize: 16,
    fontWeight: "600",
  },
  detailRow: {
    flexDirection: "row",
    marginBottom: 8,
    alignItems: "flex-start",
  },
  detailLabel: {
    fontSize: 16,
    fontWeight: "600",
    width: 100,
    marginRight: 8,
  },
  detailValue: {
    fontSize: 16,
    flex: 1,
    opacity: 0.9,
  },
  genresContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  genreTag: {
    backgroundColor: "rgba(0, 122, 255, 0.1)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(0, 122, 255, 0.3)",
  },
  genreText: {
    fontSize: 14,
    color: "#007AFF",
  },
  linkText: {
    fontSize: 16,
  },
});
