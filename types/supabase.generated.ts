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
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
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
      feed_event_details: {
        Row: {
          created_at: string
          created_by: string | null
          detail_id: string
          dress_code: string | null
          entry_type: string
          event_notes: string | null
          feed_id: string
          lucky_draw: boolean | null
          open_to_public: boolean | null
          organizer: string | null
          registration_type: string
          ticket_required: boolean | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          detail_id?: string
          dress_code?: string | null
          entry_type?: string
          event_notes?: string | null
          feed_id: string
          lucky_draw?: boolean | null
          open_to_public?: boolean | null
          organizer?: string | null
          registration_type?: string
          ticket_required?: boolean | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          detail_id?: string
          dress_code?: string | null
          entry_type?: string
          event_notes?: string | null
          feed_id?: string
          lucky_draw?: boolean | null
          open_to_public?: boolean | null
          organizer?: string | null
          registration_type?: string
          ticket_required?: boolean | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "feed_event_details_feed_id_fkey"
            columns: ["feed_id"]
            isOneToOne: true
            referencedRelation: "feeds"
            referencedColumns: ["feed_id"]
          },
        ]
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
          click_count: number
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
          click_count?: number
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
          click_count?: number
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
      history_photos: {
        Row: {
          created_at: string
          history_id: string
          history_photo_id: string
          note: string | null
          photo_id: string
          sequence: number
        }
        Insert: {
          created_at?: string
          history_id: string
          history_photo_id?: string
          note?: string | null
          photo_id: string
          sequence?: number
        }
        Update: {
          created_at?: string
          history_id?: string
          history_photo_id?: string
          note?: string | null
          photo_id?: string
          sequence?: number
        }
        Relationships: [
          {
            foreignKeyName: "history_photos_history_id_fkey"
            columns: ["history_id"]
            isOneToOne: false
            referencedRelation: "history_records"
            referencedColumns: ["history_id"]
          },
          {
            foreignKeyName: "history_photos_photo_id_fkey"
            columns: ["photo_id"]
            isOneToOne: false
            referencedRelation: "photos"
            referencedColumns: ["photo_id"]
          },
        ]
      }
      history_records: {
        Row: {
          confidence: string
          created_at: string
          description: string | null
          event_day: number
          event_month: number
          event_year: number
          history_id: string
          location_note: string | null
          place_name: string | null
          source_note: string | null
          source_screenshot_url: string | null
          source_url: string | null
          status: string
          tags: string[]
          title: string
          updated_at: string
        }
        Insert: {
          confidence?: string
          created_at?: string
          description?: string | null
          event_day: number
          event_month: number
          event_year: number
          history_id?: string
          location_note?: string | null
          place_name?: string | null
          source_note?: string | null
          source_screenshot_url?: string | null
          source_url?: string | null
          status?: string
          tags?: string[]
          title: string
          updated_at?: string
        }
        Update: {
          confidence?: string
          created_at?: string
          description?: string | null
          event_day?: number
          event_month?: number
          event_year?: number
          history_id?: string
          location_note?: string | null
          place_name?: string | null
          source_note?: string | null
          source_screenshot_url?: string | null
          source_url?: string | null
          status?: string
          tags?: string[]
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      history_sources: {
        Row: {
          created_at: string
          history_id: string
          history_source_id: string
          screenshot_error: string | null
          screenshot_status: string
          sequence: number
          source_note: string | null
          source_screenshot_url: string | null
          source_status: string
          source_title: string | null
          source_url: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          history_id: string
          history_source_id?: string
          screenshot_error?: string | null
          screenshot_status?: string
          sequence?: number
          source_note?: string | null
          source_screenshot_url?: string | null
          source_status?: string
          source_title?: string | null
          source_url: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          history_id?: string
          history_source_id?: string
          screenshot_error?: string | null
          screenshot_status?: string
          sequence?: number
          source_note?: string | null
          source_screenshot_url?: string | null
          source_status?: string
          source_title?: string | null
          source_url?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "history_sources_history_id_fkey"
            columns: ["history_id"]
            isOneToOne: false
            referencedRelation: "history_records"
            referencedColumns: ["history_id"]
          },
        ]
      }
      leads: {
        Row: {
          created_at: string
          lead_content: string | null
          lead_id: string
          lead_type: string | null
          place_name: string | null
          relevant_date: string | null
          source_name: string | null
          source_note: string | null
          source_page: string | null
          source_section: string | null
          source_type: string | null
          source_url: string | null
          status: string
          tags: string[]
          title: string
          updated_at: string
          why_interesting: string | null
        }
        Insert: {
          created_at?: string
          lead_content?: string | null
          lead_id?: string
          lead_type?: string | null
          place_name?: string | null
          relevant_date?: string | null
          source_name?: string | null
          source_note?: string | null
          source_page?: string | null
          source_section?: string | null
          source_type?: string | null
          source_url?: string | null
          status?: string
          tags?: string[]
          title: string
          updated_at?: string
          why_interesting?: string | null
        }
        Update: {
          created_at?: string
          lead_content?: string | null
          lead_id?: string
          lead_type?: string | null
          place_name?: string | null
          relevant_date?: string | null
          source_name?: string | null
          source_note?: string | null
          source_page?: string | null
          source_section?: string | null
          source_type?: string | null
          source_url?: string | null
          status?: string
          tags?: string[]
          title?: string
          updated_at?: string
          why_interesting?: string | null
        }
        Relationships: []
      }
      photo_albums: {
        Row: {
          album_id: string
          created_at: string
          description: string | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          album_id?: string
          created_at?: string
          description?: string | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          album_id?: string
          created_at?: string
          description?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      photos: {
        Row: {
          album_id: string | null
          captured_at: string | null
          click_count: number
          created_at: string
          created_by: string | null
          description: string | null
          featured: boolean
          feed_id: string | null
          is_album_cover: boolean
          latitude: number | null
          location_name: string | null
          location_note: string | null
          longitude: number | null
          photo_id: string
          photo_url: string
          place_id: string | null
          sequence: number
          status: string
          tags: string[]
          title: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          album_id?: string | null
          captured_at?: string | null
          click_count?: number
          created_at?: string
          created_by?: string | null
          description?: string | null
          featured?: boolean
          feed_id?: string | null
          is_album_cover?: boolean
          latitude?: number | null
          location_name?: string | null
          location_note?: string | null
          longitude?: number | null
          photo_id?: string
          photo_url: string
          place_id?: string | null
          sequence?: number
          status?: string
          tags?: string[]
          title?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          album_id?: string | null
          captured_at?: string | null
          click_count?: number
          created_at?: string
          created_by?: string | null
          description?: string | null
          featured?: boolean
          feed_id?: string | null
          is_album_cover?: boolean
          latitude?: number | null
          location_name?: string | null
          location_note?: string | null
          longitude?: number | null
          photo_id?: string
          photo_url?: string
          place_id?: string | null
          sequence?: number
          status?: string
          tags?: string[]
          title?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "photos_album_id_fkey"
            columns: ["album_id"]
            isOneToOne: false
            referencedRelation: "photo_albums"
            referencedColumns: ["album_id"]
          },
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
      increment_feed_click_count: {
        Args: { p_feed_id: string }
        Returns: undefined
      }
      increment_photo_click_count: {
        Args: { p_photo_id: string }
        Returns: undefined
      }
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const
