"use client";

import Link from "next/link";
import { useState } from "react";
import {
  primaryButtonClassName,
  secondaryButtonClassName,
  textareaClassName,
} from "./AdminForm";
import {
  EventImportResult,
  importEventFeedsAction,
} from "@/lib/admin-actions";

type PreviewEvent = {
  title: string;
  description: string;
  places: string[];
  schedules: string[];
  sourceChannel: string;
  sourceUrl: string;
  sourceNote: string;
  eventDetails: string[];
  confidence: string;
  missingInfo: string[];
};

type SaveResult = EventImportResult | null;

const SUPPORTED_EVENT_IMPORT_VERSIONS = [
  "aroundcities_event_import_v1",
  "aroundcities_event_import_v2",
];

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function object(value: unknown) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function normalizeImportedEventTitle(title: string) {
  return title
    .replace(
      /^happening\s+(now|today|tomorrow|this weekend|next weekend|next month)\s*:?\s*/i,
      ""
    )
    .trim();
}

function eventDetailsPreview(value: unknown) {
  const details = object(value);

  if (!details) {
    return [];
  }

  return [
    text(details.entry_type)
      ? `Entry: ${text(details.entry_type)}`
      : "",
    text(details.registration_type)
      ? `Registration: ${text(details.registration_type)}`
      : "",
    typeof details.open_to_public === "boolean"
      ? `Open to public: ${details.open_to_public ? "yes" : "no"}`
      : "",
    typeof details.ticket_required === "boolean"
      ? `Ticket required: ${details.ticket_required ? "yes" : "no"}`
      : "",
    typeof details.lucky_draw === "boolean"
      ? `Lucky draw: ${details.lucky_draw ? "yes" : "no"}`
      : "",
    text(details.dress_code)
      ? `Dress code: ${text(details.dress_code)}`
      : "",
    text(details.organizer)
      ? `Organizer: ${text(details.organizer)}`
      : "",
    text(details.event_notes)
      ? `Notes: ${text(details.event_notes)}`
      : "",
  ].filter(Boolean);
}

function parsePreview(jsonText: string): PreviewEvent[] {
  let payload: unknown;

  try {
    payload = JSON.parse(jsonText);
  } catch {
    throw new Error("JSON could not be parsed.");
  }

  const importObject = object(payload);

  if (
    !SUPPORTED_EVENT_IMPORT_VERSIONS.includes(
      String(importObject?.version ?? "")
    )
  ) {
    throw new Error(
      "Import version must be aroundcities_event_import_v1 or aroundcities_event_import_v2."
    );
  }

  if (!importObject) {
    throw new Error("JSON must be an object.");
  }

  if (!Array.isArray(importObject.events)) {
    throw new Error("JSON must include an events array.");
  }

  return importObject.events.map((item, index) => {
    const event = object(item);
    const feed = object(event?.feed);
    const title = normalizeImportedEventTitle(text(feed?.title));

    if (!title) {
      throw new Error(`Event ${index + 1} is missing feed.title.`);
    }

    const places = Array.isArray(event?.places)
      ? event.places
          .map((place) => {
            const placeObject = object(place);
            const name = text(placeObject?.name);
            const locationNote = text(placeObject?.location_note);

            if (!name && !locationNote) {
              return "";
            }

            return locationNote ? `${name} (${locationNote})` : name;
          })
          .filter(Boolean)
      : [];

    const schedules = Array.isArray(event?.schedules)
      ? event.schedules
          .map((schedule) => {
            const scheduleObject = object(schedule);
            const date = text(scheduleObject?.schedule_date);
            const startTime = text(scheduleObject?.start_time);
            const endTime = text(scheduleObject?.end_time);
            const remarks = text(scheduleObject?.remarks);
            const time =
              startTime || endTime
                ? [startTime || "?", endTime || "?"].join(" - ")
                : "";

            return [date, time, remarks].filter(Boolean).join(" | ");
          })
          .filter(Boolean)
      : [];

    const source = object(event?.source);
    const adminNotes = object(event?.admin_notes);
    const missingInfo = Array.isArray(adminNotes?.missing_info)
      ? adminNotes.missing_info
          .map((value) => text(value))
          .filter(Boolean)
      : [];

    return {
      title,
      description: text(feed?.description),
      places,
      schedules,
      sourceChannel: text(source?.source_channel_name),
      sourceUrl: text(source?.source_url),
      sourceNote: text(source?.source_note),
      eventDetails: eventDetailsPreview(event?.event_details),
      confidence: text(adminNotes?.confidence),
      missingInfo,
    };
  });
}

