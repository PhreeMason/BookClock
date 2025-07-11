import { Model, Query } from '@nozbe/watermelondb'
import { field, date, readonly, children } from '@nozbe/watermelondb/decorators'
import ReadingDeadlineProgress from './ReadingDeadlineProgress'
import ReadingDeadlineStatus from './ReadingDeadlineStatus'

export default class ReadingDeadline extends Model {
  static table = 'reading_deadlines'

  static associations = {
    progress: { type: 'has_many' as const, foreignKey: 'deadline_id' },
    status: { type: 'has_many' as const, foreignKey: 'deadline_id' },
  }

  @field('user_id') userId!: string
  @field('book_id') bookId!: string
  @field('title') title!: string
  @field('author') author?: string
  @date('target_date') targetDate!: Date
  @date('start_date') startDate!: Date
  @field('total_pages') totalPages?: number
  @field('total_duration') totalDuration?: number
  @field('book_format') bookFormat!: string
  @field('is_completed') isCompleted!: boolean
  @date('completed_at') completedAt?: Date
  @readonly @date('created_at') createdAt!: Date
  @readonly @date('updated_at') updatedAt!: Date

  @children('reading_deadline_progress') progress!: Query<ReadingDeadlineProgress>
  @children('reading_deadline_status') status!: Query<ReadingDeadlineStatus>
}