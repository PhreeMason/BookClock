# WatermelonDB Migration Plan for R-R-Books

## Overview
This document outlines the complete migration strategy for adding WatermelonDB to the R-R-Books React Native application to enable offline-first functionality while maintaining synchronization with Supabase.

## Current Architecture Analysis

### Database Structure
The app currently uses Supabase (PostgreSQL) with the following 20 tables:
- `reading_deadlines` (core entity)
- `reading_deadline_progress` (core entity)
- `reading_deadline_status` (core entity)
- `books` (core entity)
- `profiles` (core entity)
- `achievements` (gamification)
- `achievement_progress` (gamification)
- `user_achievements` (gamification)
- `user_books` (book tracking)
- `authors` (book metadata)
- `book_authors` (many-to-many relationship)
- `book_notes` (user content)
- `book_reviews` (user content)
- `book_reading_logs` (progress tracking)
- `book_status_history` (audit trail)
- `user_activity` (analytics)
- `arc_user_books` (ARC system)
- `arc_book_status_history` (ARC system)

### Current Tech Stack
- **Framework**: React Native with Expo
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Clerk (Google/Apple OAuth)
- **State Management**: React Query for server state
- **Routing**: Expo Router (file-based)
- **Forms**: React Hook Form with Zod validation

## Migration Strategy

### Phase 1: Foundation Setup (Week 1-2)

#### 1.1 Install Dependencies
```bash
npm install @nozbe/watermelondb
npm install --save-dev @babel/plugin-proposal-decorators
```

#### 1.2 Configure Babel
Update `.babelrc` to include decorator support:
```json
{
  "presets": ["babel-preset-expo"],
  "plugins": [
    ["@babel/plugin-proposal-decorators", { "legacy": true }]
  ]
}
```

#### 1.3 Update Expo Configuration
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

### Phase 2: Schema Definition (Week 2-3)

#### 2.1 Create WatermelonDB Schema
Create `src/database/schema.ts`:

