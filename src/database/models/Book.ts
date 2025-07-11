import { Model, Query } from "@nozbe/watermelondb"
import { field, date, readonly, children } from '@nozbe/watermelondb/decorators'

import BookAuthor from './BookAuthor'
import UserBook from './UserBook'
import BookNote from './BookNote'
import BookReview from './BookReview'
import BookReadingLog from './BookReadingLog'

export default class Book extends Model {
  static table = 'books'

  static associations = {
    book_authors: { type: 'has_many' as const, foreignKey: 'book_id' },
    user_books: { type: 'has_many' as const, foreignKey: 'book_id' },
    book_notes: { type: 'has_many' as const, foreignKey: 'book_id' },
    book_reviews: { type: 'has_many' as const, foreignKey: 'book_id' },
    book_reading_logs: { type: 'has_many' as const, foreignKey: 'book_id' },
  }

  @field('api_id') apiId!: string
  @field('api_source') apiSource!: string
  @field('title') title!: string
  @field('cover_image_url') coverImageUrl?: string
  @field('description') description?: string
  @field('isbn10') isbn10?: string
  @field('isbn13') isbn13?: string
  @field('publication_date') publicationDate?: string
  @field('publisher') publisher?: string
  @field('language') language?: string
  @field('format') format!: string
  @field('total_pages') totalPages?: number
  @field('total_duration') totalDuration?: number
  @field('rating') rating?: number
  @field('genres') genres!: string // JSON string
  @field('metadata') metadata!: string // JSON string
  @field('source') source!: string
  @field('has_user_edits') hasUserEdits!: boolean
  @readonly @date('created_at') createdAt!: Date
  @readonly @date('updated_at') updatedAt!: Date

  @children('book_authors') bookAuthors!: Query<BookAuthor>
  @children('user_books') userBooks!: Query<UserBook>
  @children('book_notes') bookNotes!: Query<BookNote>
  @children('book_reviews') bookReviews!: Query<BookReview>
  @children('book_reading_logs') bookReadingLogs!: Query<BookReadingLog>

  // Helper methods for JSON fields
  get genresArray(): string[] {
    try {
      return JSON.parse(this.genres || '[]')
    } catch {
      return []
    }
  }

  get metadataObject(): Record<string, any> {
    try {
      return JSON.parse(this.metadata || '{}')
    } catch {
      return {}
    }
  }
}