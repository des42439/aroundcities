import { getSupabaseAdmin } from "./supabase-admin";
import {
  FeedSchedule,
  FeedScheduleType,
} from "@/types/database";

export async function getFeedSchedules(
  feedId: string
): Promise<FeedSchedule[]> {
  const { data, error } = await getSupabaseAdmin()
    .from("feed_schedules")
    .select("*")
    .eq("feed_id", feedId)
    .order("schedule_date", {
      ascending: true,
      nullsFirst: false,
    })
    .order("created_at", { ascending: true });

  if (error) {
    console.error(error);
    return [];
  }

  return (data ?? []) as FeedSchedule[];
}

export async function createFeedSchedule(input: {
  feed_id: string;
  schedule_type: FeedScheduleType;
  schedule_date: string;
  start_time: string | null;
  end_time: string | null;
  remarks: string | null;
}): Promise<FeedSchedule> {
  const { data, error } = await getSupabaseAdmin()
    .from("feed_schedules")
    .insert(input)
    .select("*")
    .single();

  if (error) {
    throw new Error(`Feed schedule create failed: ${error.message}`);
  }

  return data as FeedSchedule;
}

export async function deleteFeedSchedule(
  scheduleId: string
): Promise<void> {
  const { error } = await getSupabaseAdmin()
    .from("feed_schedules")
    .delete()
    .eq("schedule_id", scheduleId);

  if (error) {
    throw new Error(`Feed schedule delete failed: ${error.message}`);
  }
}
