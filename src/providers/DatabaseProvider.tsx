import React, { createContext, useContext, ReactNode, useEffect, useState } from 'react'
import { Database } from '@nozbe/watermelondb'
import { database } from '../database'
import { syncService } from '../services/syncService'
import { migrationService } from '../services/migrationService'
import { networkService } from '../services/networkService'
import { useSupabase } from '../lib/supabase'
import { useAuth } from '@clerk/clerk-expo'

interface DatabaseContextValue {
  database: Database
  isReady: boolean
  isMigrated: boolean
  syncService: typeof syncService
  migrationService: typeof migrationService
  networkService: typeof networkService
}

const DatabaseContext = createContext<DatabaseContextValue | null>(null)

interface DatabaseProviderProps {
  children: ReactNode
}

export const DatabaseProvider: React.FC<DatabaseProviderProps> = ({ children }) => {
  const [isReady, setIsReady] = useState(false)
  const [isMigrated, setIsMigrated] = useState(false)
  const supabase = useSupabase()
  const auth = useAuth()

  useEffect(() => {
    const initializeDatabase = async () => {
      try {
        console.log('Initializing WatermelonDB...')
        
        // Initialize services with auth and supabase
        syncService.initialize(supabase, auth)
        migrationService.initialize(supabase, auth)
        
        // Check if user has been migrated
        // This could be stored in AsyncStorage or checked by looking for user data
        const profiles = await database.collections.get('profiles').query().fetch()
        const hasMigrated = profiles.length > 0
        
        setIsMigrated(hasMigrated)
        setIsReady(true)
        
        console.log('WatermelonDB initialization complete', {
          isReady: true,
          isMigrated: hasMigrated
        })
        
      } catch (error) {
        console.error('Failed to initialize WatermelonDB:', error)
        // Could fallback to Supabase-only mode here
        setIsReady(true) // Still mark as ready to prevent blocking
        setIsMigrated(false)
      }
    }

    initializeDatabase()
  }, [supabase, auth])

  const value: DatabaseContextValue = {
    database,
    isReady,
    isMigrated,
    syncService,
    migrationService,
    networkService,
  }

  return (
    <DatabaseContext.Provider value={value}>
      {children}
    </DatabaseContext.Provider>
  )
}

export const useDatabase = () => {
  const context = useContext(DatabaseContext)
  if (!context) {
    throw new Error('useDatabase must be used within a DatabaseProvider')
  }
  return context.database
}

export const useDatabaseContext = () => {
  const context = useContext(DatabaseContext)
  if (!context) {
    throw new Error('useDatabaseContext must be used within a DatabaseProvider')
  }
  return context
}