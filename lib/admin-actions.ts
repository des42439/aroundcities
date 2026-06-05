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
import {
  createFeedSchedule,
  deleteFeedSchedule,
} from "./feed-schedules";
import {
  createFeedSource,
  createSourceScreenshot,
  deleteFeedSource,
} from "./feed-sources";
import {
  FeedOperatingHourInput,
  replaceFeedOperatingHours,
} from "./feed-operating-hours";
import { createPlace, updatePlace } from "./places";
import {
  clearFeaturedPhotos,
  createPhoto,
  updatePhoto,
} from "./photos";
import { slugify } from "./slug";
import { getSupabaseAdmin } from "./supabase-admin";
import {
  createSource,
  deleteSource,
  markSourceChecked,
  updateSource,
} from "./sources";
import { extractPhotoMetadata } from "./photo-metadata";
import {
  FeedOperatingHourScheduleType,
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
  const placeIds = formData
    .getAll("feed_place_ids")
    .map((value) => value.toString())
    .filter(Boolean);
  const primaryPlaceId = nullableString(
    formData.get("primary_feed_place_id")
  );

  if (primaryPlaceId) {
    placeIds.push(primaryPlaceId);
  }

  return Array.from(new Set(placeIds));
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

function parseScheduleType(
  value: FormDataEntryValue | null
): FeedOperatingHourScheduleType {
  return value?.toString() === "date_range"
    ? "date_range"
    : "weekly";
}

function parseTime(value: FormDataEntryValue | null) {
  const text = value?.toString().trim() ?? "";

  return text || null;
}

function parseDate(value: FormDataEntryValue | null) {
  const text = value?.toString().trim() ?? "";

  return text || null;
}

function parseOperatingHourRows(
  formData: FormData
): FeedOperatingHourInput[] {
  const rowCount = Number(
    formData.get("operating_hour_row_count") ?? 0
  );
  const rows: FeedOperatingHourInput[] = [];

  for (let index = 0; index < rowCount; index += 1) {
    const prefix = `operating_hour_${index}`;
    const scheduleType = parseScheduleType(
      formData.get(`${prefix}_schedule_type`)
    );
    const closed =
      formData.get(`${prefix}_closed`) === "on";
    const note = nullableString(
      formData.get(`${prefix}_note`)
    );
    const timeStart = closed
      ? null
      : parseTime(formData.get(`${prefix}_time_start`));
    const timeEnd = closed
      ? null
      : parseTime(formData.get(`${prefix}_time_end`));

    if (scheduleType === "weekly") {
      const daysOfWeek = formData
        .getAll(`${prefix}_days_of_week`)
        .map((value) => Number(value))
        .filter((value) => Number.isInteger(value));

      if (!daysOfWeek.length) {
        continue;
      }

      if (!closed && (!timeStart || !timeEnd)) {
        continue;
      }

      rows.push({
        schedule_type: scheduleType,
        days_of_week: Array.from(new Set(daysOfWeek)).sort(
          (left, right) => left - right
        ),
        date_start: null,
        date_end: null,
        time_start: timeStart,
        time_end: timeEnd,
        closed,
        note,
        sort_order: rows.length,
      });

      continue;
    }

    const dateStart = parseDate(
      formData.get(`${prefix}_date_start`)
    );
    const dateEnd = parseDate(
      formData.get(`${prefix}_date_end`)
    );

    if (!dateStart || !dateEnd) {
      continue;
    }

    if (!closed && (!timeStart || !timeEnd)) {
      continue;
    }

    rows.push({
      schedule_type: scheduleType,
      days_of_week: null,
      date_start: dateStart,
      date_end: dateEnd,
      time_start: timeStart,
      time_end: timeEnd,
      closed,
      note,
      sort_order: rows.length,
    });
  }

  return rows;
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
      operating_hours: nullableString(
        formData.get("operating_hours")
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
      operating_hours: null,
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
      operating_hours: null,
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
  capturedAt?: string | null;
  latitude?: number | null;
  longitude?: number | null;
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
      captured_at: input.capturedAt ?? null,
      latitude: input.latitude ?? null,
      longitude: input.longitude ?? null,
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
      operating_hours: nullableString(
        formData.get("operating_hours")
      ),
      tags: parseTags(formData.get("tags")),
      published_at: normalizePublishedAt(
        status,
        formData.get("published_at")
      ),
      parent_feed_id: nullableString(
        formData.get("parent_feed_id")
      ),
      status,
    });

    await replaceFeedPlaces(
      feedId,
      selectedPlaceIds(formData),
      {
        primaryPlaceId: nullableString(
          formData.get("primary_feed_place_id")
        ),
        locationNote: nullableString(
          formData.get("feed_place_location_note")
        ),
      }
    );

    revalidatePath("/admin/feeds");
    revalidatePath("/admin/feeds/drafts");
    revalidatePath("/admin/feeds/published");
    revalidatePath(`/admin/feeds/${feedId}`);
    revalidatePath("/kch");
  } catch (error) {
    return await actionError("update_feed", error, {
      feedId,
    });
  }

  redirect(`/admin/feeds/${feedId}`);
}

