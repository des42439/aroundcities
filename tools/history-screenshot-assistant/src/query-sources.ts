import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../../../types/supabase.generated";
import type { CliOptions } from "./config";

export type HistorySourceJob = {
  source_id: string;
  history_id: string;
  source_url: string;
  source_title: string | null;
  source_screenshot_url: string | null;
  screenshot_status: string;
};

export async function querySources(
  supabase: SupabaseClient<Database>,
  options: CliOptions
): Promise<HistorySourceJob[]> {
  let query = supabase
    .from("sources")
    .select(
      "source_id,section_id,source_url,source_title,source_screenshot_url,screenshot_status"
    )
    .eq("section_type", "history")
    .eq("review_status", "reviewed")
    .not("source_url", "is", null)
    .order("sequence", { ascending: true })
    .order("created_at", { ascending: true });

  if (!options.force) {
    query = query
      .is("source_screenshot_url", null)
      .in("screenshot_status", ["pending", "failed"]);
  }

  if (options.historyId) {
    query = query.eq("section_id", options.historyId);
  }

  if (options.limit) {
    query = query.limit(options.limit);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`History source query failed: ${error.message}`);
  }

  const candidates = data ?? [];
  const historyIds = [...new Set(candidates.map((source) => source.section_id))];
  const { data: researched, error: historyError } = historyIds.length
    ? await supabase
        .from("history_records")
        .select("history_id")
        .in("history_id", historyIds)
        .eq("status", "researched")
    : { data: [], error: null };

  if (historyError) {
    throw new Error(`History lookup failed: ${historyError.message}`);
  }

  const researchedIds = new Set(
    (researched ?? []).map((record) => record.history_id)
  );

  return candidates.filter((source) => researchedIds.has(source.section_id)).map((source) => ({
    source_id: source.source_id,
    history_id: source.section_id,
    source_url: source.source_url as string,
    source_title: source.source_title,
    source_screenshot_url: source.source_screenshot_url,
    screenshot_status: source.screenshot_status,
  }));
}
