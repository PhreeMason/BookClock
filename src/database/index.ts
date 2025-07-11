import { Database } from '@nozbe/watermelondb'
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite'
import { schema } from './schema'
import migrations from './migrations'

// Import all models
import Profile from './models/Profile'
import ReadingDeadline from './models/ReadingDeadline'
import ReadingDeadlineProgress from './models/ReadingDeadlineProgress'
import ReadingDeadlineStatus from './models/ReadingDeadlineStatus'
import Book from './models/Book'
import Achievement from './models/Achievement'
import UserAchievement from './models/UserAchievement'
import AchievementProgress from './models/AchievementProgress'
import Author from './models/Author'
import BookAuthor from './models/BookAuthor'
import UserBook from './models/UserBook'
import BookReadingLog from './models/BookReadingLog'
import BookNote from './models/BookNote'
import BookReview from './models/BookReview'
import UserActivity from './models/UserActivity'
import ArcUserBook from './models/ArcUserBook'
import ArcBookStatusHistory from './models/ArcBookStatusHistory'
import BookStatusHistory from './models/BookStatusHistory'

const adapter = new SQLiteAdapter({
  schema,
  migrations,
  jsi: true,
  onSetUpError: (error) => {
    console.error('WatermelonDB setup error:', error)
    // Handle database setup errors
    // Could implement retry logic or fallback to Supabase-only mode
  }
})

export const database = new Database({
  adapter,
  modelClasses: [
    Profile,
    ReadingDeadline,
    ReadingDeadlineProgress,
    ReadingDeadlineStatus,
    Book,
    Achievement,
    UserAchievement,
    AchievementProgress,
    Author,
    BookAuthor,
    UserBook,
    BookReadingLog,
    BookNote,
    BookReview,
    UserActivity,
    ArcUserBook,
    ArcBookStatusHistory,
    BookStatusHistory,
  ],
})

// Export models for easy access
export {
  Profile,
  ReadingDeadline,
  ReadingDeadlineProgress,
  ReadingDeadlineStatus,
  Book,
  Achievement,
  UserAchievement,
  AchievementProgress,
  Author,
  BookAuthor,
  UserBook,
  BookReadingLog,
  BookNote,
  BookReview,
  UserActivity,
  ArcUserBook,
  ArcBookStatusHistory,
  BookStatusHistory,
}