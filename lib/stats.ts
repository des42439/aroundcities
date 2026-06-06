import { getSupabaseAdmin } from "./supabase-admin";
import { Feed, Photo } from "@/types/database";

export type FeedClickStat = Pick<
  Feed,
  | "feed_id"
  | "title"
  | "slug"
  | "status"
  | "click_count"
  | "published_at"
  | "updated_at"
>;

export type PhotoClickStat = Pick<
  Photo,
  | "photo_id"
  | "feed_id"
  | "title"
  | "description"
  | "photo_url"
  | "click_count"
  | "captured_at"
  | "created_at"
> & {
  feed: Pick<Feed, "feed_id" | "title" | "slug" | "status"> | null;
};

export async function getClickStats(): Promise<{
  feedStats: FeedClickStat[];
  photoStats: PhotoClickStat[];
  totalFeedClicks: number;
  totalPhotoClicks: number;
}> {
  const [feedStats, photoStats] = await Promise.all([
    getFeedClickStats(),
    getPhotoClickStats(),
  ]);

  return {
    feedStats,
    photoStats,
    totalFeedClicks: feedStats.reduce(
      (total, feed) => total + feed.click_count,
      0
    ),
    totalPhotoClicks: photoStats.reduce(
      (total, photo) => total + photo.click_count,
      0
    ),
  };
}

async function getFeedClickStats(): Promise<FeedClickStat[]> {
  const { data, error } = await getSupabaseAdmin()
    .from("feeds")
    .select(
      "feed_id,title,slug,status,click_count,published_at,updated_at"
    )
    .order("click_count", { ascending: false })
    .order("updated_at", { ascending: false })
    .limit(100);

  if (error) {
    console.error(error);
    return [];
  }

  return (data ?? []) as FeedClickStat[];
}

async function getPhotoClickStats(): Promise<PhotoClickStat[]> {
  const { data: photos, error } = await getSupabaseAdmin()
    .from("photos")
    .select(
      "photo_id,feed_id,title,description,photo_url,click_count,captured_at,created_at"
    )
    .order("click_count", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    console.error(error);
    return [];
  }

  const photoRows = (photos ?? []) as Pick<
    PhotoClickStat,
    | "photo_id"
    | "feed_id"
    | "title"
    | "description"
    | "photo_url"
    | "click_count"
    | "captured_at"
    | "created_at"
  >[];
  const feedIds = [
    ...new Set(photoRows.map((photo) => photo.feed_id)),
  ];

  if (!feedIds.length) {
    return [];
  }

  const { data: feeds, error: feedError } =
    await getSupabaseAdmin()
      .from("feeds")
      .select("feed_id,title,slug,status")
      .in("feed_id", feedIds);

  if (feedError) {
    console.error(feedError);
  }

  const feedsById = new Map(
    ((feeds ?? []) as Pick<
      Feed,
      "feed_id" | "title" | "slug" | "status"
    >[]).map((feed) => [feed.feed_id, feed])
  );

  return photoRows.map((photo) => ({
    ...photo,
    feed: feedsById.get(photo.feed_id) ?? null,
  }));
}
