"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { logAdminError } from "./admin-error-log";
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
import { getSupabaseAdmin } from "./supabase-admin";
import {
  FeedStatus,
  FeedType,
} from "@/types/database";

type AdminActionState = {
  error?: string | null;
  errorId?: string | null;
};

async function actionError(
  area: string,
  error: unknown,
  context: Record<string, unknown> = {}
): Promise<AdminActionState> {
  const loggedError = await logAdminError(
    area,
    error,
    context
  );

  return {
    error: `${loggedError.message} (Error ID: ${loggedError.errorId})`,
    errorId: loggedError.errorId,
  };
}

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
  _state: AdminActionState,
  formData: FormData
) {
  await requireAdmin();

  let placeId: string | null = null;

  try {
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

    placeId = place.place_id;
    revalidatePath("/admin/places");
  } catch (error) {
    return await actionError("create_place", error);
  }

  redirect(`/admin/places/${placeId}`);
}

export async function createPlaceForFeedAction(
  feedId: string,
  _state: AdminActionState,
  formData: FormData
) {
  await requireAdmin();

  try {
    const name = requiredString(formData, "name");
    const slug =
      nullableString(formData.get("slug")) ??
      slugify(name);

    await createPlace({
      name,
      slug,
      description: nullableString(
        formData.get("description")
      ),
      latitude: null,
      longitude: null,
    });

    revalidatePath(`/admin/feeds/${feedId}`);
  } catch (error) {
    return await actionError("create_place_for_feed", error, {
      feedId,
    });
  }

  redirect(`/admin/feeds/${feedId}`);
}

export async function updatePlaceAction(
  placeId: string,
  _state: AdminActionState,
  formData: FormData
) {
  await requireAdmin();

  try {
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
  } catch (error) {
    return await actionError("update_place", error, {
      placeId,
    });
  }

  redirect(`/admin/places/${placeId}`);
}

export async function createFeedAction(
  _state: AdminActionState,
  formData: FormData
) {
  await requireAdmin();

  let feedId: string | null = null;

  try {
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

    feedId = feed.feed_id;
    revalidatePath("/admin/feeds");
    revalidatePath("/kch");
  } catch (error) {
    return await actionError("create_feed", error);
  }

  redirect(`/admin/feeds/${feedId}`);
}

export async function createDraftFeedWithPhotosAction(
  _state: AdminActionState,
  formData: FormData
) {
  await requireAdmin();

  let feedId: string | null = null;

  try {
    const title = requiredString(formData, "title");
    const slug = `${slugify(title)}-${Date.now().toString(36)}`;

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

    feedId = feed.feed_id;

    await uploadPhotosForFeed(feed.feed_id, formData, {
      featureFirst: true,
      useNewPhotoMetadata: false,
    });

    revalidatePath("/admin/feeds");
  } catch (error) {
    if (feedId) {
      await deleteFeed(feedId);
    }

    return await actionError(
      "create_draft_feed_with_photos",
      error,
      {
        feedId,
      }
    );
  }

  redirect(`/admin/feeds/${feedId}`);
}

export async function createDraftFeedOnlyAction(input: {
  title: string;
  content?: string | null;
}): Promise<
  | {
      feedId: string;
    }
  | AdminActionState
> {
  await requireAdmin();

  try {
    const title = input.title.trim();

    if (!title) {
      throw new Error("Title is required.");
    }

    const slug = `${slugify(title)}-${Date.now().toString(36)}`;

    const feed = await createFeed({
      feed_type: "local_discovery",
      slug,
      title,
      content: input.content?.trim() || null,
      place_id: null,
      source_url: null,
      tags: [],
      published_at: null,
      status: "draft",
    });

    revalidatePath("/admin/feeds");

    return {
      feedId: feed.feed_id,
    };
  } catch (error) {
    return await actionError("create_draft_feed_only", error);
  }
}

export async function createPhotoUploadTargetAction(input: {
  feedId: string;
  fileName: string;
}): Promise<
  | {
      path: string;
      token: string;
      publicUrl: string;
    }
  | AdminActionState
