"use client";

import { useMemo, useState } from "react";
import AdminActionForm, {
  AdminActionState,
} from "./AdminActionForm";
import {
  Field,
  inputClassName,
  selectClassName,
  textareaClassName,
} from "./AdminForm";
import {
  AdminFormProgress,
  AdminSubmitButton,
} from "./AdminSubmitButton";
import { toDateTimeInputValue } from "@/lib/format";
import {
  FeedPlaceWithPlace,
  FeedWithPlaceAndPhotos,
  Place,
} from "@/types/database";

type OptionalField =
  | "slug"
  | "primaryPlace"
  | "feedPlaces"
  | "publishedAt"
  | "sourceUrl"
  | "tags";

type Props = {
  feed?: FeedWithPlaceAndPhotos | null;
  feedPlaces?: FeedPlaceWithPlace[];
  places: Place[];
  action: (
    state: AdminActionState,
    formData: FormData
  ) => Promise<AdminActionState>;
};

const optionalFields: {
  id: OptionalField;
  label: string;
}[] = [
  {
    id: "slug",
    label: "Slug",
  },
  {
    id: "primaryPlace",
    label: "Primary place",
  },
  {
    id: "feedPlaces",
    label: "Feed places",
  },
  {
    id: "publishedAt",
    label: "Published time",
  },
  {
    id: "sourceUrl",
    label: "Source URL",
  },
  {
    id: "tags",
    label: "Tags",
  },
];

export default function FeedForm({
  feed,
  feedPlaces = [],
  places,
  action,
}: Props) {
  const selectedFeedPlaceIds = useMemo(
    () =>
      new Set(
        feedPlaces.map((feedPlace) => feedPlace.place_id)
      ),
    [feedPlaces]
  );
  const [activeFields, setActiveFields] = useState<
    Set<OptionalField>
  >(() => {
    const initial = new Set<OptionalField>();

    if (feed?.source_url) {
      initial.add("sourceUrl");
    }

    if (feed?.tags.length) {
      initial.add("tags");
    }

    if (feed?.place_id) {
      initial.add("primaryPlace");
    }

    if (feedPlaces.length) {
      initial.add("feedPlaces");
    }

    if (feed?.published_at) {
      initial.add("publishedAt");
    }

    return initial;
  });
  const publishedAt = toDateTimeInputValue(
    feed?.published_at
  );

  function toggleField(field: OptionalField) {
    setActiveFields((current) => {
      const next = new Set(current);

      if (next.has(field)) {
        next.delete(field);
      } else {
        next.add(field);
      }

      return next;
    });
  }

  function isActive(field: OptionalField) {
    return activeFields.has(field);
  }

  return (
    <AdminActionForm action={action} className="space-y-6">
      <AdminFormProgress />

      <input
        type="hidden"
        name="feed_type"
        value={feed?.feed_type ?? "local_discovery"}
      />

      <Field label="Title">
        <input
          name="title"
          defaultValue={feed?.title ?? ""}
          required
          className={inputClassName}
        />
      </Field>

      <Field label="Content / description">
        <textarea
          name="content"
          defaultValue={feed?.content ?? ""}
          className={textareaClassName}
        />
      </Field>

      <section className="space-y-4 rounded-lg border border-neutral-900 p-4">
        <div>
          <p className="text-sm font-medium text-neutral-300">
            Add optional fields
          </p>
          <p className="mt-1 text-sm text-neutral-500">
            Pick only the fields needed for this draft.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {optionalFields.map((field) => (
            <label
              key={field.id}
              className={`flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm ${
                isActive(field.id)
                  ? "border-neutral-500 bg-neutral-900 text-neutral-100"
                  : "border-neutral-900 text-neutral-400 hover:border-neutral-700"
              }`}
            >
              <input
                type="checkbox"
                checked={isActive(field.id)}
                onChange={() => toggleField(field.id)}
                className="h-4 w-4"
              />
              {field.label}
            </label>
          ))}
        </div>

        <div className="space-y-5">
          {isActive("slug") ? (
            <Field label="Slug">
              <input
                name="slug"
                defaultValue={feed?.slug ?? ""}
                className={inputClassName}
              />
            </Field>
          ) : (
            <input
              type="hidden"
              name="slug"
              value={feed?.slug ?? ""}
            />
          )}

          <div className="grid gap-4 md:grid-cols-2">
            {isActive("primaryPlace") ? (
              <Field label="Primary place">
                <select
                  name="place_id"
                  defaultValue={feed?.place_id ?? ""}
                  className={selectClassName}
                >
                  <option value="">No primary place</option>
                  {places.map((place) => (
                    <option
                      key={place.place_id}
                      value={place.place_id}
                    >
                      {place.name}
                    </option>
                  ))}
                </select>
              </Field>
            ) : (
              <input
                type="hidden"
                name="place_id"
                value={feed?.place_id ?? ""}
              />
            )}

            {isActive("publishedAt") ? (
              <Field label="Published at">
                <input
                  name="published_at"
                  type="datetime-local"
                  defaultValue={publishedAt}
                  className={inputClassName}
                />
              </Field>
            ) : (
              <input
                type="hidden"
                name="published_at"
                value={publishedAt}
              />
            )}
          </div>

          {isActive("feedPlaces") ? (
            <div>
              <p className="mb-2 text-sm text-neutral-400">
                Feed places
              </p>
              <div className="grid gap-2 md:grid-cols-2">
                {places.length === 0 ? (
                  <p className="text-sm text-neutral-500">
                    Add a place below before assigning it.
                  </p>
                ) : (
                  places.map((place) => (
                    <label
                      key={place.place_id}
                      className="flex items-center gap-3 rounded-md border border-neutral-900 px-3 py-2 text-sm text-neutral-300"
                    >
                      <input
                        type="checkbox"
                        name="feed_place_ids"
                        value={place.place_id}
                        defaultChecked={selectedFeedPlaceIds.has(
                          place.place_id
                        )}
                      />
                      {place.name}
                    </label>
                  ))
                )}
              </div>
            </div>
          ) : (
            feedPlaces.map((feedPlace) => (
              <input
                key={feedPlace.place_id}
                type="hidden"
                name="feed_place_ids"
                value={feedPlace.place_id}
              />
            ))
          )}

          {isActive("sourceUrl") ? (
            <Field label="Source URL">
              <input
                name="source_url"
                type="url"
                defaultValue={feed?.source_url ?? ""}
                className={inputClassName}
              />
            </Field>
          ) : (
            <input
              type="hidden"
              name="source_url"
              value={feed?.source_url ?? ""}
            />
          )}

          {isActive("tags") ? (
            <Field label="Tags">
              <input
                name="tags"
                defaultValue={feed?.tags.join(", ") ?? ""}
                placeholder="waterfront, food, photo-walk"
                className={inputClassName}
              />
            </Field>
          ) : (
            <input
              type="hidden"
              name="tags"
              value={feed?.tags.join(", ") ?? ""}
            />
          )}
        </div>
      </section>

      <div className="flex flex-wrap gap-3">
        <AdminSubmitButton
          name="status"
          value="draft"
          variant="secondary"
          pendingLabel="Saving..."
        >
          Save draft
        </AdminSubmitButton>

        <AdminSubmitButton
          name="status"
          value="published"
          pendingLabel="Publishing..."
        >
          Publish
        </AdminSubmitButton>
      </div>
    </AdminActionForm>
  );
}
