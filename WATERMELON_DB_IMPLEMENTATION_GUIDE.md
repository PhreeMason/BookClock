# WatermelonDB Implementation Guide

This guide provides step-by-step instructions for implementing WatermelonDB in the R-R-Books React Native application.

## Prerequisites

Before starting, ensure you have:
- React Native development environment set up
- Expo CLI installed
- Access to the Supabase project
- Testing devices/simulators ready

## Phase 1: Install Dependencies and Configure

### Step 1: Install WatermelonDB

```bash
cd /path/to/r-r-books
npm install @nozbe/watermelondb
npm install --save-dev @babel/plugin-proposal-decorators
```

### Step 2: Configure Babel

Update `.babelrc` or `babel.config.js`:

```json
{
  "presets": ["babel-preset-expo"],
  "plugins": [
    ["@babel/plugin-proposal-decorators", { "legacy": true }]
  ]
}
```

### Step 3: Update Expo Configuration

Add to `app.json`:

```json
{
  "expo": {
    "plugins": [
      [
        "expo-build-properties",
        {
          "ios": {
            "podfile": {
              "dependencies": {
                "simdjson": "~3.1.0"
              }
            }
          }
        }
      ]
    ]
  }
}
```

### Step 4: Install Network Info (if not already installed)

```bash
npm install @react-native-community/netinfo
```

## Phase 2: Set Up Database Schema and Models

The schema and model files have been created in `src/database/`. Review and adjust if needed:

- `src/database/schema.ts` - Database schema definition
- `src/database/migrations.ts` - Migration management
- `src/database/models/` - All model classes
- `src/database/index.ts` - Database configuration

## Phase 3: Create Supabase RPC Functions

### Step 1: Create Pull Changes Function

In your Supabase SQL editor, run:

```sql
CREATE OR REPLACE FUNCTION pull_changes(
  last_pulled_at bigint,
  schema_version int,
  migration jsonb,
  user_id text
) RETURNS jsonb AS $$
DECLARE
  result jsonb;
  table_name text;
  changes jsonb := '{}';
  table_changes jsonb;
BEGIN
  -- Array of tables to sync
  FOR table_name IN SELECT unnest(ARRAY[
    'profiles', 'reading_deadlines', 'reading_deadline_progress', 
    'reading_deadline_status', 'books', 'achievements', 'user_achievements',
    'achievement_progress', 'authors', 'book_authors', 'user_books',
    'book_reading_logs', 'book_notes', 'book_reviews', 'user_activity',
    'arc_user_books', 'arc_book_status_history', 'book_status_history'
  ]) LOOP
    
    -- Build query to fetch changes for this table
    EXECUTE format('
      SELECT json_agg(
        json_build_object(
          ''id'', id,
          ''_status'', CASE 
            WHEN deleted_at IS NOT NULL THEN ''deleted''
            ELSE ''created''
          END,
          ''_changed'', CASE 
            WHEN deleted_at IS NOT NULL THEN ''''
            ELSE row_to_json(%I.*)::text
          END
        )
      ) 
      FROM %I 
      WHERE (
        (%s) AND
        (EXTRACT(EPOCH FROM COALESCE(updated_at, created_at)) * 1000 > $2)
      )', 
      table_name, 
      table_name,
      CASE 
        WHEN table_name IN ('achievements', 'authors', 'books') THEN 'TRUE'
        ELSE 'user_id = $1'
      END
    ) 
    INTO table_changes 
    USING user_id, last_pulled_at;
    
    IF table_changes IS NOT NULL THEN
      changes := changes || jsonb_build_object(table_name, table_changes);
    END IF;
  END LOOP;
  
  result := jsonb_build_object(
    'changes', changes,
    'timestamp', EXTRACT(EPOCH FROM NOW()) * 1000
  );
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Step 2: Create Push Changes Function

```sql
CREATE OR REPLACE FUNCTION push_changes(
  changes jsonb,
  last_pulled_at bigint,
  user_id text
) RETURNS jsonb AS $$
DECLARE
  table_name text;
  table_changes jsonb;
  record_data jsonb;
  record_id text;
  status text;
  sql_query text;
  columns_list text;
  values_list text;
  update_list text;
