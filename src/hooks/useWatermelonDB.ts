import { useDatabase } from '../providers/DatabaseProvider'
import { Q } from '@nozbe/watermelondb'
import { useAuth } from '@clerk/clerk-expo'
import { useMemo } from 'react'
import { Observable } from 'rxjs'
import { 
  ReadingDeadline, 
  ReadingDeadlineProgress, 
  Book, 
  Achievement, 
  UserAchievement,
  AchievementProgress,
  UserBook,
  BookReadingLog 
} from '../database'

// Hook for reading deadlines
export const useReadingDeadlines = () => {
  const database = useDatabase()
  const { userId } = useAuth()

  return useMemo(() => {
    if (!userId) return null
    
    return database.collections
      .get<ReadingDeadline>('reading_deadlines')
      .query(Q.where('user_id', userId))
      .observe()
  }, [database, userId])
}

// Hook for active (incomplete) reading deadlines
export const useActiveReadingDeadlines = () => {
  const database = useDatabase()
  const { userId } = useAuth()

  return useMemo(() => {
    if (!userId) return null
    
    return database.collections
      .get<ReadingDeadline>('reading_deadlines')
      .query(
        Q.where('user_id', userId),
        Q.where('is_completed', false),
        Q.sortBy('target_date', Q.asc)
      )
      .observe()
  }, [database, userId])
}

// Hook for completed reading deadlines
export const useCompletedReadingDeadlines = () => {
  const database = useDatabase()
  const { userId } = useAuth()

  return useMemo(() => {
    if (!userId) return null
    
    return database.collections
      .get<ReadingDeadline>('reading_deadlines')
      .query(
        Q.where('user_id', userId),
        Q.where('is_completed', true),
        Q.sortBy('completed_at', Q.desc)
      )
      .observe()
  }, [database, userId])
}

// Hook for progress of a specific deadline
export const useReadingDeadlineProgress = (deadlineId: string) => {
  const database = useDatabase()

  return useMemo(() => {
    if (!deadlineId) return null
    
    return database.collections
      .get<ReadingDeadlineProgress>('reading_deadline_progress')
      .query(
        Q.where('deadline_id', deadlineId),
        Q.sortBy('date', Q.desc)
      )
      .observe()
  }, [database, deadlineId])
}

// Hook for recent progress (last N days)
export const useRecentProgress = (deadlineId: string, limit: number = 30) => {
  const database = useDatabase()

  return useMemo(() => {
    if (!deadlineId) return null
    
    return database.collections
      .get<ReadingDeadlineProgress>('reading_deadline_progress')
      .query(
        Q.where('deadline_id', deadlineId),
        Q.sortBy('date', Q.desc),
        Q.take(limit)
      )
      .observe()
  }, [database, deadlineId, limit])
}

// Hook for user achievements
export const useUserAchievements = () => {
  const database = useDatabase()
  const { userId } = useAuth()

  return useMemo(() => {
    if (!userId) return null
    
    return database.collections
      .get<UserAchievement>('user_achievements')
      .query(
        Q.where('user_id', userId),
        Q.sortBy('unlocked_at', Q.desc)
      )
      .observe()
  }, [database, userId])
}

// Hook for achievement progress
export const useAchievementProgress = () => {
  const database = useDatabase()
  const { userId } = useAuth()

  return useMemo(() => {
    if (!userId) return null
    
    return database.collections
      .get<AchievementProgress>('achievement_progress')
      .query(Q.where('user_id', userId))
      .observe()
  }, [database, userId])
}

// Hook for all achievements (for progress calculation)
export const useAllAchievements = () => {
  const database = useDatabase()

  return useMemo(() => {
    return database.collections
      .get<Achievement>('achievements')
      .query(Q.where('is_active', true))
      .observe()
  }, [database])
}

// Hook for user books
export const useUserBooks = (status?: string) => {
  const database = useDatabase()
  const { userId } = useAuth()

  return useMemo(() => {
    if (!userId) return null
    
    let query = database.collections
      .get<UserBook>('user_books')
      .query(Q.where('user_id', userId))

    if (status) {
      query = query.extend(Q.where('status', status))
    }

    return query.observe()
  }, [database, userId, status])
}

// Hook for reading logs
export const useReadingLogs = (bookId?: string, limit?: number) => {
  const database = useDatabase()
  const { userId } = useAuth()

  return useMemo(() => {
    if (!userId) return null
    
    let queryConditions = [Q.where('user_id', userId)]
    
    if (bookId) {
      queryConditions.push(Q.where('book_id', bookId))
    }

    let query = database.collections
      .get<BookReadingLog>('book_reading_logs')
      .query(
        ...queryConditions,
        Q.sortBy('session_date', Q.desc)
      )

    if (limit) {
      query = query.extend(Q.take(limit))
    }

    return query.observe()
  }, [database, userId, bookId, limit])
}

// Hook for books with search
export const useBooks = (searchTerm?: string) => {
  const database = useDatabase()

  return useMemo(() => {
    let query = database.collections.get<Book>('books').query()

    if (searchTerm) {
      query = query.extend(
        Q.or(
          Q.where('title', Q.like(`%${Q.sanitizeLikeString(searchTerm)}%`)),
          Q.where('author', Q.like(`%${Q.sanitizeLikeString(searchTerm)}%`))
        )
      )
    }

    return query.observe()
  }, [database, searchTerm])
}

// Hook for deadline statistics
export const useDeadlineStats = () => {
  const database = useDatabase()
  const { userId } = useAuth()

  return useMemo(() => {
    if (!userId) return null
    
    // This could be enhanced to return computed statistics
    return database.collections
      .get<ReadingDeadline>('reading_deadlines')
      .query(Q.where('user_id', userId))
      .observe()
  }, [database, userId])
}

// Custom hook for observing a single record
export const useRecord = <T>(tableName: string, recordId: string): Observable<T | null> | null => {
  const database = useDatabase()

  return useMemo(() => {
    if (!recordId) return null
    
    return database.collections
      .get(tableName)
      .findAndObserve(recordId) as Observable<T | null>
  }, [database, tableName, recordId])
}