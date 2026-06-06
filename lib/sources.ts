import { getSupabaseAdmin } from "./supabase-admin";
import {
  NewSource,
  Source,
  SourceUpdate,
} from "@/types/database";

export type SourceListView = "pending" | "all";

const PENDING_SOURCE_DAYS = 3;
const DAY_MS = 24 * 60 * 60 * 1000;

export async function getSources(
  view: SourceListView = "pending"
): Promise<Source[]> {
  const query = getSupabaseAdmin()
    .from("sources")
    .select("*")
    .order("last_checked_at", {
      ascending: true,
      nullsFirst: true,
    })
    .order("created_at", { ascending: true });

  if (view === "pending") {
    query.or(
      `last_checked_at.is.null,last_checked_at.lt.${getPendingSourceCutoff()}`
    );
  }

  const { data, error } = await query;

  if (error) {
    console.error(error);
    return [];
  }

  return data ?? [];
}

function getPendingSourceCutoff() {
  return new Date(
    Date.now() - PENDING_SOURCE_DAYS * DAY_MS
  ).toISOString();
}

export async function getSourceCount(): Promise<number> {
  const { count, error } = await getSupabaseAdmin()
    .from("sources")
    .select("source_id", {
      count: "exact",
      head: true,
    });

  if (error) {
    console.error(error);
    return 0;
  }

  return count ?? 0;
}

export async function getSourceById(
  sourceId: string
): Promise<Source | null> {
  const { data, error } = await getSupabaseAdmin()
    .from("sources")
    .select("*")
    .eq("source_id", sourceId)
    .maybeSingle();

  if (error) {
    console.error(error);
    return null;
  }

  return data;
}

export async function createSource(
  input: NewSource
): Promise<Source> {
  const { data, error } = await getSupabaseAdmin()
    .from("sources")
    .insert(input)
    .select("*")
    .single();

  if (error) {
    throw new Error(
      `Source create failed: ${error.message}`
    );
  }

  return data;
}

export async function updateSource(
  sourceId: string,
  input: SourceUpdate
): Promise<Source> {
  const { data, error } = await getSupabaseAdmin()
    .from("sources")
    .update({
      ...input,
      updated_at: new Date().toISOString(),
    })
    .eq("source_id", sourceId)
    .select("*")
    .single();

  if (error) {
    throw new Error(
      `Source update failed: ${error.message}`
    );
  }

  return data;
}

export async function deleteSource(
  sourceId: string
): Promise<void> {
  const { error } = await getSupabaseAdmin()
    .from("sources")
    .delete()
    .eq("source_id", sourceId);

  if (error) {
    throw new Error(
      `Source delete failed: ${error.message}`
    );
  }
}

export async function markSourceChecked(
  sourceId: string
): Promise<Source> {
  return await updateSource(sourceId, {
    last_checked_at: new Date().toISOString(),
  });
}
