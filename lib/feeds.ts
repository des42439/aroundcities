import { getSupabaseAdmin } from "./supabase-admin";
import {
  Feed,
  FeedUpdate,
  FeedWithPlaceAndPhotos,
  NewFeed,
  Photo,
  TodayInKuchingEvent,
  TodayInKuchingSummary,
} from "@/types/database";
import { getOrderedPhotos } from "./format";
import { hydrateFeedsEventData } from "./feed-event-details";

export type DiscoveryFeedItem =
  | {
      kind: "feed";
      id: string;
      feed: FeedWithPlaceAndPhotos;
    }
  | {
      kind: "photo";
      id: string;
      feed: FeedWithPlaceAndPhotos;
      photo: Photo;
    };

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

  return await hydrateFeedsEventData(
    (data ?? []) as FeedWithPlaceAndPhotos[]
  );
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

  return await hydrateFeedsEventData(
    (data ?? []) as FeedWithPlaceAndPhotos[]
  );
}

export async function getFeedCountByStatus(
  status: Feed["status"]
): Promise<number> {
  const { count, error } = await getSupabaseAdmin()
    .from("feeds")
    .select("feed_id", {
      count: "exact",
      head: true,
    })
    .eq("status", status);

  if (error) {
    console.error(error);
    return 0;
  }

  return count ?? 0;
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

  return await hydrateFeedsEventData(
    (data ?? []) as FeedWithPlaceAndPhotos[]
  );
}

export async function getDiscoveryPublishedFeeds(): Promise<
  FeedWithPlaceAndPhotos[]
> {
  const feeds = await getLatestPublishedFeeds();

  return buildDiscoveryFeedOrder(getNonEventFeeds(feeds));
}

export async function getDiscoveryFeedItems(): Promise<
  DiscoveryFeedItem[]
> {
  const feeds = await getLatestPublishedFeeds();
  const orderedFeeds = buildDiscoveryFeedOrder(getNonEventFeeds(feeds));

  return buildDiscoveryItems(orderedFeeds);
}

