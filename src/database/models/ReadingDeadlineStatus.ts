import { Model, Relation } from "@nozbe/watermelondb"
import { field, date, readonly, relation } from '@nozbe/watermelondb/decorators'

import ReadingDeadline from './ReadingDeadline'

export default class ReadingDeadlineStatus extends Model {
  static table = 'reading_deadline_status'

  static associations = {
    deadline: { type: 'belongs_to' as const, key: 'deadline_id' },
  }

  @field('deadline_id') deadlineId!: string
  @field('user_id') userId!: string
  @field('status') status!: string
  @field('reason') reason?: string
  @readonly @date('created_at') createdAt!: Date
  @readonly @date('updated_at') updatedAt!: Date

  @relation('reading_deadlines', 'deadline_id') deadline!: Relation<ReadingDeadline>
}