```typescript
import { appSchema, tableSchema } from '@nozbe/watermelondb'

export const schema = appSchema({
  version: 1,
  tables: [
    // Core tables
    tableSchema({
      name: 'profiles',
      columns: [
        { name: 'user_id', type: 'string', isIndexed: true },
        { name: 'display_name', type: 'string', isOptional: true },
        { name: 'email', type: 'string', isOptional: true },
        { name: 'avatar_url', type: 'string', isOptional: true },
        { name: 'timezone', type: 'string', isOptional: true },
        { name: 'theme_preference', type: 'string', isOptional: true },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ]
    }),
    
    tableSchema({
      name: 'reading_deadlines',
      columns: [
        { name: 'user_id', type: 'string', isIndexed: true },
        { name: 'book_id', type: 'string', isIndexed: true },
        { name: 'title', type: 'string' },
        { name: 'author', type: 'string', isOptional: true },
        { name: 'target_date', type: 'number' },
        { name: 'start_date', type: 'number' },
        { name: 'total_pages', type: 'number', isOptional: true },
        { name: 'total_duration', type: 'number', isOptional: true },
        { name: 'book_format', type: 'string' },
        { name: 'is_completed', type: 'boolean' },
        { name: 'completed_at', type: 'number', isOptional: true },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ]
    }),
    
    tableSchema({
      name: 'reading_deadline_progress',
      columns: [
        { name: 'deadline_id', type: 'string', isIndexed: true },
        { name: 'user_id', type: 'string', isIndexed: true },
        { name: 'date', type: 'number', isIndexed: true },
        { name: 'pages_read', type: 'number', isOptional: true },
        { name: 'minutes_listened', type: 'number', isOptional: true },
        { name: 'current_page', type: 'number', isOptional: true },
        { name: 'current_minutes', type: 'number', isOptional: true },
        { name: 'percentage_complete', type: 'number', isOptional: true },
        { name: 'notes', type: 'string', isOptional: true },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ]
    }),
    
    tableSchema({
      name: 'reading_deadline_status',
      columns: [
        { name: 'deadline_id', type: 'string', isIndexed: true },
        { name: 'user_id', type: 'string', isIndexed: true },
        { name: 'status', type: 'string' },
        { name: 'reason', type: 'string', isOptional: true },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ]
    }),
    
    tableSchema({
      name: 'books',
      columns: [
        { name: 'api_id', type: 'string', isIndexed: true },
        { name: 'api_source', type: 'string' },
        { name: 'title', type: 'string' },
        { name: 'cover_image_url', type: 'string', isOptional: true },
        { name: 'description', type: 'string', isOptional: true },
        { name: 'isbn10', type: 'string', isOptional: true },
        { name: 'isbn13', type: 'string', isOptional: true },
        { name: 'publication_date', type: 'string', isOptional: true },
        { name: 'publisher', type: 'string', isOptional: true },
        { name: 'language', type: 'string', isOptional: true },
        { name: 'format', type: 'string' },
        { name: 'total_pages', type: 'number', isOptional: true },
        { name: 'total_duration', type: 'number', isOptional: true },
        { name: 'rating', type: 'number', isOptional: true },
        { name: 'genres', type: 'string' }, // JSON string
        { name: 'metadata', type: 'string' }, // JSON string
        { name: 'source', type: 'string' },
        { name: 'has_user_edits', type: 'boolean' },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ]
    }),
    
    // Achievement tables
    tableSchema({
      name: 'achievements',
      columns: [
        { name: 'title', type: 'string' },
        { name: 'description', type: 'string' },
        { name: 'category', type: 'string', isIndexed: true },
        { name: 'type', type: 'string' },
        { name: 'criteria', type: 'string' }, // JSON string
        { name: 'icon', type: 'string' },
        { name: 'color', type: 'string' },
        { name: 'sort_order', type: 'number', isOptional: true },
        { name: 'is_active', type: 'boolean' },
        { name: 'created_at', type: 'number' },
      ]
    }),
    
    tableSchema({
      name: 'user_achievements',
      columns: [
        { name: 'user_id', type: 'string', isIndexed: true },
        { name: 'achievement_id', type: 'string', isIndexed: true },
        { name: 'unlocked_at', type: 'number' },
        { name: 'created_at', type: 'number' },
      ]
    }),
    
    tableSchema({
      name: 'achievement_progress',
      columns: [
        { name: 'user_id', type: 'string', isIndexed: true },
        { name: 'achievement_id', type: 'string', isIndexed: true },
        { name: 'current_value', type: 'number' },
        { name: 'max_value', type: 'number', isOptional: true },
        { name: 'metadata', type: 'string', isOptional: true }, // JSON string
        { name: 'last_updated', type: 'number' },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ]
    }),
    
    // Supporting tables
    tableSchema({
      name: 'authors',
      columns: [
        { name: 'name', type: 'string' },
        { name: 'bio', type: 'string', isOptional: true },
        { name: 'photo_url', type: 'string', isOptional: true },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ]
    }),
    
    tableSchema({
      name: 'book_authors',
      columns: [
        { name: 'book_id', type: 'string', isIndexed: true },
        { name: 'author_id', type: 'string', isIndexed: true },
        { name: 'created_at', type: 'number' },
      ]
    }),
    
    tableSchema({
      name: 'user_books',
      columns: [
        { name: 'user_id', type: 'string', isIndexed: true },
        { name: 'book_id', type: 'string', isIndexed: true },
        { name: 'status', type: 'string' },
        { name: 'rating', type: 'number', isOptional: true },
        { name: 'review', type: 'string', isOptional: true },
        { name: 'progress_pages', type: 'number', isOptional: true },
        { name: 'progress_minutes', type: 'number', isOptional: true },
        { name: 'progress_percentage', type: 'number', isOptional: true },
        { name: 'start_date', type: 'number', isOptional: true },
        { name: 'completed_date', type: 'number', isOptional: true },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ]
    }),
    
    tableSchema({
      name: 'book_reading_logs',
      columns: [
        { name: 'user_id', type: 'string', isIndexed: true },
        { name: 'book_id', type: 'string', isIndexed: true },
        { name: 'session_date', type: 'number', isIndexed: true },
        { name: 'pages_read', type: 'number', isOptional: true },
        { name: 'minutes_listened', type: 'number', isOptional: true },
        { name: 'start_page', type: 'number', isOptional: true },
        { name: 'end_page', type: 'number', isOptional: true },
        { name: 'start_time', type: 'number', isOptional: true },
        { name: 'end_time', type: 'number', isOptional: true },
        { name: 'notes', type: 'string', isOptional: true },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ]
    }),
    
    // Additional tables for completeness
    tableSchema({
      name: 'book_notes',
      columns: [
        { name: 'user_id', type: 'string', isIndexed: true },
        { name: 'book_id', type: 'string', isIndexed: true },
        { name: 'content', type: 'string' },
        { name: 'page_number', type: 'number', isOptional: true },
        { name: 'timestamp', type: 'number', isOptional: true },
        { name: 'is_spoiler', type: 'boolean' },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ]
    }),
    
    tableSchema({
      name: 'book_reviews',
      columns: [
        { name: 'user_id', type: 'string', isIndexed: true },
        { name: 'book_id', type: 'string', isIndexed: true },
        { name: 'rating', type: 'number', isOptional: true },
        { name: 'review_text', type: 'string', isOptional: true },
        { name: 'is_spoiler', type: 'boolean' },
        { name: 'is_public', type: 'boolean' },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ]
    }),
    
    tableSchema({
      name: 'user_activity',
      columns: [
        { name: 'user_id', type: 'string', isIndexed: true },
        { name: 'activity_type', type: 'string', isIndexed: true },
        { name: 'activity_data', type: 'string' }, // JSON string
        { name: 'created_at', type: 'number' },
      ]
    }),
    
    // ARC (Advanced Reader Copy) tables
    tableSchema({
      name: 'arc_user_books',
      columns: [
        { name: 'user_id', type: 'string', isIndexed: true },
        { name: 'book_id', type: 'string', isIndexed: true },
        { name: 'status', type: 'string' },
        { name: 'requested_at', type: 'number', isOptional: true },
        { name: 'approved_at', type: 'number', isOptional: true },
        { name: 'due_date', type: 'number', isOptional: true },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ]
    }),
    
    tableSchema({
      name: 'arc_book_status_history',
      columns: [
        { name: 'arc_user_book_id', type: 'string', isIndexed: true },
        { name: 'previous_status', type: 'string', isOptional: true },
        { name: 'new_status', type: 'string' },
        { name: 'changed_by', type: 'string' },
        { name: 'reason', type: 'string', isOptional: true },
        { name: 'created_at', type: 'number' },
      ]
    }),
    
    tableSchema({
      name: 'book_status_history',
      columns: [
        { name: 'user_book_id', type: 'string', isIndexed: true },
        { name: 'previous_status', type: 'string', isOptional: true },
        { name: 'new_status', type: 'string' },
        { name: 'created_at', type: 'number' },
      ]
    }),
  ]
})
```

