import { Model } from "@nozbe/watermelondb"
import { date, field, readonly } from '@nozbe/watermelondb/decorators'

export default class UserActivity extends Model {
  static table = 'user_activity'

  @field('user_id') userId!: string
  @field('activity_type') activityType!: string
  @field('activity_data') activityData!: string // JSON string
  @readonly @date('created_at') createdAt!: Date

  // Helper method for JSON field
  get activityDataObject(): Record<string, any> {
    try {
      return JSON.parse(this.activityData || '{}')
    } catch {
      return {}
    }
  }
}