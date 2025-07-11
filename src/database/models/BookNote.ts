import { Model, Relation } from "@nozbe/watermelondb"
import { field, date, readonly, relation } from '@nozbe/watermelondb/decorators'

import Book from './Book'

export default class BookNote extends Model {
  static table = 'book_notes'

  static associations = {
    book: { type: 'belongs_to' as const, key: 'book_id' },
  }

  @field('user_id') userId!: string
  @field('book_id') bookId!: string
  @field('content') content!: string
  @field('page_number') pageNumber?: number
  @field('timestamp') timestamp?: number
  @field('is_spoiler') isSpoiler!: boolean
  @readonly @date('created_at') createdAt!: Date
  @readonly @date('updated_at') updatedAt!: Date

  @relation('books', 'book_id') book!: Relation<Book>
}