#### 2.2 Create Model Classes
Create `src/database/models/` directory with individual model files:

**`src/database/models/Profile.ts`**:
```typescript
import { Model } from '@nozbe/watermelondb'
import { field, date, readonly } from '@nozbe/watermelondb/decorators'

export default class Profile extends Model {
  static table = 'profiles'

  @field('user_id') userId!: string
  @field('display_name') displayName!: string
  @field('email') email!: string
  @field('avatar_url') avatarUrl!: string
  @field('timezone') timezone!: string
  @field('theme_preference') themePreference!: string
  @readonly @date('created_at') createdAt!: Date
  @readonly @date('updated_at') updatedAt!: Date
}
```

**`src/database/models/ReadingDeadline.ts`**:
```typescript
import { Model } from '@nozbe/watermelondb'
import { field, date, readonly, children } from '@nozbe/watermelondb/decorators'
import { Query } from '@nozbe/watermelondb'

export default class ReadingDeadline extends Model {
  static table = 'reading_deadlines'

  static associations = {
    progress: { type: 'has_many', foreignKey: 'deadline_id' },
    status: { type: 'has_many', foreignKey: 'deadline_id' },
  }

  @field('user_id') userId!: string
  @field('book_id') bookId!: string
  @field('title') title!: string
  @field('author') author!: string
  @date('target_date') targetDate!: Date
  @date('start_date') startDate!: Date
  @field('total_pages') totalPages!: number
  @field('total_duration') totalDuration!: number
  @field('book_format') bookFormat!: string
  @field('is_completed') isCompleted!: boolean
  @date('completed_at') completedAt!: Date
  @readonly @date('created_at') createdAt!: Date
  @readonly @date('updated_at') updatedAt!: Date

  @children('reading_deadline_progress') progress!: Query<any>
  @children('reading_deadline_status') status!: Query<any>
}
```

### Phase 3: Database Setup (Week 3-4)

#### 3.1 Create Database Configuration
Create `src/database/index.ts`:

