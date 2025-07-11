import { Model, Relation } from "@nozbe/watermelondb"
import { field, date, readonly, relation } from '@nozbe/watermelondb/decorators'

import UserBook from './UserBook'

export default class BookStatusHistory extends Model {
  static table = 'book_status_history'

  static associations = {
    user_book: { type: 'belongs_to' as const, key: 'user_book_id' },
  }

  @field('user_book_id') userBookId!: string
  @field('previous_status') previousStatus?: string
  @field('new_status') newStatus!: string
  @readonly @date('created_at') createdAt!: Date

  @relation('user_books', 'user_book_id') userBook!: Relation<UserBook>
}