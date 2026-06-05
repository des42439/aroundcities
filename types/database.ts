export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type FeedStatus =
  | "draft"
  | "published"
  | "archived";

export type FeedType =
  | "photo_walk"
  | "food_visit"
  | "event_observation"
  | "local_discovery";

export type FeedOperatingHourScheduleType =
  | "weekly"
  | "date_range";

export type FeedScheduleType =
  | "occurrence"
  | "date_range"
  | "registration"
  | "operating_hours"
  | "other";

export interface Place {
  place_id: string;
  name: string;
  slug: string;
  description: string | null;
  latitude: number | null;
  longitude: number | null;
  created_by: string | null;
  created_at: string;
  updated_by: string | null;
  updated_at: string;
}

export interface Feed {
  feed_id: string;
  feed_type: FeedType;
  slug: string;
  title: string;
  content: string | null;
  description: string | null;
  place_id: string | null;
  parent_feed_id: string | null;
  source_url: string | null;
  operating_hours: string | null;
  tags: string[];
  published_at: string | null;
  status: FeedStatus;
  click_count: number;
  created_by: string | null;
  created_at: string;
  updated_by: string | null;
  updated_at: string;
}

export interface Photo {
  photo_id: string;
  feed_id: string;
  place_id: string | null;
  title: string | null;
  description: string | null;
  photo_url: string;
  location_name: string | null;
  captured_at: string | null;
  latitude: number | null;
  longitude: number | null;
  featured: boolean;
  sequence: number;
  click_count: number;
  created_by: string | null;
  created_at: string;
  updated_by: string | null;
  updated_at: string;
}

export interface FeedPlace {
  feed_id: string;
  place_id: string;
  is_primary: boolean;
  location_note: string | null;
  created_by: string | null;
  created_at: string;
  updated_by: string | null;
  updated_at: string;
}

export interface FeedPlaceWithPlace extends FeedPlace {
  place: Place;
}

export interface FeedOperatingHour {
  operating_hour_id: string;
  feed_id: string;
  schedule_type: FeedOperatingHourScheduleType;
  days_of_week: number[] | null;
  date_start: string | null;
  date_end: string | null;
  time_start: string | null;
  time_end: string | null;
  closed: boolean;
  note: string | null;
  sort_order: number;
  created_by: string | null;
  created_at: string;
  updated_by: string | null;
  updated_at: string;
}

export interface AdminErrorLog {
  log_id: string;
  error_id: string;
  area: string;
  message: string;
  details: Json;
  created_by: string | null;
  created_at: string;
  updated_by: string | null;
  updated_at: string;
}

export interface Source {
  source_id: string;
  name: string;
  url: string;
  notes: string | null;
  last_checked_at: string | null;
  created_by: string | null;
  created_at: string;
  updated_by: string | null;
  updated_at: string;
}

export interface Channel {
  channel_id: string;
  name: string;
  url: string;
  screenshot_url: string | null;
  remarks: string | null;
  last_checked_at: string | null;
  created_by: string | null;
  created_at: string;
  updated_by: string | null;
  updated_at: string;
}

export interface FeedSource {
  source_id: string;
  feed_id: string;
  source_url: string | null;
  channel_id: string | null;
  source_note: string | null;
  created_by: string | null;
  created_at: string;
  updated_by: string | null;
  updated_at: string;
}

export interface SourceScreenshot {
  screenshot_id: string;
  source_id: string;
  screenshot_url: string;
  sequence: number;
  remarks: string | null;
  created_by: string | null;
  created_at: string;
  updated_by: string | null;
  updated_at: string;
}

export interface FeedSchedule {
  schedule_id: string;
  feed_id: string;
  schedule_type: FeedScheduleType;
  schedule_date: string | null;
  start_date: string | null;
  end_date: string | null;
  days_of_week: number[] | null;
  start_time: string | null;
  end_time: string | null;
  remarks: string | null;
  created_by: string | null;
  created_at: string;
  updated_by: string | null;
  updated_at: string;
}

export interface FeedWithPlaceAndPhotos extends Feed {
  place: Place | null;
  photos: Photo[];
  feed_places?: FeedPlaceWithPlace[];
  operating_hour_rows?: FeedOperatingHour[];
}

export interface PlaceWithFeeds extends Place {
  feeds: FeedWithPlaceAndPhotos[];
}

export type NewFeed =
  Database["public"]["Tables"]["feeds"]["Insert"];

