import { getSupabaseAdmin } from "./supabase-admin";
import type { Source } from "@/types/database";

function sourceDb() {
  return getSupabaseAdmin() as ReturnType<typeof getSupabaseAdmin> & {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    from: (table: string) => any;
  };
}

export async function getFeedSources(feedId: string): Promise<Source[]> {
  const { data, error } = await sourceDb()
    .from("sources")
    .select("*")
    .eq("section_type", "feed")
    .eq("section_id", feedId)
    .order("sequence", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    console.error(error);
    return [];
  }

  return (data ?? []) as Source[];
}

export async function createFeedSource(input: {
  feed_id: string;
  source_title: string | null;
  source_url: string | null;
  source_note: string | null;
  source_screenshot_url?: string | null;
}): Promise<Source> {
  const { data, error } = await sourceDb()
    .from("sources")
    .insert({
      section_type: "feed",
      section_id: input.feed_id,
      source_title: input.source_title,
      source_url: input.source_url,
      source_note: input.source_note,
      source_screenshot_url: input.source_screenshot_url ?? null,
      screenshot_status: input.source_screenshot_url
        ? "completed"
        : "pending",
      screenshot_error: null,
      review_status: "reviewed",
      sequence: 0,
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(`Feed source create failed: ${error.message}`);
  }

  return data as Source;
}

export async function deleteFeedSource(sourceId: string): Promise<void> {
  const { error } = await sourceDb()
    .from("sources")
    .delete()
    .eq("source_id", sourceId)
    .eq("section_type", "feed");

  if (error) {
    throw new Error(`Feed source delete failed: ${error.message}`);
  }
}
