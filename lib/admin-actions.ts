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
import {
  FeedEventDetailsInput,
  replaceFeedEventDetails,
} from "./feed-event-details";
import { createPlace, updatePlace } from "./places";
import {
  createPhoto,
  deletePhoto,
  updatePhoto,
} from "./photos";
import {
  addHistoryPhotos,
  createHistoryOnlyPhoto,
  createHistoryRecord,
  deleteHistoryRecord,
  getNextHistoryPhotoSequence,
  removeHistoryPhoto,
  updateHistoryPhoto,
  updateHistoryRecord,
} from "./history";
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
  EventEntryType,
  EventRegistrationType,
  FeedOperatingHourScheduleType,
  FeedStatus,
  FeedType,
  HistoryConfidence,
  HistoryStatus,
} from "@/types/database";

type AdminActionState = {
  error?: string | null;
  errorId?: string | null;
};

export type EventImportResult = {
  createdCount: number;
  results: {
    index: number;
    title: string;
    feedId?: string;
    error?: string;
  }[];
};

export type HistoryImportResult = {
  createdCount: number;
};

type EventImportPayload = {
  version?: unknown;
  events?: unknown;
};

const SUPPORTED_EVENT_IMPORT_VERSIONS = [
  "aroundcities_event_import_v1",
  "aroundcities_event_import_v2",
];

type ParsedImportEvent = {
  feed: {
    title: string;
    description: string | null;
  };
  places: {
    name: string;
    location_note: string | null;
  }[];
  schedules: {
    schedule_date: string;
    start_time: string | null;
    end_time: string | null;
    remarks: string | null;
  }[];
  source: {
    source_url: string | null;
    source_channel_name: string | null;
    source_channel_url: string | null;
    source_note: string | null;
  } | null;
  event_details: FeedEventDetailsInput | null;
};