export type FeedUpdate =
  Database["public"]["Tables"]["feeds"]["Update"];

export type NewPlace =
  Database["public"]["Tables"]["places"]["Insert"];

export type PlaceUpdate =
  Database["public"]["Tables"]["places"]["Update"];

export type NewPhoto =
  Database["public"]["Tables"]["photos"]["Insert"];

export type PhotoUpdate =
  Database["public"]["Tables"]["photos"]["Update"];

export type NewSource =
  Database["public"]["Tables"]["sources"]["Insert"];

export type SourceUpdate =
  Database["public"]["Tables"]["sources"]["Update"];

export interface Database {
  public: {
    Tables: {
      places: {
        Row: Place;
        Insert: {
          place_id?: string;
          name: string;
          slug: string;
          description?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          created_by?: string | null;
          created_at?: string;
          updated_by?: string | null;
          updated_at?: string;
        };
        Update: {
          place_id?: string;
          name?: string;
          slug?: string;
          description?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          created_by?: string | null;
          created_at?: string;
          updated_by?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      feeds: {
        Row: Feed;
        Insert: {
          feed_id?: string;
          feed_type: FeedType;
          slug: string;
          title: string;
          content?: string | null;
          description?: string | null;
          place_id?: string | null;
          parent_feed_id?: string | null;
          source_url?: string | null;
          operating_hours?: string | null;
          tags?: string[];
          published_at?: string | null;
          status?: FeedStatus;
          click_count?: number;
          created_by?: string | null;
          created_at?: string;
          updated_by?: string | null;
          updated_at?: string;
        };
        Update: {
          feed_id?: string;
          feed_type?: FeedType;
          slug?: string;
          title?: string;
          content?: string | null;
          description?: string | null;
          place_id?: string | null;
          parent_feed_id?: string | null;
          source_url?: string | null;
          operating_hours?: string | null;
          tags?: string[];
          published_at?: string | null;
          status?: FeedStatus;
          click_count?: number;
          created_by?: string | null;
          created_at?: string;
          updated_by?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "feeds_place_id_fkey";
            columns: ["place_id"];
            referencedRelation: "places";
            referencedColumns: ["place_id"];
          },
          {
            foreignKeyName: "feeds_parent_feed_id_fkey";
            columns: ["parent_feed_id"];
            referencedRelation: "feeds";
            referencedColumns: ["feed_id"];
          },
        ];
      };
      photos: {
        Row: Photo;
        Insert: {
          photo_id?: string;
          feed_id: string;
          place_id?: string | null;
          title?: string | null;
          description?: string | null;
          photo_url: string;
          location_name?: string | null;
          captured_at?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          featured?: boolean;
          sequence?: number;
          click_count?: number;
          created_by?: string | null;
          created_at?: string;
          updated_by?: string | null;
          updated_at?: string;
        };
        Update: {
          photo_id?: string;
          feed_id?: string;
          place_id?: string | null;
          title?: string | null;
          description?: string | null;
          photo_url?: string;
          location_name?: string | null;
          captured_at?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          featured?: boolean;
          sequence?: number;
          click_count?: number;
          created_by?: string | null;
          created_at?: string;
          updated_by?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "photos_feed_id_fkey";
            columns: ["feed_id"];
            referencedRelation: "feeds";
            referencedColumns: ["feed_id"];
          },
          {
            foreignKeyName: "photos_place_id_fkey";
            columns: ["place_id"];
            referencedRelation: "places";
            referencedColumns: ["place_id"];
          },
        ];
      };
      feed_places: {
        Row: FeedPlace;
        Insert: {
          feed_id: string;
          place_id: string;
          is_primary?: boolean;
          location_note?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_by?: string | null;
          updated_at?: string;
        };
        Update: {
          feed_id?: string;
          place_id?: string;
          is_primary?: boolean;
          location_note?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_by?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "feed_places_feed_id_fkey";
            columns: ["feed_id"];
            referencedRelation: "feeds";
            referencedColumns: ["feed_id"];
          },
          {
            foreignKeyName: "feed_places_place_id_fkey";
            columns: ["place_id"];
            referencedRelation: "places";
            referencedColumns: ["place_id"];
          },
        ];
      };
      feed_operating_hours: {
        Row: FeedOperatingHour;
        Insert: {
          operating_hour_id?: string;
          feed_id: string;
          schedule_type: FeedOperatingHourScheduleType;
          days_of_week?: number[] | null;
          date_start?: string | null;
          date_end?: string | null;
          time_start?: string | null;
          time_end?: string | null;
          closed?: boolean;
          note?: string | null;
          sort_order?: number;
          created_by?: string | null;
          created_at?: string;
          updated_by?: string | null;
          updated_at?: string;
        };
        Update: {
          operating_hour_id?: string;
          feed_id?: string;
          schedule_type?: FeedOperatingHourScheduleType;
          days_of_week?: number[] | null;
          date_start?: string | null;
          date_end?: string | null;
          time_start?: string | null;
          time_end?: string | null;
          closed?: boolean;
          note?: string | null;
          sort_order?: number;
          created_by?: string | null;
          created_at?: string;
          updated_by?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "feed_operating_hours_feed_id_fkey";
            columns: ["feed_id"];
            referencedRelation: "feeds";
            referencedColumns: ["feed_id"];
          },
        ];
      };
      admin_error_logs: {
        Row: AdminErrorLog;
        Insert: {
          log_id?: string;
          error_id: string;
          area: string;
          message: string;
          details?: Json;
          created_by?: string | null;
          created_at?: string;
          updated_by?: string | null;
          updated_at?: string;
        };
        Update: {
          log_id?: string;
          error_id?: string;
          area?: string;
          message?: string;
          details?: Json;
          created_by?: string | null;
          created_at?: string;
          updated_by?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      sources: {
        Row: Source;
        Insert: {
          source_id?: string;
          name: string;
          url: string;
          notes?: string | null;
          last_checked_at?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_by?: string | null;
          updated_at?: string;
        };
        Update: {
          source_id?: string;
          name?: string;
          url?: string;
          notes?: string | null;
          last_checked_at?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_by?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      channels: {
        Row: Channel;
        Insert: {
          channel_id?: string;
          name: string;
          url: string;
          screenshot_url?: string | null;
          remarks?: string | null;
          last_checked_at?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_by?: string | null;
          updated_at?: string;
        };
        Update: {
          channel_id?: string;
          name?: string;
          url?: string;
          screenshot_url?: string | null;
          remarks?: string | null;
          last_checked_at?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_by?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      feed_sources: {
        Row: FeedSource;
        Insert: {
          source_id?: string;
          feed_id: string;
          source_url?: string | null;
          channel_id?: string | null;
          source_note?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_by?: string | null;
          updated_at?: string;
        };
        Update: {
          source_id?: string;
          feed_id?: string;
          source_url?: string | null;
          channel_id?: string | null;
          source_note?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_by?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "feed_sources_channel_id_fkey";
            columns: ["channel_id"];
            referencedRelation: "channels";
            referencedColumns: ["channel_id"];
          },
          {
            foreignKeyName: "feed_sources_feed_id_fkey";
            columns: ["feed_id"];
            referencedRelation: "feeds";
            referencedColumns: ["feed_id"];
          },
        ];
      };
      source_screenshots: {
        Row: SourceScreenshot;
        Insert: {
          screenshot_id?: string;
          source_id: string;
          screenshot_url: string;
          sequence?: number;
          remarks?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_by?: string | null;
          updated_at?: string;
        };
        Update: {
          screenshot_id?: string;
          source_id?: string;
          screenshot_url?: string;
          sequence?: number;
          remarks?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_by?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "source_screenshots_source_id_fkey";
            columns: ["source_id"];
            referencedRelation: "feed_sources";
            referencedColumns: ["source_id"];
          },
        ];
      };
      feed_schedules: {
        Row: FeedSchedule;
        Insert: {
          schedule_id?: string;
          feed_id: string;
          schedule_type?: FeedScheduleType;
          schedule_date?: string | null;
          start_date?: string | null;
          end_date?: string | null;
          days_of_week?: number[] | null;
          start_time?: string | null;
          end_time?: string | null;
          remarks?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_by?: string | null;
          updated_at?: string;
        };
        Update: {
          schedule_id?: string;
          feed_id?: string;
          schedule_type?: FeedScheduleType;
          schedule_date?: string | null;
          start_date?: string | null;
          end_date?: string | null;
          days_of_week?: number[] | null;
          start_time?: string | null;
          end_time?: string | null;
          remarks?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_by?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "feed_schedules_feed_id_fkey";
            columns: ["feed_id"];
            referencedRelation: "feeds";
            referencedColumns: ["feed_id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
