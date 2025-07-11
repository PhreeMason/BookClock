import { synchronize } from '@nozbe/watermelondb/sync'
import { database } from '../database'
import { useSupabase } from '../lib/supabase'
import { useAuth } from '@clerk/clerk-expo'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { SyncStatusService } from './syncStatusService'

export interface SyncResult {
  success: boolean
  error?: string
  timestamp: number
  changes?: {
    pulled: number
    pushed: number
  }
}

export class SyncService {
  private static instance: SyncService
  private supabase: ReturnType<typeof useSupabase> | null = null
  private auth: ReturnType<typeof useAuth> | null = null
  private isSyncing = false

  private constructor() {}

  static getInstance(): SyncService {
    if (!SyncService.instance) {
      SyncService.instance = new SyncService()
    }
    return SyncService.instance
  }

  initialize(supabase: ReturnType<typeof useSupabase>, auth: ReturnType<typeof useAuth>) {
    this.supabase = supabase
    this.auth = auth
  }

  async syncDatabase(): Promise<SyncResult> {
    if (this.isSyncing) {
      throw new Error('Sync already in progress')
    }

    if (!this.supabase || !this.auth) {
      throw new Error('SyncService not initialized')
    }

    if (!this.auth.userId) {
      throw new Error('User not authenticated')
    }

    this.isSyncing = true
    await SyncStatusService.setSyncStatus('syncing')

    try {
      const startTime = Date.now()
      let pulledCount = 0
      let pushedCount = 0

      await synchronize({
        database,
        pullChanges: async ({ lastPulledAt, schemaVersion, migration }) => {
          console.log('Pulling changes from server...', { lastPulledAt, schemaVersion })
          
          const { data, error } = await this.supabase!.rpc('pull_changes', {
            last_pulled_at: lastPulledAt || 0,
            schema_version: schemaVersion,
            migration: migration || null,
            user_id: this.auth!.userId,
          })

          if (error) {
            console.error('Pull failed:', error)
            throw new Error(`Pull failed: ${error.message}`)
          }

          if (data?.changes) {
            // Count total changes pulled
            Object.values(data.changes).forEach((tableChanges: any) => {
              if (Array.isArray(tableChanges)) {
                pulledCount += tableChanges.length
              }
            })
          }

          console.log(`Pulled ${pulledCount} changes from server`)
          return data
        },
        
        pushChanges: async ({ changes, lastPulledAt }) => {
          console.log('Pushing changes to server...', { 
            changeCount: Object.keys(changes).length,
            lastPulledAt 
          })

          // Count total changes being pushed
          Object.values(changes).forEach((tableChanges: any) => {
            if (Array.isArray(tableChanges)) {
              pushedCount += tableChanges.length
            }
          })

          const { data, error } = await this.supabase!.rpc('push_changes', {
            changes,
            last_pulled_at: lastPulledAt || 0,
            user_id: this.auth!.userId,
          })

          if (error) {
            console.error('Push failed:', error)
            throw new Error(`Push failed: ${error.message}`)
          }

          console.log(`Pushed ${pushedCount} changes to server`)
          return data
        },
        
        migrationsEnabledAtVersion: 1,
      })

      const endTime = Date.now()
      const result: SyncResult = {
        success: true,
        timestamp: endTime,
        changes: {
          pulled: pulledCount,
          pushed: pushedCount,
        }
      }

      await SyncStatusService.setSyncStatus('success')
      console.log(`Sync completed successfully in ${endTime - startTime}ms`, result)
      
      return result

    } catch (error) {
      console.error('Sync failed:', error)
      await SyncStatusService.setSyncStatus('error')
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown sync error',
        timestamp: Date.now(),
      }
    } finally {
      this.isSyncing = false
    }
  }

  async forceSyncDatabase(): Promise<SyncResult> {
    // Clear last sync timestamp to force full sync
    await AsyncStorage.removeItem('watermelon_last_sync')
    return this.syncDatabase()
  }

  get isCurrentlySyncing(): boolean {
    return this.isSyncing
  }
}

// Singleton instance
export const syncService = SyncService.getInstance()