export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      achievement_events: {
        Row: {
          created_at: string | null
          event_data: Json
          event_type: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          event_data?: Json
          event_type: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          event_data?: Json
          event_type?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      achievement_progress: {
        Row: {
          achievement_id: string
          created_at: string | null
          current_value: number
          id: string
          last_updated: string | null
          max_value: number | null
          metadata: Json | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          achievement_id: string
          created_at?: string | null
          current_value?: number
          id?: string
          last_updated?: string | null
          max_value?: number | null
          metadata?: Json | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          achievement_id?: string
          created_at?: string | null
          current_value?: number
          id?: string
          last_updated?: string | null
          max_value?: number | null
          metadata?: Json | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "achievement_progress_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "achievements"
            referencedColumns: ["id"]
          },
        ]
      }
      achievements: {
        Row: {
          category: string
          color: string
          created_at: string | null
          criteria: Json
          description: string
          icon: string
          id: string
          is_active: boolean | null
          sort_order: number | null
          title: string
          type: string
          updated_at: string | null
        }
        Insert: {
          category: string
          color: string
          created_at?: string | null
          criteria: Json
          description: string
          icon: string
          id: string
          is_active?: boolean | null
          sort_order?: number | null
          title: string
          type: string
          updated_at?: string | null
        }
        Update: {
          category?: string
          color?: string
          created_at?: string | null
          criteria?: Json
          description?: string
          icon?: string
          id?: string
          is_active?: boolean | null
          sort_order?: number | null
          title?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
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
          source_platform: string
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
          source_platform: string
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
          source_platform?: string
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
          email: string | null
          first_name: string | null
          id: string
          last_name: string | null
          onboarding_complete: boolean
          updated_at: string | null
          username: string | null
          website: string | null
        }
        Insert: {
          avatar_url?: string | null
          email?: string | null
          first_name?: string | null
          id: string
          last_name?: string | null
          onboarding_complete?: boolean
          updated_at?: string | null
          username?: string | null
          website?: string | null
        }
        Update: {
          avatar_url?: string | null
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          onboarding_complete?: boolean
          updated_at?: string | null
          username?: string | null
          website?: string | null
        }
        Relationships: []
      }
      reading_deadline_progress: {
        Row: {
          created_at: string
          current_progress: number
          id: string
          reading_deadline_id: string
          time_spent_reading: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          current_progress: number
          id: string
          reading_deadline_id: string
          time_spent_reading?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          current_progress?: number
          id?: string
          reading_deadline_id?: string
          time_spent_reading?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reading_deadline_progress_reading_deadline_id_fkey"
            columns: ["reading_deadline_id"]
            isOneToOne: false
            referencedRelation: "reading_deadlines"
            referencedColumns: ["id"]
          },
        ]
      }
      reading_deadline_status: {
        Row: {
          created_at: string
          id: number
          reading_deadline_id: string | null
          status:
            | Database["public"]["Enums"]["reading_deadline_status_enum"]
            | null
        }
        Insert: {
          created_at?: string
          id?: number
          reading_deadline_id?: string | null
          status?:
            | Database["public"]["Enums"]["reading_deadline_status_enum"]
            | null
        }
        Update: {
          created_at?: string
          id?: number
          reading_deadline_id?: string | null
          status?:
            | Database["public"]["Enums"]["reading_deadline_status_enum"]
            | null
        }
        Relationships: [
          {
            foreignKeyName: "reading_deadline_status_reading_deadline_id_fkey"
            columns: ["reading_deadline_id"]
            isOneToOne: false
            referencedRelation: "reading_deadlines"
            referencedColumns: ["id"]
          },
        ]
      }
      reading_deadlines: {
        Row: {
          author: string | null
          book_id: string | null
          book_title: string
          created_at: string
          deadline_date: string
          flexibility: Database["public"]["Enums"]["deadline_flexibility"]
          format: Database["public"]["Enums"]["book_format_enum"]
          id: string
          source: string
          total_quantity: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          author?: string | null
          book_id?: string | null
          book_title: string
          created_at?: string
          deadline_date: string
          flexibility: Database["public"]["Enums"]["deadline_flexibility"]
          format?: Database["public"]["Enums"]["book_format_enum"]
          id: string
          source: string
          total_quantity: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          author?: string | null
          book_id?: string | null
          book_title?: string
          created_at?: string
          deadline_date?: string
          flexibility?: Database["public"]["Enums"]["deadline_flexibility"]
          format?: Database["public"]["Enums"]["book_format_enum"]
          id?: string
          source?: string
          total_quantity?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reading_deadlines_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reading_deadlines_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      reading_sessions: {
        Row: {
          books_read: string[] | null
          created_at: string | null
          date: string
          duration_minutes: number | null
          id: string
          pages_read: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          books_read?: string[] | null
          created_at?: string | null
          date: string
          duration_minutes?: number | null
          id?: string
          pages_read?: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          books_read?: string[] | null
          created_at?: string | null
          date?: string
          duration_minutes?: number | null
          id?: string
          pages_read?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_achievements: {
        Row: {
          achievement_id: string
          created_at: string | null
          id: string
          progress_data: Json | null
          unlocked_at: string | null
          user_id: string
        }
        Insert: {
          achievement_id: string
          created_at?: string | null
          id?: string
          progress_data?: Json | null
          unlocked_at?: string | null
          user_id: string
        }
        Update: {
          achievement_id?: string
          created_at?: string | null
          id?: string
          progress_data?: Json | null
          unlocked_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_achievements_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "achievements"
            referencedColumns: ["id"]
          },
        ]
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
          created_at: string
          id: string
          query: string
          result_count: number
          user_id: string
        }
        Insert: {
          created_at?: string
          id: string
          query: string
          result_count: number
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          query?: string
          result_count?: number
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_prefixed_id: {
        Args: { prefix: string }
        Returns: string
      }
      pull_changes: {
        Args: {
          last_pulled_at: number
          migration: Json
          schema_version: number
          user_id: string
        }
        Returns: Json
      }
      push_changes: {
        Args: { changes: Json; last_pulled_at: number; user_id: string }
        Returns: Json
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
      deadline_flexibility: "flexible" | "strict"
      reading_deadline_status_enum:
        | "requested"
        | "approved"
        | "reading"
        | "rejected"
        | "withdrew"
        | "complete"
        | "set_aside"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
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
      deadline_flexibility: ["flexible", "strict"],
      reading_deadline_status_enum: [
        "requested",
        "approved",
        "reading",
        "rejected",
        "withdrew",
        "complete",
        "set_aside",
      ],
    },
  },
} as const
