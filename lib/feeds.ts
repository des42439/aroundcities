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

export async function getFeedsByStatus(
  status: Feed["status"]
): Promise<FeedWithPlaceAndPhotos[]> {
  const { data, error } = await getSupabaseAdmin()
    .from("feeds")
    .select(
      "*, place:places!feeds_place_id_fkey(*), photos(*)"
    )
    .eq("status", status)
    .order(status === "published" ? "published_at" : "updated_at", {
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

export async function getParentFeedCandidates(
  currentFeedId: string
): Promise<Feed[]> {
  const { data, error } = await getSupabaseAdmin()
    .from("feeds")
    .select("*")
    .neq("feed_id", currentFeedId)
    .order("updated_at", {
      ascending: false,
      nullsFirst: false,
    })
    .limit(100);

  if (error) {
    console.error(error);
    return [];
  }

  return (data ?? []) as Feed[];
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

export async function getDiscoveryPublishedFeeds(): Promise<
  FeedWithPlaceAndPhotos[]
> {
  const feeds = await getLatestPublishedFeeds();

  return buildDiscoveryFeedOrder(feeds);
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

const DAY_MS = 24 * 60 * 60 * 1000;

function buildDiscoveryFeedOrder(
  feeds: FeedWithPlaceAndPhotos[]
): FeedWithPlaceAndPhotos[] {
  const latestFeeds = [...feeds].sort(comparePublishedDesc);
  const selectedFeedIds = new Set<string>();
  const orderedFeeds: FeedWithPlaceAndPhotos[] = [];
  let normalPostCount = 0;

  const appendFeed = (feed?: FeedWithPlaceAndPhotos | null) => {
    if (!feed || selectedFeedIds.has(feed.feed_id)) {
      return;
    }

    orderedFeeds.push(feed);
    selectedFeedIds.add(feed.feed_id);
    normalPostCount += 1;

    if (normalPostCount % 10 === 0) {
      appendRediscoveryFeed();
    }
  };

  const appendRediscoveryFeed = () => {
    const olderFeeds = latestFeeds.filter(
      (feed) =>
        !selectedFeedIds.has(feed.feed_id) &&
        isPublishedWithinDays(feed, Number.POSITIVE_INFINITY, 30)
    );

    const olderFeed = pickRandomFeed(olderFeeds);

    if (olderFeed) {
      orderedFeeds.push(olderFeed);
      selectedFeedIds.add(olderFeed.feed_id);
    }
  };

  // Slot 1: pick a recent post from the last 3 days, weighted toward newer
  // posts but still random enough that refreshes can surface different leads.
  const slotOneFeed =
    pickWeightedRecentFeed(getUnselectedFeedsWithinDays(latestFeeds, selectedFeedIds, 3)) ??
    pickWeightedRecentFeed(getUnselectedFeedsWithinDays(latestFeeds, selectedFeedIds, 7)) ??
    latestFeeds.find((feed) => !selectedFeedIds.has(feed.feed_id));
  appendFeed(slotOneFeed);

  // Slots 2-5: fill with random posts from the last 7 days, excluding slot 1.
  // If the recent pool is thin, the later fallback section will continue with
  // latest published posts so small datasets never break the page.
  while (orderedFeeds.length < 5) {
    const weeklyFeed = pickWeightedRecentFeed(
      getUnselectedFeedsWithinDays(latestFeeds, selectedFeedIds, 7)
    );

    if (!weeklyFeed) {
      break;
    }

    appendFeed(weeklyFeed);
  }

  // Slot 6: force the latest not-yet-shown item near the top so
  // freshness remains visible even when slots 1-5 are randomized.
  appendFeed(latestFeeds.find((feed) => !selectedFeedIds.has(feed.feed_id)));

  // Remaining slots: continue the normal reverse-chronological list, skipping
  // anything already selected by the discovery slots. Every 10 normal posts,
  // try to insert one older rediscovery item from more than 30 days ago.
  for (const feed of latestFeeds) {
    appendFeed(feed);
  }

  return orderedFeeds;
}

function getUnselectedFeedsWithinDays(
  feeds: FeedWithPlaceAndPhotos[],
  selectedFeedIds: Set<string>,
  days: number
): FeedWithPlaceAndPhotos[] {
  return feeds.filter(
    (feed) =>
      !selectedFeedIds.has(feed.feed_id) &&
      isPublishedWithinDays(feed, days)
  );
}

function isPublishedWithinDays(
  feed: FeedWithPlaceAndPhotos,
  maxDays: number,
  minDays = 0
): boolean {
  const publishedAt = getPublishedTimestamp(feed);

  if (!publishedAt) {
    return false;
  }

  const ageMs = Date.now() - publishedAt;

  return ageMs >= minDays * DAY_MS && ageMs <= maxDays * DAY_MS;
}

function pickWeightedRecentFeed(
  feeds: FeedWithPlaceAndPhotos[]
): FeedWithPlaceAndPhotos | null {
  if (feeds.length === 0) {
    return null;
  }

  const sortedFeeds = [...feeds].sort(comparePublishedDesc);
  const totalWeight = sortedFeeds.reduce(
    (total, _feed, index) => total + (sortedFeeds.length - index),
    0
  );
  let target = Math.random() * totalWeight;

  for (let index = 0; index < sortedFeeds.length; index += 1) {
    target -= sortedFeeds.length - index;

    if (target <= 0) {
      return sortedFeeds[index];
    }
  }

  return sortedFeeds[sortedFeeds.length - 1] ?? null;
}

function pickRandomFeed(
  feeds: FeedWithPlaceAndPhotos[]
): FeedWithPlaceAndPhotos | null {
  if (feeds.length === 0) {
    return null;
  }

  return feeds[Math.floor(Math.random() * feeds.length)] ?? null;
}

function comparePublishedDesc(
  firstFeed: FeedWithPlaceAndPhotos,
  secondFeed: FeedWithPlaceAndPhotos
): number {
  return getPublishedTimestamp(secondFeed) - getPublishedTimestamp(firstFeed);
}

function getPublishedTimestamp(feed: FeedWithPlaceAndPhotos): number {
  if (!feed.published_at) {
    return 0;
  }

  const timestamp = new Date(feed.published_at).getTime();

  return Number.isNaN(timestamp) ? 0 : timestamp;
}