export async function archiveFeedAction(
  feedId: string,
  _state: AdminActionState
) {
  await requireAdmin();
  void _state;

  try {
    await updateFeed(feedId, {
      status: "archived",
      published_at: null,
    });

    revalidatePath("/admin/feeds");
    revalidatePath("/admin/feeds/published");
    revalidatePath(`/admin/feeds/${feedId}`);
    revalidatePath("/kch");
  } catch (error) {
    return await actionError("archive_feed", error, {
      feedId,
    });
  }

  redirect("/admin/feeds/published");
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
    revalidatePath("/admin/feeds/drafts");
    revalidatePath("/admin/feeds/published");
    revalidatePath("/kch");
  } catch (error) {
    return await actionError("delete_feed", error, {
      feedId,
    });
  }

  redirect("/admin/feeds");
}

export async function createFeedSourceAction(
  feedId: string,
  _state: AdminActionState,
  formData: FormData
) {
  await requireAdmin();

  try {
    const source = await createFeedSource({
      feed_id: feedId,
      source_url: nullableString(formData.get("source_url")),
      channel_id: nullableString(formData.get("channel_id")),
      source_note: nullableString(formData.get("source_note")),
    });

    const screenshotUrl = nullableString(
      formData.get("screenshot_url")
    );

    if (screenshotUrl) {
      await createSourceScreenshot({
        source_id: source.source_id,
        screenshot_url: screenshotUrl,
        remarks: nullableString(
          formData.get("screenshot_remarks")
        ),
        sequence: 0,
      });
    }

    revalidatePath(`/admin/feeds/${feedId}`);
  } catch (error) {
    return await actionError("create_feed_source", error, {
      feedId,
    });
  }

  redirect(`/admin/feeds/${feedId}`);
}

export async function deleteFeedSourceAction(
  feedId: string,
  sourceId: string,
  _state: AdminActionState
) {
  await requireAdmin();
  void _state;

  try {
    await deleteFeedSource(sourceId);
    revalidatePath(`/admin/feeds/${feedId}`);
  } catch (error) {
    return await actionError("delete_feed_source", error, {
      feedId,
      sourceId,
    });
  }

  redirect(`/admin/feeds/${feedId}`);
}

export async function createFeedScheduleAction(
  feedId: string,
  _state: AdminActionState,
  formData: FormData
) {
  await requireAdmin();

  try {
    await createFeedSchedule({
      feed_id: feedId,
      schedule_type: "occurrence",
      schedule_date: requiredString(formData, "schedule_date"),
      start_time: parseTime(formData.get("start_time")),
      end_time: parseTime(formData.get("end_time")),
      remarks: nullableString(formData.get("remarks")),
    });

    revalidatePath(`/admin/feeds/${feedId}`);
    revalidatePath("/kch");
  } catch (error) {
    return await actionError("create_feed_schedule", error, {
      feedId,
    });
  }

  redirect(`/admin/feeds/${feedId}`);
}

export async function deleteFeedScheduleAction(
  feedId: string,
  scheduleId: string,
  _state: AdminActionState
) {
  await requireAdmin();
  void _state;

  try {
    await deleteFeedSchedule(scheduleId);
    revalidatePath(`/admin/feeds/${feedId}`);
    revalidatePath("/kch");
  } catch (error) {
    return await actionError("delete_feed_schedule", error, {
      feedId,
      scheduleId,
    });
  }

  redirect(`/admin/feeds/${feedId}`);
}

export async function replaceFeedOperatingHoursAction(
  feedId: string,
  _state: AdminActionState,
  formData: FormData
) {
  await requireAdmin();

  try {
    await replaceFeedOperatingHours(
      feedId,
      parseOperatingHourRows(formData)
    );

    revalidatePath(`/admin/feeds/${feedId}`);
    revalidatePath("/kch");
  } catch (error) {
    return await actionError(
      "replace_feed_operating_hours",
      error,
      {
        feedId,
      }
    );
  }

  redirect(`/admin/feeds/${feedId}`);
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
    const metadata = await extractPhotoMetadata(file);
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
          ) ?? metadata.capturedAt
        : metadata.capturedAt,
      latitude: metadata.latitude,
      longitude: metadata.longitude,
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

export async function createSourceAction(
  _state: AdminActionState,
  formData: FormData
) {
  await requireAdmin();

  try {
    await createSource({
      name: requiredString(formData, "name"),
      url: requiredString(formData, "url"),
      notes: nullableString(formData.get("notes")),
      last_checked_at: null,
    });

    revalidatePath("/admin/sources");
  } catch (error) {
    return await actionError("create_source", error);
  }

  redirect("/admin/sources");
}

export async function updateSourceAction(
  sourceId: string,
  _state: AdminActionState,
  formData: FormData
) {
  await requireAdmin();

  try {
    await updateSource(sourceId, {
      name: requiredString(formData, "name"),
      url: requiredString(formData, "url"),
      notes: nullableString(formData.get("notes")),
    });

    revalidatePath("/admin/sources");
    revalidatePath(`/admin/sources/${sourceId}`);
  } catch (error) {
    return await actionError("update_source", error, {
      sourceId,
    });
  }

  redirect("/admin/sources");
}

export async function deleteSourceAction(
  sourceId: string,
  _state: AdminActionState
) {
  await requireAdmin();
  void _state;

  try {
    await deleteSource(sourceId);

    revalidatePath("/admin/sources");

    return {
      error: null,
    };
  } catch (error) {
    return await actionError("delete_source", error, {
      sourceId,
    });
  }
}

export async function markSourceCheckedAction(
  sourceId: string,
  _state: AdminActionState
) {
  await requireAdmin();
  void _state;

  try {
    await markSourceChecked(sourceId);

    revalidatePath("/admin/sources");

    return {
      error: null,
    };
  } catch (error) {
    return await actionError("mark_source_checked", error, {
      sourceId,
    });
  }
}
