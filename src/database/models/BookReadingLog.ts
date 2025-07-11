import { Model, Relation } from "@nozbe/watermelondb"
import { field, date, readonly, relation } from '@nozbe/watermelondb/decorators'

import Book from './Book'

export default class BookReadingLog extends Model {
  static table = 'book_reading_logs'

  static associations = {
    book: { type: 'belongs_to' as const, key: 'book_id' },
  }

  @field('user_id') userId!: string
  @field('book_id') bookId!: string
  @date('session_date') sessionDate!: Date
  @field('pages_read') pagesRead?: number
  @field('minutes_listened') minutesListened?: number
  @field('start_page') startPage?: number
  @field('end_page') endPage?: number
  @field('start_time') startTime?: number
  @field('end_time') endTime?: number
  @field('notes') notes?: string
  @readonly @date('created_at') createdAt!: Date
  @readonly @date('updated_at') updatedAt!: Date

  @relation('books', 'book_id') book!: Relation<Book>
}