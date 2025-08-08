# Supabase Database Setup & Configuration

This document outlines the current Supabase database setup for the R&R Books application, including authentication patterns, RLS policies, and development guidelines.

## Authentication Setup

The application uses **Clerk** for authentication, which requires a specific RLS pattern different from standard Supabase auth.

### Key Function: `requesting_user_id()`

All RLS policies use the `requesting_user_id()` function instead of `auth.uid()`. This function is compatible with Clerk's authentication system.

### User ID Format

- **Type**: `TEXT` (not UUID)
- **Source**: Clerk user IDs are strings, not UUIDs
- **Foreign Keys**: Reference `profiles.id` instead of `auth.users(id)`

## Primary Key System

The application uses **prefixed IDs** for all primary keys to improve debugging and API clarity.

### Prefixed ID Function: `generate_prefixed_id(prefix)`

- **Returns**: `TEXT` with format `{prefix}_{uuid}`
- **Example**: `generate_prefixed_id('rd')` → `rd_a1b2c3d4-e5f6-7890-abcd-ef1234567890`
- **Benefits**: Easy identification of record types in logs and APIs

### Current Prefixes

| Table | Prefix | Example ID |
|-------|--------|------------|
| `reading_deadlines` | `rd` | `rd_a1b2c3d4...` |
| `reading_deadline_status` | `rdp` | `rdp_a1b2c3d4...` |
| `achievement_progress` | `ap` | `ap_a1b2c3d4...` |
| `achievement_events` | `ae` | `ae_a1b2c3d4...` |

### Adding New Tables

When creating new tables, choose a 2-3 character prefix that clearly identifies the table:
- Keep prefixes short but descriptive
- Avoid conflicts with existing prefixes
- Document new prefixes in this README

## Row Level Security (RLS) Patterns

### Standard RLS Policy Template

All tables follow this consistent RLS pattern:

```sql
-- Enable RLS on table
ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;

-- SELECT policy
CREATE POLICY "Users can view their own records"
  ON table_name
  FOR SELECT
  TO authenticated
  USING (user_id = requesting_user_id());

-- INSERT policy
CREATE POLICY "Users can insert their own records"
  ON table_name
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = requesting_user_id());

-- UPDATE policy
CREATE POLICY "Users can update their own records"
  ON table_name
  FOR UPDATE
  TO authenticated
  USING (user_id = requesting_user_id())
  WITH CHECK (user_id = requesting_user_id());

-- DELETE policy (if needed)
CREATE POLICY "Users can delete their own records"
  ON table_name
  FOR DELETE
  TO authenticated
  USING (user_id = requesting_user_id());
```

### Important Notes

- **Always use `requesting_user_id()`** instead of `auth.uid()`
- **Always specify `TO authenticated`** to restrict to authenticated users
- **Use both `USING` and `WITH CHECK`** clauses for UPDATE policies
- **Include meaningful policy names** that describe the action and scope

## Database Tables & RLS Status

### Core Tables

| Table | RLS Enabled | Policies | Notes |
|-------|-------------|----------|-------|
| `reading_deadlines` | ✅ | Full CRUD | Main reading goals table |
| `reading_deadline_status` | ✅ | Full CRUD | Status tracking for deadlines |
| `user_activity` | ✅ | Full CRUD | User activity tracking |

### Achievement System Tables

| Table | RLS Enabled | Policies | Notes |
|-------|-------------|----------|-------|
| `achievement_progress` | ✅ | Full CRUD | User achievement progress |
| `achievement_events` | ✅ | SELECT/INSERT | Event logging for analytics |

## Migration Guidelines

### Creating New Tables

1. **Always include RLS setup** in the same migration
2. **Follow the standard RLS pattern** shown above
3. **Include proper foreign key constraints** to `auth.users(id)`
4. **Add appropriate indexes** for performance

Example migration structure:
```sql
-- Create table
CREATE TABLE new_table (
  id TEXT DEFAULT generate_prefixed_id('nt') PRIMARY KEY,
  user_id TEXT NOT NULL,
  -- other columns
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE new_table ENABLE ROW LEVEL SECURITY;

-- Create policies (using standard template above)

-- Add indexes
CREATE INDEX idx_new_table_user ON new_table(user_id);
```

### Updating Existing Tables

When adding RLS to existing tables:

1. **Enable RLS first**: `ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;`
2. **Test policies carefully** to ensure existing data is accessible
3. **Consider data migration** if user_id columns are missing

## Development Best Practices

### Testing RLS Policies

1. **Test with actual user sessions** - RLS policies only apply to authenticated requests
2. **Verify policy logic** by checking that users can only access their own data
3. **Test all CRUD operations** to ensure policies work correctly

### Common Pitfalls

- ❌ Using `auth.uid()` instead of `requesting_user_id()`
- ❌ Using `UUID` instead of `TEXT` for IDs and user_id columns
- ❌ Using `gen_random_uuid()` instead of `generate_prefixed_id()`
- ❌ Forgetting `TO authenticated` clause
- ❌ Missing `WITH CHECK` clause on UPDATE policies
- ❌ Not testing policies with real user sessions
- ❌ Forgetting to enable RLS on new tables
- ❌ Not documenting new table prefixes

### Debugging RLS Issues

If you encounter RLS-related errors:

1. **Check if RLS is enabled**: `SELECT relname, relrowsecurity FROM pg_class WHERE relname = 'table_name';`
2. **Verify policy exists**: `SELECT * FROM pg_policies WHERE tablename = 'table_name';`
3. **Test with direct SQL** using the requesting_user_id() function
4. **Check authentication context** in your application

## Database Schema Overview

### Core Reading System
- `reading_deadlines` - User's reading goals and deadlines
  - Includes `format` column with values: `physical`, `ebook`, `audio`
- `reading_deadline_status` - Status tracking for reading progress
- `user_activity` - General user activity tracking

### Achievement System
- `achievement_progress` - User progress on various achievements
- `achievement_events` - Event logging for debugging and analytics

## Future Development

When adding new features:

1. **Follow established patterns** for consistency
2. **Include RLS from the start** - don't add it later
3. **Document any deviations** from standard patterns
4. **Test thoroughly** with multiple user accounts
5. **Consider indexing** for performance at scale

## Migration Execution

To apply migrations:

```bash
# Using Supabase CLI
supabase db push

# Or through the dashboard
# Upload migration files through Supabase dashboard > SQL Editor
```

Always test migrations in a development environment first.