```typescript
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
// ... import other models

const adapter = new SQLiteAdapter({
  schema,
  migrations,
  jsi: true,
  onSetUpError: (error) => {
    console.error('Database setup error:', error)
    // Handle database setup errors
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
    // ... other models
  ],
})
```

#### 3.2 Create Initial Migration
Create `src/database/migrations.ts`:

```typescript
import { schemaMigrations } from '@nozbe/watermelondb/Schema/migrations'

export default schemaMigrations({
  migrations: [
    // Migration will be added here when schema changes
  ],
})
```

### Phase 4: Synchronization Implementation (Week 4-5)

#### 4.1 Create Sync Service
Create `src/services/syncService.ts`:

```typescript
import { synchronize } from '@nozbe/watermelondb/sync'
import { database } from '../database'
import { useSupabase } from '../lib/supabase'
import { useAuth } from '@clerk/clerk-expo'

export class SyncService {
  private supabase: ReturnType<typeof useSupabase>
  private auth: ReturnType<typeof useAuth>

  constructor() {
    this.supabase = useSupabase()
    this.auth = useAuth()
  }

  async syncDatabase() {
    if (!this.auth.userId) {
      throw new Error('User not authenticated')
    }

    await synchronize({
      database,
      pullChanges: async ({ lastPulledAt, schemaVersion, migration }) => {
        const { data, error } = await this.supabase.rpc('pull_changes', {
          last_pulled_at: lastPulledAt,
          schema_version: schemaVersion,
          migration,
          user_id: this.auth.userId,
        })

        if (error) {
          throw new Error(`Pull failed: ${error.message}`)
        }

        return data
      },
      pushChanges: async ({ changes, lastPulledAt }) => {
        const { data, error } = await this.supabase.rpc('push_changes', {
          changes,
          last_pulled_at: lastPulledAt,
          user_id: this.auth.userId,
        })

        if (error) {
          throw new Error(`Push failed: ${error.message}`)
        }

        return data
      },
    })
  }
}
```

#### 4.2 Create Supabase RPC Functions
Create PostgreSQL functions in Supabase:

**Pull Changes Function**:
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
  changes jsonb[] := '{}';
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
            ELSE (to_json(%I.*) - ''deleted_at'')::text
          END
        )
      ) FROM %I 
      WHERE (
        (user_id = $1 OR user_id IS NULL) AND
        (EXTRACT(EPOCH FROM updated_at) * 1000 > $2 OR 
         EXTRACT(EPOCH FROM deleted_at) * 1000 > $2)
      )', table_name, table_name) 
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
$$ LANGUAGE plpgsql;
```

**Push Changes Function**:
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
BEGIN
  -- Process each table's changes
  FOR table_name IN SELECT jsonb_object_keys(changes) LOOP
    table_changes := changes->table_name;
    
    -- Process each record in the table
    FOR record_data IN SELECT * FROM jsonb_array_elements(table_changes) LOOP
      record_id := record_data->>'id';
      status := record_data->>'_status';
      
      IF status = 'deleted' THEN
        -- Soft delete
        EXECUTE format('
          UPDATE %I SET 
            deleted_at = NOW(),
            updated_at = NOW()
          WHERE id = $1 AND user_id = $2
        ', table_name) 
        USING record_id, user_id;
      ELSE
        -- Insert or update
        EXECUTE format('
          INSERT INTO %I (id, user_id, %s, created_at, updated_at) 
          VALUES ($1, $2, %s, NOW(), NOW())
          ON CONFLICT (id) DO UPDATE SET
            %s,
            updated_at = NOW()
          WHERE %I.user_id = $2
        ', table_name, 
           -- column list for insert
           (SELECT string_agg(key, ', ') FROM jsonb_object_keys(record_data - '_status' - '_changed' - 'id') key),
           -- values for insert  
           (SELECT string_agg('$' || (row_number() OVER() + 2), ', ') FROM jsonb_object_keys(record_data - '_status' - '_changed' - 'id')),
           -- update clause
           (SELECT string_agg(key || ' = $' || (row_number() OVER() + 2), ', ') FROM jsonb_object_keys(record_data - '_status' - '_changed' - 'id') key),
           table_name)
        USING record_id, user_id, (SELECT array_agg(value) FROM jsonb_each_text(record_data - '_status' - '_changed' - 'id'));
      END IF;
    END LOOP;
  END LOOP;
  
  RETURN jsonb_build_object('success', true);
END;
$$ LANGUAGE plpgsql;
```

