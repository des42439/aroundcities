import { createFeed } from "./feeds";
import { createPhoto } from "./photos";
import { getSupabaseAdmin } from "./supabase-admin";
import {
  FeedWithPlaceAndPhotos,
  HistoryPhotoWithPhoto,
  HistoryRecord,
  HistorySource,
  HistorySourceUpdate,
  HistoryStatus,
  HistoryRecordUpdate,
  HistoryRecordWithPhotos,
  NewHistoryPhoto,
  NewHistoryRecord,
  NewHistorySource,
  Photo,
} from "@/types/database";

export const DAILY_HISTORY_RESEARCH_TARGET = 10;

export type HistoryRecordFilter =
  | "daily"
  | "all"
  | "drafted"
  | "researched"
  | "pending_review"
  | "published"
  | "archived";

export type HistoryStatusCount = {
  status: HistoryStatus;
  count: number;
};

export type HistorySourceImportInput = {
  source_url: string;
  source_title: string | null;
  source_note: string | null;
  sequence: number;
};

const DAILY_HISTORY_TASK_TAG_PREFIX = "daily-task:";
const HISTORY_TIME_ZONE = "Asia/Kuching";

export function getDailyHistoryTaskTag(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: HISTORY_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const partMap = Object.fromEntries(
    parts.map((part) => [part.type, part.value])
  );

  return `${DAILY_HISTORY_TASK_TAG_PREFIX}${partMap.year}${partMap.month}${partMap.day}`;
}

export async function ensureDailyHistoryTasks(
  todayTag = getDailyHistoryTaskTag()
): Promise<void> {
  const db = historyDb();
  const { data: existing, error: existingError } = await db
    .from("history_records")
    .select("history_id")
    .contains("tags", [todayTag])
    .limit(1);

  if (existingError) {
    throw new Error(
      `Daily history task lookup failed: ${existingError.message}`
    );
  }

  if ((existing ?? []).length > 0) {
    return;
  }

  await clearOldDailyHistoryTaskTags(db);

  const { data: draftRecords, error: draftError } = await db
    .from("history_records")
    .select("history_id,tags")
    .eq("status", "drafted")
    .order("created_at", { ascending: true })
    .limit(DAILY_HISTORY_RESEARCH_TARGET);

  if (draftError) {
    throw new Error(
      `Daily history task draft lookup failed: ${draftError.message}`
    );
  }

  for (const record of (draftRecords ?? []) as Pick<
    HistoryRecord,
    "history_id" | "tags"
  >[]) {
    await updateHistoryTags(record.history_id, [
      ...removeDailyHistoryTaskTags(record.tags ?? []),
      todayTag,
    ]);
  }
}

export async function getHistoryRecords(
  filter: HistoryRecordFilter = "all",
  todayTag = getDailyHistoryTaskTag()
): Promise<HistoryRecord[]> {
  let query = historyDb()
    .from("history_records")
    .select("*");

  query = applyHistoryRecordFilter(query, filter, todayTag).order(
    "created_at",
    { ascending: false }
  );

  const { data, error } = await query;

  if (error) {
    console.error(error);
    return [];
  }

  return (data ?? []) as HistoryRecord[];
}

export async function getHistoryRecordCount(): Promise<number> {
  const { count, error } = await historyDb()
    .from("history_records")
    .select("history_id", {
      count: "exact",
      head: true,
    });

  if (error) {
    console.error(error);
    return 0;
  }

  return count ?? 0;
}

export async function getHistoryStatusCounts(): Promise<
  HistoryStatusCount[]
> {
  const statuses: HistoryStatus[] = [
    "drafted",
    "researched",
    "pending_review",
    "published",
    "archived",
  ];

  const counts = await Promise.all(
    statuses.map(async (status) => {
      const { count, error } = await historyDb()
        .from("history_records")
        .select("history_id", {
          count: "exact",
          head: true,
        })
        .eq("status", status);

      if (error) {
        console.error(error);
        return { status, count: 0 };
      }

      return { status, count: count ?? 0 };
    })
  );

  return counts;
}

