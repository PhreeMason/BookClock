import { Model, Query } from "@nozbe/watermelondb"
import { field, date, readonly, children } from '@nozbe/watermelondb/decorators'

import BookAuthor from './BookAuthor'

export default class Author extends Model {
  static table = 'authors'

  static associations = {
    book_authors: { type: 'has_many' as const, foreignKey: 'author_id' },
  }

  @field('name') name!: string
  @field('bio') bio?: string
  @field('photo_url') photoUrl?: string
  @readonly @date('created_at') createdAt!: Date
  @readonly @date('updated_at') updatedAt!: Date

  @children('book_authors') bookAuthors!: Query<BookAuthor>
}