function serverError(result: unknown) {
  if (
    result &&
    typeof result === "object" &&
    "error" in result &&
    typeof result.error === "string"
  ) {
    return result.error;
  }

  return null;
}

export default function EventImportForm() {
  const [jsonText, setJsonText] = useState("");
  const [preview, setPreview] = useState<PreviewEvent[] | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [saveResult, setSaveResult] = useState<SaveResult>(null);

  function handlePreview() {
    setSaveResult(null);

    try {
      const nextPreview = parsePreview(jsonText);
      setPreview(nextPreview);
      setError(null);
    } catch (previewError) {
      setPreview(null);
      setError(
        previewError instanceof Error
          ? previewError.message
          : "Import JSON is invalid."
      );
    }
  }

  async function handleSave() {
    if (!preview) {
      return;
    }

    setPending(true);
    setError(null);
    setSaveResult(null);

    try {
      const result = await importEventFeedsAction({ jsonText });
      const actionError = serverError(result);

      if (actionError) {
        setError(actionError);
        return;
      }

      setSaveResult(result as EventImportResult);
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Events could not be saved."
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-6">
      <Link
        href="/admin/feeds/new"
        className="text-sm text-neutral-400 underline underline-offset-4 hover:text-neutral-100"
      >
        Back to New Feed
      </Link>

      <textarea
        value={jsonText}
        onChange={(event) => {
          setJsonText(event.target.value);
          setPreview(null);
          setSaveResult(null);
          setError(null);
        }}
        placeholder='{"version":"aroundcities_event_import_v2","events":[]}'
        className={`${textareaClassName} min-h-80 font-mono text-sm`}
      />

      {error ? (
        <div className="rounded-md border border-red-950 bg-red-950/30 px-3 py-2 text-sm text-red-100">
          {error}
        </div>
      ) : null}

      {saveResult ? (
        <div className="space-y-3 rounded-md border border-emerald-950 bg-emerald-950/30 px-3 py-3 text-sm text-emerald-100">
          <p>
            Created {saveResult.createdCount} draft feed
            {saveResult.createdCount === 1 ? "" : "s"}.
          </p>
          <Link
            href="/admin/feeds/drafts"
            className="inline-block underline underline-offset-4"
          >
            View Drafted Feeds
          </Link>
        </div>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={handlePreview}
          disabled={pending || !jsonText.trim()}
          className={secondaryButtonClassName}
        >
          Preview
        </button>

        {preview ? (
          <button
            type="button"
            onClick={handleSave}
            disabled={pending}
            className={primaryButtonClassName}
          >
            {pending ? "Saving..." : "Save Events"}
          </button>
        ) : null}
      </div>

      {preview ? (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">
            Preview ({preview.length})
          </h2>
          {preview.map((event, index) => (
            <article
              key={`${event.title}-${index}`}
              className="space-y-3 rounded-md border border-neutral-800 bg-neutral-950 p-4"
            >
              <div>
                <div className="text-xs text-neutral-500">
                  Event {index + 1}
                </div>
                <h3 className="mt-1 text-lg font-semibold">
                  {event.title}
                </h3>
                {event.description ? (
                  <p className="mt-2 whitespace-pre-wrap text-sm text-neutral-300">
                    {event.description}
                  </p>
                ) : null}
              </div>

              <PreviewRows
                rows={[
                  ["Places", event.places.join(", ")],
                  ["Schedules", event.schedules.join("; ")],
                  ["Source channel", event.sourceChannel],
                  ["Source URL", event.sourceUrl],
                  ["Source note", event.sourceNote],
                  ["Event details", event.eventDetails.join("; ")],
                  ["Confidence", event.confidence],
                  ["Missing info", event.missingInfo.join(", ")],
                ]}
              />
            </article>
          ))}
        </div>
      ) : null}

      {saveResult?.results.some((result) => result.error) ? (
        <div className="space-y-2 rounded-md border border-amber-950 bg-amber-950/30 px-3 py-3 text-sm text-amber-100">
          <p className="font-medium">Some events were not saved.</p>
          {saveResult.results
            .filter((result) => result.error)
            .map((result) => (
              <p key={result.index}>
                Event {result.index + 1}: {result.error}
              </p>
            ))}
        </div>
      ) : null}
    </div>
  );
}

function PreviewRows({
  rows,
}: {
  rows: [label: string, value: string][];
}) {
  return (
    <dl className="space-y-2 text-sm">
      {rows.map(([label, value]) => (
        <div key={label}>
          <dt className="text-neutral-500">{label}</dt>
          <dd className="mt-0.5 text-neutral-200">
            {value || "Not provided"}
          </dd>
        </div>
      ))}
    </dl>
  );
}
