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

export interface Place {
  place_id: string;
  name: string;
  slug: string;
  description: string | null;
  latitude: number | null;
  longitude: number | null;
  created_at: string;
  updated_at: string;
}

export interface Feed {
  feed_id: string;
  feed_type: FeedType;
  slug: string;
  title: string;
  content: string | null;
  place_id: string | null;
  source_url: string | null;
  operating_hours: string | null;
  tags: string[];
  published_at: string | null;
  status: FeedStatus;
  created_at: string;
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
  featured: boolean;
  created_at: string;
  updated_at: string;
}

export interface FeedPlace {
  feed_id: string;
  place_id: string;
  created_at: string;
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
  created_at: string;
  updated_at: string;
}

export interface AdminErrorLog {
  log_id: string;
  error_id: string;
  area: string;
  message: string;
  details: Json;
  created_at: string;
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

export type NewFeed = Omit<
  Feed,
  "feed_id" | "created_at" | "updated_at"
>;

export type FeedUpdate = Partial<
  Omit<Feed, "feed_id" | "created_at" | "updated_at">
>;

export type NewPlace = Omit<
  Place,
  "place_id" | "created_at" | "updated_at"
>;

export type PlaceUpdate = Partial<
  Omit<Place, "place_id" | "created_at" | "updated_at">
>;

export type NewPhoto = Omit<
  Photo,
  "photo_id" | "created_at" | "updated_at"
>;

export type PhotoUpdate = Partial<
  Omit<Photo, "photo_id" | "created_at" | "updated_at">
>;

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
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          place_id?: string;
          name?: string;
          slug?: string;
          description?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          created_at?: string;
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
          place_id?: string | null;
          source_url?: string | null;
          operating_hours?: string | null;
          tags?: string[];
          published_at?: string | null;
          status?: FeedStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          feed_id?: string;
          feed_type?: FeedType;
          slug?: string;
          title?: string;
          content?: string | null;
          place_id?: string | null;
          source_url?: string | null;
          operating_hours?: string | null;
          tags?: string[];
          published_at?: string | null;
          status?: FeedStatus;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "feeds_place_id_fkey";
            columns: ["place_id"];
            referencedRelation: "places";
            referencedColumns: ["place_id"];
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
          featured?: boolean;
          created_at?: string;
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
          featured?: boolean;
          created_at?: string;
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
          created_at?: string;
        };
        Update: {
          feed_id?: string;
          place_id?: string;
          created_at?: string;
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
          created_at?: string;
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
          created_at?: string;
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
          created_at?: string;
        };
        Update: {
          log_id?: string;
          error_id?: string;
          area?: string;
          message?: string;
          details?: Json;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
