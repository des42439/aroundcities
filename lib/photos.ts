import { getSupabaseAdmin } from "./supabase-admin";
import { getOrderedPhotos } from "./format";
import {
  Feed,
  NewPhoto,
  Photo,
  PhotoUpdate,
} from "@/types/database";

export type PhotoWithFeed = Photo & {
  feed: Feed;
};

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

  return getOrderedPhotos(((data ?? []) as unknown as Photo[]).map(normalizePhoto));
}

export async function getPublishedPhotoById(
  photoId: string
): Promise<PhotoWithFeed | null> {
  const { data: photo, error: photoError } = await getSupabaseAdmin()
    .from("photos")
    .select("*")
    .eq("photo_id", photoId)
    .maybeSingle();

  if (photoError) {
    console.error(photoError);
    return null;
  }

  if (!photo) {
    return null;
  }

  const normalizedPhoto = normalizePhoto(photo as unknown as Photo);

  if (!normalizedPhoto.feed_id) {
    return null;
  }

  const { data: feed, error: feedError } = await getSupabaseAdmin()
    .from("feeds")
    .select("*")
    .eq("feed_id", normalizedPhoto.feed_id)
    .eq("status", "published")
    .maybeSingle();

  if (feedError) {
    console.error(feedError);
    return null;
  }

  if (!feed) {
    return null;
  }

  return {
    ...normalizedPhoto,
    feed: feed as Feed,
  };
}

export async function createPhoto(
  input: NewPhoto
): Promise<Photo> {
  const { data, error } = await photoDb()
    .from("photos")
    .insert(input)
    .select("*")
    .single();

  if (error) {
    throw new Error(`Photo create failed: ${error.message}`);
  }

  return normalizePhoto(data as Photo);
}

export async function updatePhoto(
  photoId: string,
  input: PhotoUpdate
): Promise<Photo> {
  const { data, error } = await photoDb()
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

  return normalizePhoto(data as Photo);
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

  return normalizePhoto(data as Photo);
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

function normalizePhoto(photo: Photo): Photo {
  return {
    ...photo,
    album_id: photo.album_id ?? null,
    location_note: photo.location_note ?? null,
    is_album_cover: photo.is_album_cover ?? false,
    status: photo.status ?? "drafted",
    tags: photo.tags ?? [],
  };
}

function photoDb() {
  return getSupabaseAdmin() as unknown as {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    from: (table: string) => any;
  };
}
