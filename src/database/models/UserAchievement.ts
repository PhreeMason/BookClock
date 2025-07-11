import { Model, Relation } from "@nozbe/watermelondb"
import { field, date, readonly, relation } from '@nozbe/watermelondb/decorators'

import Achievement from './Achievement'

export default class UserAchievement extends Model {
  static table = 'user_achievements'

  static associations = {
    achievement: { type: 'belongs_to' as const, key: 'achievement_id' },
  }

  @field('user_id') userId!: string
  @field('achievement_id') achievementId!: string
  @date('unlocked_at') unlockedAt!: Date
  @readonly @date('created_at') createdAt!: Date

  @relation('achievements', 'achievement_id') achievement!: Relation<Achievement>
}