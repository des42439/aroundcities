import { supabase } from "./supabase";
import { Photo } from "@/types/database";

export async function getPhotosByFeedId(
  feedId: string
): Promise<Photo[]> {
  const { data, error } = await supabase
    .from("photos")
    .select("*")
    .eq("feed_id", feedId)
    .order("featured", { ascending: false })
    .order("captured_at", {
      ascending: true,
      nullsFirst: false,
    });

  if (error) {
    console.error(error);
    return [];
  }

  return data ?? [];
}
