import { getSupabaseAdmin } from "./supabase-admin";
import {
  Feed,
  FeedUpdate,
  FeedWithPlaceAndPhotos,
  NewFeed,
} from "@/types/database";

export async function getFeeds(): Promise<
  FeedWithPlaceAndPhotos[]
> {
  const { data, error } = await getSupabaseAdmin()
    .from("feeds")
    .select(
      "*, place:places!feeds_place_id_fkey(*), photos(*)"
    )
    .order("published_at", {
      ascending: false,
      nullsFirst: false,
    })
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    return [];
  }

  return (data ?? []) as FeedWithPlaceAndPhotos[];
}

export async function getLatestPublishedFeeds(): Promise<
  FeedWithPlaceAndPhotos[]
> {
  const { data, error } = await getSupabaseAdmin()
    .from("feeds")
    .select(
      "*, place:places!feeds_place_id_fkey(*), photos(*)"
    )
    .eq("status", "published")
    .order("published_at", {
      ascending: false,
      nullsFirst: false,
    });

  if (error) {
    console.error(error);
    return [];
  }

  return (data ?? []) as FeedWithPlaceAndPhotos[];
}

export async function getFeedBySlug(
  slug: string
): Promise<FeedWithPlaceAndPhotos | null> {
  const { data, error } = await getSupabaseAdmin()
    .from("feeds")
    .select(
      "*, place:places!feeds_place_id_fkey(*), photos(*)"
    )
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (error) {
    console.error(error);
    return null;
  }

  if (!data) {
    return null;
  }

  return data as FeedWithPlaceAndPhotos;
}

export async function getFeedById(
  feedId: string
): Promise<FeedWithPlaceAndPhotos | null> {
  const { data, error } = await getSupabaseAdmin()
    .from("feeds")
    .select(
      "*, place:places!feeds_place_id_fkey(*), photos(*)"
    )
    .eq("feed_id", feedId)
    .maybeSingle();

  if (error) {
    console.error(error);
    return null;
  }

  if (!data) {
    return null;
  }

  return data as FeedWithPlaceAndPhotos;
}

export async function createFeed(
  input: NewFeed
): Promise<Feed> {
  const { data, error } = await getSupabaseAdmin()
    .from("feeds")
    .insert(input)
    .select("*")
    .single();

  if (error) {
    throw new Error(`Feed create failed: ${error.message}`);
  }

  return data as Feed;
}

export async function updateFeed(
  feedId: string,
  input: FeedUpdate
): Promise<Feed> {
  const { data, error } = await getSupabaseAdmin()
    .from("feeds")
    .update({
      ...input,
      updated_at: new Date().toISOString(),
    })
    .eq("feed_id", feedId)
    .select("*")
    .single();

  if (error) {
    throw new Error(`Feed update failed: ${error.message}`);
  }

  return data as Feed;
}

export async function deleteFeed(
  feedId: string
): Promise<void> {
  const { error } = await getSupabaseAdmin()
    .from("feeds")
    .delete()
    .eq("feed_id", feedId);

  if (error) {
    throw new Error(`Feed delete failed: ${error.message}`);
  }
}
