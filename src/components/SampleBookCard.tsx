// industry average for reading speed
// 250 words per minute or 40 pages per hour
// color code the countdown number instead of the card border
import { ThemedText } from '@/components/ThemedText';
import React from 'react';
import { Dimensions, ImageBackground, StyleSheet, View } from 'react-native';

interface BookData {
  title: string;
  author: string;
  totalPages: number;
  currentPage: number;
  daysLeft: number;
  format: 'Book' | 'Audio' | 'Ebook';
  coverUrl?: string;
}

const urgencyBorderColorMap = {
  'overdue': '#DC2626',
  'urgent': '#EF4444',
  'good': '#4ADE80',
  'approaching': '#FB923C',
}

interface SampleBookCardProps {
  bookData?: BookData;
}

export function SampleBookCard({ bookData }: SampleBookCardProps) {

  // Default book data for the sample
  const getBookData = (): BookData => {
    return bookData || {
      title: 'The Seven Moons of Maali Almeida',
      author: 'Shehan Karunatilaka',
      totalPages: 320,
      currentPage: 120,
      daysLeft: 40,
      format: 'Book',
      coverUrl: 'https://m.media-amazon.com/images/I/81MF6Z0s1oL._SL1500_.jpg'
    };
  };

  //  🎧 vs 📱 vs 📖
  const formatEmojiMap = {
    'Book': '📖',
    'Audio': '🎧',
    'Ebook': '📱',
  }
  // Calculate pages per day needed based on industry standard
  const calculatePagesPerDay = (totalPages: number, currentPage: number, daysLeft: number): number => {
    const remainingPages = totalPages - currentPage;
    if (daysLeft <= 0) return remainingPages;
    return Math.ceil(remainingPages / daysLeft);
  };

  // Calculate hours per day needed (40 pages per hour industry standard)
  const calculateHoursPerDay = (pagesPerDay: number): number => {
    return Math.round((pagesPerDay / 40) * 10) / 10; // Round to 1 decimal place
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


  const currentBookData = getBookData();
  const pagesPerDay = calculatePagesPerDay(currentBookData.totalPages, currentBookData.currentPage, currentBookData.daysLeft);
  const urgencyLevel = getUrgencyLevel(currentBookData.daysLeft);
  const countdownColor = getUrgencyColor(urgencyLevel);
  const borderColor = getUrgencyColor(urgencyLevel);

  // Consolidated book content rendering
  const renderBookContent = () => (
    <View style={styles.contentContainer}>
      <View style={{ flex: 1, flexDirection: 'row' }}>
        {/* Days Left Counter - Top Left */}
        <View style={styles.daysLeftContainer}>
          <ThemedText type='title' style={[styles.daysLeftNumber, { color: countdownColor }]}>
            {currentBookData.daysLeft}
          </ThemedText>
          <ThemedText style={styles.daysLeftLabel}>
            Days Left
          </ThemedText>
        </View>

        {/* Centered Title and Author */}
        <View style={styles.titleContainer}>
          <ThemedText style={styles.title} numberOfLines={2}>
            {currentBookData.title}
          </ThemedText>
        </View>

        {/* Type and Format Badges - Top Right */}
        <View style={styles.badgesContainer}>
          <View style={styles.formatBadge}>
            <ThemedText style={styles.formatBadgeText}>{formatEmojiMap[currentBookData.format]}</ThemedText>
          </View>
        </View>
      </View>

      {/* Reading Statistics - Bottom */}
      <View style={styles.statsContainer}>
        <ThemedText style={[styles.pagesPerDay]}>
          {pagesPerDay} pages/day needed
        </ThemedText>
        <ThemedText style={[styles.statusMessage, { color: countdownColor }]}>
          {getStatusMessage(urgencyLevel)}
        </ThemedText>
      </View>
    </View>
  );

  return (
    <View style={[styles.card, { borderColor }]}>
      {currentBookData.coverUrl ? (
        <ImageBackground
          source={{ uri: currentBookData.coverUrl }}
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

const { width } = Dimensions.get('window');
const cardWidth = width - 32; // 16px margin on each side

const styles = StyleSheet.create({
  card: {
    width: cardWidth,
    height: 200,
    borderRadius: 16,
    borderWidth: 3,
    marginVertical: 8,
    marginHorizontal: 16,
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
    backgroundColor: 'hsla(0, 0.00%, 0.00%, 0.50)',
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
    backgroundColor: 'hsla(0, 0.00%, 0.00%, 0.50)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  formatBadgeText: {
    color: '#333',
    fontSize: 12,
    fontWeight: '600',
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
    backgroundColor: 'hsla(0, 0.00%, 0.00%, 0.50)',
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

export default SampleBookCard