BEGIN
  -- Process each table's changes
  FOR table_name IN SELECT jsonb_object_keys(changes) LOOP
    table_changes := changes->table_name;
    
    IF table_changes IS NULL OR jsonb_array_length(table_changes) = 0 THEN
      CONTINUE;
    END IF;
    
    -- Process each record in the table
    FOR record_data IN SELECT * FROM jsonb_array_elements(table_changes) LOOP
      record_id := record_data->>'id';
      status := record_data->>'_status';
      
      IF status = 'deleted' THEN
        -- Soft delete (if your tables support it) or hard delete
        EXECUTE format('DELETE FROM %I WHERE id = $1', table_name) 
        USING record_id;
      ELSE
        -- Prepare the record data (remove WatermelonDB specific fields)
        record_data := record_data - '_status' - '_changed';
        
        -- Insert or update the record
        EXECUTE format('
          INSERT INTO %I (%s) 
          VALUES (%s)
          ON CONFLICT (id) DO UPDATE SET %s
        ', 
          table_name,
          (SELECT string_agg(quote_ident(key), ', ') FROM jsonb_object_keys(record_data) key),
          (SELECT string_agg(quote_literal(value), ', ') FROM jsonb_each_text(record_data) kv(key, value)),
          (SELECT string_agg(quote_ident(key) || ' = ' || quote_literal(value), ', ') 
           FROM jsonb_each_text(record_data - 'id') kv(key, value))
        );
      END IF;
    END LOOP;
  END LOOP;
  
  RETURN jsonb_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Step 3: Grant Permissions

```sql
-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION pull_changes(bigint, int, jsonb, text) TO authenticated;
GRANT EXECUTE ON FUNCTION push_changes(jsonb, bigint, text) TO authenticated;
```

## Phase 4: Update App Configuration

### Step 1: Update Root Layout

Update `app/_layout.tsx` to include the DatabaseProvider:

```tsx
import { DatabaseProvider } from '../src/providers/DatabaseProvider'

export default function RootLayout() {
  return (
    <DatabaseProvider>
      <ClerkProvider publishableKey={clerkPublishableKey}>
        <QueryClient client={queryClient}>
          {/* Rest of your existing app structure */}
        </QueryClient>
      </ClerkProvider>
    </DatabaseProvider>
  )
}
```

## Phase 5: Create Migration UI Components

### Step 1: Create Migration Screen

Create `src/screens/MigrationScreen.tsx`:

```tsx
import React, { useState } from 'react'
import { View, Text, StyleSheet, ActivityIndicator, Alert } from 'react-native'
import { useDatabaseContext } from '../providers/DatabaseProvider'
import { MigrationProgress } from '../services/migrationService'
import { ThemedButton } from '../components/themed/ThemedButton'

export const MigrationScreen: React.FC = () => {
  const { migrationService, isMigrated } = useDatabaseContext()
  const [isLoading, setIsLoading] = useState(false)
  const [progress, setProgress] = useState<MigrationProgress | null>(null)

  const handleMigration = async () => {
    setIsLoading(true)
    setProgress(null)

    try {
      await migrationService.migrateUserData((progress) => {
        setProgress(progress)
      })

      Alert.alert(
        'Migration Complete',
        'Your data has been successfully migrated to offline mode!',
        [{ text: 'OK' }]
      )
    } catch (error) {
      Alert.alert(
        'Migration Failed',
        error instanceof Error ? error.message : 'An unknown error occurred',
        [{ text: 'OK' }]
      )
    } finally {
      setIsLoading(false)
      setProgress(null)
    }
  }

  if (isMigrated) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>✅ Migration Complete</Text>
        <Text style={styles.description}>
          Your app is now running in offline-first mode!
        </Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Enable Offline Mode</Text>
      <Text style={styles.description}>
        Migrate your data to enable offline reading tracking. This is a one-time process.
      </Text>

      {progress && (
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>{progress.message}</Text>
          <View style={styles.progressBar}>
            <View 
              style={[styles.progressFill, { width: `${progress.progress}%` }]} 
            />
          </View>
          <Text style={styles.progressPercentage}>{progress.progress.toFixed(0)}%</Text>
        </View>
      )}

      <ThemedButton
        title={isLoading ? 'Migrating...' : 'Start Migration'}
        onPress={handleMigration}
        disabled={isLoading}
        style={styles.button}
      />

      {isLoading && <ActivityIndicator size="large" style={styles.loader} />}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  progressContainer: {
    width: '100%',
    marginBottom: 24,
  },
  progressText: {
    fontSize: 14,
    marginBottom: 8,
    textAlign: 'center',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007AFF',
  },
  progressPercentage: {
    fontSize: 12,
    textAlign: 'center',
    color: '#666',
  },
  button: {
    width: '100%',
    marginBottom: 16,
  },
  loader: {
    marginTop: 16,
  },
})
```

