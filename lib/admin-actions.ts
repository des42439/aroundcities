"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "./admin-auth";
import {
  createFeed,
  deleteFeed,
  updateFeed,
} from "./feeds";
import { replaceFeedPlaces } from "./feed-places";
import { createPlace, updatePlace } from "./places";
import {
  clearFeaturedPhotos,
  createPhoto,
  updatePhoto,
} from "./photos";
import { slugify } from "./slug";
import { supabase } from "./supabase";
import {
  FeedStatus,
  FeedType,
} from "@/types/database";

function nullableString(value: FormDataEntryValue | null) {
  const text = value?.toString().trim() ?? "";

  return text.length ? text : null;
}

function requiredString(
  formData: FormData,
  key: string
) {
  return formData.get(key)?.toString().trim() ?? "";
}

function optionalNumber(value: FormDataEntryValue | null) {
  const text = value?.toString().trim() ?? "";

  if (!text) {
    return null;
  }

  const number = Number(text);

  return Number.isFinite(number) ? number : null;
}

function parseTags(value: FormDataEntryValue | null) {
  const text = value?.toString() ?? "";

  return text
    .split(",")
    .map((tag) => tag.trim().toLowerCase())
    .filter(Boolean);
}

function parseDateTime(value: FormDataEntryValue | null) {
  const text = value?.toString().trim() ?? "";

  if (!text) {
    return null;
  }

  return new Date(text).toISOString();
}

function parseFeedStatus(
  value: FormDataEntryValue | null
): FeedStatus {
  const status = value?.toString();

  if (
    status === "draft" ||
    status === "published" ||
    status === "archived"
  ) {
    return status;
  }

  return "draft";
}

function parseFeedType(
  value: FormDataEntryValue | null
): FeedType {
  const feedType = value?.toString();

  if (
    feedType === "photo_walk" ||
    feedType === "food_visit" ||
    feedType === "event_observation" ||
    feedType === "local_discovery"
  ) {
    return feedType;
  }

  return "local_discovery";
}

function selectedPlaceIds(formData: FormData) {
  return formData
    .getAll("feed_place_ids")
    .map((value) => value.toString())
    .filter(Boolean);
}

function normalizePublishedAt(
  status: FeedStatus,
  value: FormDataEntryValue | null
) {
  const parsed = parseDateTime(value);

  if (parsed) {
    return parsed;
  }

  if (status === "published") {
    return new Date().toISOString();
  }

  return null;
}

export async function createPlaceAction(
  formData: FormData
) {
  await requireAdmin();

  const name = requiredString(formData, "name");
  const slug =
    nullableString(formData.get("slug")) ??
    slugify(name);

  const place = await createPlace({
    name,
    slug,
    description: nullableString(
      formData.get("description")
    ),
    latitude: optionalNumber(formData.get("latitude")),
    longitude: optionalNumber(
      formData.get("longitude")
    ),
  });

  revalidatePath("/admin/places");

  if (place) {
    redirect(`/admin/places/${place.place_id}`);
  }

  redirect("/admin/places");
}

export async function updatePlaceAction(
  placeId: string,
  formData: FormData
) {
  await requireAdmin();

  const name = requiredString(formData, "name");
  const slug =
    nullableString(formData.get("slug")) ??
    slugify(name);

  await updatePlace(placeId, {
    name,
    slug,
    description: nullableString(
      formData.get("description")
    ),
    latitude: optionalNumber(formData.get("latitude")),
    longitude: optionalNumber(
      formData.get("longitude")
    ),
  });

  revalidatePath("/admin/places");
  revalidatePath(`/admin/places/${placeId}`);
  redirect(`/admin/places/${placeId}`);
}

export async function createFeedAction(
  formData: FormData
) {
  await requireAdmin();

  const title = requiredString(formData, "title");
  const status = parseFeedStatus(
    formData.get("status")
  );
  const slug =
    nullableString(formData.get("slug")) ??
    slugify(title);

  const feed = await createFeed({
    feed_type: parseFeedType(
      formData.get("feed_type")
    ),
    slug,
    title,
    content: nullableString(formData.get("content")),
    place_id: nullableString(formData.get("place_id")),
    source_url: nullableString(
      formData.get("source_url")
    ),
    tags: parseTags(formData.get("tags")),
    published_at: normalizePublishedAt(
      status,
      formData.get("published_at")
    ),
    status,
  });

  revalidatePath("/admin/feeds");
  revalidatePath("/kch");

  if (feed) {
    redirect(`/admin/feeds/${feed.feed_id}`);
  }

  redirect("/admin/feeds");
}

