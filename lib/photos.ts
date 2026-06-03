import { supabase } from "./supabase";
import {
  NewPhoto,
  Photo,
  PhotoUpdate,
} from "@/types/database";

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

export async function createPhoto(
  input: NewPhoto
): Promise<Photo> {
  const { data, error } = await supabase
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
  const { data, error } = await supabase
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

export async function clearFeaturedPhotos(
  feedId: string
): Promise<void> {
  const { error } = await supabase
    .from("photos")
    .update({
      featured: false,
      updated_at: new Date().toISOString(),
    })
    .eq("feed_id", feedId);

  if (error) {
    throw new Error(
      `Featured photo update failed: ${error.message}`
    );
  }
}