### Phase 5: Integration with Existing Code (Week 5-6)

#### 5.1 Create Database Provider
Create `src/providers/DatabaseProvider.tsx`:

```typescript
import React, { createContext, useContext, ReactNode } from 'react'
import { Database } from '@nozbe/watermelondb'
import { database } from '../database'

const DatabaseContext = createContext<Database | null>(null)

export const DatabaseProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <DatabaseContext.Provider value={database}>
      {children}
    </DatabaseContext.Provider>
  )
}

export const useDatabase = () => {
  const context = useContext(DatabaseContext)
  if (!context) {
    throw new Error('useDatabase must be used within a DatabaseProvider')
  }
  return context
}
```

#### 5.2 Update App Root
Update `app/_layout.tsx` to include DatabaseProvider:

```typescript
import { DatabaseProvider } from '../src/providers/DatabaseProvider'

export default function RootLayout() {
  return (
    <DatabaseProvider>
      <ClerkProvider>
        <QueryClient>
          {/* existing app structure */}
        </QueryClient>
      </ClerkProvider>
    </DatabaseProvider>
  )
}
```

#### 5.3 Create WatermelonDB Hooks
Create `src/hooks/useWatermelonDB.ts`:

```typescript
import { useDatabase } from '../providers/DatabaseProvider'
import { Q } from '@nozbe/watermelondb'
import { useAuth } from '@clerk/clerk-expo'
import { useMemo } from 'react'

export const useReadingDeadlines = () => {
  const database = useDatabase()
  const { userId } = useAuth()

  return useMemo(() => {
    if (!userId) return null
    
    return database.collections
      .get('reading_deadlines')
      .query(Q.where('user_id', userId))
      .observe()
  }, [database, userId])
}

export const useReadingDeadlineProgress = (deadlineId: string) => {
  const database = useDatabase()

  return useMemo(() => {
    return database.collections
      .get('reading_deadline_progress')
      .query(Q.where('deadline_id', deadlineId))
      .observe()
  }, [database, deadlineId])
}

export const useAchievements = () => {
  const database = useDatabase()
  const { userId } = useAuth()

  return useMemo(() => {
    if (!userId) return null
    
    return database.collections
      .get('user_achievements')
      .query(Q.where('user_id', userId))
      .observe()
  }, [database, userId])
}
```

### Phase 6: Migration Implementation (Week 6-7)

#### 6.1 Create Migration Service
Create `src/services/migrationService.ts`:

```typescript
import { database } from '../database'
import { useSupabase } from '../lib/supabase'
import { useAuth } from '@clerk/clerk-expo'

export class MigrationService {
  private supabase: ReturnType<typeof useSupabase>
  private auth: ReturnType<typeof useAuth>

  constructor() {
    this.supabase = useSupabase()
    this.auth = useAuth()
  }

  async migrateUserData() {
    if (!this.auth.userId) {
      throw new Error('User not authenticated')
    }

    // Clear existing local data
    await database.action(async () => {
      await database.unsafeResetDatabase()
    })

    // Fetch all user data from Supabase
    const userData = await this.fetchAllUserData()
    
    // Insert data into WatermelonDB
    await this.insertDataIntoWatermelonDB(userData)
  }

  private async fetchAllUserData() {
    const tables = [
      'profiles', 'reading_deadlines', 'reading_deadline_progress',
      'reading_deadline_status', 'books', 'achievements', 'user_achievements',
      'achievement_progress', 'authors', 'book_authors', 'user_books',
      'book_reading_logs', 'book_notes', 'book_reviews', 'user_activity'
    ]

    const userData: Record<string, any[]> = {}

    for (const table of tables) {
      const { data, error } = await this.supabase
        .from(table)
        .select('*')
        .or(`user_id.eq.${this.auth.userId},user_id.is.null`)

      if (error) {
        console.error(`Error fetching ${table}:`, error)
        continue
      }

      userData[table] = data || []
    }

    return userData
  }

  private async insertDataIntoWatermelonDB(userData: Record<string, any[]>) {
    await database.action(async () => {
      for (const [tableName, records] of Object.entries(userData)) {
        const collection = database.collections.get(tableName)
        
        for (const record of records) {
          await collection.create((newRecord: any) => {
            Object.assign(newRecord, {
              ...record,
              createdAt: new Date(record.created_at),
              updatedAt: new Date(record.updated_at),
            })
          })
        }
      }
    })
  }
}
```