type ParsedHistoryImportRecord = {
  title: string;
  description: string | null;
  event_year: number;
  event_month: number;
  event_day: number;
  place_name: string | null;
  location_note: string | null;
  tags: string[];
  source_url: string | null;
  source_note: string | null;
  source_screenshot_url: string | null;
  confidence: HistoryConfidence;
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

function parsePhotoSequence(value: FormDataEntryValue | null) {
  const text = value?.toString().trim() ?? "";

  if (!text) {
    return 0;
  }

  if (!/^\d+$/.test(text)) {
    throw new Error("Photo order must be a whole number.");
  }

  const sequence = Number(text);

  if (!Number.isSafeInteger(sequence) || sequence < 1) {
    throw new Error("Photo order must be 1 or higher.");
  }

  return sequence;
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

function parseHistoryStatus(
  value: FormDataEntryValue | null
): HistoryStatus {
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

function parseHistoryConfidence(value: unknown): HistoryConfidence {
  if (value === "high" || value === "low") {
    return value;
  }

  return "medium";
}

function parseHistoryImportConfidence(
  value: unknown,
  index: number
): HistoryConfidence {
  if (value === undefined || value === null || value === "") {
    return "medium";
  }

  if (value === "high" || value === "medium" || value === "low") {
    return value;
  }

  throw new Error(
    `Record ${index + 1} confidence must be high, medium, or low.`
  );
}

function parseRequiredInteger(
  formData: FormData,
  key: string
) {
  const value = Number(requiredString(formData, key));

  if (!Number.isInteger(value)) {
    throw new Error(`${key} must be a whole number.`);
  }

  return value;
}

function validateHistoryDateParts(
  eventYear: number,
  eventMonth: number,
  eventDay: number
) {
  if (!Number.isInteger(eventYear)) {
    throw new Error("Event year must be a whole number.");
  }

  if (eventMonth < 1 || eventMonth > 12) {
    throw new Error("Event month must be between 1 and 12.");
  }

  if (eventDay < 1 || eventDay > 31) {
    throw new Error("Event day must be between 1 and 31.");
  }
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

function parseNullableBoolean(
  value: FormDataEntryValue | null
): boolean | null {
  const text = value?.toString();

  if (text === "true") {
    return true;
  }

  if (text === "false") {
    return false;
  }

  return null;
}

function parseEventEntryType(value: unknown): EventEntryType {
  return value === "free" || value === "paid"
    ? value
    : "unknown";
}

function parseEventRegistrationType(
  value: unknown
): EventRegistrationType {
  if (
    value === "free_registration" ||
    value === "registration_required" ||
    value === "walk_in"
  ) {
    return value;
  }

  return "unknown";
}

function parseEventDetailsFromForm(
  formData: FormData
): FeedEventDetailsInput {
  return {
    entry_type: parseEventEntryType(
      formData.get("event_entry_type")?.toString()
    ),
    registration_type: parseEventRegistrationType(
      formData.get("event_registration_type")?.toString()
    ),
    open_to_public: parseNullableBoolean(
      formData.get("event_open_to_public")
    ),
    ticket_required: parseNullableBoolean(
      formData.get("event_ticket_required")
    ),
    lucky_draw: parseNullableBoolean(
      formData.get("event_lucky_draw")
    ),
    dress_code: nullableString(formData.get("event_dress_code")),
    organizer: nullableString(formData.get("event_organizer")),
    event_notes: nullableString(formData.get("event_notes")),
  };
}

function textFromUnknown(value: unknown) {
  return typeof value === "string" && value.trim()
    ? value.trim()
    : null;
}

function objectFromUnknown(value: unknown) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function parseEventDetailsFromObject(
  value: unknown
): FeedEventDetailsInput | null {
  const eventDetails = objectFromUnknown(value);

  if (!eventDetails) {
    return null;
  }

  return {
    entry_type: parseEventEntryType(eventDetails.entry_type),
    registration_type: parseEventRegistrationType(
      eventDetails.registration_type
    ),
    open_to_public:
      typeof eventDetails.open_to_public === "boolean"
        ? eventDetails.open_to_public
        : null,
    ticket_required:
      typeof eventDetails.ticket_required === "boolean"
        ? eventDetails.ticket_required
        : null,
    lucky_draw:
      typeof eventDetails.lucky_draw === "boolean"
        ? eventDetails.lucky_draw
        : null,
    dress_code: textFromUnknown(eventDetails.dress_code),
    organizer: textFromUnknown(eventDetails.organizer),
    event_notes: textFromUnknown(eventDetails.event_notes),
  };
}

function parseHistoryImportJson(
  jsonText: string
): ParsedHistoryImportRecord[] {
  let payload: unknown;

  try {
    payload = JSON.parse(jsonText);
  } catch {
    throw new Error("JSON could not be parsed.");
  }

  const importObject = objectFromUnknown(payload);

  if (!importObject) {
    throw new Error("JSON must be an object.");
  }

  if (importObject.version !== "aroundcities_history_import_v1") {
    throw new Error(
      "Import version must be aroundcities_history_import_v1."
    );
  }

  if (!Array.isArray(importObject.records)) {
    throw new Error("JSON must include a records array.");
  }

  return importObject.records.map((item, index) => {
    const record = objectFromUnknown(item);
    const title = textFromUnknown(record?.title);

    if (!title) {
      throw new Error(`Record ${index + 1} is missing title.`);
    }

    const eventYear = Number(record?.event_year);
    const eventMonth = Number(record?.event_month);
    const eventDay = Number(record?.event_day);

    validateHistoryDateParts(eventYear, eventMonth, eventDay);

    const rawTags = Array.isArray(record?.tags) ? record.tags : [];

    return {
      title,
      description: textFromUnknown(record?.description),
      event_year: eventYear,
      event_month: eventMonth,
      event_day: eventDay,
      place_name: textFromUnknown(record?.place_name),
      location_note: textFromUnknown(record?.location_note),
      tags: rawTags
        .map((tag) =>
          typeof tag === "string" ? tag.trim().toLowerCase() : ""
        )
        .filter(Boolean),
      source_url: textFromUnknown(record?.source_url),
      source_note: textFromUnknown(record?.source_note),
      source_screenshot_url: textFromUnknown(
        record?.source_screenshot_url
      ),
      confidence: parseHistoryImportConfidence(
        record?.confidence,
        index
      ),
    };
  });
}

function normalizeImportedEventTitle(title: string) {
  return title
    .replace(
      /^happening\s+(now|today|tomorrow|this weekend|next weekend|next month)\s*:?\s*/i,
      ""
    )
    .trim();
}

function normalizeFeedTitleForStorage(title: string) {
  return normalizeImportedEventTitle(title);
}

function parseEventImportJson(jsonText: string): ParsedImportEvent[] {
  let payload: EventImportPayload;

  try {
    payload = JSON.parse(jsonText) as EventImportPayload;
  } catch {
    throw new Error("JSON could not be parsed.");
  }

  if (
    !SUPPORTED_EVENT_IMPORT_VERSIONS.includes(
      String(payload.version ?? "")
    )
  ) {
    throw new Error(
      "Import version must be aroundcities_event_import_v1 or aroundcities_event_import_v2."
    );
  }

  if (!Array.isArray(payload.events)) {
    throw new Error("JSON must include an events array.");
  }

  return payload.events.map((item, index) => {
    const event = objectFromUnknown(item);
    const feed = objectFromUnknown(event?.feed);
    const rawTitle = textFromUnknown(feed?.title);
    const title = rawTitle
      ? normalizeImportedEventTitle(rawTitle)
      : null;

    if (!title) {
      throw new Error(`Event ${index + 1} is missing feed.title.`);
    }

    const places = Array.isArray(event?.places)
      ? event.places
          .map((place) => {
            const placeObject = objectFromUnknown(place);
            const name = textFromUnknown(placeObject?.name);

            if (!name) {
              return null;
            }

            return {
              name,
              location_note: textFromUnknown(
                placeObject?.location_note
              ),
            };
          })
          .filter(
            (
              place
            ): place is {
              name: string;
              location_note: string | null;
            } => place !== null
          )
      : [];

    const schedules = Array.isArray(event?.schedules)
      ? event.schedules
          .map((schedule) => {
            const scheduleObject = objectFromUnknown(schedule);
            const scheduleDate = textFromUnknown(
              scheduleObject?.schedule_date
            );

            if (!scheduleDate) {
              return null;
            }

            return {
              schedule_date: scheduleDate,
              start_time: textFromUnknown(
                scheduleObject?.start_time
              ),
              end_time: textFromUnknown(scheduleObject?.end_time),
              remarks: textFromUnknown(scheduleObject?.remarks),
            };
          })
          .filter(
            (
              schedule
            ): schedule is {
              schedule_date: string;
              start_time: string | null;
              end_time: string | null;
              remarks: string | null;
            } => schedule !== null
          )
      : [];

    const sourceObject = objectFromUnknown(event?.source);
    const source = sourceObject
      ? {
          source_url: textFromUnknown(sourceObject.source_url),
          source_channel_name: textFromUnknown(
            sourceObject.source_channel_name
          ),
          source_channel_url: textFromUnknown(
            sourceObject.source_channel_url
          ),
          source_note: textFromUnknown(sourceObject.source_note),
        }
      : null;

    return {
      feed: {
        title,
        description: textFromUnknown(feed?.description),
      },
      places,
      schedules,
      source,
      event_details: parseEventDetailsFromObject(
        event?.event_details
      ),
    };
  });
}

async function findOrCreatePlaceByName(name: string) {
  const supabaseAdmin = getSupabaseAdmin();
  const { data: existingByName, error: nameError } =
    await supabaseAdmin
      .from("places")
      .select("*")
      .eq("name", name)
      .limit(1)
      .maybeSingle();

  if (nameError) {
    throw new Error(`Place lookup failed: ${nameError.message}`);
  }

  if (existingByName) {
    return existingByName;
  }

  const baseSlug = slugify(name);
  const { data: existingBySlug, error: slugError } =
    await supabaseAdmin
      .from("places")
      .select("*")
      .eq("slug", baseSlug)
      .limit(1)
      .maybeSingle();

  if (slugError) {
    throw new Error(`Place slug lookup failed: ${slugError.message}`);
  }

  if (existingBySlug) {
    return existingBySlug;
  }

  return await createPlace({
    name,
    slug: baseSlug,
    description: null,
    latitude: null,
    longitude: null,
  });
}

async function findOrCreateChannelByName(
  name: string,
  channelUrl: string | null
) {
  const supabaseAdmin = getSupabaseAdmin();
  const { data: existingByName, error: nameError } =
    await supabaseAdmin
      .from("channels")
      .select("*")
      .eq("name", name)
      .limit(1)
      .maybeSingle();

  if (nameError) {
    throw new Error(`Channel lookup failed: ${nameError.message}`);
  }

  if (existingByName) {
    return existingByName;
  }

  const normalizedChannelUrl = channelUrl ?? `manual:${slugify(name)}`;

  const { data: existingByUrl, error: urlError } =
    await supabaseAdmin
      .from("channels")
      .select("*")
      .eq("url", normalizedChannelUrl)
      .limit(1)
      .maybeSingle();

  if (urlError) {
    throw new Error(`Channel URL lookup failed: ${urlError.message}`);
  }

  if (existingByUrl) {
    return existingByUrl;
  }

  const { data, error } = await supabaseAdmin
    .from("channels")
    .insert({
      name,
      url: normalizedChannelUrl,
      screenshot_url: null,
      remarks: null,
      last_checked_at: null,
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(`Channel create failed: ${error.message}`);
  }

  return data;
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
    const title = normalizeFeedTitleForStorage(
      requiredString(formData, "title")
    );
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
    const title = normalizeFeedTitleForStorage(
      requiredString(formData, "title")
    );
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
    const title = normalizeFeedTitleForStorage(input.title.trim());

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

export async function importEventFeedsAction(input: {
  jsonText: string;
}): Promise<EventImportResult | AdminActionState> {
  await requireAdmin();

  let events: ParsedImportEvent[];

  try {
    events = parseEventImportJson(input.jsonText);
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "Import JSON is invalid.",
    };
  }

  const results: EventImportResult["results"] = [];

  for (const [index, event] of events.entries()) {
    let feedId: string | null = null;

    try {
      const uniquePlaces = event.places.filter(
        (place, placeIndex, places) =>
          places.findIndex(
            (candidate) => candidate.name === place.name
          ) === placeIndex
      );
      const places = [];

      for (const place of uniquePlaces) {
        places.push({
          place: await findOrCreatePlaceByName(place.name),
          locationNote: place.location_note,
        });
      }

      const feed = await createFeed({
        feed_type: "event_observation",
        slug: `${slugify(event.feed.title)}-${Date.now().toString(
          36
        )}-${index + 1}`,
        title: event.feed.title,
        content: event.feed.description,
        description: event.feed.description,
        place_id: places[0]?.place.place_id ?? null,
        source_url: event.source?.source_url ?? null,
        operating_hours: null,
        tags: [],
        published_at: null,
        status: "draft",
      });

      feedId = feed.feed_id;

      if (places.length) {
        const { error } = await getSupabaseAdmin()
          .from("feed_places")
          .insert(
            places.map(({ place, locationNote }, placeIndex) => ({
              feed_id: feed.feed_id,
              place_id: place.place_id,
              is_primary: placeIndex === 0,
              location_note: locationNote,
            }))
          );

        if (error) {
          throw new Error(
            `Feed place link failed: ${error.message}`
          );
        }
      }

      for (const schedule of event.schedules) {
        await createFeedSchedule({
          feed_id: feed.feed_id,
          schedule_type: "occurrence",
          schedule_date: schedule.schedule_date,
          start_time: schedule.start_time,
          end_time: schedule.end_time,
          remarks: schedule.remarks,
        });
      }

      if (
        event.source?.source_url ||
        event.source?.source_channel_name ||
        event.source?.source_note
      ) {
        const channel = event.source.source_channel_name
            ? await findOrCreateChannelByName(
                event.source.source_channel_name,
                event.source.source_channel_url
              )
            : null;

        await createFeedSource({
          feed_id: feed.feed_id,
          source_url: event.source.source_url,
          channel_id: channel?.channel_id ?? null,
          source_note: event.source.source_note,
        });
      }

      if (event.event_details) {
        await replaceFeedEventDetails(
          feed.feed_id,
          event.event_details
        );
      }

      results.push({
        index,
        title: event.feed.title,
        feedId: feed.feed_id,
      });
    } catch (error) {
      if (feedId) {
        try {
          await deleteFeed(feedId);
        } catch (deleteError) {
          console.error(deleteError);
        }
      }

      const loggedError = await logAdminError("import_event_feed", error, {
        eventIndex: index,
        title: event.feed.title,
        feedId,
      });

      results.push({
        index,
        title: event.feed.title,
        error: `${loggedError.message} (Error ID: ${loggedError.errorId})`,
      });
    }
  }

  revalidatePath("/admin/feeds");
  revalidatePath("/admin/feeds/drafts");
  revalidatePath("/admin/feeds/import-events");

  return {
    createdCount: results.filter((result) => !result.error).length,
    results,
  };
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

export async function createSourceScreenshotUploadTargetAction(input: {
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
    const path = `source-screenshots/${input.feedId}/${filename}`;
    const supabaseAdmin = getSupabaseAdmin();

    const { data, error } = await supabaseAdmin.storage
      .from("photos")
      .createSignedUploadUrl(path);

    if (error) {
      throw new Error(
        `Screenshot upload URL failed: ${error.message}`
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
    return await actionError(
      "create_source_screenshot_upload_target",
      error,
      {
        feedId: input.feedId,
        fileName: input.fileName,
      }
    );
  }
}

export async function createUploadedPhotoRecordAction(input: {
  feedId: string;
  photoUrl: string;
  featured: boolean;
  sequence?: number;
  capturedAt?: string | null;
  latitude?: number | null;
  longitude?: number | null;
}): Promise<AdminActionState> {
  await requireAdmin();

  try {
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
      sequence: input.sequence ?? 0,
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
    const title = normalizeFeedTitleForStorage(
      requiredString(formData, "title")
    );
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

    if (formData.get("event_details_section_present") === "1") {
      await replaceFeedEventDetails(
        feedId,
        parseEventDetailsFromForm(formData)
      );
    }

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

  const supabaseAdmin = getSupabaseAdmin();
  const firstSequence = await getNextPhotoSequence(feedId);

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
      featured: false,
      sequence: firstSequence + index,
    });
  }
}

async function getNextPhotoSequence(feedId: string) {
  const { data, error } = await getSupabaseAdmin()
    .from("photos")
    .select("sequence")
    .eq("feed_id", feedId);

  if (error) {
    throw new Error(
      `Photo sequence lookup failed: ${error.message}`
    );
  }

  const sequences = (data ?? []).map((photo) =>
    Number(photo.sequence)
  );
  const highestSequence = Math.max(0, ...sequences);
  const existingCount = sequences.length;

  return Math.max(highestSequence, existingCount) + 1;
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

    await updatePhoto(photoId, {
      title: nullableString(formData.get("title")),
      description: nullableString(
        formData.get("description")
      ),
      captured_at: parseDateTime(
        formData.get("captured_at")
      ),
      sequence: parsePhotoSequence(formData.get("sequence")),
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

export async function deleteFeedPhotoAction(
  feedId: string,
  photoId: string,
  _state: AdminActionState
) {
  await requireAdmin();
  void _state;

  try {
    await deletePhoto(photoId);

    revalidatePath(`/admin/feeds/${feedId}`);
    revalidatePath("/admin/feeds");
    revalidatePath("/admin/feeds/drafts");
    revalidatePath("/admin/feeds/published");
    revalidatePath("/kch");
  } catch (error) {
    return await actionError("delete_feed_photo", error, {
      feedId,
      photoId,
    });
  }

  redirect(`/admin/feeds/${feedId}`);
}

export async function createHistoryRecordAction(
  _state: AdminActionState,
  formData: FormData
) {
  await requireAdmin();

  let historyId: string | null = null;

  try {
    const eventYear = parseRequiredInteger(formData, "event_year");
    const eventMonth = parseRequiredInteger(formData, "event_month");
    const eventDay = parseRequiredInteger(formData, "event_day");

    validateHistoryDateParts(eventYear, eventMonth, eventDay);

    const record = await createHistoryRecord({
      title: requiredString(formData, "title"),
      description: nullableString(formData.get("description")),
      event_year: eventYear,
      event_month: eventMonth,
      event_day: eventDay,
      status: "draft",
      place_name: nullableString(formData.get("place_name")),
      location_note: nullableString(formData.get("location_note")),
      tags: parseTags(formData.get("tags")),
      source_url: nullableString(formData.get("source_url")),
      source_note: nullableString(formData.get("source_note")),
      source_screenshot_url: nullableString(
        formData.get("source_screenshot_url")
      ),
      confidence: parseHistoryConfidence(
        formData.get("confidence")?.toString()
      ),
    });

    historyId = record.history_id;
    revalidatePath("/admin");
    revalidatePath("/admin/history");
  } catch (error) {
    return await actionError("create_history_record", error);
  }

  redirect(`/admin/history/${historyId}`);
}

export async function updateHistoryRecordAction(
  historyId: string,
  _state: AdminActionState,
  formData: FormData
) {
  await requireAdmin();

  try {
    const eventYear = parseRequiredInteger(formData, "event_year");
    const eventMonth = parseRequiredInteger(formData, "event_month");
    const eventDay = parseRequiredInteger(formData, "event_day");

    validateHistoryDateParts(eventYear, eventMonth, eventDay);

    await updateHistoryRecord(historyId, {
      title: requiredString(formData, "title"),
      description: nullableString(formData.get("description")),
      event_year: eventYear,
      event_month: eventMonth,
      event_day: eventDay,
      status: parseHistoryStatus(formData.get("status")),
      place_name: nullableString(formData.get("place_name")),
      location_note: nullableString(formData.get("location_note")),
      tags: parseTags(formData.get("tags")),
      source_url: nullableString(formData.get("source_url")),
      source_note: nullableString(formData.get("source_note")),
      source_screenshot_url: nullableString(
        formData.get("source_screenshot_url")
      ),
      confidence: parseHistoryConfidence(
        formData.get("confidence")?.toString()
      ),
    });

    revalidatePath("/admin");
    revalidatePath("/admin/history");
    revalidatePath(`/admin/history/${historyId}`);
  } catch (error) {
    return await actionError("update_history_record", error, {
      historyId,
    });
  }

  redirect(`/admin/history/${historyId}`);
}

export async function deleteHistoryRecordAction(
  historyId: string,
  _state: AdminActionState
) {
  await requireAdmin();
  void _state;

  try {
    await deleteHistoryRecord(historyId);

    revalidatePath("/admin");
    revalidatePath("/admin/history");
  } catch (error) {
    return await actionError("delete_history_record", error, {
      historyId,
    });
  }

  redirect("/admin/history");
}

export async function linkExistingHistoryPhotosAction(
  historyId: string,
  _state: AdminActionState,
  formData: FormData
) {
  await requireAdmin();

  try {
    await addHistoryPhotos(
      historyId,
      formData.getAll("photo_ids").map((value) => value.toString())
    );

    revalidatePath(`/admin/history/${historyId}`);
  } catch (error) {
    return await actionError("link_existing_history_photos", error, {
      historyId,
    });
  }

  redirect(`/admin/history/${historyId}`);
}

export async function updateHistoryPhotoAction(
  historyId: string,
  historyPhotoId: string,
  _state: AdminActionState,
  formData: FormData
) {
  await requireAdmin();

  try {
    await updateHistoryPhoto(historyPhotoId, {
      sequence: parsePhotoSequence(formData.get("sequence")),
      note: nullableString(formData.get("note")),
    });

    revalidatePath(`/admin/history/${historyId}`);
  } catch (error) {
    return await actionError("update_history_photo", error, {
      historyId,
      historyPhotoId,
    });
  }

  redirect(`/admin/history/${historyId}`);
}

export async function removeHistoryPhotoAction(
  historyId: string,
  historyPhotoId: string,
  _state: AdminActionState
) {
  await requireAdmin();
  void _state;

  try {
    await removeHistoryPhoto(historyPhotoId);

    revalidatePath(`/admin/history/${historyId}`);
  } catch (error) {
    return await actionError("remove_history_photo", error, {
      historyId,
      historyPhotoId,
    });
  }

  redirect(`/admin/history/${historyId}`);
}

export async function createHistoryPhotoUploadTargetAction(input: {
  historyId: string;
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
    const path = `history/${input.historyId}/${filename}`;
    const supabaseAdmin = getSupabaseAdmin();
    const { data, error } = await supabaseAdmin.storage
      .from("photos")
      .createSignedUploadUrl(path);

    if (error) {
      throw new Error(
        `History photo upload URL failed: ${error.message}`
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
    return await actionError("create_history_photo_upload_target", error, {
      historyId: input.historyId,
      fileName: input.fileName,
    });
  }
}

export async function createUploadedHistoryPhotoAction(input: {
  historyId: string;
  photoUrl: string;
  title?: string | null;
  description?: string | null;
}): Promise<AdminActionState> {
  await requireAdmin();

  try {
    await addUploadedHistoryPhoto(input);

    revalidatePath(`/admin/history/${input.historyId}`);

    return {
      error: null,
    };
  } catch (error) {
    return await actionError("create_uploaded_history_photo", error, {
      historyId: input.historyId,
    });
  }
}

async function addUploadedHistoryPhoto(input: {
  historyId: string;
  photoUrl: string;
  title?: string | null;
  description?: string | null;
}) {
  const sequence = await getNextHistoryPhotoSequence(input.historyId);
  const photo = await createHistoryOnlyPhoto({
    title: input.title ?? null,
    description: input.description ?? null,
    photoUrl: input.photoUrl,
    sequence,
  });

  await addHistoryPhotos(input.historyId, [photo.photo_id]);

  return sequence;
}

export async function importHistoryRecordsAction(input: {
  jsonText: string;
}): Promise<HistoryImportResult | AdminActionState> {
  await requireAdmin();

  let records: ParsedHistoryImportRecord[];

  try {
    records = parseHistoryImportJson(input.jsonText);
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "Import JSON is invalid.",
    };
  }

  try {
    for (const record of records) {
      await createHistoryRecord({
        ...record,
        status: "draft",
      });
    }

    revalidatePath("/admin");
    revalidatePath("/admin/history");
    revalidatePath("/admin/history/import");

    return {
      createdCount: records.length,
    };
  } catch (error) {
    return await actionError("import_history_records", error);
  }
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
