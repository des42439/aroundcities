import AdminActionForm from "./AdminActionForm";
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
import {
  updateFeedPhotoAction,
  uploadFeedPhotosAction,
} from "@/lib/admin-actions";
import { toDateTimeInputValue } from "@/lib/format";
import { Photo, Place } from "@/types/database";

type Props = {
  feedId: string;
  photos: Photo[];
  places: Place[];
};

export default function PhotoManager({
  feedId,
  photos,
  places,
}: Props) {
  const uploadAction =
    uploadFeedPhotosAction.bind(null, feedId);

  return (
    <section className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold">
          Photos
        </h2>
        <p className="mt-2 text-sm text-neutral-500">
          Attach photos to this feed and choose one featured photo.
        </p>
      </div>

      <AdminActionForm
        action={uploadAction}
        className="space-y-5 rounded-lg border border-neutral-900 p-4"
      >
        <AdminFormProgress />

        <Field label="Upload photos">
          <input
            name="photos"
            type="file"
            multiple
            accept="image/*"
            className={inputClassName}
          />
        </Field>

        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Photo title">
            <input
              name="new_photo_title"
              className={inputClassName}
            />
          </Field>

          <Field label="Photo place">
            <select
              name="new_photo_place_id"
              className={selectClassName}
              defaultValue=""
            >
              <option value="">Use feed place or no place</option>
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
        </div>

        <Field label="Location name">
          <input
            name="new_photo_location_name"
            className={inputClassName}
          />
        </Field>

        <Field label="Description">
          <textarea
            name="new_photo_description"
            className={textareaClassName}
          />
        </Field>

        <Field label="Captured at">
          <input
            name="new_photo_captured_at"
            type="datetime-local"
            className={inputClassName}
          />
        </Field>

        <label className="flex items-center gap-3 text-sm text-neutral-300">
          <input
            type="checkbox"
            name="feature_first_photo"
            className="h-4 w-4"
          />
          Mark first uploaded photo as featured
        </label>

        <AdminSubmitButton pendingLabel="Uploading...">
          Upload photos
        </AdminSubmitButton>
      </AdminActionForm>

      <div className="space-y-4">
        {photos.length === 0 ? (
          <p className="text-sm text-neutral-500">
            No photos attached yet.
          </p>
        ) : (
          photos.map((photo) => {
            const action = updateFeedPhotoAction.bind(
              null,
              feedId,
              photo.photo_id
            );

            return (
              <AdminActionForm
                key={photo.photo_id}
                action={action}
                className="grid gap-4 rounded-lg border border-neutral-900 p-4 md:grid-cols-[180px_1fr]"
              >
                <AdminFormProgress className="md:col-span-2" />

                <img
                  src={photo.photo_url}
                  alt={photo.title ?? "Feed photo"}
                  className="h-40 w-full rounded-md bg-neutral-900 object-cover"
                />

                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <Field label="Title">
                      <input
                        name="title"
                        defaultValue={photo.title ?? ""}
                        className={inputClassName}
                      />
                    </Field>

                    <Field label="Photo place">
                      <select
                        name="place_id"
                        defaultValue={photo.place_id ?? ""}
                        className={selectClassName}
                      >
                        <option value="">No photo-specific place</option>
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
                  </div>

                  <Field label="Location name">
                    <input
                      name="location_name"
                      defaultValue={photo.location_name ?? ""}
                      className={inputClassName}
                    />
                  </Field>

                  <Field label="Description">
                    <textarea
                      name="description"
                      defaultValue={photo.description ?? ""}
                      className={textareaClassName}
                    />
                  </Field>

                  <Field label="Captured at">
                    <input
                      name="captured_at"
                      type="datetime-local"
                      defaultValue={toDateTimeInputValue(
                        photo.captured_at
                      )}
                      className={inputClassName}
                    />
                  </Field>

                  <label className="flex items-center gap-3 text-sm text-neutral-300">
                    <input
                      type="checkbox"
                      name="featured"
                      defaultChecked={photo.featured}
                      className="h-4 w-4"
                    />
                    Featured photo
                  </label>

                  <AdminSubmitButton
                    variant="secondary"
                    pendingLabel="Saving..."
                  >
                    Save photo
                  </AdminSubmitButton>
                </div>
              </AdminActionForm>
            );
          })
        )}
      </div>
    </section>
  );
}
