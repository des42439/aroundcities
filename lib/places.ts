import { supabase } from "./supabase";
import {
  FeedWithPlaceAndPhotos,
  NewPlace,
  Place,
  PlaceUpdate,
  PlaceWithFeeds,
} from "@/types/database";

export async function getPlaceBySlug(
  slug: string
): Promise<PlaceWithFeeds | null> {
  const { data: place, error: placeError } = await supabase
    .from("places")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (placeError) {
    console.error(placeError);
    return null;
  }

  if (!place) {
    return null;
  }

  const { data: feeds, error: feedsError } = await supabase
    .from("feeds")
    .select(
      "*, place:places!feeds_place_id_fkey(*), photos(*)"
    )
    .eq("place_id", place.place_id)
    .eq("status", "published")
    .order("published_at", {
      ascending: false,
      nullsFirst: false,
    });

  if (feedsError) {
    console.error(feedsError);
    return {
      ...place,
      feeds: [],
    } as PlaceWithFeeds;
  }

  return {
    ...place,
    feeds: (feeds ?? []) as FeedWithPlaceAndPhotos[],
  } as PlaceWithFeeds;
}

export async function getPlaces(): Promise<Place[]> {
  const { data, error } = await supabase
    .from("places")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    console.error(error);
    return [];
  }

  return data ?? [];
}

export async function getPlaceById(
  placeId: string
): Promise<Place | null> {
  const { data, error } = await supabase
    .from("places")
    .select("*")
    .eq("place_id", placeId)
    .maybeSingle();

  if (error) {
    console.error(error);
    return null;
  }

  return data;
}

export async function createPlace(
  input: NewPlace
): Promise<Place> {
  const { data, error } = await supabase
    .from("places")
    .insert(input)
    .select("*")
    .single();

  if (error) {
    throw new Error(`Place create failed: ${error.message}`);
  }

  return data;
}

export async function updatePlace(
  placeId: string,
  input: PlaceUpdate
): Promise<Place> {
  const { data, error } = await supabase
    .from("places")
    .update({
      ...input,
      updated_at: new Date().toISOString(),
    })
    .eq("place_id", placeId)
    .select("*")
    .single();

  if (error) {
    throw new Error(`Place update failed: ${error.message}`);
  }

  return data;
}
