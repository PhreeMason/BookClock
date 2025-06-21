// industry average for reading speed
// 250 words per minute or 40 pages per hour
// color code the countdown number instead of the card border
import { ThemedText } from '@/components/ThemedText';
import { calculateCurrentProgress, calculateTotalQuantity } from '@/lib/deadlineCalculations';
import { calculateDaysLeft, calculateProgress, getUnitForFormat } from '@/lib/deadlineUtils';
import { ReadingDeadlineWithProgress } from '@/types/deadline';
import React from 'react';
import { ImageBackground, StyleSheet, View } from 'react-native';

const urgencyBorderColorMap = {
  'overdue': '#DC2626',
  'urgent': '#EF4444',
  'good': '#4ADE80',
  'approaching': '#FB923C',
}

interface DeadlineCardProps {
  deadline: ReadingDeadlineWithProgress;
}

export function DeadlineCard({ deadline }: DeadlineCardProps) {

  //  🎧 vs 📱 vs 📖
  const formatEmojiMap = {
    'physical': '📖',
    'audio': '🎧',
    'ebook': '📱',
  }

  // Calculate units per day needed based on format
  const calculateUnitsPerDay = (totalQuantity: number, currentProgress: number, daysLeft: number, format: 'physical' | 'ebook' | 'audio'): number => {
    const total = calculateTotalQuantity(format, totalQuantity);
    const current = calculateCurrentProgress(format, currentProgress);
    const remaining = total - current;
    
    if (daysLeft <= 0) return remaining;
    return Math.ceil(remaining / daysLeft);
  };

  // Get color coding based on urgency
  const getUrgencyLevel = (daysLeft: number): 'overdue' | 'urgent' | 'good' | 'approaching' => {
    if (daysLeft <= 0) return 'overdue';
    if (daysLeft <= 7) return 'urgent';
    if (daysLeft <= 14) return 'approaching';
    return 'good';
  };

  const getUrgencyColor = (urgencyLevel: string): string => {
    switch (urgencyLevel) {
      case 'overdue': return '#DC2626';
      case 'urgent': return '#EF4444';
      case 'good': return '#4ADE80';
      case 'approaching': return '#FB923C';
      default: return '#4ECDC4';
    }
  };

  const getStatusMessage = (urgencyLevel: string): string => {
    if (urgencyLevel === 'overdue') return 'Return or renew';
    if (urgencyLevel === 'urgent') return 'Tough timeline';
    if (urgencyLevel === 'good') return "You're doing great";
    if (urgencyLevel === 'approaching') return 'A bit more daily';
    return 'Good';
  }

  const currentProgress = calculateProgress(deadline);
  const daysLeft = calculateDaysLeft(deadline.deadline_date);
  const unitsPerDay = calculateUnitsPerDay(deadline.total_quantity, currentProgress, daysLeft, deadline.format);
  const urgencyLevel = getUrgencyLevel(daysLeft);
  const countdownColor = getUrgencyColor(urgencyLevel);
  const borderColor = getUrgencyColor(urgencyLevel);
  const unit = getUnitForFormat(deadline.format);

  // Format the units per day display based on format
  const formatUnitsPerDay = (units: number, format: 'physical' | 'ebook' | 'audio'): string => {
    if (format === 'audio') {
      const hours = Math.floor(units / 60);
      const minutes = units % 60;
      if (hours > 0) {
        return `${hours}h ${minutes}m/day needed`;
      }
      return `${minutes} minutes/day needed`;
    }
    return `${units} ${unit}/day needed`;
  };

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
          {getStatusMessage(urgencyLevel)}
        </ThemedText>
      </View>
    </View>
  );

  return (
    <View style={[styles.card, { borderColor }]}>
      {true ? (
        <ImageBackground
          source={{ uri: 'https://m.media-amazon.com/images/I/91rnexU88KL._SL1500_.jpg' }}
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