export async function getHistoryResearchExportRecords(input: {
  filter: HistoryRecordFilter;
  todayTag: string;
}): Promise<HistoryRecord[]> {
  const records: HistoryRecord[] = [];
  const batchSize = 1000;
  let offset = 0;

  while (true) {
    let query = historyDb()
      .from("history_records")
      .select("*");

    query = applyHistoryRecordFilter(
      query,
      input.filter,
      input.todayTag
    )
      .order("created_at", { ascending: true })
      .range(offset, offset + batchSize - 1);

    const { data, error } = await query;

    if (error) {
      throw new Error(`History export query failed: ${error.message}`);
    }

    const batch = (data ?? []) as HistoryRecord[];
    records.push(...batch);

    if (batch.length < batchSize) {
      break;
    }

    offset += batchSize;
  }

  return records;
}

export async function getHistoryRecordById(
  historyId: string
): Promise<HistoryRecordWithPhotos | null> {
  const { data, error } = await historyDb()
    .from("history_records")
    .select("*, history_photos(*, photo:photos(*)), history_sources(*)")
    .eq("history_id", historyId)
    .maybeSingle();

  if (error) {
    console.error(error);
    return null;
  }

  if (!data) {
    return null;
  }

  const record = data as HistoryRecordWithPhotos;
  record.history_photos = getOrderedHistoryPhotos(
    record.history_photos
  );
  record.history_sources = getOrderedHistorySources(
    record.history_sources
  );

  return record;
}

export async function createHistoryRecord(
  input: NewHistoryRecord
): Promise<HistoryRecord> {
  const { data, error } = await historyDb()
    .from("history_records")
    .insert(input)
    .select("*")
    .single();

  if (error) {
    throw new Error(`History record create failed: ${error.message}`);
  }

  return data as HistoryRecord;
}

export async function updateHistoryRecord(
  historyId: string,
  input: HistoryRecordUpdate
): Promise<HistoryRecord> {
  const { data, error } = await historyDb()
    .from("history_records")
    .update({
      ...input,
      updated_at: new Date().toISOString(),
    })
    .eq("history_id", historyId)
    .select("*")
    .single();

  if (error) {
    throw new Error(`History record update failed: ${error.message}`);
  }

  return data as HistoryRecord;
}

export async function deleteHistoryRecord(
  historyId: string
): Promise<void> {
  const { error } = await historyDb()
    .from("history_records")
    .delete()
    .eq("history_id", historyId);

  if (error) {
    throw new Error(`History record delete failed: ${error.message}`);
  }
}

export async function createHistorySource(
  input: NewHistorySource
): Promise<HistorySource> {
  const { data, error } = await historyDb()
    .from("history_sources")
    .insert(input)
    .select("*")
    .single();

  if (error) {
    throw new Error(`History source create failed: ${error.message}`);
  }

  return data as HistorySource;
}

export async function updateHistorySource(
  historySourceId: string,
  input: HistorySourceUpdate
): Promise<HistorySource> {
  const { data, error } = await historyDb()
    .from("history_sources")
    .update({
      ...input,
      updated_at: new Date().toISOString(),
    })
    .eq("history_source_id", historySourceId)
    .select("*")
    .single();

  if (error) {
    throw new Error(`History source update failed: ${error.message}`);
  }

  return data as HistorySource;
}

export async function deleteHistorySource(
  historySourceId: string
): Promise<void> {
  const { error } = await historyDb()
    .from("history_sources")
    .delete()
    .eq("history_source_id", historySourceId);

  if (error) {
    throw new Error(`History source delete failed: ${error.message}`);
  }
}

export async function hasHistorySources(
  historyId: string
): Promise<boolean> {
  const { data, error } = await historyDb()
    .from("history_sources")
    .select("history_source_id")
    .eq("history_id", historyId)
    .limit(1);

  if (error) {
    throw new Error(`History source lookup failed: ${error.message}`);
  }

  return (data ?? []).length > 0;
}

export async function hasReviewedHistorySource(
  historyId: string
): Promise<boolean> {
  const { data, error } = await historyDb()
    .from("history_sources")
    .select("history_source_id")
    .eq("history_id", historyId)
    .eq("source_status", "reviewed")
    .limit(1);

  if (error) {
    throw new Error(
      `Reviewed history source lookup failed: ${error.message}`
    );
  }

  return (data ?? []).length > 0;
}

