import { getSupabaseAdmin } from "./supabase-admin";

export async function incrementFeedClickCount(feedId: string) {
  const { error } = await getSupabaseAdmin().rpc(
    "increment_feed_click_count",
    {
      p_feed_id: feedId,
    }
  );

  if (error) {
    throw new Error(
      `Feed click count update failed: ${error.message}`
    );
  }
}

export async function incrementPhotoClickCount(photoId: string) {
  const { error } = await getSupabaseAdmin().rpc(
    "increment_photo_click_count",
    {
      p_photo_id: photoId,
    }
  );

  if (error) {
    throw new Error(
      `Photo click count update failed: ${error.message}`
    );
  }
}

export function isUuid(value: unknown): value is string {
  return (
    typeof value === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      value
    )
  );
}
