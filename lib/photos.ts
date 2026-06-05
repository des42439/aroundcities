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

export async function deletePhoto(
  photoId: string
): Promise<Photo> {
  const { data, error } = await getSupabaseAdmin()
    .from("photos")
    .delete()
    .eq("photo_id", photoId)
    .select("*")
    .single();

  if (error) {
    throw new Error(`Photo delete failed: ${error.message}`);
  }

  await deletePhotoStorageObject(data.photo_url);

  return data;
}

async function deletePhotoStorageObject(photoUrl: string) {
  const storagePath = getPhotoStoragePath(photoUrl);

  if (!storagePath) {
    return;
  }

  const { error } = await getSupabaseAdmin().storage
    .from("photos")
    .remove([storagePath]);

  if (error) {
    console.error("Photo storage delete failed", error);
  }
}

function getPhotoStoragePath(photoUrl: string) {
  const marker = "/storage/v1/object/public/photos/";
  const markerIndex = photoUrl.indexOf(marker);

  if (markerIndex === -1) {
    return null;
  }

  return decodeURIComponent(
    photoUrl.slice(markerIndex + marker.length)
  );
}
