import { database } from '../database'
import { useSupabase } from '../lib/supabase'
import { useAuth } from '@clerk/clerk-expo'
import { syncService } from './syncService'
import { SyncStatusService } from './syncStatusService'

export interface MigrationProgress {
  stage: 'preparing' | 'fetching' | 'inserting' | 'finalizing' | 'completed' | 'error'
  progress: number // 0-100
  message: string
  error?: string
}

export type MigrationProgressCallback = (progress: MigrationProgress) => void

export class MigrationService {
  private supabase: ReturnType<typeof useSupabase> | null = null
  private auth: ReturnType<typeof useAuth> | null = null

  initialize(supabase: ReturnType<typeof useSupabase>, auth: ReturnType<typeof useAuth>) {
    this.supabase = supabase
    this.auth = auth
  }

  async migrateUserData(onProgress?: MigrationProgressCallback): Promise<void> {
    if (!this.supabase || !this.auth) {
      throw new Error('MigrationService not initialized')
    }

    if (!this.auth.userId) {
      throw new Error('User not authenticated')
    }

    try {
      // Stage 1: Preparing
      onProgress?.({
        stage: 'preparing',
        progress: 0,
        message: 'Preparing migration...'
      })

      // Clear existing local data
      await database.action(async () => {
        await database.unsafeResetDatabase()
      })

      // Clear sync status
      await SyncStatusService.clearSyncData()

      // Stage 2: Fetching data
      onProgress?.({
        stage: 'fetching',
        progress: 20,
        message: 'Fetching data from server...'
      })

      const userData = await this.fetchAllUserData(onProgress)

      // Stage 3: Inserting data
      onProgress?.({
        stage: 'inserting',
        progress: 60,
        message: 'Importing data to local database...'
      })

      await this.insertDataIntoWatermelonDB(userData, onProgress)

      // Stage 4: Finalizing
      onProgress?.({
        stage: 'finalizing',
        progress: 90,
        message: 'Finalizing migration...'
      })

      // Set initial sync status
      await SyncStatusService.setSyncStatus('success')

      // Initialize sync service
      syncService.initialize(this.supabase, this.auth)

      // Stage 5: Completed
      onProgress?.({
        stage: 'completed',
        progress: 100,
        message: 'Migration completed successfully!'
      })

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown migration error'
      console.error('Migration failed:', error)
      
      onProgress?.({
        stage: 'error',
        progress: 0,
        message: 'Migration failed',
        error: errorMessage
      })

      throw error
    }
  }

  private async fetchAllUserData(onProgress?: MigrationProgressCallback): Promise<Record<string, any[]>> {
    const tables = [
      'profiles',
      'reading_deadlines',
      'reading_deadline_progress',
      'reading_deadline_status',
      'books',
      'achievements',
      'user_achievements',
      'achievement_progress',
      'authors',
      'book_authors',
      'user_books',
      'book_reading_logs',
      'book_notes',
      'book_reviews',
      'user_activity',
      'arc_user_books',
      'arc_book_status_history',
      'book_status_history'
    ]

    const userData: Record<string, any[]> = {}
    const totalTables = tables.length

    for (let i = 0; i < tables.length; i++) {
      const table = tables[i]
      const progress = 20 + (i / totalTables) * 40 // 20-60% progress
      
      onProgress?.({
        stage: 'fetching',
        progress,
        message: `Fetching ${table}...`
      })

      try {
        let query = this.supabase!.from(table).select('*')

        // Add user filtering for user-specific tables
        if (this.isUserSpecificTable(table)) {
          query = query.eq('user_id', this.auth!.userId!)
        }

        // For global tables (like achievements), fetch all records
        const { data, error } = await query

        if (error) {
          console.error(`Error fetching ${table}:`, error)
          // Continue with other tables rather than failing completely
          userData[table] = []
          continue
        }

        userData[table] = data || []
        console.log(`Fetched ${userData[table].length} records from ${table}`)

      } catch (error) {
        console.error(`Failed to fetch ${table}:`, error)
        userData[table] = []
      }
    }

    return userData
  }

  private async insertDataIntoWatermelonDB(
    userData: Record<string, any[]>, 
    onProgress?: MigrationProgressCallback
  ): Promise<void> {
    const totalTables = Object.keys(userData).length
    let processedTables = 0

    await database.action(async () => {
      for (const [tableName, records] of Object.entries(userData)) {
        const progress = 60 + (processedTables / totalTables) * 30 // 60-90% progress
        
        onProgress?.({
          stage: 'inserting',
          progress,
          message: `Importing ${tableName} (${records.length} records)...`
        })

        if (records.length === 0) {
          processedTables++
          continue
        }

        try {
          const collection = database.collections.get(tableName)
          
          for (const record of records) {
            await collection.create((newRecord: any) => {
              // Map Supabase fields to WatermelonDB fields
              const mappedRecord = this.mapSupabaseToWatermelon(record, tableName)
              Object.assign(newRecord, mappedRecord)
            })
          }

          console.log(`Inserted ${records.length} records into ${tableName}`)
        } catch (error) {
          console.error(`Failed to insert data into ${tableName}:`, error)
          // Continue with other tables
        }

        processedTables++
      }
    })
  }

  private mapSupabaseToWatermelon(record: any, tableName: string): any {
    const mapped = { ...record }

    // Convert timestamp strings to numbers (milliseconds)
    const timestampFields = ['created_at', 'updated_at', 'target_date', 'start_date', 'completed_at', 'date', 'unlocked_at', 'last_updated', 'session_date', 'start_date', 'completed_date', 'requested_at', 'approved_at', 'due_date']
    
    timestampFields.forEach(field => {
      if (mapped[field] && typeof mapped[field] === 'string') {
        mapped[field] = new Date(mapped[field]).getTime()
      }
    })

    // Convert JSON fields to strings
    const jsonFields = ['genres', 'metadata', 'criteria', 'activity_data']
    
    jsonFields.forEach(field => {
      if (mapped[field] && typeof mapped[field] === 'object') {
        mapped[field] = JSON.stringify(mapped[field])
      }
    })

    return mapped
  }

  private isUserSpecificTable(tableName: string): boolean {
    const userSpecificTables = [
      'profiles',
      'reading_deadlines',
      'reading_deadline_progress',
      'reading_deadline_status',
      'user_achievements',
      'achievement_progress',
      'user_books',
      'book_reading_logs',
      'book_notes',
      'book_reviews',
      'user_activity',
      'arc_user_books'
    ]

    return userSpecificTables.includes(tableName)
  }

  async validateMigration(): Promise<{ isValid: boolean; issues: string[] }> {
    const issues: string[] = []

    try {
      // Check if essential data exists
      const profiles = await database.collections.get('profiles').query().fetch()
      if (profiles.length === 0) {
        issues.push('No user profile found')
      }

      const deadlines = await database.collections.get('reading_deadlines').query().fetch()
      console.log(`Found ${deadlines.length} reading deadlines after migration`)

      // Check for data integrity
      const achievements = await database.collections.get('achievements').query().fetch()
      if (achievements.length === 0) {
        issues.push('No achievements found - may indicate incomplete migration')
      }

      // Add more validation checks as needed

    } catch (error) {
      issues.push(`Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }

    return {
      isValid: issues.length === 0,
      issues
    }
  }
}

// Singleton instance
export const migrationService = new MigrationService()