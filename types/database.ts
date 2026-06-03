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

export interface FeedWithPlaceAndPhotos extends Feed {
  place: Place | null;
  photos: Photo[];
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
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
