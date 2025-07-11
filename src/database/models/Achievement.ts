import { Model, Query } from "@nozbe/watermelondb"
import { field, date, readonly, children } from '@nozbe/watermelondb/decorators'

import UserAchievement from './UserAchievement'
import AchievementProgress from './AchievementProgress'

export default class Achievement extends Model {
  static table = 'achievements'

  static associations = {
    user_achievements: { type: 'has_many' as const, foreignKey: 'achievement_id' },
    achievement_progress: { type: 'has_many' as const, foreignKey: 'achievement_id' },
  }

  @field('title') title!: string
  @field('description') description!: string
  @field('category') category!: string
  @field('type') type!: string
  @field('criteria') criteria!: string // JSON string
  @field('icon') icon!: string
  @field('color') color!: string
  @field('sort_order') sortOrder?: number
  @field('is_active') isActive!: boolean
  @readonly @date('created_at') createdAt!: Date

  @children('user_achievements') userAchievements!: Query<UserAchievement>
  @children('achievement_progress') achievementProgress!: Query<AchievementProgress>

  // Helper method for JSON field
  get criteriaObject(): Record<string, any> {
    try {
      return JSON.parse(this.criteria || '{}')
    } catch {
      return {}
    }
  }
}