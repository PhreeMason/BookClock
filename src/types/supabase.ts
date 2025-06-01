export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      arc_book_status_history: {
        Row: {
          book_id: string
          created_at: string | null
          id: string
          status: Database["public"]["Enums"]["arc_book_status_enum"] | null
          user_id: string
        }
        Insert: {
          book_id: string
          created_at?: string | null
          id: string
          status?: Database["public"]["Enums"]["arc_book_status_enum"] | null
          user_id: string
        }
        Update: {
          book_id?: string
          created_at?: string | null
          id?: string
          status?: Database["public"]["Enums"]["arc_book_status_enum"] | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "arc_book_status_history_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "arc_book_status_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      arc_user_books: {
        Row: {
          book_id: string
          completion_date: string | null
          genres: string[] | null
          notes: string | null
          rating: number | null
          review_due_date: string | null
          total_pages: number | null
          user_id: string
        }
        Insert: {
          book_id: string
          completion_date?: string | null
          genres?: string[] | null
          notes?: string | null
          rating?: number | null
          review_due_date?: string | null
          total_pages?: number | null
          user_id: string
        }
        Update: {
          book_id?: string
          completion_date?: string | null
          genres?: string[] | null
          notes?: string | null
          rating?: number | null
          review_due_date?: string | null
          total_pages?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "arc_user_books_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "arc_user_books_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      authors: {
        Row: {
          id: string
          name: string
        }
        Insert: {
          id: string
          name: string
        }
        Update: {
          id?: string
          name?: string
        }
        Relationships: []
      }
      book_authors: {
        Row: {
          author_id: string
          book_id: string
        }
        Insert: {
          author_id: string
          book_id: string
        }
        Update: {
          author_id?: string
          book_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "book_authors_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "authors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "book_authors_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
        ]
      }
      book_notes: {
        Row: {
          book_id: string
          created_at: string | null
          id: string
          note: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          book_id: string
          created_at?: string | null
          id: string
          note?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          book_id?: string
          created_at?: string | null
          id?: string
          note?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "book_notes_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
        ]
      }
      book_reading_logs: {
        Row: {
          audio_end_time: number | null
          audio_start_time: number | null
          book_id: string
          created_at: string | null
          current_percentage: number | null
          date: string | null
          duration: number | null
          emotional_state: string[] | null
          end_page: number | null
          format: Database["public"]["Enums"]["book_format_enum"][] | null
          id: string
          listening_speed: number | null
          note: string | null
          pages_read: number | null
          rating: number | null
          reading_location: string | null
          start_page: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          audio_end_time?: number | null
          audio_start_time?: number | null
          book_id: string
          created_at?: string | null
          current_percentage?: number | null
          date?: string | null
          duration?: number | null
          emotional_state?: string[] | null
          end_page?: number | null
          format?: Database["public"]["Enums"]["book_format_enum"][] | null
          id: string
          listening_speed?: number | null
          note?: string | null
          pages_read?: number | null
          rating?: number | null
          reading_location?: string | null
          start_page?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          audio_end_time?: number | null
          audio_start_time?: number | null
          book_id?: string
          created_at?: string | null
          current_percentage?: number | null
          date?: string | null
          duration?: number | null
          emotional_state?: string[] | null
          end_page?: number | null
          format?: Database["public"]["Enums"]["book_format_enum"][] | null
          id?: string
          listening_speed?: number | null
          note?: string | null
          pages_read?: number | null
          rating?: number | null
          reading_location?: string | null
          start_page?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "book_reading_logs_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
        ]
      }
      book_reviews: {
        Row: {
          book_id: string
          created_at: string | null
          id: string
          rating: number | null
          review: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          book_id: string
          created_at?: string | null
          id: string
          rating?: number | null
          review?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          book_id?: string
          created_at?: string | null
          id?: string
          rating?: number | null
          review?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "book_reviews_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
        ]
      }
      book_status_history: {
        Row: {
          book_id: string
          created_at: string | null
          id: string
          status: Database["public"]["Enums"]["book_status_enum"] | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          book_id: string
          created_at?: string | null
          id: string
          status?: Database["public"]["Enums"]["book_status_enum"] | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          book_id?: string
          created_at?: string | null
          id?: string
          status?: Database["public"]["Enums"]["book_status_enum"] | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "book_status_history_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
        ]
      }
      books: {
        Row: {
          api_id: string | null
          api_source: string | null
          cover_image_url: string | null
          created_at: string | null
          date_added: string | null
          description: string | null
          edition: Json | null
          format: Database["public"]["Enums"]["book_format_enum"] | null
          genres: string[] | null
          id: string
          isbn10: string | null
          isbn13: string | null
          language: string | null
          metadata: Json | null
          publication_date: string | null
          publisher: string | null
          rating: number | null
          title: string
          total_duration: number | null
          total_pages: number | null
          updated_at: string | null
        }
        Insert: {
          api_id?: string | null
          api_source?: string | null
          cover_image_url?: string | null
          created_at?: string | null
          date_added?: string | null
          description?: string | null
          edition?: Json | null
          format?: Database["public"]["Enums"]["book_format_enum"] | null
          genres?: string[] | null
          id: string
          isbn10?: string | null
          isbn13?: string | null
          language?: string | null
          metadata?: Json | null
          publication_date?: string | null
          publisher?: string | null
          rating?: number | null
          title: string
          total_duration?: number | null
          total_pages?: number | null
          updated_at?: string | null
        }
        Update: {
          api_id?: string | null
          api_source?: string | null
          cover_image_url?: string | null
          created_at?: string | null
          date_added?: string | null
          description?: string | null
          edition?: Json | null
          format?: Database["public"]["Enums"]["book_format_enum"] | null
          genres?: string[] | null
          id?: string
          isbn10?: string | null
          isbn13?: string | null
          language?: string | null
          metadata?: Json | null
          publication_date?: string | null
          publisher?: string | null
          rating?: number | null
          title?: string
          total_duration?: number | null
          total_pages?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          full_name: string | null
          id: string
          updated_at: string | null
          username: string | null
          website: string | null
        }
        Insert: {
          avatar_url?: string | null
          full_name?: string | null
          id: string
          updated_at?: string | null
          username?: string | null
          website?: string | null
        }
        Update: {
          avatar_url?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string | null
          username?: string | null
          website?: string | null
        }
        Relationships: []
      }
      user_activity: {
        Row: {
          activity_type: string
          book_id: string
          created_at: string | null
          id: string
          metadata: Json | null
          record_id: string
          table_name: string
          user_id: string
        }
        Insert: {
          activity_type: string
          book_id: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          record_id: string
          table_name: string
          user_id: string
        }
        Update: {
          activity_type?: string
          book_id?: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          record_id?: string
          table_name?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_activity_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
        ]
      }
      user_books: {
        Row: {
          book_id: string
          cover_image_url: string | null
          date_added: string | null
          format: Database["public"]["Enums"]["book_format_enum"][]
          genres: string[] | null
          rating: number | null
          target_completion_date: string | null
          total_duration: number | null
          total_pages: number | null
          user_id: string
        }
        Insert: {
          book_id: string
          cover_image_url?: string | null
          date_added?: string | null
          format: Database["public"]["Enums"]["book_format_enum"][]
          genres?: string[] | null
          rating?: number | null
          target_completion_date?: string | null
          total_duration?: number | null
          total_pages?: number | null
          user_id: string
        }
        Update: {
          book_id?: string
          cover_image_url?: string | null
          date_added?: string | null
          format?: Database["public"]["Enums"]["book_format_enum"][]
          genres?: string[] | null
          rating?: number | null
          target_completion_date?: string | null
          total_duration?: number | null
          total_pages?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_books_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
        ]
      }
      user_searches: {
        Row: {
          created_at: string | null
          id: string
          query: string
          result_count: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id: string
          query: string
          result_count: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          query?: string
          result_count?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_book_reading_log: {
        Args: { reading_log_data: Json; user_id: string; book_id: string }
        Returns: string
      }
      add_book_to_library: {
        Args: {
          book_data: Json
          book_status_history_data: Json
          user_books_data: Json
          user_id: string
        }
        Returns: string
      }
      generate_prefixed_id: {
        Args: { prefix: string }
        Returns: string
      }
      get_books_by_status: {
        Args: {
          p_status: Database["public"]["Enums"]["book_status_enum"]
          p_user_id: string
        }
        Returns: Json
      }
      get_reading_progress: {
        Args: { p_user_id: string; p_book_id: string }
        Returns: {
          current_percentage: number
          current_page: number
          current_audio_time: number
          last_updated: string
        }[]
      }
      get_user_book_activity: {
        Args: { user_id: string }
        Returns: {
          activity_id: string
          activity_created_at: string
          status_history: Json
          book_details: Json
        }[]
      }
      get_user_book_current_state_fn: {
        Args: { p_user_id: string; p_book_id: string }
        Returns: {
          title: string
          description: string
          user_id: string
          book_id: string
          format: Database["public"]["Enums"]["book_format_enum"][]
          rating: number
          target_completion_date: string
          date_added: string
          cover_image_url: string
          total_pages: number
          total_duration: number
          genres: string[]
          current_status: Database["public"]["Enums"]["book_status_enum"]
          status_changed_at: string
          current_percentage: number
          current_audio_time: number
          current_page: number
          latest_note: string
        }[]
      }
      requesting_user_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      store_book_with_authors: {
        Args: { book_data: Json }
        Returns: string
      }
    }
    Enums: {
      arc_book_status_enum:
        | "requested"
        | "approved"
        | "reading"
        | "done"
        | "rejected"
        | "withdrew"
      book_format_enum: "physical" | "ebook" | "audio"
      book_status_enum: "tbr" | "current" | "completed" | "dnf" | "pause"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      arc_book_status_enum: [
        "requested",
        "approved",
        "reading",
        "done",
        "rejected",
        "withdrew",
      ],
      book_format_enum: ["physical", "ebook", "audio"],
      book_status_enum: ["tbr", "current", "completed", "dnf", "pause"],
    },
  },
} as const
