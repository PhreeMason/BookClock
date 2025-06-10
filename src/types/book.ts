// Book-related TypeScript interfaces and types

export interface BookMetadata {
  extraction_method?: string;
  authors: string[];
  rating_count?: number;
  review_count?: number;
  awards?: string;
  series?: string;
  series_number?: number;
  goodreads_id?: string;
  edition_count?: number | null;
  ratings_count?: number;
}

export interface BookData {
  api_id: string;
  api_source: string;
  cover_image_url: string | null;
  description: string | null;
  edition: string | null;
  format: string;
  genres: string[];
  has_user_edits: boolean;
  isbn10: string | null;
  isbn13: string | null;
  language: string | null;
  metadata: BookMetadata;
  publication_date: string | null;
  publisher: string | null;
  rating: number | null;
  source: string;
  title: string;
  total_duration: number | null;
  total_pages: number | null;
  bookUrl?: string;
  epub_url?: string;
}

// Additional utility types
export type BookSource = 'goodreads' | 'openlibrary' | 'google' | string;
export type BookFormat = 'physical' | 'digital' | 'audiobook' | string;

// For API responses
export interface BookApiResponse {
  data: BookData | null;
  error?: Error | null;
  isLoading: boolean;
} 