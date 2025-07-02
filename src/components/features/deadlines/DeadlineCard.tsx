import { ThemedText } from '@/components/themed';
import { useDeadlines } from '@/contexts/DeadlineProvider';
import { ReadingDeadlineWithProgress } from '@/types/deadline';
import { useRouter } from 'expo-router';
import React from 'react';
import { ImageBackground, Pressable, StyleSheet, View } from 'react-native';

const urgencyBorderColorMap = {
  'overdue': '#DC2626',
  'urgent': '#EF4444',
  'good': '#4ADE80',
  'approaching': '#FB923C',
  'impossible': '#DC2626', // Same as overdue
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

  const countdownColor = urgencyBorderColorMap[urgencyLevel];
  const borderColor = urgencyBorderColorMap[urgencyLevel];

  // Consolidated book content rendering
  const renderBookContent = () => (
    <View style={styles.contentContainer}>
      <View style={{ flex: 1, flexDirection: 'row' }}>
        {/* Days Left Counter - Top Left */}
        <View style={styles.daysLeftContainer}>
          <ThemedText type='title' style={[styles.daysLeftNumber, { color: countdownColor }]}>
            {daysLeft}
          </ThemedText>
          <ThemedText style={styles.daysLeftLabel}>
            Days Left
          </ThemedText>
        </View>

        {/* Centered Title and Author */}
        <View style={styles.titleContainer}>
          <ThemedText style={styles.title} numberOfLines={2}>
            {deadline.book_title}
          </ThemedText>
        </View>

        {/* Type and Format Badges - Top Right */}
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

  return (
    <Pressable onPress={handlePress} style={({ pressed }) => [
      { opacity: pressed ? 0.8 : 1 }
    ]}>
      <View style={[styles.card, { borderColor }]}>
        {true ? (
          <ImageBackground
            source={{ uri: backgroundImageUrl['default'] }}
            style={styles.backgroundImage}
            blurRadius={50}
          >
            {renderBookContent()}
          </ImageBackground>
        ) : (
          <View style={styles.placeholderBackground}>
            <ThemedText style={styles.placeholderText}>📚</ThemedText>
            {renderBookContent()}
          </View>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    height: 200,
    borderRadius: 16,
    borderWidth: 3,
    overflow: 'hidden',
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
    backgroundColor: 'rgba(0, 0, 0, 0.2)'
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
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
    color: 'rgb(255, 255, 255)',
    textShadowColor: 'rgba(0,0,0, 0.4)',
    textShadowOffset: { width: 3, height: 3 },
    textShadowRadius: 6,
    letterSpacing: -0.1,
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