"use client";

import { useMemo, useState } from "react";
import AdminActionForm, {
  AdminActionState,
} from "./AdminActionForm";
import {
  Field,
  inputClassName,
  secondaryButtonClassName,
  selectClassName,
  textareaClassName,
} from "./AdminForm";
import {
  AdminFormProgress,
  AdminSubmitButton,
} from "./AdminSubmitButton";
import DeleteFeedForm from "./DeleteFeedForm";
import PhotoManager from "./PhotoManager";
import SourceEvidenceScreenshotPicker from "./SourceEvidenceScreenshotPicker";
import {
  archiveFeedAction,
  createFeedScheduleAction,
  createFeedSourceAction,
  deleteFeedScheduleAction,
  deleteFeedSourceAction,
} from "@/lib/admin-actions";
import { FeedSourceWithScreenshots } from "@/lib/feed-sources";
import {
  Channel,
  Feed,
  FeedEventDetails,
  FeedPlaceWithPlace,
  FeedSchedule,
  FeedWithPlaceAndPhotos,
  Photo,
  Place,
} from "@/types/database";

type SectionKey =
  | "sources"
  | "places"
  | "schedules"
  | "event_details"
  | "parent";

type Props = {
  feed: FeedWithPlaceAndPhotos;
  photos: Photo[];
  places: Place[];
  feedPlaces: FeedPlaceWithPlace[];
  feedSources: FeedSourceWithScreenshots[];
  channels: Channel[];
  schedules: FeedSchedule[];
  eventDetails: FeedEventDetails | null;
  parentCandidates: Feed[];
  action: (
    state: AdminActionState,
    formData: FormData
  ) => Promise<AdminActionState>;
};

const sectionOptions: { key: SectionKey; label: string }[] = [
  { key: "sources", label: "Sources" },
  { key: "places", label: "Places" },
  { key: "schedules", label: "Schedules" },
  { key: "event_details", label: "Event Details" },
  { key: "parent", label: "Parent Feed" },
];