export async function getKuchingPageData(): Promise<{
  items: DiscoveryFeedItem[];
  todayInKuching: TodayInKuchingSummary;
}> {
  const feeds = await getLatestPublishedFeeds();
  const eventFeeds = feeds.filter(
    (feed) => feed.feed_type === "event_observation"
  );
  const orderedFeeds = buildDiscoveryFeedOrder(getNonEventFeeds(feeds));

  return {
    items: buildDiscoveryItems(orderedFeeds),
    todayInKuching: await buildTodayInKuchingSummary(eventFeeds),
  };
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

  const [feed] = await hydrateFeedsEventData([
    data as FeedWithPlaceAndPhotos,
  ]);

  return feed ?? null;
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

  const [feed] = await hydrateFeedsEventData([
    data as FeedWithPlaceAndPhotos,
  ]);

  return feed ?? null;
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
const TODAY_IN_KUCHING_RANGE_DAYS = 7;
const KUCHING_TIME_ZONE = "Asia/Kuching";

function getNonEventFeeds(
  feeds: FeedWithPlaceAndPhotos[]
): FeedWithPlaceAndPhotos[] {
  return feeds.filter(
    (feed) => feed.feed_type !== "event_observation"
  );
}

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

function buildDiscoveryItems(
  feeds: FeedWithPlaceAndPhotos[]
): DiscoveryFeedItem[] {
  const photoItems = shuffle(
    feeds.flatMap((feed) =>
      getOrderedPhotos(feed.photos)
        .filter((photo) => photo.featured)
        .map((photo) => ({
          kind: "photo" as const,
          id: `photo-${photo.photo_id}`,
          feed,
          photo,
        }))
    )
  );
  const items: DiscoveryFeedItem[] = [];
  let nextPhotoIndex = 0;

  feeds.forEach((feed, feedIndex) => {
    items.push({
      kind: "feed",
      id: `feed-${feed.feed_id}`,
      feed,
    });

    const shouldInsertPhoto =
      photoItems.length > 0 &&
      feedIndex + 1 >= 1 &&
      (feedIndex === 0 || Math.random() > 0.35);

    if (shouldInsertPhoto && nextPhotoIndex < photoItems.length) {
      items.push(photoItems[nextPhotoIndex]);
      nextPhotoIndex += 1;
    }
  });

  while (nextPhotoIndex < photoItems.length) {
    items.push(photoItems[nextPhotoIndex]);
    nextPhotoIndex += 1;
  }

  return items;
}

async function buildTodayInKuchingSummary(
  eventFeeds: FeedWithPlaceAndPhotos[],
  now = new Date()
): Promise<TodayInKuchingSummary> {
  const emptySummary = {
    today: [],
    tomorrow: [],
    comingSoon: [],
  } satisfies TodayInKuchingSummary;

  if (!eventFeeds.length) {
    return emptySummary;
  }

  const feedIds = eventFeeds.map((feed) => feed.feed_id);
  const [sourcesResult, feedPlacesResult] = await Promise.all([
    getSupabaseAdmin()
      .from("sources")
      .select(
        "source_id, section_id, source_title, source_url, sequence, created_at"
      )
      .eq("section_type", "feed")
      .in("section_id", feedIds)
      .not("source_url", "is", null)
      .order("sequence", { ascending: true })
      .order("created_at", { ascending: true }),
    getSupabaseAdmin()
      .from("feed_places")
      .select("feed_id, is_primary, location_note, place:places(*)")
      .in("feed_id", feedIds)
      .order("is_primary", { ascending: false })
      .order("created_at", { ascending: true }),
  ]);

  if (sourcesResult.error) {
    console.error(sourcesResult.error);
  }

  if (feedPlacesResult.error) {
    console.error(feedPlacesResult.error);
  }

  const sourcesByFeedId = new Map<
    string,
    { source_title: string | null; source_url: string | null }
  >();

  for (const source of sourcesResult.data ?? []) {
    if (!sourcesByFeedId.has(source.section_id)) {
      sourcesByFeedId.set(source.section_id, {
        source_title: source.source_title,
        source_url: source.source_url,
      });
    }
  }

  const locationsByFeedId = new Map<string, string>();

  for (const feedPlace of feedPlacesResult.data ?? []) {
    if (locationsByFeedId.has(feedPlace.feed_id)) {
      continue;
    }

    const place = Array.isArray(feedPlace.place)
      ? feedPlace.place[0]
      : feedPlace.place;
    const location = [place?.name, feedPlace.location_note]
      .filter(Boolean)
      .join(" — ");

    if (location) {
      locationsByFeedId.set(feedPlace.feed_id, location);
    }
  }

  const summaryEvents = eventFeeds.flatMap((feed) => {
    const source = sourcesByFeedId.get(feed.feed_id);
    const location =
      locationsByFeedId.get(feed.feed_id) ?? feed.place?.name ?? null;

    return getRelevantEventSchedules(feed.schedules, now).map(
      ({ scheduleDate, startTime, group }, index) => ({
        id: `${feed.feed_id}-${scheduleDate}-${startTime ?? "all-day"}-${index}`,
        feed_id: feed.feed_id,
        title: feed.title,
        slug: feed.slug,
        group,
        schedule_date: scheduleDate,
        start_time: startTime,
        location,
        source_title: source?.source_title ?? null,
        source_url: source?.source_url ?? feed.source_url,
      })
    );
  });

  const uniqueEvents = Array.from(
    new Map(
      summaryEvents.map((event) => [
        `${event.feed_id}-${event.schedule_date}-${event.start_time ?? ""}`,
        event,
      ])
    ).values()
  ).sort(compareSummaryEvents);

  return {
    today: uniqueEvents.filter((event) => event.group === "today"),
    tomorrow: uniqueEvents.filter(
      (event) => event.group === "tomorrow"
    ),
    comingSoon: uniqueEvents.filter(
      (event) => event.group === "comingSoon"
    ),
  };
}

function getRelevantEventSchedules(
  schedules: FeedWithPlaceAndPhotos["schedules"],
  now: Date
): {
  scheduleDate: string;
  startTime: string | null;
  group: TodayInKuchingEvent["group"];
}[] {
  const today = getKuchingDateParts(now);

  return (schedules ?? []).flatMap((schedule) => {
    const occurrenceDate = parseDateParts(schedule.schedule_date);
    const rangeStart = parseDateParts(schedule.start_date);
    const rangeEnd = parseDateParts(schedule.end_date);
    let displayDate = occurrenceDate;

    if (!displayDate && rangeStart && rangeEnd) {
      const startsInDays = daysBetween(today, rangeStart);
      const endsInDays = daysBetween(today, rangeEnd);

      if (startsInDays <= 0 && endsInDays >= 0) {
        displayDate = today;
      } else if (startsInDays > 0) {
        displayDate = rangeStart;
      }
    }

    if (!displayDate) {
      return [];
    }

    const diffDays = daysBetween(today, displayDate);

    if (diffDays < 0 || diffDays > TODAY_IN_KUCHING_RANGE_DAYS) {
      return [];
    }

    return [
      {
        scheduleDate: formatDateParts(displayDate),
        startTime: schedule.start_time,
        group:
          diffDays === 0
            ? "today"
            : diffDays === 1
              ? "tomorrow"
              : "comingSoon",
      },
    ];
  });
}

function compareSummaryEvents(
  left: TodayInKuchingEvent,
  right: TodayInKuchingEvent
) {
  return (
    left.schedule_date.localeCompare(right.schedule_date) ||
    timeToMinutes(left.start_time) - timeToMinutes(right.start_time) ||
    left.title.localeCompare(right.title)
  );
}

function getKuchingDateParts(date: Date) {
  const parts = new Intl.DateTimeFormat("en-MY", {
    timeZone: KUCHING_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  return {
    year: Number(parts.find((part) => part.type === "year")?.value),
    month: Number(parts.find((part) => part.type === "month")?.value),
    day: Number(parts.find((part) => part.type === "day")?.value),
  };
}

function parseDateParts(value?: string | null) {
  if (!value) {
    return null;
  }

  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})/);

  return match
    ? {
        year: Number(match[1]),
        month: Number(match[2]),
        day: Number(match[3]),
      }
    : null;
}

function formatDateParts(date: {
  year: number;
  month: number;
  day: number;
}) {
  return `${date.year}-${String(date.month).padStart(2, "0")}-${String(
    date.day
  ).padStart(2, "0")}`;
}

function daysBetween(
  first: { year: number; month: number; day: number },
  second: { year: number; month: number; day: number }
) {
  return Math.round(
    (Date.UTC(second.year, second.month - 1, second.day) -
      Date.UTC(first.year, first.month - 1, first.day)) /
      DAY_MS
  );
}

function timeToMinutes(value: string | null) {
  if (!value) {
    return Number.MAX_SAFE_INTEGER;
  }

  const [hour = "0", minute = "0"] = value.split(":");

  return Number(hour) * 60 + Number(minute);
}

function shuffle<T>(items: T[]): T[] {
  const shuffledItems = [...items];

  for (let index = shuffledItems.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    const currentItem = shuffledItems[index];

    shuffledItems[index] = shuffledItems[swapIndex];
    shuffledItems[swapIndex] = currentItem;
  }

  return shuffledItems;
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
