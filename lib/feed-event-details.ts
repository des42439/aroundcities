import { getSupabaseAdmin } from "./supabase-admin";
import {
  FeedEventDetails,
  FeedWithPlaceAndPhotos,
  NewFeedEventDetails,
} from "@/types/database";

export type FeedEventDetailsInput = Omit<
  NewFeedEventDetails,
  "feed_id"
>;

export async function getFeedEventDetails(
  feedId: string
): Promise<FeedEventDetails | null> {
  const { data, error } = await getSupabaseAdmin()
    .from("feed_event_details")
    .select("*")
    .eq("feed_id", feedId)
    .maybeSingle();

  if (error) {
    console.error(error);
    return null;
  }

  return data as FeedEventDetails | null;
}

export async function replaceFeedEventDetails(
  feedId: string,
  input: FeedEventDetailsInput | null
): Promise<void> {
  const supabaseAdmin = getSupabaseAdmin();

  if (!input || !hasEventDetails(input)) {
    const { error } = await supabaseAdmin
      .from("feed_event_details")
      .delete()
      .eq("feed_id", feedId);

    if (error) {
      throw new Error(
        `Feed event details delete failed: ${error.message}`
      );
    }

    return;
  }

  const { error } = await supabaseAdmin
    .from("feed_event_details")
    .upsert(
      {
        ...input,
        feed_id: feedId,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "feed_id" }
    );

  if (error) {
    throw new Error(
      `Feed event details save failed: ${error.message}`
    );
  }
}

export async function hydrateFeedsEventData<
  T extends FeedWithPlaceAndPhotos,
>(feeds: T[]): Promise<T[]> {
  if (!feeds.length) {
    return feeds;
  }

  const feedIds = feeds.map((feed) => feed.feed_id);
  const [schedulesResult, detailsResult] = await Promise.all([
    getSupabaseAdmin()
      .from("feed_schedules")
      .select("*")
      .in("feed_id", feedIds)
      .order("schedule_date", {
        ascending: true,
        nullsFirst: false,
      })
      .order("created_at", { ascending: true }),
    getSupabaseAdmin()
      .from("feed_event_details")
      .select("*")
      .in("feed_id", feedIds),
  ]);

  if (schedulesResult.error) {
    console.error(schedulesResult.error);
  }

  if (detailsResult.error) {
    console.error(detailsResult.error);
  }

  const schedulesByFeedId = new Map<string, unknown[]>();

  for (const schedule of schedulesResult.data ?? []) {
    const feedId = String(schedule.feed_id);
    const schedules = schedulesByFeedId.get(feedId) ?? [];

    schedules.push(schedule);
    schedulesByFeedId.set(feedId, schedules);
  }

  const detailsByFeedId = new Map(
    (detailsResult.data ?? []).map((details) => [
      details.feed_id,
      details as FeedEventDetails,
    ])
  );

  return feeds.map((feed) => ({
    ...feed,
    schedules: (schedulesByFeedId.get(feed.feed_id) ??
      []) as T["schedules"],
    event_details: detailsByFeedId.get(feed.feed_id) ?? null,
  }));
}

function hasEventDetails(input: FeedEventDetailsInput) {
  return (
    input.entry_type !== "unknown" ||
    input.registration_type !== "unknown" ||
    input.open_to_public !== null ||
    input.ticket_required !== null ||
    input.lucky_draw !== null ||
    Boolean(input.dress_code) ||
    Boolean(input.organizer) ||
    Boolean(input.event_notes)
  );
}
