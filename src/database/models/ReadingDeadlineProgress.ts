import { Model, Relation } from '@nozbe/watermelondb'
import { field, date, readonly, relation } from '@nozbe/watermelondb/decorators'
import ReadingDeadline from './ReadingDeadline'

export default class ReadingDeadlineProgress extends Model {
  static table = 'reading_deadline_progress'

  static associations = {
    deadline: { type: 'belongs_to' as const, key: 'deadline_id' },
  }

  @field('deadline_id') deadlineId!: string
  @field('user_id') userId!: string
  @date('date') date!: Date
  @field('pages_read') pagesRead?: number
  @field('minutes_listened') minutesListened?: number
  @field('current_page') currentPage?: number
  @field('current_minutes') currentMinutes?: number
  @field('percentage_complete') percentageComplete?: number
  @field('notes') notes?: string
  @readonly @date('created_at') createdAt!: Date
  @readonly @date('updated_at') updatedAt!: Date

  @relation('reading_deadlines', 'deadline_id') deadline!: Relation<ReadingDeadline>
}