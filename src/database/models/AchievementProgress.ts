import { Model, Relation } from "@nozbe/watermelondb"
import { field, date, readonly, relation } from '@nozbe/watermelondb/decorators'

import Achievement from './Achievement'

export default class AchievementProgress extends Model {
  static table = 'achievement_progress'

  static associations = {
    achievement: { type: 'belongs_to' as const, key: 'achievement_id' },
  }

  @field('user_id') userId!: string
  @field('achievement_id') achievementId!: string
  @field('current_value') currentValue!: number
  @field('max_value') maxValue?: number
  @field('metadata') metadata?: string // JSON string
  @date('last_updated') lastUpdated!: Date
  @readonly @date('created_at') createdAt!: Date
  @readonly @date('updated_at') updatedAt!: Date

  @relation('achievements', 'achievement_id') achievement!: Relation<Achievement>

  // Helper method for JSON field
  get metadataObject(): Record<string, any> {
    try {
      return JSON.parse(this.metadata || '{}')
    } catch {
      return {}
    }
  }
}