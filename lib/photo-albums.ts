import { getOrderedPhotos } from "./format";
import { getSupabaseAdmin } from "./supabase-admin";
import type {
  NewPhotoAlbum,
  Photo,
  PhotoAlbum,
  PhotoAlbumUpdate,
  PhotoAlbumWithPhotos,
  PhotoStatus,
  PhotoUpdate,
} from "@/types/database";

export async function getPhotoAlbums(): Promise<PhotoAlbumWithPhotos[]> {
  const { data, error } = await albumDb()
    .from("photo_albums")
    .select("*, photos(*)")
    .order("updated_at", { ascending: false });

  if (error) {
    console.error(error);
    return [];
  }

  return (data ?? []).map((album: PhotoAlbumWithPhotos) => ({
    ...album,
    photos: getOrderedPhotos(album.photos ?? []),
  }));
}

export async function getPhotoAlbumById(
  albumId: string
): Promise<PhotoAlbumWithPhotos | null> {
  const { data, error } = await albumDb()
    .from("photo_albums")
    .select("*, photos(*)")
    .eq("album_id", albumId)
    .maybeSingle();

  if (error) {
    console.error(error);
    return null;
  }

  if (!data) {
    return null;
  }

  const album = data as PhotoAlbumWithPhotos;

  return {
    ...album,
    photos: getOrderedPhotos(album.photos ?? []),
  };
}

export async function getAlbumPhotoById(
  photoId: string
): Promise<Photo | null> {
  const { data, error } = await albumDb()
    .from("photos")
    .select("*")
    .eq("photo_id", photoId)
    .maybeSingle();

  if (error) {
    console.error(error);
    return null;
  }

  return data as Photo | null;
}

export async function createPhotoAlbum(
  input: NewPhotoAlbum
): Promise<PhotoAlbum> {
  const { data, error } = await albumDb()
    .from("photo_albums")
    .insert(input)
    .select("*")
    .single();

  if (error) {
    throw new Error(`Photo album create failed: ${error.message}`);
  }

  return data as PhotoAlbum;
}

export async function updatePhotoAlbum(
  albumId: string,
  input: PhotoAlbumUpdate
): Promise<PhotoAlbum> {
  const { data, error } = await albumDb()
    .from("photo_albums")
    .update({
      ...input,
      updated_at: new Date().toISOString(),
    })
    .eq("album_id", albumId)
    .select("*")
    .single();

  if (error) {
    throw new Error(`Photo album update failed: ${error.message}`);
  }

  return data as PhotoAlbum;
}

export async function createAlbumPhoto(input: {
  albumId: string;
  photoUrl: string;
  sequence: number;
  capturedAt: string | null;
  latitude: number | null;
  longitude: number | null;
}): Promise<Photo> {
  const { data, error } = await albumDb()
    .from("photos")
    .insert({
      feed_id: null,
      album_id: input.albumId,
      place_id: null,
      title: null,
      description: null,
      photo_url: input.photoUrl,
      location_name: null,
      location_note: null,
      captured_at: input.capturedAt,
      latitude: input.latitude,
      longitude: input.longitude,
      featured: false,
      is_album_cover: false,
      sequence: input.sequence,
      status: "drafted" satisfies PhotoStatus,
      tags: [],
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(`Album photo create failed: ${error.message}`);
  }

  return data as Photo;
}

export async function updateAlbumPhoto(
  photoId: string,
  input: PhotoUpdate
): Promise<Photo> {
  const { data, error } = await albumDb()
    .from("photos")
    .update({
      ...input,
      updated_at: new Date().toISOString(),
    })
    .eq("photo_id", photoId)
    .select("*")
    .single();

  if (error) {
    throw new Error(`Album photo update failed: ${error.message}`);
  }

  return data as Photo;
}

export async function setAlbumCover(input: {
  albumId: string;
  photoId: string;
  isAlbumCover: boolean;
}) {
  if (input.isAlbumCover) {
    const { error: clearError } = await albumDb()
      .from("photos")
      .update({ is_album_cover: false })
      .eq("album_id", input.albumId)
      .neq("photo_id", input.photoId);

    if (clearError) {
      throw new Error(
        `Album cover clear failed: ${clearError.message}`
      );
    }
  }

  await updateAlbumPhoto(input.photoId, {
    is_album_cover: input.isAlbumCover,
  });
}

export async function getPhotoTagSuggestions(): Promise<string[]> {
  const { data, error } = await albumDb()
    .from("photos")
    .select("tags")
    .not("tags", "is", null);

  if (error) {
    console.error(error);
    return COMMON_PHOTO_TAGS;
  }

  const tags = new Set(COMMON_PHOTO_TAGS);

  for (const photo of (data ?? []) as Pick<Photo, "tags">[]) {
    for (const tag of photo.tags ?? []) {
      if (tag.trim()) {
        tags.add(tag.trim().toLowerCase());
      }
    }
  }

  return [...tags].sort();
}

const COMMON_PHOTO_TAGS = [
  "event",
  "featured",
  "history",
  "photo-of-the-day",
  "positive",
];

function albumDb() {
  return getSupabaseAdmin() as unknown as {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    from: (table: string) => any;
  };
}