export async function upsertHistoryResearchSources(input: {
  historyId: string;
  sources: HistorySourceImportInput[];
}): Promise<{
  inserted: number;
  updated: number;
}> {
  let inserted = 0;
  let updated = 0;

  for (const source of input.sources) {
    const { data: existing, error: lookupError } = await historyDb()
      .from("history_sources")
      .select("history_source_id")
      .eq("history_id", input.historyId)
      .eq("source_url", source.source_url)
      .maybeSingle();

    if (lookupError) {
      throw new Error(
        `History source lookup failed: ${lookupError.message}`
      );
    }

    if (existing?.history_source_id) {
      await updateHistorySource(existing.history_source_id, {
        source_title: source.source_title,
        source_note: source.source_note,
        sequence: source.sequence,
      });
      updated += 1;
      continue;
    }

    await createHistorySource({
      history_id: input.historyId,
      source_url: source.source_url,
      source_title: source.source_title,
      source_note: source.source_note,
      source_status: "pending",
      source_screenshot_url: null,
      screenshot_status: "pending",
      screenshot_error: null,
      sequence: source.sequence,
    });
    inserted += 1;
  }

  return { inserted, updated };
}

export async function addHistoryPhotos(
  historyId: string,
  photoIds: string[]
): Promise<void> {
  const uniquePhotoIds = Array.from(new Set(photoIds)).filter(Boolean);

  if (!uniquePhotoIds.length) {
    return;
  }

  const firstSequence = await getNextHistoryPhotoSequence(historyId);
  const rows: NewHistoryPhoto[] = uniquePhotoIds.map((photoId, index) => ({
    history_id: historyId,
    photo_id: photoId,
    sequence: firstSequence + index,
    note: null,
  }));
  const { error } = await historyDb()
    .from("history_photos")
    .upsert(rows, {
      onConflict: "history_id,photo_id",
      ignoreDuplicates: true,
    });

  if (error) {
    throw new Error(`History photo link failed: ${error.message}`);
  }
}

export async function updateHistoryPhoto(
  historyPhotoId: string,
  input: {
    sequence: number;
    note: string | null;
  }
): Promise<void> {
  const { error } = await historyDb()
    .from("history_photos")
    .update(input)
    .eq("history_photo_id", historyPhotoId);

  if (error) {
    throw new Error(`History photo update failed: ${error.message}`);
  }
}

export async function removeHistoryPhoto(
  historyPhotoId: string
): Promise<void> {
  const { error } = await historyDb()
    .from("history_photos")
    .delete()
    .eq("history_photo_id", historyPhotoId);

  if (error) {
    throw new Error(`History photo remove failed: ${error.message}`);
  }
}

export async function getFeedsForHistoryPhotoPicker(): Promise<
  FeedWithPlaceAndPhotos[]
> {
  const { data, error } = await historyDb()
    .from("feeds")
    .select("*, place:places!feeds_place_id_fkey(*), photos(*)")
    .order("updated_at", {
      ascending: false,
      nullsFirst: false,
    })
    .limit(300);

  if (error) {
    console.error(error);
    return [];
  }

  return (data ?? []) as FeedWithPlaceAndPhotos[];
}

export async function createHistoryOnlyPhoto(input: {
  title: string | null;
  description: string | null;
  photoUrl: string;
  sequence: number;
}): Promise<Photo> {
  const feedId = await getOrCreateHistoryPhotoStorageFeedId();

  return await createPhoto({
    feed_id: feedId,
    place_id: null,
    title: input.title,
    description: input.description,
    photo_url: input.photoUrl,
    location_name: null,
    captured_at: null,
    latitude: null,
    longitude: null,
    featured: false,
    sequence: input.sequence,
  });
}