export async function createDraftFeedWithPhotosAction(
  formData: FormData
) {
  await requireAdmin();

  const title = requiredString(formData, "title");
  const slug =
    nullableString(formData.get("slug")) ??
    slugify(title);

  const feed = await createFeed({
    feed_type: "local_discovery",
    slug,
    title,
    content: nullableString(formData.get("content")),
    place_id: null,
    source_url: null,
    tags: [],
    published_at: null,
    status: "draft",
  });

  if (!feed) {
    redirect("/admin/feeds");
  }

  await uploadPhotosForFeed(feed.feed_id, formData, {
    featureFirst: true,
    useNewPhotoMetadata: false,
  });

  revalidatePath("/admin/feeds");
  redirect(`/admin/feeds/${feed.feed_id}`);
}

export async function updateFeedAction(
  feedId: string,
  formData: FormData
) {
  await requireAdmin();

  const title = requiredString(formData, "title");
  const status = parseFeedStatus(
    formData.get("status")
  );
  const slug =
    nullableString(formData.get("slug")) ??
    slugify(title);

  await updateFeed(feedId, {
    feed_type: parseFeedType(formData.get("feed_type")),
    slug,
    title,
    content: nullableString(formData.get("content")),
    place_id: nullableString(formData.get("place_id")),
    source_url: nullableString(
      formData.get("source_url")
    ),
    tags: parseTags(formData.get("tags")),
    published_at: normalizePublishedAt(
      status,
      formData.get("published_at")
    ),
    status,
  });

  await replaceFeedPlaces(
    feedId,
    selectedPlaceIds(formData)
  );

  revalidatePath("/admin/feeds");
  revalidatePath(`/admin/feeds/${feedId}`);
  revalidatePath("/kch");
  redirect(`/admin/feeds/${feedId}`);
}

export async function deleteFeedAction(feedId: string) {
  await requireAdmin();

  await deleteFeed(feedId);

  revalidatePath("/admin/feeds");
  revalidatePath("/kch");
  redirect("/admin/feeds");
}

export async function uploadFeedPhotosAction(
  feedId: string,
  formData: FormData
) {
  await requireAdmin();

  await uploadPhotosForFeed(feedId, formData, {
    featureFirst:
      formData.get("feature_first_photo") === "on",
    useNewPhotoMetadata: true,
  });

  revalidatePath(`/admin/feeds/${feedId}`);
  revalidatePath("/kch");
  redirect(`/admin/feeds/${feedId}`);
}

async function uploadPhotosForFeed(
  feedId: string,
  formData: FormData,
  options: {
    featureFirst: boolean;
    useNewPhotoMetadata: boolean;
  }
) {
  const files = formData
    .getAll("photos")
    .filter(
      (item): item is File =>
        item instanceof File && item.size > 0
    );

  if (options.featureFirst && files.length > 0) {
    await clearFeaturedPhotos(feedId);
  }

  for (const [index, file] of files.entries()) {
    const extension =
      file.name.split(".").pop()?.toLowerCase() ??
      "jpg";
    const filename = `${Date.now()}-${index}-${slugify(
      file.name.replace(/\.[^.]+$/, "")
    )}.${extension}`;
    const path = `feeds/${feedId}/${filename}`;

    const { error } = await supabase.storage
      .from("photos")
      .upload(path, file, {
        cacheControl: "31536000",
        upsert: false,
      });

    if (error) {
      console.error(error);
      continue;
    }

    const { data } = supabase.storage
      .from("photos")
      .getPublicUrl(path);

    await createPhoto({
      feed_id: feedId,
      place_id: options.useNewPhotoMetadata
        ? nullableString(formData.get("new_photo_place_id"))
        : null,
      title: options.useNewPhotoMetadata
        ? nullableString(formData.get("new_photo_title"))
        : null,
      description: options.useNewPhotoMetadata
        ? nullableString(
            formData.get("new_photo_description")
          )
        : null,
      photo_url: data.publicUrl,
      location_name: options.useNewPhotoMetadata
        ? nullableString(
            formData.get("new_photo_location_name")
          )
        : null,
      captured_at: options.useNewPhotoMetadata
        ? parseDateTime(
            formData.get("new_photo_captured_at")
          )
        : null,
      featured: options.featureFirst && index === 0,
    });
  }
}

export async function updateFeedPhotoAction(
  feedId: string,
  photoId: string,
  formData: FormData
) {
  await requireAdmin();

  const isFeatured =
    formData.get("featured") === "on";

  if (isFeatured) {
    await clearFeaturedPhotos(feedId);
  }

  await updatePhoto(photoId, {
    title: nullableString(formData.get("title")),
    description: nullableString(
      formData.get("description")
    ),
    location_name: nullableString(
      formData.get("location_name")
    ),
    place_id: nullableString(formData.get("place_id")),
    captured_at: parseDateTime(
      formData.get("captured_at")
    ),
    featured: isFeatured,
  });

  revalidatePath(`/admin/feeds/${feedId}`);
  revalidatePath("/kch");
  redirect(`/admin/feeds/${feedId}`);
}
