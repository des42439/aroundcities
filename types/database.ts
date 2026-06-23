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

export type PhotoAlbumStatus =
  | "drafted"
  | "published"
  | "archived";

export type PhotoStatus =
  | "drafted"
  | "published"
  | "archived";

export type HistoryStatus =
  | "drafted"
  | "researched"
  | "pending_review"
  | "published"
  | "archived";

export type LeadStatus =
  | "active"
  | "archived";

export type SourceReviewStatus =
  | "pending"
  | "reviewed"
  | "rejected";

export type SourceScreenshotStatus =
  | "pending"
  | "completed"
  | "failed";

export type SourceSectionType = "history" | "feed";

export type HistoryConfidence =
  | "high"
  | "medium"
  | "low";

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

export type EventEntryType =
  | "free"
  | "paid"
  | "unknown";

export type EventRegistrationType =
  | "free_registration"
  | "registration_required"
  | "walk_in"
  | "unknown";

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
  feed_id: string | null;
  album_id: string | null;
  place_id: string | null;
  title: string | null;
  description: string | null;
  photo_url: string;
  location_name: string | null;
  location_note: string | null;
  captured_at: string | null;
  latitude: number | null;
  longitude: number | null;
  featured: boolean;
  is_album_cover: boolean;
  sequence: number;
  status: PhotoStatus;
  tags: string[];
  click_count: number;
  created_by: string | null;
  created_at: string;
  updated_by: string | null;
  updated_at: string;
}

export interface PhotoAlbum {
  album_id: string;
  title: string;
  description: string | null;
  status: PhotoAlbumStatus;
  created_at: string;
  updated_at: string;
}

export interface PhotoAlbumWithPhotos extends PhotoAlbum {
  photos: Photo[];
}

export interface HistoryRecord {
  history_id: string;
  title: string;
  description: string | null;
  event_year: number;
  event_month: number;
  event_day: number;
  status: HistoryStatus;
  place_name: string | null;
  location_note: string | null;
  tags: string[];
  source_url: string | null;
  source_note: string | null;
  source_screenshot_url: string | null;
  confidence: HistoryConfidence;
  created_at: string;
  updated_at: string;
}

export interface HistoryPhoto {
  history_photo_id: string;
  history_id: string;
  photo_id: string;
  sequence: number;
  note: string | null;
  created_at: string;
}

export interface HistoryPhotoWithPhoto extends HistoryPhoto {
  photo: Photo;
}

export interface Source {
  source_id: string;
  section_type: SourceSectionType;
  section_id: string;
  source_url: string | null;
  source_title: string | null;
  source_note: string | null;
  review_status: SourceReviewStatus;
  source_screenshot_url: string | null;
  screenshot_status: SourceScreenshotStatus;
  screenshot_error: string | null;
  sequence: number;
  created_at: string;
  updated_at: string;
}

