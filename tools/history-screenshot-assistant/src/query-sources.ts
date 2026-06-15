import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../../../types/supabase.generated";
import type { CliOptions } from "./config";

export type HistorySourceJob = {
  history_source_id: string;
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
    .from("history_sources")
    .select(
      "history_source_id,history_id,source_url,source_title,source_screenshot_url,screenshot_status,history_records!inner(status)"
    )
    .eq("source_status", "reviewed")
    .eq("history_records.status", "researched")
    .order("sequence", { ascending: true })
    .order("created_at", { ascending: true });

  if (!options.force) {
    query = query
      .is("source_screenshot_url", null)
      .in("screenshot_status", ["pending", "failed"]);
  }

  if (options.historyId) {
    query = query.eq("history_id", options.historyId);
  }

  if (options.limit) {
    query = query.limit(options.limit);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`History source query failed: ${error.message}`);
  }

  return (data ?? []).map((source) => ({
    history_source_id: source.history_source_id,
    history_id: source.history_id,
    source_url: source.source_url,
    source_title: source.source_title,
    source_screenshot_url: source.source_screenshot_url,
    screenshot_status: source.screenshot_status,
  }));
}