export async function getNextHistoryPhotoSequence(
  historyId: string
): Promise<number> {
  const { data, error } = await historyDb()
    .from("history_photos")
    .select("sequence")
    .eq("history_id", historyId);

  if (error) {
    throw new Error(
      `History photo sequence lookup failed: ${error.message}`
    );
  }

  const sequences = (data ?? []).map((photo: { sequence: number }) =>
    Number(photo.sequence)
  );
  const highestSequence = Math.max(0, ...sequences);
  const existingCount = sequences.length;

  return Math.max(highestSequence, existingCount) + 1;
}

async function getOrCreateHistoryPhotoStorageFeedId(): Promise<string> {
  const title = "History Photo Storage";
  const { data: existing, error: lookupError } = await getSupabaseAdmin()
    .from("feeds")
    .select("feed_id")
    .eq("slug", "history-photo-storage")
    .maybeSingle();

  if (lookupError) {
    throw new Error(
      `History storage feed lookup failed: ${lookupError.message}`
    );
  }

  if (existing?.feed_id) {
    return existing.feed_id;
  }

  const feed = await createFeed({
    feed_type: "local_discovery",
    slug: "history-photo-storage",
    title,
    content:
      "Archived container for photos uploaded directly to history records.",
    description:
      "Archived container for photos uploaded directly to history records.",
    place_id: null,
    source_url: null,
    operating_hours: null,
    tags: ["history", "photo-storage"],
    published_at: null,
    status: "archived",
  });

  return feed.feed_id;
}

function getOrderedHistoryPhotos(
  historyPhotos: HistoryPhotoWithPhoto[]
): HistoryPhotoWithPhoto[] {
  return [...(historyPhotos ?? [])].sort((left, right) => {
    const sequenceDelta =
      normalizeSequence(left.sequence) - normalizeSequence(right.sequence);

    if (sequenceDelta !== 0) {
      return sequenceDelta;
    }

    return left.created_at.localeCompare(right.created_at);
  });
}

function getOrderedHistorySources(
  historySources: HistorySource[]
): HistorySource[] {
  return [...(historySources ?? [])].sort((left, right) => {
    const sequenceDelta =
      normalizeSequence(left.sequence) - normalizeSequence(right.sequence);

    if (sequenceDelta !== 0) {
      return sequenceDelta;
    }

    return left.created_at.localeCompare(right.created_at);
  });
}

function normalizeSequence(sequence: number): number {
  return sequence > 0 ? sequence : Number.MAX_SAFE_INTEGER;
}

function applyHistoryRecordFilter(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  query: any,
  filter: HistoryRecordFilter,
  todayTag: string
) {
  if (filter === "daily") {
    return query.eq("status", "drafted").contains("tags", [todayTag]);
  }

  if (
    filter === "drafted" ||
    filter === "researched" ||
    filter === "pending_review" ||
    filter === "published" ||
    filter === "archived"
  ) {
    const status: HistoryStatus = filter;
    return query.eq("status", status);
  }

  return query;
}

async function clearOldDailyHistoryTaskTags(
  db: ReturnType<typeof historyDb>
) {
  const { data, error } = await db
    .from("history_records")
    .select("history_id,tags");

  if (error) {
    throw new Error(
      `Daily history task cleanup lookup failed: ${error.message}`
    );
  }

  for (const record of (data ?? []) as Pick<
    HistoryRecord,
    "history_id" | "tags"
  >[]) {
    const cleanedTags = removeDailyHistoryTaskTags(record.tags ?? []);

    if (cleanedTags.length !== (record.tags ?? []).length) {
      await updateHistoryTags(record.history_id, cleanedTags);
    }
  }
}

function removeDailyHistoryTaskTags(tags: string[]) {
  return tags.filter(
    (tag) => !tag.startsWith(DAILY_HISTORY_TASK_TAG_PREFIX)
  );
}

async function updateHistoryTags(historyId: string, tags: string[]) {
  const { error } = await historyDb()
    .from("history_records")
    .update({ tags })
    .eq("history_id", historyId);

  if (error) {
    throw new Error(
      `Daily history task tag update failed: ${error.message}`
    );
  }
}

function historyDb() {
  // The checked-in generated Supabase types are refreshed after migrations
  // are applied; this keeps the new history tables usable locally until then.
  return getSupabaseAdmin() as ReturnType<typeof getSupabaseAdmin> & {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    from: (table: string) => any;
  };
}