### Step 2: Create Sync Status Component

Create `src/components/SyncStatusIndicator.tsx`:

```tsx
import React, { useEffect, useState } from 'react'
import { View, Text, StyleSheet, Pressable } from 'react-native'
import { SyncStatusService, SyncStatusInfo } from '../services/syncStatusService'
import { syncService } from '../services/syncService'
import { networkService } from '../services/networkService'

export const SyncStatusIndicator: React.FC = () => {
  const [syncStatus, setSyncStatus] = useState<SyncStatusInfo | null>(null)
  const [isOnline, setIsOnline] = useState(networkService.isOnline())

  useEffect(() => {
    loadSyncStatus()

    // Listen for network changes
    const unsubscribe = networkService.addListener((status) => {
      setIsOnline(status.status === 'online')
    })

    return unsubscribe
  }, [])

  const loadSyncStatus = async () => {
    const status = await SyncStatusService.getSyncStatusInfo()
    setSyncStatus(status)
  }

  const handleSync = async () => {
    if (!isOnline) return

    try {
      await syncService.syncDatabase()
      await loadSyncStatus()
    } catch (error) {
      console.error('Manual sync failed:', error)
    }
  }

  const getStatusColor = () => {
    if (!isOnline) return '#ff6b6b'
    if (syncStatus?.status === 'syncing') return '#4ecdc4'
    if (syncStatus?.status === 'success') return '#51cf66'
    if (syncStatus?.status === 'error') return '#ff6b6b'
    return '#868e96'
  }

  const getStatusText = () => {
    if (!isOnline) return 'Offline'
    if (syncStatus?.status === 'syncing') return 'Syncing...'
    if (syncStatus?.status === 'success') return 'Synced'
    if (syncStatus?.status === 'error') return 'Sync Error'
    return 'Not Synced'
  }

  return (
    <Pressable style={styles.container} onPress={handleSync}>
      <View style={[styles.indicator, { backgroundColor: getStatusColor() }]} />
      <Text style={styles.text}>{getStatusText()}</Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  text: {
    fontSize: 12,
    color: '#666',
  },
})
```

## Phase 6: Gradual Migration Strategy

### Step 1: Feature Flag Implementation

Create `src/utils/featureFlags.ts`:

```tsx
import AsyncStorage from '@react-native-async-storage/async-storage'

export class FeatureFlags {
  private static WATERMELON_ENABLED_KEY = 'feature_watermelon_enabled'

  static async isWatermelonEnabled(): Promise<boolean> {
    try {
      const enabled = await AsyncStorage.getItem(this.WATERMELON_ENABLED_KEY)
      return enabled === 'true'
    } catch {
      return false
    }
  }

  static async enableWatermelon(): Promise<void> {
    await AsyncStorage.setItem(this.WATERMELON_ENABLED_KEY, 'true')
  }

  static async disableWatermelon(): Promise<void> {
    await AsyncStorage.setItem(this.WATERMELON_ENABLED_KEY, 'false')
  }
}
```

