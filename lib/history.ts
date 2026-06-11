import { createFeed } from "./feeds";
import { createPhoto } from "./photos";
import { getSupabaseAdmin } from "./supabase-admin";
import {
  FeedWithPlaceAndPhotos,
  HistoryPhotoWithPhoto,
  HistoryRecord,
  HistoryRecordUpdate,
  HistoryRecordWithPhotos,
  NewHistoryPhoto,
  NewHistoryRecord,
  Photo,
} from "@/types/database";

export async function getHistoryRecords(): Promise<HistoryRecord[]> {
  const { data, error } = await historyDb()
    .from("history_records")
    .select("*")
    .order("created_at", { ascending: false });

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

export async function getHistoryRecordById(
  historyId: string
): Promise<HistoryRecordWithPhotos | null> {
  const { data, error } = await historyDb()
    .from("history_records")
    .select("*, history_photos(*, photo:photos(*))")
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

function normalizeSequence(sequence: number): number {
  return sequence > 0 ? sequence : Number.MAX_SAFE_INTEGER;
}

function historyDb() {
  // The checked-in generated Supabase types are refreshed after migrations
  // are applied; this keeps the new history tables usable locally until then.
  return getSupabaseAdmin() as ReturnType<typeof getSupabaseAdmin> & {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    from: (table: string) => any;
  };
}
