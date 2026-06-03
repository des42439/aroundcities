import AutoSlugFields from "./AutoSlugFields";
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

type Props = {
  feed?: FeedWithPlaceAndPhotos | null;
  feedPlaces?: FeedPlaceWithPlace[];
  places: Place[];
  action: (
    state: AdminActionState,
    formData: FormData
  ) => Promise<AdminActionState>;
};

export default function FeedForm({
  feed,
  feedPlaces = [],
  places,
  action,
}: Props) {
  const selectedFeedPlaceIds = new Set(
    feedPlaces.map((feedPlace) => feedPlace.place_id)
  );

  return (
    <AdminActionForm action={action} className="space-y-6">
      <AdminFormProgress />

      <input
        type="hidden"
        name="feed_type"
        value={feed?.feed_type ?? "local_discovery"}
      />

      <AutoSlugFields
        sourceLabel="Title"
        sourceName="title"
        initialSource={feed?.title ?? ""}
        initialSlug={feed?.slug ?? ""}
      />

      <Field label="Content / description">
        <textarea
          name="content"
          defaultValue={feed?.content ?? ""}
          className={textareaClassName}
        />
      </Field>

      <details className="rounded-lg border border-neutral-900 p-4">
        <summary className="cursor-pointer text-sm font-medium text-neutral-300">
          More options
        </summary>

        <div className="mt-5 space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
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

            <Field label="Published at">
              <input
                name="published_at"
                type="datetime-local"
                defaultValue={toDateTimeInputValue(
                  feed?.published_at
                )}
                className={inputClassName}
              />
            </Field>
          </div>

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

          <Field label="Source URL">
            <input
              name="source_url"
              type="url"
              defaultValue={feed?.source_url ?? ""}
              className={inputClassName}
            />
          </Field>

          <Field label="Tags">
            <input
              name="tags"
              defaultValue={feed?.tags.join(", ") ?? ""}
              placeholder="waterfront, food, photo-walk"
              className={inputClassName}
            />
          </Field>
        </div>
      </details>

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
