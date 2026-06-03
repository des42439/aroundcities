import { supabase } from "./supabase";
import {
  Feed,
  FeedUpdate,
  FeedWithPlaceAndPhotos,
  NewFeed,
} from "@/types/database";

export async function getFeeds(): Promise<
  FeedWithPlaceAndPhotos[]
> {
  const { data, error } = await supabase
    .from("feeds")
    .select("*, place:places(*), photos(*)")
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
  const { data, error } = await supabase
    .from("feeds")
    .select("*, place:places(*), photos(*)")
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
  const { data, error } = await supabase
    .from("feeds")
    .select("*, place:places(*), photos(*)")
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
  const { data, error } = await supabase
    .from("feeds")
    .select("*, place:places(*), photos(*)")
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
): Promise<Feed | null> {
  const { data, error } = await supabase
    .from("feeds")
    .insert(input)
    .select("*")
    .single();

  if (error) {
    console.error(error);
    return null;
  }

  return data;
}

export async function updateFeed(
  feedId: string,
  input: FeedUpdate
): Promise<Feed | null> {
  const { data, error } = await supabase
    .from("feeds")
    .update({
      ...input,
      updated_at: new Date().toISOString(),
    })
    .eq("feed_id", feedId)
    .select("*")
    .single();

  if (error) {
    console.error(error);
    return null;
  }

  return data;
}

export async function deleteFeed(
  feedId: string
): Promise<void> {
  const { error } = await supabase
    .from("feeds")
    .delete()
    .eq("feed_id", feedId);

  if (error) {
    console.error(error);
  }
}
