/**
 * Achievement Configurations
 * Static configuration for all achievement types
 */

import { AchievementConfig, EventType, PersistenceType } from './types';

export const ACHIEVEMENT_CONFIGS: AchievementConfig[] = [
  // VOLUME ACHIEVEMENTS
  {
    id: 'page-turner',
    name: 'Page Turner',
    description: 'Read 100 pages total',
    calculatorFunction: 'calculatePageTurner',
    subscribedEvents: [EventType.PROGRESS_UPDATED],
    persistenceStrategy: PersistenceType.CUMULATIVE,
    notificationPriority: 'medium',
    targetValue: 100,
    category: 'volume'
  },
  {
    id: 'ambitious-reader',
    name: 'Ambitious Reader',
    description: 'Read 5 books simultaneously',
    calculatorFunction: 'calculateAmbitiousReader',
    subscribedEvents: [EventType.DEADLINE_STARTED, EventType.DEADLINE_COMPLETED],
    persistenceStrategy: PersistenceType.SNAPSHOT,
    notificationPriority: 'medium',
    targetValue: 5,
    category: 'volume'
  },
  {
    id: 'book-worm',
    name: 'Book Worm',
    description: 'Complete 5 books',
    calculatorFunction: 'calculateBookWorm',
    subscribedEvents: [EventType.DEADLINE_COMPLETED],
    persistenceStrategy: PersistenceType.CUMULATIVE,
    notificationPriority: 'high',
    targetValue: 5,
    category: 'volume'
  },

  // CONSISTENCY ACHIEVEMENTS
  {
    id: 'consistency-champion',
    name: 'Consistency Champion',
    description: 'Maintain a 7-day reading streak',
    calculatorFunction: 'calculateConsistencyChampion',
    subscribedEvents: [EventType.DAILY_READING_SESSION, EventType.PROGRESS_UPDATED],
    persistenceStrategy: PersistenceType.SNAPSHOT,
    notificationPriority: 'high',
    targetValue: 7,
    category: 'consistency'
  },
  {
    id: 'streak-master',
    name: 'Streak Master',
    description: 'Maintain a 30-day reading streak',
    calculatorFunction: 'calculateStreakMaster',
    subscribedEvents: [EventType.DAILY_READING_SESSION, EventType.PROGRESS_UPDATED],
    persistenceStrategy: PersistenceType.SNAPSHOT,
    notificationPriority: 'high',
    targetValue: 30,
    category: 'consistency'
  },
  {
    id: 'weekend-warrior',
    name: 'Weekend Warrior',
    description: 'Read on 10 weekends',
    calculatorFunction: 'calculateWeekendWarrior',
    subscribedEvents: [EventType.DAILY_READING_SESSION],
    persistenceStrategy: PersistenceType.CUMULATIVE,
    notificationPriority: 'medium',
    targetValue: 10,
    category: 'consistency'
  },

  // SPEED ACHIEVEMENTS
  {
    id: 'speed-reader',
    name: 'Speed Reader',
    description: 'Read 50 pages in a single day',
    calculatorFunction: 'calculateSpeedReader',
    subscribedEvents: [EventType.DAILY_READING_SESSION, EventType.PROGRESS_UPDATED],
    persistenceStrategy: PersistenceType.CUMULATIVE,
    notificationPriority: 'medium',
    targetValue: 50,
    category: 'speed'
  },
  {
    id: 'rapid-reader',
    name: 'Rapid Reader',
    description: 'Read 100 pages in a single day',
    calculatorFunction: 'calculateRapidReader',
    subscribedEvents: [EventType.DAILY_READING_SESSION, EventType.PROGRESS_UPDATED],
    persistenceStrategy: PersistenceType.CUMULATIVE,
    notificationPriority: 'high',
    targetValue: 100,
    category: 'speed'
  },
  {
    id: 'marathon-listener',
    name: 'Marathon Listener',
    description: 'Listen to 10 hours of audiobooks',
    calculatorFunction: 'calculateMarathonListener',
    subscribedEvents: [EventType.DAILY_READING_SESSION, EventType.PROGRESS_UPDATED],
    persistenceStrategy: PersistenceType.CUMULATIVE,
    notificationPriority: 'medium',
    targetValue: 10,
    category: 'speed'
  },

  // DIVERSITY ACHIEVEMENTS
  {
    id: 'format-explorer',
    name: 'Format Explorer',
    description: 'Read books in all 3 formats (physical, ebook, audio)',
    calculatorFunction: 'calculateFormatExplorer',
    subscribedEvents: [EventType.DEADLINE_STARTED, EventType.PROGRESS_UPDATED],
    persistenceStrategy: PersistenceType.CUMULATIVE,
    notificationPriority: 'medium',
    targetValue: 3,
    category: 'diversity'
  },

  // LIBRARY/SOURCE ACHIEVEMENTS
  {
    id: 'library-warrior',
    name: 'Library Warrior',
    description: 'Read 10 books from the library',
    calculatorFunction: 'calculateLibraryWarrior',
    subscribedEvents: [EventType.DEADLINE_COMPLETED],
    persistenceStrategy: PersistenceType.CUMULATIVE,
    notificationPriority: 'medium',
    targetValue: 10,
    category: 'social'
  },

  // TIMING ACHIEVEMENTS
  {
    id: 'early-finisher',
    name: 'Early Finisher',
    description: 'Complete 5 books before their deadline',
    calculatorFunction: 'calculateEarlyFinisher',
    subscribedEvents: [EventType.DEADLINE_COMPLETED],
    persistenceStrategy: PersistenceType.CUMULATIVE,
    notificationPriority: 'high',
    targetValue: 5,
    category: 'speed'
  },

  // LEGACY COMPATIBILITY ACHIEVEMENTS
  {
    id: 'dedicated-reader',
    name: 'Dedicated Reader',
    description: 'Maintain a 14-day reading streak',
    calculatorFunction: 'calculateDedicatedReader',
    subscribedEvents: [EventType.DAILY_READING_SESSION, EventType.PROGRESS_UPDATED],
    persistenceStrategy: PersistenceType.SNAPSHOT,
    notificationPriority: 'medium',
    targetValue: 14,
    category: 'consistency'
  },
  {
    id: 'reading-habit-master',
    name: 'Reading Habit Master',
    description: 'Maintain a 21-day reading streak',
    calculatorFunction: 'calculateReadingHabitMaster',
    subscribedEvents: [EventType.DAILY_READING_SESSION, EventType.PROGRESS_UPDATED],
    persistenceStrategy: PersistenceType.SNAPSHOT,
    notificationPriority: 'medium',
    targetValue: 21,
    category: 'consistency'
  },
  {
    id: 'reading-champion',
    name: 'Reading Champion',
    description: 'Maintain a 60-day reading streak',
    calculatorFunction: 'calculateReadingChampion',
    subscribedEvents: [EventType.DAILY_READING_SESSION, EventType.PROGRESS_UPDATED],
    persistenceStrategy: PersistenceType.SNAPSHOT,
    notificationPriority: 'high',
    targetValue: 60,
    category: 'consistency'
  },
  {
    id: 'century-reader',
    name: 'Century Reader',
    description: 'Maintain a 100-day reading streak',
    calculatorFunction: 'calculateCenturyReader',
    subscribedEvents: [EventType.DAILY_READING_SESSION, EventType.PROGRESS_UPDATED],
    persistenceStrategy: PersistenceType.SNAPSHOT,
    notificationPriority: 'high',
    targetValue: 100,
    category: 'consistency'
  },
  {
    id: 'half-year-scholar',
    name: 'Half Year Scholar',
    description: 'Maintain a 180-day reading streak',
    calculatorFunction: 'calculateHalfYearScholar',
    subscribedEvents: [EventType.DAILY_READING_SESSION, EventType.PROGRESS_UPDATED],
    persistenceStrategy: PersistenceType.SNAPSHOT,
    notificationPriority: 'high',
    targetValue: 180,
    category: 'consistency'
  },
  {
    id: 'year-long-scholar',
    name: 'Year Long Scholar',
    description: 'Maintain a 365-day reading streak',
    calculatorFunction: 'calculateYearLongScholar',
    subscribedEvents: [EventType.DAILY_READING_SESSION, EventType.PROGRESS_UPDATED],
    persistenceStrategy: PersistenceType.SNAPSHOT,
    notificationPriority: 'high',
    targetValue: 365,
    category: 'consistency'
  }
];