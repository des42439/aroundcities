import { supabase } from "./supabase";
import {
  FeedOperatingHour,
  FeedOperatingHourScheduleType,
} from "@/types/database";

export type FeedOperatingHourInput = {
  schedule_type: FeedOperatingHourScheduleType;
  days_of_week: number[] | null;
  date_start: string | null;
  date_end: string | null;
  time_start: string | null;
  time_end: string | null;
  closed: boolean;
  note: string | null;
  sort_order: number;
};

export async function getFeedOperatingHours(
  feedId: string
): Promise<FeedOperatingHour[]> {
  const { data, error } = await supabase
    .from("feed_operating_hours")
    .select("*")
    .eq("feed_id", feedId)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    console.error(error);
    return [];
  }

  return (data ?? []) as FeedOperatingHour[];
}

export async function replaceFeedOperatingHours(
  feedId: string,
  rows: FeedOperatingHourInput[]
): Promise<void> {
  const { error: deleteError } = await supabase
    .from("feed_operating_hours")
    .delete()
    .eq("feed_id", feedId);

  if (deleteError) {
    throw new Error(
      `Operating hours delete failed: ${deleteError.message}`
    );
  }

  if (!rows.length) {
    return;
  }

  const { error } = await supabase
    .from("feed_operating_hours")
    .insert(
      rows.map((row) => ({
        ...row,
        feed_id: feedId,
      }))
    );

  if (error) {
    throw new Error(
      `Operating hours update failed: ${error.message}`
    );
  }
}
