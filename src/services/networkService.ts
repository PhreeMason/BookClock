import NetInfo from '@react-native-community/netinfo'
import { syncService } from './syncService'
import { SyncStatusService } from './syncStatusService'

export type NetworkStatus = 'online' | 'offline' | 'unknown'

export interface NetworkStatusInfo {
  status: NetworkStatus
  isConnected: boolean
  isInternetReachable: boolean | null
  type: string
}

export class NetworkService {
  private static instance: NetworkService
  private networkStatus: NetworkStatus = 'unknown'
  private listeners: ((status: NetworkStatusInfo) => void)[] = []
  private autoSyncEnabled = true
  private autoSyncInterval = 5 * 60 * 1000 // 5 minutes

  private constructor() {
    this.initialize()
  }

  static getInstance(): NetworkService {
    if (!NetworkService.instance) {
      NetworkService.instance = new NetworkService()
    }
    return NetworkService.instance
  }

  private async initialize() {
    // Listen for network state changes
    NetInfo.addEventListener(state => {
      this.handleNetworkChange(state)
    })

    // Get initial network state
    const state = await NetInfo.fetch()
    this.handleNetworkChange(state)
  }

  private handleNetworkChange(state: any) {
    const wasOffline = this.networkStatus === 'offline'
    
    this.networkStatus = this.determineNetworkStatus(state)
    
    const statusInfo: NetworkStatusInfo = {
      status: this.networkStatus,
      isConnected: state.isConnected ?? false,
      isInternetReachable: state.isInternetReachable,
      type: state.type || 'unknown'
    }

    console.log('Network status changed:', statusInfo)

    // Notify listeners
    this.listeners.forEach(listener => {
      try {
        listener(statusInfo)
      } catch (error) {
        console.error('Error in network status listener:', error)
      }
    })

    // Auto-sync when coming back online
    if (wasOffline && this.networkStatus === 'online' && this.autoSyncEnabled) {
      this.handleReconnection()
    }
  }

  private determineNetworkStatus(state: any): NetworkStatus {
    if (state.isConnected === false) {
      return 'offline'
    }
    
    if (state.isConnected === true && state.isInternetReachable === true) {
      return 'online'
    }
    
    return 'unknown'
  }

  private async handleReconnection() {
    try {
      console.log('Device came back online, checking if auto-sync is needed')
      
      const shouldSync = await SyncStatusService.shouldAutoSync(this.autoSyncInterval)
      
      if (shouldSync) {
        console.log('Triggering auto-sync after reconnection')
        // Small delay to ensure connection is stable
        setTimeout(async () => {
          try {
            await syncService.syncDatabase()
          } catch (error) {
            console.error('Auto-sync after reconnection failed:', error)
          }
        }, 2000)
      }
    } catch (error) {
      console.error('Error handling reconnection:', error)
    }
  }

  getCurrentStatus(): NetworkStatus {
    return this.networkStatus
  }

  async getDetailedStatus(): Promise<NetworkStatusInfo> {
    const state = await NetInfo.fetch()
    return {
      status: this.determineNetworkStatus(state),
      isConnected: state.isConnected ?? false,
      isInternetReachable: state.isInternetReachable,
      type: state.type || 'unknown'
    }
  }

  isOnline(): boolean {
    return this.networkStatus === 'online'
  }

  isOffline(): boolean {
    return this.networkStatus === 'offline'
  }

  addListener(listener: (status: NetworkStatusInfo) => void): () => void {
    this.listeners.push(listener)
    
    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(listener)
      if (index > -1) {
        this.listeners.splice(index, 1)
      }
    }
  }

  removeAllListeners() {
    this.listeners = []
  }

  setAutoSyncEnabled(enabled: boolean) {
    this.autoSyncEnabled = enabled
    console.log(`Auto-sync ${enabled ? 'enabled' : 'disabled'}`)
  }

  setAutoSyncInterval(intervalMs: number) {
    this.autoSyncInterval = intervalMs
    console.log(`Auto-sync interval set to ${intervalMs}ms`)
  }

  async triggerSyncIfOnline(): Promise<boolean> {
    if (!this.isOnline()) {
      console.log('Cannot sync: device is offline')
      return false
    }

    try {
      await syncService.syncDatabase()
      return true
    } catch (error) {
      console.error('Manual sync failed:', error)
      return false
    }
  }
}

// Singleton instance
export const networkService = NetworkService.getInstance()