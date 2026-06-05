import { getSupabaseAdmin } from "./supabase-admin";
import {
  Channel,
  FeedSource,
  SourceScreenshot,
} from "@/types/database";

export interface FeedSourceWithScreenshots extends FeedSource {
  channel: Channel | null;
  screenshots: SourceScreenshot[];
}

export async function getChannels(): Promise<Channel[]> {
  const { data, error } = await getSupabaseAdmin()
    .from("channels")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    console.error(error);
    return [];
  }

  return data ?? [];
}

export async function getFeedSources(
  feedId: string
): Promise<FeedSourceWithScreenshots[]> {
  const { data, error } = await getSupabaseAdmin()
    .from("feed_sources")
    .select("*, channel:channels(*), screenshots:source_screenshots(*)")
    .eq("feed_id", feedId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error(error);
    return [];
  }

  return (data ?? []) as FeedSourceWithScreenshots[];
}

export async function createFeedSource(input: {
  feed_id: string;
  source_url: string | null;
  channel_id: string | null;
  source_note: string | null;
}): Promise<FeedSource> {
  const { data, error } = await getSupabaseAdmin()
    .from("feed_sources")
    .insert(input)
    .select("*")
    .single();

  if (error) {
    throw new Error(`Feed source create failed: ${error.message}`);
  }

  return data;
}

export async function deleteFeedSource(
  sourceId: string
): Promise<void> {
  const { error } = await getSupabaseAdmin()
    .from("feed_sources")
    .delete()
    .eq("source_id", sourceId);

  if (error) {
    throw new Error(`Feed source delete failed: ${error.message}`);
  }
}

export async function createSourceScreenshot(input: {
  source_id: string;
  screenshot_url: string;
  remarks: string | null;
  sequence: number;
}): Promise<SourceScreenshot> {
  const { data, error } = await getSupabaseAdmin()
    .from("source_screenshots")
    .insert(input)
    .select("*")
    .single();

  if (error) {
    throw new Error(
      `Source screenshot create failed: ${error.message}`
    );
  }

  return data;
}
