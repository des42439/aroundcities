import { getSupabaseAdmin } from "./supabase-admin";
import { FeedPlaceWithPlace } from "@/types/database";

export async function getFeedPlaces(
  feedId: string
): Promise<FeedPlaceWithPlace[]> {
  const { data, error } = await getSupabaseAdmin()
    .from("feed_places")
    .select("*, place:places(*)")
    .eq("feed_id", feedId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error(error);
    return [];
  }

  return (data ?? []) as FeedPlaceWithPlace[];
}

export async function replaceFeedPlaces(
  feedId: string,
  placeIds: string[],
  options: {
    primaryPlaceId?: string | null;
    locationNote?: string | null;
  } = {}
): Promise<void> {
  const { error: deleteError } = await getSupabaseAdmin()
    .from("feed_places")
    .delete()
    .eq("feed_id", feedId);

  if (deleteError) {
    console.error(deleteError);
    return;
  }

  const rows = Array.from(new Set(placeIds))
    .filter(Boolean)
    .map((placeId) => ({
      feed_id: feedId,
      place_id: placeId,
      is_primary: options.primaryPlaceId === placeId,
      location_note: options.locationNote,
    }));

  if (!rows.length) {
    return;
  }

  const { error } = await getSupabaseAdmin()
    .from("feed_places")
    .insert(rows);

  if (error) {
    console.error(error);
  }
}
