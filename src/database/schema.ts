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
        { name: 'target_date', type: 'number', isIndexed: true },
        { name: 'start_date', type: 'number' },
        { name: 'total_pages', type: 'number', isOptional: true },
        { name: 'total_duration', type: 'number', isOptional: true },
        { name: 'book_format', type: 'string' },
        { name: 'is_completed', type: 'boolean', isIndexed: true },
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