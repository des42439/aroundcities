import { getSupabaseAdmin } from "./supabase-admin";
import { getOrderedPhotos } from "./format";
import {
  NewPhoto,
  Photo,
  PhotoUpdate,
} from "@/types/database";

export async function getPhotosByFeedId(
  feedId: string
): Promise<Photo[]> {
  const { data, error } = await getSupabaseAdmin()
    .from("photos")
    .select("*")
    .eq("feed_id", feedId)
    .order("sequence", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    console.error(error);
    return [];
  }

  return getOrderedPhotos(data ?? []);
}

export async function createPhoto(
  input: NewPhoto
): Promise<Photo> {
  const { data, error } = await getSupabaseAdmin()
    .from("photos")
    .insert(input)
    .select("*")
    .single();

  if (error) {
    throw new Error(`Photo create failed: ${error.message}`);
  }

  return data;
}

export async function updatePhoto(
  photoId: string,
  input: PhotoUpdate
): Promise<Photo> {
  const { data, error } = await getSupabaseAdmin()
    .from("photos")
    .update({
      ...input,
      updated_at: new Date().toISOString(),
    })
    .eq("photo_id", photoId)
    .select("*")
    .single();

  if (error) {
    throw new Error(`Photo update failed: ${error.message}`);
  }

  return data;
}
