"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { supabase } from "./supabase";

async function savePhoto(
  formData: FormData,
  forceStatus?: string
) {
  const photo_id =
    formData.get("photo_id")?.toString() ?? "";

  const title =
    formData.get("title")?.toString() ?? "";

  const description =
    formData.get("description")?.toString() ?? "";

  const location =
    formData.get("location")?.toString() ?? "";

  const latitude =
    formData.get("latitude")?.toString() || null;

  const longitude =
    formData.get("longitude")?.toString() || null;

  const captured_date =
    formData.get("captured_date")?.toString() ??
    null;

  const captured_by =
    formData.get("captured_by")?.toString() ?? "";

  const status =
    forceStatus ??
    formData.get("status")?.toString() ??
    "";

  const photo_type =
    formData.get("photo_type")?.toString() ?? "";

  await supabase
    .from("photos")
    .update({
      title,
      description,
      location,
      latitude:
        latitude === null
          ? null
          : Number(latitude),
      longitude:
        longitude === null
          ? null
          : Number(longitude),
      captured_date,
      captured_by,
      status,
      photo_type,
      updated_at: new Date().toISOString(),
    })
    .eq("photo_id", photo_id);

  revalidatePath("/admin/photos");
  revalidatePath(`/photo/${photo_id}`);
}

export async function updatePhoto(
  formData: FormData
) {
  await savePhoto(formData);

  redirect("/admin/photos?saved=1");
}

export async function publishPhoto(
  formData: FormData
) {
  await savePhoto(
    formData,
    "active"
  );

  redirect("/admin/photos?saved=1");
}

export async function deletePhoto(
  photoId: string
) {
  await supabase
    .from("photos")
    .delete()
    .eq("photo_id", photoId);

  revalidatePath("/admin/photos");

  redirect("/admin/photos?deleted=1");
}