> {
  await requireAdmin();

  try {
    const extension =
      input.fileName.split(".").pop()?.toLowerCase() ?? "jpg";
    const filename = `${Date.now()}-${slugify(
      input.fileName.replace(/\.[^.]+$/, "")
    )}.${extension}`;
    const path = `feeds/${input.feedId}/${filename}`;
    const supabaseAdmin = getSupabaseAdmin();

    const { data, error } = await supabaseAdmin.storage
      .from("photos")
      .createSignedUploadUrl(path);

    if (error) {
      throw new Error(
        `Photo upload URL failed: ${error.message}`
      );
    }

    const { data: publicUrlData } = supabaseAdmin.storage
      .from("photos")
      .getPublicUrl(path);

    return {
      path,
      token: data.token,
      publicUrl: publicUrlData.publicUrl,
    };
  } catch (error) {
    return await actionError("create_photo_upload_target", error, {
      feedId: input.feedId,
      fileName: input.fileName,
    });
  }
}

export async function createUploadedPhotoRecordAction(input: {
  feedId: string;
  photoUrl: string;
  featured: boolean;
}): Promise<AdminActionState> {
  await requireAdmin();

  try {
    if (input.featured) {
      await clearFeaturedPhotos(input.feedId);
    }

    await createPhoto({
      feed_id: input.feedId,
      place_id: null,
      title: null,
      description: null,
      photo_url: input.photoUrl,
      location_name: null,
      captured_at: null,
      featured: input.featured,
    });

    revalidatePath(`/admin/feeds/${input.feedId}`);
    revalidatePath("/admin/feeds");

    return {
      error: null,
    };
  } catch (error) {
    return await actionError("create_uploaded_photo_record", error, {
      feedId: input.feedId,
    });
  }
}

export async function updateFeedAction(
  feedId: string,
  _state: AdminActionState,
  formData: FormData
) {
  await requireAdmin();

  try {
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
  } catch (error) {
    return await actionError("update_feed", error, {
      feedId,
    });
  }

  redirect(`/admin/feeds/${feedId}`);
}

export async function deleteFeedAction(
  feedId: string,
  _state: AdminActionState
) {
  await requireAdmin();
  void _state;

  try {
    await deleteFeed(feedId);

    revalidatePath("/admin/feeds");
    revalidatePath("/kch");
  } catch (error) {
    return await actionError("delete_feed", error, {
      feedId,
    });
  }

  redirect("/admin/feeds");
}

export async function uploadFeedPhotosAction(
  feedId: string,
  _state: AdminActionState,
  formData: FormData
) {
  await requireAdmin();

  try {
    await uploadPhotosForFeed(feedId, formData, {
      featureFirst:
        formData.get("feature_first_photo") === "on",
      useNewPhotoMetadata: true,
    });

    revalidatePath(`/admin/feeds/${feedId}`);
    revalidatePath("/kch");
  } catch (error) {
    return await actionError("upload_feed_photos", error, {
      feedId,
    });
  }

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

  if (files.length === 0) {
    return;
  }

  if (options.featureFirst) {
    await clearFeaturedPhotos(feedId);
  }

  const supabaseAdmin = getSupabaseAdmin();

  for (const [index, file] of files.entries()) {
    const extension =
      file.name.split(".").pop()?.toLowerCase() ??
      "jpg";
    const filename = `${Date.now()}-${index}-${slugify(
      file.name.replace(/\.[^.]+$/, "")
    )}.${extension}`;
    const path = `feeds/${feedId}/${filename}`;

    const { error } = await supabaseAdmin.storage
      .from("photos")
      .upload(path, file, {
        cacheControl: "31536000",
        upsert: false,
      });

    if (error) {
      throw new Error(
        `Photo upload failed: ${error.message}`
      );
    }

    const { data } = supabaseAdmin.storage
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
  _state: AdminActionState,
  formData: FormData
) {
  await requireAdmin();

  try {
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
  } catch (error) {
    return await actionError("update_feed_photo", error, {
      feedId,
      photoId,
    });
  }

  redirect(`/admin/feeds/${feedId}`);
}
