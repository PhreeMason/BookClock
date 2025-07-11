import { Model, Relation, Query } from "@nozbe/watermelondb"
import { field, date, readonly, relation, children } from '@nozbe/watermelondb/decorators'

import Book from './Book'
import ArcBookStatusHistory from './ArcBookStatusHistory'

export default class ArcUserBook extends Model {
  static table = 'arc_user_books'

  static associations = {
    book: { type: 'belongs_to' as const, key: 'book_id' },
    arc_book_status_history: { type: 'has_many' as const, foreignKey: 'arc_user_book_id' },
  }

  @field('user_id') userId!: string
  @field('book_id') bookId!: string
  @field('status') status!: string
  @date('requested_at') requestedAt?: Date
  @date('approved_at') approvedAt?: Date
  @date('due_date') dueDate?: Date
  @readonly @date('created_at') createdAt!: Date
  @readonly @date('updated_at') updatedAt!: Date

  @relation('books', 'book_id') book!: Relation<Book>
  @children('arc_book_status_history') statusHistory!: Query<ArcBookStatusHistory>
}