### Step 2: Create Hybrid Hook

Create `src/hooks/useDeadlines.ts` (replaces existing hook):

```tsx
import { useQuery } from '@tanstack/react-query'
import { useActiveReadingDeadlines } from './useWatermelonDB'
import { FeatureFlags } from '../utils/featureFlags'
import { useEffect, useState } from 'react'
import { useGetDeadlines } from './existing/useGetDeadlines' // Your existing hook

export const useDeadlines = () => {
  const [useWatermelon, setUseWatermelon] = useState(false)

  useEffect(() => {
    FeatureFlags.isWatermelonEnabled().then(setUseWatermelon)
  }, [])

  // WatermelonDB approach
  const watermelonDeadlines = useActiveReadingDeadlines()
  
  // Existing Supabase approach
  const supabaseDeadlines = useGetDeadlines()

  // Return appropriate data based on feature flag
  if (useWatermelon && watermelonDeadlines) {
    return {
      data: watermelonDeadlines,
      isLoading: false,
      error: null,
      isWatermelon: true,
    }
  }

  return {
    data: supabaseDeadlines.data,
    isLoading: supabaseDeadlines.isLoading,
    error: supabaseDeadlines.error,
    isWatermelon: false,
  }
}
```

## Phase 7: Testing

### Step 1: Unit Tests

Run existing tests and create new ones:

```bash
npm test
```

### Step 2: Integration Testing

Test the following scenarios:
- Fresh app install with migration
- Offline functionality
- Sync when coming back online
- Data integrity after sync conflicts

### Step 3: Performance Testing

Monitor:
- App startup time
- Database query performance
- Memory usage
- Sync duration

## Phase 8: Deployment

### Step 1: Staged Rollout

1. **Internal Testing** (Week 1)
   - Deploy to internal test devices
   - Test all core functionality
   - Validate sync performance

2. **Beta Testing** (Week 2)
   - Release to beta testers with feature flag disabled by default
   - Allow opt-in migration for beta users
   - Gather feedback and fix issues

3. **Gradual Rollout** (Week 3-4)
   - Enable for 10% of users
   - Monitor metrics and error rates
   - Gradually increase to 50%, then 100%

### Step 2: Monitoring

Set up monitoring for:
- Sync success rates
- Error frequencies
- Performance metrics
- User adoption of offline features

### Step 3: Rollback Plan

If issues arise:
1. Disable feature flag to revert to Supabase-only
2. Fix issues in development
3. Re-enable gradually after validation

## Troubleshooting

### Common Issues

1. **Build Errors**
   - Ensure all dependencies are installed
   - Check Babel configuration
   - Verify Expo configuration

2. **Database Errors**
   - Check schema compatibility
   - Validate migration scripts
   - Ensure proper permissions

3. **Sync Issues**
   - Verify Supabase RPC functions
   - Check network connectivity
   - Validate authentication

4. **Performance Issues**
   - Review database queries
   - Check for proper indexing
   - Monitor memory usage

### Debug Tools

1. **WatermelonDB Dev Tools**
   ```tsx
   import { Database } from '@nozbe/watermelondb'
   
   // In development, log all queries
   if (__DEV__) {
     database.adapter.setLocal('debug', true)
   }
   ```

2. **Sync Logging**
   - Enable detailed logging in sync service
   - Monitor network requests
   - Track sync performance

## Success Metrics

Monitor these KPIs:
- App launch time < 2 seconds
- Sync completion < 30 seconds
- Offline functionality 100% available
- User retention maintained
- Error rate < 5%

## Support

For issues or questions:
1. Check this implementation guide
2. Review WatermelonDB documentation
3. Check app logs and error tracking
4. Test on multiple devices/platforms

Remember to always test thoroughly on both iOS and Android before deploying to users!