import { Model, Relation } from "@nozbe/watermelondb"
import { field, date, readonly, relation } from '@nozbe/watermelondb/decorators'

import ArcUserBook from './ArcUserBook'

export default class ArcBookStatusHistory extends Model {
  static table = 'arc_book_status_history'

  static associations = {
    arc_user_book: { type: 'belongs_to' as const, key: 'arc_user_book_id' },
  }

  @field('arc_user_book_id') arcUserBookId!: string
  @field('previous_status') previousStatus?: string
  @field('new_status') newStatus!: string
  @field('changed_by') changedBy!: string
  @field('reason') reason?: string
  @readonly @date('created_at') createdAt!: Date

  @relation('arc_user_books', 'arc_user_book_id') arcUserBook!: Relation<ArcUserBook>
}