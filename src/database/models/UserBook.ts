import { Model, Relation, Query } from "@nozbe/watermelondb"
import { field, date, readonly, relation, children } from '@nozbe/watermelondb/decorators'

import Book from './Book'
import BookStatusHistory from './BookStatusHistory'

export default class UserBook extends Model {
  static table = 'user_books'

  static associations = {
    book: { type: 'belongs_to' as const, key: 'book_id' },
    book_status_history: { type: 'has_many' as const, foreignKey: 'user_book_id' },
  }

  @field('user_id') userId!: string
  @field('book_id') bookId!: string
  @field('status') status!: string
  @field('rating') rating?: number
  @field('review') review?: string
  @field('progress_pages') progressPages?: number
  @field('progress_minutes') progressMinutes?: number
  @field('progress_percentage') progressPercentage?: number
  @date('start_date') startDate?: Date
  @date('completed_date') completedDate?: Date
  @readonly @date('created_at') createdAt!: Date
  @readonly @date('updated_at') updatedAt!: Date

  @relation('books', 'book_id') book!: Relation<Book>
  @children('book_status_history') statusHistory!: Query<BookStatusHistory>
}