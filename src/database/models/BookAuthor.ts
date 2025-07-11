import { Model, Relation } from "@nozbe/watermelondb"
import { field, date, readonly, relation } from '@nozbe/watermelondb/decorators'

import Book from './Book'
import Author from './Author'

export default class BookAuthor extends Model {
  static table = 'book_authors'

  static associations = {
    book: { type: 'belongs_to' as const, key: 'book_id' },
    author: { type: 'belongs_to' as const, key: 'author_id' },
  }

  @field('book_id') bookId!: string
  @field('author_id') authorId!: string
  @readonly @date('created_at') createdAt!: Date

  @relation('books', 'book_id') book!: Relation<Book>
  @relation('authors', 'author_id') author!: Relation<Author>
}