export interface HistoryRecordWithPhotos extends HistoryRecord {
  history_photos: HistoryPhotoWithPhoto[];
  sources: Source[];
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

export interface SourceChecklist {
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

export interface Lead {
  lead_id: string;
  title: string;
  lead_content: string | null;
  why_interesting: string | null;
  source_name: string | null;
  source_type: string | null;
  source_url: string | null;
  source_page: string | null;
  source_section: string | null;
  source_note: string | null;
  lead_type: string | null;
  place_name: string | null;
  relevant_date: string | null;
  tags: string[];
  status: LeadStatus;
  created_at: string;
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

export interface FeedEventDetails {
  detail_id: string;
  feed_id: string;
  entry_type: EventEntryType;
  registration_type: EventRegistrationType;
  open_to_public: boolean | null;
  ticket_required: boolean | null;
  lucky_draw: boolean | null;
  dress_code: string | null;
  organizer: string | null;
  event_notes: string | null;
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
  schedules?: FeedSchedule[];
  event_details?: FeedEventDetails | null;
}

export type TodayInKuchingGroup =
  | "today"
  | "tomorrow"
  | "comingSoon";

export interface TodayInKuchingEvent {
  id: string;
  feed_id: string;
  title: string;
  slug: string;
  group: TodayInKuchingGroup;
  schedule_date: string;
  start_time: string | null;
  location: string | null;
  source_title: string | null;
  source_url: string | null;
}

export interface TodayInKuchingSummary {
  today: TodayInKuchingEvent[];
  tomorrow: TodayInKuchingEvent[];
  comingSoon: TodayInKuchingEvent[];
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

export type NewPhotoAlbum =
  Database["public"]["Tables"]["photo_albums"]["Insert"];

export type PhotoAlbumUpdate =
  Database["public"]["Tables"]["photo_albums"]["Update"];

export type NewHistoryRecord =
  Database["public"]["Tables"]["history_records"]["Insert"];

export type HistoryRecordUpdate =
  Database["public"]["Tables"]["history_records"]["Update"];

export type NewHistoryPhoto =
  Database["public"]["Tables"]["history_photos"]["Insert"];

export type NewSource =
  Database["public"]["Tables"]["sources"]["Insert"];

export type SourceUpdate =
  Database["public"]["Tables"]["sources"]["Update"];

export type NewSourceChecklist =
  Database["public"]["Tables"]["source_checklist"]["Insert"];

export type SourceChecklistUpdate =
  Database["public"]["Tables"]["source_checklist"]["Update"];

export type NewLead =
  Database["public"]["Tables"]["leads"]["Insert"];

export type LeadUpdate =
  Database["public"]["Tables"]["leads"]["Update"];

export type NewFeedEventDetails =
  Database["public"]["Tables"]["feed_event_details"]["Insert"];

export type FeedEventDetailsUpdate =
  Database["public"]["Tables"]["feed_event_details"]["Update"];

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
          feed_id?: string | null;
          album_id?: string | null;
          place_id?: string | null;
          title?: string | null;
          description?: string | null;
          photo_url: string;
          location_name?: string | null;
          location_note?: string | null;
          captured_at?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          featured?: boolean;
          is_album_cover?: boolean;
          sequence?: number;
          status?: PhotoStatus;
          tags?: string[];
          click_count?: number;
          created_by?: string | null;
          created_at?: string;
          updated_by?: string | null;
          updated_at?: string;
        };
        Update: {
          photo_id?: string;
          feed_id?: string | null;
          album_id?: string | null;
          place_id?: string | null;
          title?: string | null;
          description?: string | null;
          photo_url?: string;
          location_name?: string | null;
          location_note?: string | null;
          captured_at?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          featured?: boolean;
          is_album_cover?: boolean;
          sequence?: number;
          status?: PhotoStatus;
          tags?: string[];
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
            foreignKeyName: "photos_album_id_fkey";
            columns: ["album_id"];
            referencedRelation: "photo_albums";
            referencedColumns: ["album_id"];
          },
          {
            foreignKeyName: "photos_place_id_fkey";
            columns: ["place_id"];
            referencedRelation: "places";
            referencedColumns: ["place_id"];
          },
        ];
      };
      photo_albums: {
        Row: PhotoAlbum;
        Insert: {
          album_id?: string;
          title: string;
          description?: string | null;
          status?: PhotoAlbumStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          album_id?: string;
          title?: string;
          description?: string | null;
          status?: PhotoAlbumStatus;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      history_records: {
        Row: HistoryRecord;
        Insert: {
          history_id?: string;
          title: string;
          description?: string | null;
          event_year: number;
          event_month: number;
          event_day: number;
          status?: HistoryStatus;
          place_name?: string | null;
          location_note?: string | null;
          tags?: string[];
          source_url?: string | null;
          source_note?: string | null;
          source_screenshot_url?: string | null;
          confidence?: HistoryConfidence;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          history_id?: string;
          title?: string;
          description?: string | null;
          event_year?: number;
          event_month?: number;
          event_day?: number;
          status?: HistoryStatus;
          place_name?: string | null;
          location_note?: string | null;
          tags?: string[];
          source_url?: string | null;
          source_note?: string | null;
          source_screenshot_url?: string | null;
          confidence?: HistoryConfidence;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      history_photos: {
        Row: HistoryPhoto;
        Insert: {
          history_photo_id?: string;
          history_id: string;
          photo_id: string;
          sequence?: number;
          note?: string | null;
          created_at?: string;
        };
        Update: {
          history_photo_id?: string;
          history_id?: string;
          photo_id?: string;
          sequence?: number;
          note?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "history_photos_history_id_fkey";
            columns: ["history_id"];
            referencedRelation: "history_records";
            referencedColumns: ["history_id"];
          },
          {
            foreignKeyName: "history_photos_photo_id_fkey";
            columns: ["photo_id"];
            referencedRelation: "photos";
            referencedColumns: ["photo_id"];
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
          section_type: SourceSectionType;
          section_id: string;
          source_title?: string | null;
          source_url?: string | null;
          source_note?: string | null;
          source_screenshot_url?: string | null;
          screenshot_status?: SourceScreenshotStatus;
          screenshot_error?: string | null;
          review_status?: SourceReviewStatus;
          sequence?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          source_id?: string;
          section_type?: SourceSectionType;
          section_id?: string;
          source_title?: string | null;
          source_url?: string | null;
          source_note?: string | null;
          source_screenshot_url?: string | null;
          screenshot_status?: SourceScreenshotStatus;
          screenshot_error?: string | null;
          review_status?: SourceReviewStatus;
          sequence?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      source_checklist: {
        Row: SourceChecklist;
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
      leads: {
        Row: Lead;
        Insert: {
          lead_id?: string;
          title: string;
          lead_content?: string | null;
          why_interesting?: string | null;
          source_name?: string | null;
          source_type?: string | null;
          source_url?: string | null;
          source_page?: string | null;
          source_section?: string | null;
          source_note?: string | null;
          lead_type?: string | null;
          place_name?: string | null;
          relevant_date?: string | null;
          tags?: string[];
          status?: LeadStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          lead_id?: string;
          title?: string;
          lead_content?: string | null;
          why_interesting?: string | null;
          source_name?: string | null;
          source_type?: string | null;
          source_url?: string | null;
          source_page?: string | null;
          source_section?: string | null;
          source_note?: string | null;
          lead_type?: string | null;
          place_name?: string | null;
          relevant_date?: string | null;
          tags?: string[];
          status?: LeadStatus;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
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
      feed_event_details: {
        Row: FeedEventDetails;
        Insert: {
          detail_id?: string;
          feed_id: string;
          entry_type?: EventEntryType;
          registration_type?: EventRegistrationType;
          open_to_public?: boolean | null;
          ticket_required?: boolean | null;
          lucky_draw?: boolean | null;
          dress_code?: string | null;
          organizer?: string | null;
          event_notes?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_by?: string | null;
          updated_at?: string;
        };
        Update: {
          detail_id?: string;
          feed_id?: string;
          entry_type?: EventEntryType;
          registration_type?: EventRegistrationType;
          open_to_public?: boolean | null;
          ticket_required?: boolean | null;
          lucky_draw?: boolean | null;
          dress_code?: string | null;
          organizer?: string | null;
          event_notes?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_by?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "feed_event_details_feed_id_fkey";
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
