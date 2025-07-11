import { Model } from "@nozbe/watermelondb"
import { field, date, readonly } from '@nozbe/watermelondb/decorators'

export default class Profile extends Model {
  static table = 'profiles'

  @field('user_id') userId!: string
  @field('display_name') displayName?: string
  @field('email') email?: string
  @field('avatar_url') avatarUrl?: string
  @field('timezone') timezone?: string
  @field('theme_preference') themePreference?: string
  @readonly @date('created_at') createdAt!: Date
  @readonly @date('updated_at') updatedAt!: Date
}