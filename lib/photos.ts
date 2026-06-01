import { supabase } from "./supabase";
import { Photo } from "@/types/database";

export async function getPhotos(): Promise<Photo[]> {
  const { data, error } = await supabase
    .from("photos")
    .select("*")
    .order("captured_date", {
      ascending: false,
      nullsFirst: false,
    });

  if (error) {
    console.error(error);
    return [];
  }

  return (data ?? []) as Photo[];
}

export async function getActivePhotos(): Promise<Photo[]> {
  const { data, error } = await supabase
    .from("photos")
    .select("*")
    .eq("status", "active")
    .order("captured_date", {
      ascending: false,
      nullsFirst: false,
    });

  if (error) {
    console.error(error);
    return [];
  }

  return (data ?? []) as Photo[];
}

export async function getPhoto(
  photoId: string
): Promise<Photo | null> {
  const { data, error } = await supabase
    .from("photos")
    .select("*")
    .eq("photo_id", photoId)
    .single();

  if (error) {
    console.error(error);
    return null;
  }

  return data as Photo;
}

export async function getEventPhotos(
  eventId: string
): Promise<Photo[]> {
  const { data, error } = await supabase
    .from("photos")
    .select("*")
    .eq("event_id", eventId)
    .order("captured_date", {
      ascending: false,
      nullsFirst: false,
    });

  if (error) {
    console.error(error);
    return [];
  }

  return (data ?? []) as Photo[];
}

export async function getRandomAtmospherePhoto(): Promise<Photo | null> {
  const { data, error } = await supabase
    .from("photos")
    .select("*")
    .eq("status", "active")
    .eq("photo_type", "photo");

  if (error || !data?.length) {
    return null;
  }

  const randomIndex = Math.floor(
    Math.random() * data.length
  );

  return data[randomIndex] as Photo;
}