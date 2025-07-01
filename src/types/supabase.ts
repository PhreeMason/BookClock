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
            profiles: {
                Row: {
                    avatar_url: string | null
                    email: string | null
                    first_name: string | null
                    id: string
                    last_name: string | null
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
                    updated_at: string
                }
                Insert: {
                    created_at?: string
                    current_progress: number
                    id: string
                    reading_deadline_id: string
                    updated_at?: string
                }
                Update: {
                    created_at?: string
                    current_progress?: number
                    id?: string
                    reading_deadline_id?: string
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
            reading_deadlines: {
                Row: {
                    author: string | null
                    book_title: string
                    created_at: string | null
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
                    book_title: string
                    created_at?: string | null
                    deadline_date: string
                    flexibility: Database["public"]["Enums"]["deadline_flexibility"]
                    format: Database["public"]["Enums"]["book_format_enum"]
                    id: string
                    source: string
                    total_quantity: number
                    updated_at?: string | null
                    user_id: string
                }
                Update: {
                    author?: string | null
                    book_title?: string
                    created_at?: string | null
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
                        foreignKeyName: "reading_deadlines_user_id_fkey"
                        columns: ["user_id"]
                        isOneToOne: false
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    },
                ]
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
            deadline_flexibility: ["flexible", "strict"],
        },
    },
} as const
