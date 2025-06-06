import { SampleBookCard } from '@/components/SampleBookCard';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { UserAvatar } from '@/components/UserAvatar';
import {
  ArcBookWithDetails,
  getActiveArcBooks,
  getCompletedArcBooks,
  getPendingArcBooks
} from '@/constants/mockData';
import { useUser } from "@clerk/clerk-expo";
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type FilterTab = 'Active' | 'Pending' | 'Done';

export default function HomeScreen() {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState<FilterTab>('Active');

  const getFilteredBooks = (): ArcBookWithDetails[] => {
    switch (activeTab) {
      case 'Active':
        return getActiveArcBooks();
      case 'Pending':
        return getPendingArcBooks();
      case 'Done':
        return getCompletedArcBooks();
      default:
        return getActiveArcBooks();
    }
  };

  const filteredBooks = getFilteredBooks();
  const allActiveBooks = getActiveArcBooks();
  const totalBooks = allActiveBooks.length;
  const booksThisMonth = allActiveBooks.filter(book => {
    const bookDate = new Date(book.book.date_added || '');
    const currentMonth = new Date().getMonth();
    return bookDate.getMonth() === currentMonth;
  }).length;




  // Helper function to get greeting with user's name
  const getGreeting = () => {
    const now = new Date();
    const hour = now.getHours();
    let timeOfDay = 'Good morning';

    if (hour >= 12 && hour < 17) {
      timeOfDay = 'Good afternoon';
    } else if (hour >= 17) {
      timeOfDay = 'Good evening';
    }

    const name = user?.firstName || 'there';
    return `${timeOfDay}, ${name}! 👋`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <ThemedView style={styles.header} lightColor="#fff">
          <ThemedView style={styles.headerRow}>
            <ThemedView style={styles.headerLeft}>
              <ThemedText type="title" style={styles.greeting}>{getGreeting()}</ThemedText>
              <ThemedView style={styles.statsRow}>
                <ThemedView style={styles.stat}>
                  <ThemedText style={styles.statNumber}>{totalBooks}</ThemedText>
                  <ThemedText style={styles.statLabel}>Active ARCs</ThemedText>
                </ThemedView>
                <ThemedView style={styles.stat}>
                  <ThemedText style={styles.statNumber}>{booksThisMonth}</ThemedText>
                  <ThemedText style={styles.statLabel}>This Month</ThemedText>
                </ThemedView>
              </ThemedView>
            </ThemedView>
            <UserAvatar size={40} />
          </ThemedView>
        </ThemedView>

        {/* Filter Tabs */}
        <ThemedView style={styles.filterTabs}>
          {(['Active', 'Pending', 'Done'] as FilterTab[]).map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.filterTab, activeTab === tab && styles.filterTabActive]}
              onPress={() => setActiveTab(tab)}
            >
              <ThemedText style={[
                styles.filterTabText,
                activeTab === tab && styles.filterTabTextActive
              ]}>
                {tab}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </ThemedView>

        <SampleBookCard />
        <SampleBookCard bookData={{
          title: 'Playground: A Novel',
          author: ' Richard Powers',
          totalPages: 320,
          currentPage: 120,
          daysLeft: 10,
          format: 'Book',
          coverUrl: 'https://m.media-amazon.com/images/I/91rnexU88KL._SL1500_.jpg'
        }} />
        {/* Content */}
        <View style={styles.content}>


          {filteredBooks.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>
                No {activeTab.toLowerCase()} books found
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f7',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerLeft: {
    flex: 1,
  },
  greeting: {
    marginBottom: 8,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 24,
  },
  stat: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: '#007aff',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },

  filterTabs: {
    flexDirection: 'row',
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
    padding: 4,
    marginHorizontal: 20,
    marginVertical: 16,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  filterTabActive: {
    backgroundColor: '#007aff',
  },
  filterTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  filterTabTextActive: {
    color: 'white',
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },

  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
  },
});
