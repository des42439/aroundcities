import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../../../types/supabase.generated";

export async function markScreenshotCompleted(input: {
  supabase: SupabaseClient<Database>;
  sourceId: string;
  screenshotUrl: string;
}) {
  const { error } = await input.supabase
    .from("sources")
    .update({
      source_screenshot_url: input.screenshotUrl,
      screenshot_status: "completed",
      screenshot_error: null,
      updated_at: new Date().toISOString(),
    })
    .eq("source_id", input.sourceId)
    .eq("section_type", "history");

  if (error) {
    throw new Error(`Source update failed: ${error.message}`);
  }
}

export async function markScreenshotFailed(input: {
  supabase: SupabaseClient<Database>;
  sourceId: string;
  errorMessage: string;
}) {
  const { error } = await input.supabase
    .from("sources")
    .update({
      screenshot_status: "failed",
      screenshot_error: input.errorMessage.slice(0, 1000),
      updated_at: new Date().toISOString(),
    })
    .eq("source_id", input.sourceId)
    .eq("section_type", "history");

  if (error) {
    throw new Error(`Failure update failed: ${error.message}`);
  }
}

export async function updateHistoryStatusIfReady(input: {
  supabase: SupabaseClient<Database>;
  historyId: string;
}): Promise<boolean> {
  const { data: historyRecord, error: historyError } = await input.supabase
    .from("history_records")
    .select("history_id,status")
    .eq("history_id", input.historyId)
    .maybeSingle();

  if (historyError) {
    throw new Error(`History lookup failed: ${historyError.message}`);
  }

  if (!historyRecord || historyRecord.status !== "researched") {
    return false;
  }

  const { data: reviewedSources, error: sourceError } = await input.supabase
    .from("sources")
    .select("source_id,source_screenshot_url,screenshot_status")
    .eq("section_type", "history")
    .eq("section_id", input.historyId)
    .eq("review_status", "reviewed");

  if (sourceError) {
    throw new Error(
      `Reviewed source lookup failed: ${sourceError.message}`
    );
  }

  const sources = reviewedSources ?? [];

  if (!sources.length) {
    return false;
  }

  const ready = sources.every(
    (source) =>
      Boolean(source.source_screenshot_url) ||
      source.screenshot_status === "completed"
  );

  if (!ready) {
    return false;
  }

  const { error: updateError } = await input.supabase
    .from("history_records")
    .update({
      status: "pending_review",
      updated_at: new Date().toISOString(),
    })
    .eq("history_id", input.historyId)
    .eq("status", "researched");

  if (updateError) {
    throw new Error(
      `History status update failed: ${updateError.message}`
    );
  }

  return true;
}
