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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      admin_error_logs: {
        Row: {
          area: string
          created_at: string
          created_by: string | null
          details: Json
          error_id: string
          log_id: string
          message: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          area: string
          created_at?: string
          created_by?: string | null
          details?: Json
          error_id: string
          log_id?: string
          message: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          area?: string
          created_at?: string
          created_by?: string | null
          details?: Json
          error_id?: string
          log_id?: string
          message?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      channels: {
        Row: {
          channel_id: string
          created_at: string
          created_by: string | null
          last_checked_at: string | null
          name: string
          remarks: string | null
          screenshot_url: string | null
          updated_at: string
          updated_by: string | null
          url: string
        }
        Insert: {
          channel_id?: string
          created_at?: string
          created_by?: string | null
          last_checked_at?: string | null
          name: string
          remarks?: string | null
          screenshot_url?: string | null
          updated_at?: string
          updated_by?: string | null
          url: string
        }
        Update: {
          channel_id?: string
          created_at?: string
          created_by?: string | null
          last_checked_at?: string | null
          name?: string
          remarks?: string | null
          screenshot_url?: string | null
          updated_at?: string
          updated_by?: string | null
          url?: string
        }
        Relationships: []
      }
      feed_operating_hours: {
        Row: {
          closed: boolean
          created_at: string
          created_by: string | null
          date_end: string | null
          date_start: string | null
          days_of_week: number[] | null
          feed_id: string
          note: string | null
          operating_hour_id: string
          schedule_type: string
          sort_order: number
          time_end: string | null
          time_start: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          closed?: boolean
          created_at?: string
          created_by?: string | null
          date_end?: string | null
          date_start?: string | null
          days_of_week?: number[] | null
          feed_id: string
          note?: string | null
          operating_hour_id?: string
          schedule_type: string
          sort_order?: number
          time_end?: string | null
          time_start?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          closed?: boolean
          created_at?: string
          created_by?: string | null
          date_end?: string | null
          date_start?: string | null
          days_of_week?: number[] | null
          feed_id?: string
          note?: string | null
          operating_hour_id?: string
          schedule_type?: string
          sort_order?: number
          time_end?: string | null
          time_start?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "feed_operating_hours_feed_id_fkey"
            columns: ["feed_id"]
            isOneToOne: false
            referencedRelation: "feeds"
            referencedColumns: ["feed_id"]
          },
        ]
      }
      feed_places: {
        Row: {
          created_at: string
          created_by: string | null
          feed_id: string
          is_primary: boolean
          location_note: string | null
          place_id: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          feed_id: string
          is_primary?: boolean
          location_note?: string | null
          place_id: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          feed_id?: string
          is_primary?: boolean
          location_note?: string | null
          place_id?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "feed_places_feed_id_fkey"
            columns: ["feed_id"]
            isOneToOne: false
            referencedRelation: "feeds"
            referencedColumns: ["feed_id"]
          },
          {
            foreignKeyName: "feed_places_place_id_fkey"
            columns: ["place_id"]
            isOneToOne: false
            referencedRelation: "places"
            referencedColumns: ["place_id"]
          },
        ]
      }
      feed_schedules: {
        Row: {
          created_at: string
          created_by: string | null
          days_of_week: number[] | null
          end_date: string | null
          end_time: string | null
          feed_id: string
          remarks: string | null
          schedule_date: string | null
          schedule_id: string
          schedule_type: string
          start_date: string | null
          start_time: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          days_of_week?: number[] | null
          end_date?: string | null
          end_time?: string | null
          feed_id: string
          remarks?: string | null
          schedule_date?: string | null
          schedule_id?: string
          schedule_type?: string
          start_date?: string | null
          start_time?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          days_of_week?: number[] | null
          end_date?: string | null
          end_time?: string | null
          feed_id?: string
          remarks?: string | null
          schedule_date?: string | null
          schedule_id?: string
          schedule_type?: string
          start_date?: string | null
          start_time?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "feed_schedules_feed_id_fkey"
            columns: ["feed_id"]
            isOneToOne: false
            referencedRelation: "feeds"
            referencedColumns: ["feed_id"]
          },
        ]
      }
      feed_sources: {
        Row: {
          channel_id: string | null
          created_at: string
          created_by: string | null
          feed_id: string
          source_id: string
          source_note: string | null
          source_url: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          channel_id?: string | null
          created_at?: string
          created_by?: string | null
          feed_id: string
          source_id?: string
          source_note?: string | null
          source_url?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          channel_id?: string | null
          created_at?: string
          created_by?: string | null
          feed_id?: string
          source_id?: string
          source_note?: string | null
          source_url?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "feed_sources_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "channels"
            referencedColumns: ["channel_id"]
          },
          {
            foreignKeyName: "feed_sources_feed_id_fkey"
            columns: ["feed_id"]
            isOneToOne: false
            referencedRelation: "feeds"
            referencedColumns: ["feed_id"]
          },
        ]
      }
      feeds: {
        Row: {
          content: string | null
          created_at: string
          created_by: string | null
          description: string | null
          feed_id: string
          feed_type: string
          operating_hours: string | null
          parent_feed_id: string | null
          place_id: string | null
          published_at: string | null
          slug: string
          source_url: string | null
          status: string
          tags: string[]
          title: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          content?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          feed_id?: string
          feed_type: string
          operating_hours?: string | null
          parent_feed_id?: string | null
          place_id?: string | null
          published_at?: string | null
          slug: string
          source_url?: string | null
          status?: string
          tags?: string[]
          title: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          content?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          feed_id?: string
          feed_type?: string
          operating_hours?: string | null
          parent_feed_id?: string | null
          place_id?: string | null
          published_at?: string | null
          slug?: string
          source_url?: string | null
          status?: string
          tags?: string[]
          title?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "feeds_parent_feed_id_fkey"
            columns: ["parent_feed_id"]
            isOneToOne: false
            referencedRelation: "feeds"
            referencedColumns: ["feed_id"]
          },
          {
            foreignKeyName: "feeds_place_id_fkey"
            columns: ["place_id"]
            isOneToOne: false
            referencedRelation: "places"
            referencedColumns: ["place_id"]
          },
        ]
      }
      photos: {
        Row: {
          captured_at: string | null
          created_at: string
          created_by: string | null
          description: string | null
          featured: boolean
          feed_id: string
          latitude: number | null
          location_name: string | null
          longitude: number | null
          photo_id: string
          photo_url: string
          place_id: string | null
          sequence: number
          title: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          captured_at?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          featured?: boolean
          feed_id: string
          latitude?: number | null
          location_name?: string | null
          longitude?: number | null
          photo_id?: string
          photo_url: string
          place_id?: string | null
          sequence?: number
          title?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          captured_at?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          featured?: boolean
          feed_id?: string
          latitude?: number | null
          location_name?: string | null
          longitude?: number | null
          photo_id?: string
          photo_url?: string
          place_id?: string | null
          sequence?: number
          title?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "photos_feed_id_fkey"
            columns: ["feed_id"]
            isOneToOne: false
            referencedRelation: "feeds"
            referencedColumns: ["feed_id"]
          },
          {
            foreignKeyName: "photos_place_id_fkey"
            columns: ["place_id"]
            isOneToOne: false
            referencedRelation: "places"
            referencedColumns: ["place_id"]
          },
        ]
      }
      places: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          latitude: number | null
          longitude: number | null
          name: string
          place_id: string
          slug: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          latitude?: number | null
          longitude?: number | null
          name: string
          place_id?: string
          slug: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          latitude?: number | null
          longitude?: number | null
          name?: string
          place_id?: string
          slug?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      source_screenshots: {
        Row: {
          created_at: string
          created_by: string | null
          remarks: string | null
          screenshot_id: string
          screenshot_url: string
          sequence: number
          source_id: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          remarks?: string | null
          screenshot_id?: string
          screenshot_url: string
          sequence?: number
          source_id: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          remarks?: string | null
          screenshot_id?: string
          screenshot_url?: string
          sequence?: number
          source_id?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "source_screenshots_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "feed_sources"
            referencedColumns: ["source_id"]
          },
        ]
      }
      sources: {
        Row: {
          created_at: string
          created_by: string | null
          last_checked_at: string | null
          name: string
          notes: string | null
          source_id: string
          updated_at: string
          updated_by: string | null
          url: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          last_checked_at?: string | null
          name: string
          notes?: string | null
          source_id?: string
          updated_at?: string
          updated_by?: string | null
          url: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          last_checked_at?: string | null
          name?: string
          notes?: string | null
          source_id?: string
          updated_at?: string
          updated_by?: string | null
          url?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
