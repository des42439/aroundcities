import { supabase } from "./supabase";
import {
  NewSource,
  Source,
  SourceUpdate,
} from "@/types/database";

export async function getSources(): Promise<Source[]> {
  const { data, error } = await supabase
    .from("sources")
    .select("*")
    .order("last_checked_at", {
      ascending: true,
      nullsFirst: true,
    })
    .order("created_at", { ascending: true });

  if (error) {
    console.error(error);
    return [];
  }

  return data ?? [];
}

export async function getSourceById(
  sourceId: string
): Promise<Source | null> {
  const { data, error } = await supabase
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
  const { data, error } = await supabase
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
  const { data, error } = await supabase
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
  const { error } = await supabase
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
