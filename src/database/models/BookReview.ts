import { Model, Relation } from "@nozbe/watermelondb"
import { field, date, readonly, relation } from '@nozbe/watermelondb/decorators'

import Book from './Book'

export default class BookReview extends Model {
  static table = 'book_reviews'

  static associations = {
    book: { type: 'belongs_to' as const, key: 'book_id' },
  }

  @field('user_id') userId!: string
  @field('book_id') bookId!: string
  @field('rating') rating?: number
  @field('review_text') reviewText?: string
  @field('is_spoiler') isSpoiler!: boolean
  @field('is_public') isPublic!: boolean
  @readonly @date('created_at') createdAt!: Date
  @readonly @date('updated_at') updatedAt!: Date

  @relation('books', 'book_id') book!: Relation<Book>
}