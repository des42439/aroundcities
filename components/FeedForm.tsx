import AutoSlugFields from "./AutoSlugFields";
import {
  Field,
  inputClassName,
  primaryButtonClassName,
  selectClassName,
  textareaClassName,
} from "./AdminForm";
import { feedStatuses, feedTypes } from "@/lib/feed-options";
import { toDateTimeInputValue } from "@/lib/format";
import {
  FeedWithPlaceAndPhotos,
  Place,
} from "@/types/database";

type Props = {
  feed?: FeedWithPlaceAndPhotos | null;
  places: Place[];
  action: (formData: FormData) => void | Promise<void>;
  submitLabel: string;
};

export default function FeedForm({
  feed,
  places,
  action,
  submitLabel,
}: Props) {
  return (
    <form action={action} className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Feed type">
          <select
            name="feed_type"
            defaultValue={feed?.feed_type ?? "local_discovery"}
            className={selectClassName}
          >
            {feedTypes.map((feedType) => (
              <option
                key={feedType.value}
                value={feedType.value}
              >
                {feedType.label}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Status">
          <select
            name="status"
            defaultValue={feed?.status ?? "draft"}
            className={selectClassName}
          >
            {feedStatuses.map((status) => (
              <option
                key={status.value}
                value={status.value}
              >
                {status.label}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <AutoSlugFields
        sourceLabel="Title"
        sourceName="title"
        initialSource={feed?.title ?? ""}
        initialSlug={feed?.slug ?? ""}
      />

      <Field label="Content">
        <textarea
          name="content"
          defaultValue={feed?.content ?? ""}
          className={textareaClassName}
        />
      </Field>

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Place">
          <select
            name="place_id"
            defaultValue={feed?.place_id ?? ""}
            className={selectClassName}
          >
            <option value="">No place</option>
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

      <button
        type="submit"
        className={primaryButtonClassName}
      >
        {submitLabel}
      </button>
    </form>
  );
}