export default function MobileFeedEditor({
  feed,
  photos,
  places,
  feedPlaces,
  feedSources,
  channels,
  schedules,
  eventDetails,
  parentCandidates,
  action,
}: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSections, setActiveSections] = useState<
    Set<SectionKey>
  >(() => {
    const initial = new Set<SectionKey>();

    if (feedSources.length) {
      initial.add("sources");
    }

    if (feedPlaces.length || feed.place_id) {
      initial.add("places");
    }

    if (schedules.length) {
      initial.add("schedules");
    }

    if (eventDetails) {
      initial.add("event_details");
    }

    if (feed.parent_feed_id) {
      initial.add("parent");
    }

    return initial;
  });
  const selectedFeedPlaceIds = useMemo(
    () =>
      new Set(
        feedPlaces.map((feedPlace) => feedPlace.place_id)
      ),
    [feedPlaces]
  );
  const primaryFeedPlace =
    feedPlaces.find((feedPlace) => feedPlace.is_primary) ??
    feedPlaces.find(
      (feedPlace) => feedPlace.place_id === feed.place_id
    ) ??
    null;
  const locationNote =
    feedPlaces.find((feedPlace) => feedPlace.location_note)
      ?.location_note ?? "";

  function addSection(section: SectionKey) {
    setActiveSections((current) => {
      const next = new Set(current);
      next.add(section);
      return next;
    });
    setMenuOpen(false);
  }

  function hasSection(section: SectionKey) {
    return activeSections.has(section);
  }

  const saveLabel =
    feed.status === "published" ? "Save" : "Save Draft";

  return (
    <div className="space-y-8">
      <AdminActionForm action={action} className="space-y-5">
        <AdminFormProgress />

        <input
          type="hidden"
          name="feed_type"
          value={feed.feed_type}
        />
        <input type="hidden" name="slug" value={feed.slug} />
        <input
          type="hidden"
          name="source_url"
          value={feed.source_url ?? ""}
        />
        <input
          type="hidden"
          name="operating_hours"
          value={feed.operating_hours ?? ""}
        />
        <input
          type="hidden"
          name="tags"
          value={feed.tags.join(", ")}
        />
        <input
          type="hidden"
          name="published_at"
          value={feed.published_at ?? ""}
        />

        <Field label="Title">
          <input
            name="title"
            defaultValue={feed.title}
            required
            className={inputClassName}
          />
        </Field>

        <Field label="Description">
          <textarea
            name="content"
            defaultValue={feed.content ?? ""}
            className={textareaClassName}
          />
        </Field>

        {!hasSection("places") ? (
          <>
            <input
              type="hidden"
              name="place_id"
              value={feed.place_id ?? ""}
            />
            {feedPlaces.map((feedPlace) => (
              <input
                key={feedPlace.place_id}
                type="hidden"
                name="feed_place_ids"
                value={feedPlace.place_id}
              />
            ))}
            <input
              type="hidden"
              name="primary_feed_place_id"
              value={primaryFeedPlace?.place_id ?? ""}
            />
            <input
              type="hidden"
              name="feed_place_location_note"
              value={locationNote}
            />
          </>
        ) : (
          <PlacesSection
            places={places}
            feed={feed}
            selectedFeedPlaceIds={selectedFeedPlaceIds}
            primaryPlaceId={primaryFeedPlace?.place_id ?? ""}
            locationNote={locationNote}
          />
        )}

        {!hasSection("parent") ? (
          <input
            type="hidden"
            name="parent_feed_id"
            value={feed.parent_feed_id ?? ""}
          />
        ) : (
          <ParentSection
            feed={feed}
            parentCandidates={parentCandidates}
          />
        )}

        {hasSection("event_details") ? (
          <EventDetailsSection eventDetails={eventDetails} />
        ) : null}

        <div className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            className={secondaryButtonClassName}
          >
            Add Section
          </button>

          {menuOpen ? (
            <div className="absolute left-0 z-20 mt-2 w-56 rounded-lg border border-neutral-800 bg-neutral-950 p-2 shadow-2xl">
              {sectionOptions.map((section) => (
                <button
                  key={section.key}
                  type="button"
                  onClick={() => addSection(section.key)}
                  className="block w-full rounded-md px-3 py-3 text-left text-sm text-neutral-200 hover:bg-neutral-900"
                >
                  {section.label}
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <AdminSubmitButton
            name="status"
            value={feed.status === "published" ? "published" : "draft"}
            variant="secondary"
            pendingLabel="Saving..."
          >
            {saveLabel}
          </AdminSubmitButton>

          {feed.status !== "published" ? (
            <AdminSubmitButton
              name="status"
              value="published"
              pendingLabel="Publishing..."
            >
              Publish
            </AdminSubmitButton>
          ) : null}
        </div>
      </AdminActionForm>

      <PhotoManager
        feedId={feed.feed_id}
        photos={photos}
      />

      {hasSection("sources") ? (
        <SourcesSection
          feedId={feed.feed_id}
          sources={feedSources}
          channels={channels}
        />
      ) : null}

      {hasSection("schedules") ? (
        <SchedulesSection
          feedId={feed.feed_id}
          schedules={schedules}
        />
      ) : null}

      {feed.status === "published" ? (
        <ArchiveFeedForm feedId={feed.feed_id} />
      ) : null}

      <DeleteFeedForm feedId={feed.feed_id} />
    </div>
  );
}

function PlacesSection({
  places,
  feed,
  selectedFeedPlaceIds,
  primaryPlaceId,
  locationNote,
}: {
  places: Place[];
  feed: FeedWithPlaceAndPhotos;
  selectedFeedPlaceIds: Set<string>;
  primaryPlaceId: string;
  locationNote: string;
}) {
  return (
    <section className="space-y-4 rounded-lg border border-neutral-900 p-4">
      <h2 className="font-semibold">Places</h2>

      <Field label="Primary place">
        <select
          name="place_id"
          defaultValue={feed.place_id ?? primaryPlaceId}
          className={selectClassName}
        >
          <option value="">No primary place</option>
          {places.map((place) => (
            <option key={place.place_id} value={place.place_id}>
              {place.name}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Linked places">
        <div className="space-y-2">
          {places.length === 0 ? (
            <p className="text-sm text-neutral-500">
              No places available yet.
            </p>
          ) : (
            places.map((place) => (
              <label
                key={place.place_id}
                className="flex min-h-11 items-center gap-3 rounded-md border border-neutral-900 px-3 py-2 text-sm text-neutral-300"
              >
                <input
                  type="checkbox"
                  name="feed_place_ids"
                  value={place.place_id}
                  defaultChecked={selectedFeedPlaceIds.has(
                    place.place_id
                  )}
                  className="h-4 w-4"
                />
                <span>{place.name}</span>
              </label>
            ))
          )}
        </div>
      </Field>

      <Field label="Primary linked place">
        <select
          name="primary_feed_place_id"
          defaultValue={primaryPlaceId}
          className={selectClassName}
        >
          <option value="">No linked primary</option>
          {places.map((place) => (
            <option key={place.place_id} value={place.place_id}>
              {place.name}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Location note">
        <input
          name="feed_place_location_note"
          defaultValue={locationNote}
          className={inputClassName}
        />
      </Field>
    </section>
  );
}

function SourcesSection({
  feedId,
  sources,
  channels,
}: {
  feedId: string;
  sources: FeedSourceWithScreenshots[];
  channels: Channel[];
}) {
  const action = createFeedSourceAction.bind(null, feedId);
  const [screenshotUploadPending, setScreenshotUploadPending] =
    useState(false);

  return (
    <section className="space-y-4 rounded-lg border border-neutral-900 p-4">
      <h2 className="font-semibold">Sources</h2>

      {sources.length ? (
        <div className="space-y-2">
          {sources.map((source) => (
            <div
              key={source.source_id}
              className="rounded-md border border-neutral-900 p-3 text-sm"
            >
              <p className="break-words text-neutral-200">
                {source.source_url ||
                  source.channel?.name ||
                  "Source note"}
              </p>
              {source.source_note ? (
                <p className="mt-1 text-neutral-500">
                  {source.source_note}
                </p>
              ) : null}
              {source.screenshots.length ? (
                <p className="mt-2 text-xs text-neutral-500">
                  {source.screenshots.length} evidence screenshot
                  {source.screenshots.length === 1 ? "" : "s"}
                </p>
              ) : null}
              <AdminActionForm
                action={deleteFeedSourceAction.bind(
                  null,
                  feedId,
                  source.source_id
                )}
                className="mt-3"
              >
                <AdminSubmitButton
                  variant="danger"
                  pendingLabel="Removing..."
                  confirmMessage="Remove this source?"
                >
                  Remove
                </AdminSubmitButton>
              </AdminActionForm>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-neutral-500">
          No sources attached yet.
        </p>
      )}

      <AdminActionForm action={action} className="space-y-4">
        <AdminFormProgress />
        <Field label="Source URL">
          <input
            name="source_url"
            type="url"
            className={inputClassName}
          />
        </Field>
        <Field label="Source channel">
          <select name="channel_id" className={selectClassName}>
            <option value="">No channel</option>
            {channels.map((channel) => (
              <option
                key={channel.channel_id}
                value={channel.channel_id}
              >
                {channel.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Source note">
          <textarea
            name="source_note"
            className={textareaClassName}
          />
        </Field>
        <div>
          <span className="text-sm text-neutral-400">
            Evidence screenshot
          </span>
          <div className="mt-2">
            <SourceEvidenceScreenshotPicker
              feedId={feedId}
              onPendingChange={setScreenshotUploadPending}
            />
          </div>
        </div>
        <Field label="Screenshot note">
          <input
            name="screenshot_remarks"
            className={inputClassName}
          />
        </Field>
        <AdminSubmitButton
          variant="secondary"
          pendingLabel="Adding..."
          disabled={screenshotUploadPending}
        >
          {screenshotUploadPending
            ? "Uploading Screenshot..."
            : "Add Source"}
        </AdminSubmitButton>
      </AdminActionForm>
    </section>
  );
}

function EventDetailsSection({
  eventDetails,
}: {
  eventDetails: FeedEventDetails | null;
}) {
  return (
    <section className="space-y-4 rounded-lg border border-neutral-900 p-4">
      <input
        type="hidden"
        name="event_details_section_present"
        value="1"
      />
      <h2 className="font-semibold">Event Details</h2>

      <Field label="Entry type">
        <select
          name="event_entry_type"
          defaultValue={eventDetails?.entry_type ?? "unknown"}
          className={selectClassName}
        >
          <option value="unknown">Unknown</option>
          <option value="free">Free</option>
          <option value="paid">Paid</option>
        </select>
      </Field>

      <Field label="Registration type">
        <select
          name="event_registration_type"
          defaultValue={
            eventDetails?.registration_type ?? "unknown"
          }
          className={selectClassName}
        >
          <option value="unknown">Unknown</option>
          <option value="free_registration">
            Free registration
          </option>
          <option value="registration_required">
            Registration required
          </option>
          <option value="walk_in">Walk-in</option>
        </select>
      </Field>

      <NullableBooleanField
        label="Open to public"
        name="event_open_to_public"
        value={eventDetails?.open_to_public ?? null}
      />
      <NullableBooleanField
        label="Ticket required"
        name="event_ticket_required"
        value={eventDetails?.ticket_required ?? null}
      />
      <NullableBooleanField
        label="Lucky draw"
        name="event_lucky_draw"
        value={eventDetails?.lucky_draw ?? null}
      />

      <Field label="Dress code">
        <input
          name="event_dress_code"
          defaultValue={eventDetails?.dress_code ?? ""}
          className={inputClassName}
        />
      </Field>

      <Field label="Organizer">
        <input
          name="event_organizer"
          defaultValue={eventDetails?.organizer ?? ""}
          className={inputClassName}
        />
      </Field>

      <Field label="Event notes">
        <textarea
          name="event_notes"
          defaultValue={eventDetails?.event_notes ?? ""}
          className={textareaClassName}
        />
      </Field>
    </section>
  );
}

function NullableBooleanField({
  label,
  name,
  value,
}: {
  label: string;
  name: string;
  value: boolean | null;
}) {
  return (
    <Field label={label}>
      <select
        name={name}
        defaultValue={value === null ? "" : String(value)}
        className={selectClassName}
      >
        <option value="">Unknown</option>
        <option value="true">Yes</option>
        <option value="false">No</option>
      </select>
    </Field>
  );
}

function SchedulesSection({
  feedId,
  schedules,
}: {
  feedId: string;
  schedules: FeedSchedule[];
}) {
  const [adding, setAdding] = useState(false);

  return (
    <section className="space-y-4 rounded-lg border border-neutral-900 p-4">
      <h2 className="font-semibold">Schedules</h2>

      {schedules.length ? (
        <div className="space-y-2">
          {schedules.map((schedule) => (
            <div
              key={schedule.schedule_id}
              className="rounded-md border border-neutral-900 p-3 text-sm"
            >
              <p className="text-neutral-200">
                {schedule.schedule_date}
                {schedule.start_time
                  ? `, ${schedule.start_time.slice(0, 5)}`
                  : ""}
                {schedule.end_time
                  ? `-${schedule.end_time.slice(0, 5)}`
                  : ""}
              </p>
              {schedule.remarks ? (
                <p className="mt-1 text-neutral-500">
                  {schedule.remarks}
                </p>
              ) : null}
              <AdminActionForm
                action={deleteFeedScheduleAction.bind(
                  null,
                  feedId,
                  schedule.schedule_id
                )}
                className="mt-3"
              >
                <AdminSubmitButton
                  variant="danger"
                  pendingLabel="Removing..."
                  confirmMessage="Remove this schedule?"
                >
                  Remove
                </AdminSubmitButton>
              </AdminActionForm>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-neutral-500">
          No schedule rows yet.
        </p>
      )}

      <button
        type="button"
        onClick={() => setAdding(true)}
        className={secondaryButtonClassName}
      >
        Add Schedule
      </button>

      {adding ? (
        <div className="fixed inset-0 z-50 flex items-end bg-neutral-950/85 px-3 py-4 backdrop-blur-sm sm:items-center sm:justify-center">
          <div className="max-h-full w-full max-w-lg overflow-y-auto rounded-lg border border-neutral-800 bg-neutral-950 p-4 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-semibold">Add Schedule</h3>
              <button
                type="button"
                onClick={() => setAdding(false)}
                className={secondaryButtonClassName}
              >
                Close
              </button>
            </div>
            <AdminActionForm
              action={createFeedScheduleAction.bind(null, feedId)}
              className="space-y-4"
            >
              <AdminFormProgress />
              <Field label="Schedule date">
                <input
                  name="schedule_date"
                  type="date"
                  required
                  className={inputClassName}
                />
              </Field>
              <Field label="Start time">
                <input
                  name="start_time"
                  type="time"
                  className={inputClassName}
                />
              </Field>
              <Field label="End time">
                <input
                  name="end_time"
                  type="time"
                  className={inputClassName}
                />
              </Field>
              <Field label="Remarks">
                <input
                  name="remarks"
                  className={inputClassName}
                />
              </Field>
              <AdminSubmitButton pendingLabel="Adding...">
                Save Schedule
              </AdminSubmitButton>
            </AdminActionForm>
          </div>
        </div>
      ) : null}
    </section>
  );
}

function ParentSection({
  feed,
  parentCandidates,
}: {
  feed: FeedWithPlaceAndPhotos;
  parentCandidates: Feed[];
}) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedParentId, setSelectedParentId] = useState(
    feed.parent_feed_id ?? ""
  );
  const selectedParent =
    parentCandidates.find(
      (candidate) => candidate.feed_id === selectedParentId
    ) ?? null;
  const normalizedQuery = query.trim().toLowerCase();
  const filteredCandidates = parentCandidates.filter(
    (candidate) =>
      !normalizedQuery ||
      candidate.title.toLowerCase().includes(normalizedQuery)
  );

  return (
    <section className="space-y-4 rounded-lg border border-neutral-900 p-4">
      <h2 className="font-semibold">Parent Feed</h2>
      <input
        type="hidden"
        name="parent_feed_id"
        value={selectedParentId}
      />
      <p className="text-sm text-neutral-400">
        {selectedParent
          ? selectedParent.title
          : "No parent feed selected"}
      </p>
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => setPickerOpen(true)}
          className={secondaryButtonClassName}
        >
          Select Feed
        </button>
        {selectedParentId ? (
          <button
            type="button"
            onClick={() => setSelectedParentId("")}
            className={secondaryButtonClassName}
          >
            Remove
          </button>
        ) : null}
      </div>

      {pickerOpen ? (
        <div className="fixed inset-0 z-50 flex items-end bg-neutral-950/85 px-3 py-4 backdrop-blur-sm sm:items-center sm:justify-center">
          <div className="max-h-full w-full max-w-lg overflow-y-auto rounded-lg border border-neutral-800 bg-neutral-950 p-4 shadow-2xl">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h3 className="font-semibold">Select Feed</h3>
              <button
                type="button"
                onClick={() => setPickerOpen(false)}
                className={secondaryButtonClassName}
              >
                Close
              </button>
            </div>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search feed titles"
              className={inputClassName}
            />
            <div className="mt-4 space-y-2">
              {filteredCandidates.map((candidate) => (
                <button
                  key={candidate.feed_id}
                  type="button"
                  onClick={() => {
                    setSelectedParentId(candidate.feed_id);
                    setPickerOpen(false);
                  }}
                  className="block w-full rounded-md border border-neutral-900 px-3 py-3 text-left text-sm text-neutral-200 hover:border-neutral-700"
                >
                  {candidate.title}
                </button>
              ))}
              {filteredCandidates.length === 0 ? (
                <p className="text-sm text-neutral-500">
                  No matching feeds.
                </p>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}

function ArchiveFeedForm({ feedId }: { feedId: string }) {
  return (
    <section className="border-t border-neutral-900 pt-8">
      <AdminActionForm
        action={archiveFeedAction.bind(null, feedId)}
        className="space-y-4"
      >
        <AdminFormProgress />
        <AdminSubmitButton
          variant="secondary"
          pendingLabel="Archiving..."
          confirmMessage="Archive this feed? It will be hidden from public pages."
        >
          Archive
        </AdminSubmitButton>
      </AdminActionForm>
    </section>
  );
}