#### 6.2 Create Sync Status Management
Create `src/services/syncStatusService.ts`:

```typescript
import AsyncStorage from '@react-native-async-storage/async-storage'

export class SyncStatusService {
  private static SYNC_STATUS_KEY = 'watermelon_sync_status'
  private static LAST_SYNC_KEY = 'watermelon_last_sync'

  static async getSyncStatus(): Promise<'never' | 'syncing' | 'success' | 'error'> {
    try {
      const status = await AsyncStorage.getItem(this.SYNC_STATUS_KEY)
      return status as any || 'never'
    } catch {
      return 'never'
    }
  }

  static async setSyncStatus(status: 'syncing' | 'success' | 'error') {
    await AsyncStorage.setItem(this.SYNC_STATUS_KEY, status)
    if (status === 'success') {
      await AsyncStorage.setItem(this.LAST_SYNC_KEY, new Date().toISOString())
    }
  }

  static async getLastSyncTime(): Promise<Date | null> {
    try {
      const timestamp = await AsyncStorage.getItem(this.LAST_SYNC_KEY)
      return timestamp ? new Date(timestamp) : null
    } catch {
      return null
    }
  }

  static async clearSyncData() {
    await AsyncStorage.multiRemove([this.SYNC_STATUS_KEY, this.LAST_SYNC_KEY])
  }
}
```

### Phase 7: Testing & Validation (Week 7-8)

#### 7.1 Create Test Setup
Create `src/__tests__/database.test.ts`:

```typescript
import { database } from '../database'
import { SyncService } from '../services/syncService'

describe('WatermelonDB Integration', () => {
  beforeEach(async () => {
    await database.action(async () => {
      await database.unsafeResetDatabase()
    })
  })

  describe('Database Operations', () => {
    it('should create a reading deadline', async () => {
      const deadline = await database.collections
        .get('reading_deadlines')
        .create((record: any) => {
          record.userId = 'test-user'
          record.title = 'Test Book'
          record.targetDate = new Date()
          record.startDate = new Date()
          record.bookFormat = 'physical'
          record.isCompleted = false
        })

      expect(deadline.title).toBe('Test Book')
      expect(deadline.userId).toBe('test-user')
    })

    it('should query reading deadlines by user', async () => {
      // Create test data
      await database.collections
        .get('reading_deadlines')
        .create((record: any) => {
          record.userId = 'user1'
          record.title = 'Book 1'
          record.targetDate = new Date()
          record.startDate = new Date()
          record.bookFormat = 'physical'
          record.isCompleted = false
        })

      await database.collections
        .get('reading_deadlines')
        .create((record: any) => {
          record.userId = 'user2'
          record.title = 'Book 2'
          record.targetDate = new Date()
          record.startDate = new Date()
          record.bookFormat = 'physical'
          record.isCompleted = false
        })

      const user1Deadlines = await database.collections
        .get('reading_deadlines')
        .query(Q.where('user_id', 'user1'))
        .fetch()

      expect(user1Deadlines).toHaveLength(1)
      expect(user1Deadlines[0].title).toBe('Book 1')
    })
  })

  describe('Synchronization', () => {
    it('should handle sync conflicts', async () => {
      // Test sync conflict resolution
      // This would require mocking the Supabase RPC calls
    })
  })
})
```

#### 7.2 Create Migration Validation
Create `src/__tests__/migration.test.ts`:

```typescript
import { MigrationService } from '../services/migrationService'
import { database } from '../database'

describe('Data Migration', () => {
  it('should migrate all user data from Supabase to WatermelonDB', async () => {
    const migrationService = new MigrationService()
    
    // Mock Supabase data
    const mockSupabaseData = {
      profiles: [{ id: '1', user_id: 'test-user', display_name: 'Test User' }],
      reading_deadlines: [
        { id: '1', user_id: 'test-user', title: 'Test Book', book_format: 'physical' }
      ],
    }

    // Mock the fetch method
    jest.spyOn(migrationService as any, 'fetchAllUserData')
      .mockResolvedValue(mockSupabaseData)

    await migrationService.migrateUserData()

    // Verify data was inserted correctly
    const profiles = await database.collections.get('profiles').query().fetch()
    const deadlines = await database.collections.get('reading_deadlines').query().fetch()

    expect(profiles).toHaveLength(1)
    expect(deadlines).toHaveLength(1)
    expect(profiles[0].displayName).toBe('Test User')
    expect(deadlines[0].title).toBe('Test Book')
  })
})
```

