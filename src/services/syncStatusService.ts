import AsyncStorage from '@react-native-async-storage/async-storage'

export type SyncStatus = 'never' | 'syncing' | 'success' | 'error'

export interface SyncStatusInfo {
  status: SyncStatus
  lastSyncTime: Date | null
  lastError: string | null
}

export class SyncStatusService {
  private static SYNC_STATUS_KEY = 'watermelon_sync_status'
  private static LAST_SYNC_KEY = 'watermelon_last_sync'
  private static LAST_ERROR_KEY = 'watermelon_last_error'

  static async getSyncStatus(): Promise<SyncStatus> {
    try {
      const status = await AsyncStorage.getItem(this.SYNC_STATUS_KEY)
      return (status as SyncStatus) || 'never'
    } catch (error) {
      console.error('Failed to get sync status:', error)
      return 'never'
    }
  }

  static async setSyncStatus(status: SyncStatus) {
    try {
      await AsyncStorage.setItem(this.SYNC_STATUS_KEY, status)
      
      if (status === 'success') {
        await AsyncStorage.setItem(this.LAST_SYNC_KEY, new Date().toISOString())
        // Clear error on successful sync
        await AsyncStorage.removeItem(this.LAST_ERROR_KEY)
      }
    } catch (error) {
      console.error('Failed to set sync status:', error)
    }
  }

  static async getLastSyncTime(): Promise<Date | null> {
    try {
      const timestamp = await AsyncStorage.getItem(this.LAST_SYNC_KEY)
      return timestamp ? new Date(timestamp) : null
    } catch (error) {
      console.error('Failed to get last sync time:', error)
      return null
    }
  }

  static async setLastError(error: string) {
    try {
      await AsyncStorage.setItem(this.LAST_ERROR_KEY, error)
    } catch (storageError) {
      console.error('Failed to store last error:', storageError)
    }
  }

  static async getLastError(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(this.LAST_ERROR_KEY)
    } catch (error) {
      console.error('Failed to get last error:', error)
      return null
    }
  }

  static async getSyncStatusInfo(): Promise<SyncStatusInfo> {
    const [status, lastSyncTime, lastError] = await Promise.all([
      this.getSyncStatus(),
      this.getLastSyncTime(),
      this.getLastError(),
    ])

    return {
      status,
      lastSyncTime,
      lastError,
    }
  }

  static async clearSyncData() {
    try {
      await AsyncStorage.multiRemove([
        this.SYNC_STATUS_KEY,
        this.LAST_SYNC_KEY,
        this.LAST_ERROR_KEY,
      ])
    } catch (error) {
      console.error('Failed to clear sync data:', error)
    }
  }

  static async getTimeSinceLastSync(): Promise<number | null> {
    const lastSyncTime = await this.getLastSyncTime()
    if (!lastSyncTime) return null
    
    return Date.now() - lastSyncTime.getTime()
  }

  static async shouldAutoSync(intervalMs: number = 5 * 60 * 1000): Promise<boolean> {
    const timeSinceLastSync = await this.getTimeSinceLastSync()
    if (timeSinceLastSync === null) return true // Never synced
    
    return timeSinceLastSync > intervalMs
  }
}