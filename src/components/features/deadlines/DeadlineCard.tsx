import { ThemedText } from '@/components/themed';
import { useDeadlines } from '@/contexts/DeadlineProvider';
import { useFetchBookById } from '@/hooks/useBooks';
import { ReadingDeadlineWithProgress } from '@/types/deadline';
import { useRouter } from 'expo-router';
import React from 'react';
import { ImageBackground, Platform, Pressable, StyleSheet, View } from 'react-native';

const urgencyBorderColorMap = {
  'complete': '#3B82F6',
  'set_aside': '#9CA3AF',
  'overdue': '#C17B7B',
  'urgent': '#C17B7B',
  'good': '#95B99C',
  'approaching': '#D4A574',
  'impossible': '#C17B7B', // Same as overdue
}

const backgroundImageUrl = {
    default: 'https://images.unsplash.com/photo-1750712406219-549c4ba27210?q=80&w=1887&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    desert: 'https://images.unsplash.com/photo-1750712406219-549c4ba27210?q=80&w=1887&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    cherry: 'https://images.unsplash.com/photo-1750625991979-a008c832e04c?q=80&w=1887&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
}


interface DeadlineCardProps {
  deadline: ReadingDeadlineWithProgress;
  disableNavigation?: boolean;
}

export function DeadlineCard({ deadline, disableNavigation = false }: DeadlineCardProps) {
  const { getDeadlineCalculations, formatUnitsPerDay } = useDeadlines();
  const router = useRouter();
  
  // Fetch book data if deadline has a book_id
  const { data: bookData } = useFetchBookById(deadline.book_id);

  //  🎧 vs 📱 vs 📖
  const formatEmojiMap = {
    'physical': '📖',
    'audio': '🎧',
    'ebook': '📱',
  }

  const {
    daysLeft,
    unitsPerDay,
    urgencyLevel,
    statusMessage
  } = getDeadlineCalculations(deadline);

  const shadowStyle = Platform.select({
    ios: {
      shadowColor: 'rgba(184, 169, 217, 0.1)',
      shadowOffset: { width: 2, height: 8 },
      shadowOpacity: 0.25,
      shadowRadius: 8,
    },
    android: {
      elevation: 5,
    },
  });

  let countdownColor = urgencyBorderColorMap[urgencyLevel];
  let borderColor = 'rgba(184, 169, 217, 0.1)';

  // Check if deadline is archived (completed or set aside)
  const latestStatus = deadline.status && deadline.status.length > 0 
    ? deadline.status[deadline.status.length - 1].status 
    : 'reading';
  
  const isArchived = latestStatus === 'complete' || latestStatus === 'set_aside';
  if (isArchived) {
    borderColor = urgencyBorderColorMap[latestStatus];
    countdownColor = urgencyBorderColorMap[latestStatus];
  }

  // Consolidated book content rendering
  const renderBookContent = () => (
    <View style={styles.contentContainer}>
      <View style={{ flex: 1, flexDirection: 'row' }}>
        {/* Days Left Counter - Top Left */}
        <View style={styles.daysLeftContainer}>
          {isArchived ? (
            <>
              <ThemedText type='title' style={[styles.archivedIcon, { color: countdownColor }]}>
                {latestStatus === 'complete' ? '✓' : '📌'}
              </ThemedText>
              <ThemedText style={styles.daysLeftLabel}>
                {latestStatus === 'complete' ? 'Complete' : 'Set Aside'}
              </ThemedText>
            </>
          ) : (
            <>
              <ThemedText type='title' style={[styles.daysLeftNumber, { color: countdownColor }]}>
                {daysLeft}
              </ThemedText>
              <ThemedText style={styles.daysLeftLabel}>
                Days Left
              </ThemedText>
            </>
          )}
        </View>

        {/* Centered Title and Author */}
        <View style={styles.titleContainer}>
          <ThemedText style={styles.title} numberOfLines={2}>
            {deadline.book_title}
          </ThemedText>
        </View>

        {/* Format Badge - Top Right */}
        <View style={styles.badgesContainer}>
          <View style={styles.formatBadge}>
            <ThemedText style={styles.formatBadgeText}>{formatEmojiMap[deadline.format]}</ThemedText>
          </View>
        </View>
      </View>

      {/* Reading Statistics - Bottom */}
      <View style={styles.statsContainer}>
        <ThemedText style={[styles.pagesPerDay]}>
          {formatUnitsPerDay(unitsPerDay, deadline.format)}
        </ThemedText>
        <ThemedText style={[styles.statusMessage, { color: countdownColor }]}>
          {statusMessage}
        </ThemedText>
      </View>
    </View>
  );

  const handlePress = () => {
    if (!disableNavigation) {
      router.push(`/deadline/${deadline.id}/view`);
    }
  };

  // Determine which background image to use
  const getBackgroundImageUrl = () => {
    // If we have book data and it has a cover image, use that
    if (bookData?.cover_image_url) {
      return bookData.cover_image_url;
    }
    // Otherwise, fall back to the default background
    return backgroundImageUrl['default'];
  };

  return (
    <Pressable onPress={handlePress} style={({ pressed }) => [
      { opacity: pressed ? 0.8 : 1 }
    ]}>
      <View style={[styles.card, shadowStyle, {borderColor}]}>
        <ImageBackground
          source={{ uri: getBackgroundImageUrl() }}
          style={styles.backgroundImage}
          blurRadius={bookData?.cover_image_url ? 15 : 50} // Less blur for book covers
        >
          {renderBookContent()}
        </ImageBackground>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    height: 200,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    backgroundColor: 'white'
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  placeholderBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    padding: 16,
    flex: 1,
    backgroundColor: 'rgba(147, 148, 147, 0.09)'
  },
  placeholderText: {
    fontSize: 48,
  },
  daysLeftContainer: {
    alignItems: 'center',
    backgroundColor: 'hsla(0, 0.00%, 0.00%, 0.45)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    maxHeight: 80,
  },
  daysLeftNumber: {
    paddingTop: 6,
    paddingHorizontal: 4,
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 28,
    marginBottom: 2,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 6,
    fontFamily: 'CrimsonText-Regular',
  },
  archivedIcon: {
    paddingTop: 6,
    paddingHorizontal: 4,
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 28,
    marginBottom: 2,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 6,
  },
  daysLeftLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: 'rgb(255, 255, 255)',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  badgesContainer: {
    alignItems: 'flex-end',
    gap: 6,
  },
  typeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  formatBadge: {
    backgroundColor: 'hsla(0, 0.00%, 0.00%, 0.45)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  formatBadgeText: {
    fontSize: 14,
  },
  titleContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
    color: 'rgb(255, 255, 255)',
    textShadowColor: 'rgba(0,0,0, 0.4)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 6,
    letterSpacing: -0.1,
    fontFamily: 'CrimsonText-SemiBold',
    lineHeight: 26,
  },
  statsContainer: {
    alignItems: 'center',
    backgroundColor: 'hsla(0, 0.00%, 0.00%, 0.45)',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  pagesPerDay: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    color: 'rgb(255, 255, 255)',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4,
    letterSpacing: 0.1,
  },
  statusMessage: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
    letterSpacing: 0.2,
    lineHeight: 22,
  },
});

export default DeadlineCard