### Phase 8: Performance Optimization (Week 8)

#### 8.1 Add Database Indexes
Update schema with proper indexes for common queries:

```typescript
// Add to schema.ts
tableSchema({
  name: 'reading_deadlines',
  columns: [
    { name: 'user_id', type: 'string', isIndexed: true },
    { name: 'book_id', type: 'string', isIndexed: true },
    { name: 'target_date', type: 'number', isIndexed: true },
    { name: 'is_completed', type: 'boolean', isIndexed: true },
    // ... other columns
  ]
})
```

#### 8.2 Optimize Queries
Create optimized query patterns:

```typescript
// src/hooks/useOptimizedQueries.ts
export const useActiveDeadlines = () => {
  const database = useDatabase()
  const { userId } = useAuth()

  return useMemo(() => {
    if (!userId) return null
    
    return database.collections
      .get('reading_deadlines')
      .query(
        Q.where('user_id', userId),
        Q.where('is_completed', false),
        Q.sortBy('target_date', Q.asc)
      )
      .observe()
  }, [database, userId])
}

export const useRecentProgress = (deadlineId: string, limit: number = 30) => {
  const database = useDatabase()

  return useMemo(() => {
    return database.collections
      .get('reading_deadline_progress')
      .query(
        Q.where('deadline_id', deadlineId),
        Q.sortBy('date', Q.desc),
        Q.take(limit)
      )
      .observe()
  }, [database, deadlineId, limit])
}
```

## Implementation Timeline

### Week 1-2: Foundation
- [ ] Install WatermelonDB dependencies
- [ ] Configure Babel and Expo
- [ ] Create basic schema structure
- [ ] Set up database initialization

### Week 3-4: Core Implementation
- [ ] Complete schema definition
- [ ] Create all model classes
- [ ] Implement database configuration
- [ ] Create migration infrastructure

### Week 5-6: Synchronization
- [ ] Implement sync service
- [ ] Create Supabase RPC functions
- [ ] Build sync status management
- [ ] Test basic sync functionality

### Week 7-8: Integration & Testing
- [ ] Update existing hooks and providers
- [ ] Create migration tools
- [ ] Comprehensive testing
- [ ] Performance optimization
- [ ] Documentation and rollout plan

## Risk Mitigation

### Technical Risks
1. **Complex Relationships**: Thorough testing of foreign key handling and cascade operations
2. **Sync Conflicts**: Robust conflict resolution with user feedback mechanisms
3. **Performance**: Careful indexing and query optimization, especially for large datasets
4. **Data Integrity**: Comprehensive validation and rollback mechanisms

### Business Risks
1. **User Experience**: Seamless migration with minimal downtime
2. **Data Loss**: Multiple backup strategies and validation checkpoints
3. **Adoption**: Gradual rollout with feature flags and monitoring

## Success Metrics

### Technical Metrics
- App launch time: < 2 seconds (cold start)
- Database query response time: < 100ms for common queries
- Sync completion time: < 30 seconds for typical user data
- Offline functionality: 100% for core features

### User Experience Metrics
- User retention maintained or improved
- App store rating maintained or improved
- Support tickets related to data issues: < 5% increase
- User satisfaction with offline capabilities: > 80%

## Rollback Strategy

### Immediate Rollback (< 1 hour)
1. Revert to previous app version using Expo updates
2. Disable WatermelonDB feature flags
3. Restore Supabase-only data flow

### Data Recovery (< 24 hours)
1. Export user data from WatermelonDB
2. Validate and clean data
3. Restore to Supabase if needed
4. Notify affected users

### Long-term Recovery (< 1 week)
1. Analyze root cause of issues
2. Implement fixes
3. Comprehensive testing
4. Gradual re-rollout with enhanced monitoring

## Conclusion

This migration plan provides a comprehensive approach to implementing WatermelonDB in the R-R-Books application while maintaining data integrity and user experience. The phased approach allows for careful testing and validation at each step, minimizing risks and ensuring a smooth transition to offline-first functionality.

The implementation preserves the app's sophisticated reading deadline tracking system while adding robust offline capabilities that will significantly improve user experience, especially for users with intermittent internet connectivity.