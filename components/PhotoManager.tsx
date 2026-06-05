"use client";

import Image from "next/image";
import { useState } from "react";
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
import { ADMIN_UPLOAD_MAX_BYTES } from "@/lib/upload-limits";
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
  const [uploadOpen, setUploadOpen] = useState(false);
  const [selectedPhotoId, setSelectedPhotoId] = useState<
    string | null
  >(null);
  const uploadAction =
    uploadFeedPhotosAction.bind(null, feedId);
  const selectedPhoto =
    photos.find(
      (photo) => photo.photo_id === selectedPhotoId
    ) ?? null;

  return (
    <section className="space-y-4">
      {photos.length === 0 ? (
        <div className="rounded-lg border border-neutral-900 p-4 text-sm text-neutral-500">
          No photos attached yet.
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
          {photos.map((photo, index) => (
            <button
              key={photo.photo_id}
              type="button"
              onClick={() =>
                setSelectedPhotoId(photo.photo_id)
              }
              className="group relative overflow-hidden rounded-md border border-neutral-900 bg-neutral-950 text-left outline-none transition hover:border-neutral-600 focus:border-neutral-500"
            >
              <div className="relative aspect-square">
                <Image
                  src={photo.photo_url}
                  alt={photo.title ?? `Feed photo ${index + 1}`}
                  fill
                  sizes="(min-width: 1024px) 12vw, (min-width: 640px) 20vw, 33vw"
                  className="object-cover transition group-hover:scale-105"
                  unoptimized
                />
              </div>
              <div className="p-2">
                <p className="truncate text-xs text-neutral-300">
                  {photo.title || `Photo ${index + 1}`}
                </p>
                {photo.featured ? (
                  <p className="mt-1 text-xs text-neutral-500">
                    Featured
                  </p>
                ) : null}
              </div>
            </button>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={() => setUploadOpen(true)}
        className="min-h-11 rounded-md border border-neutral-800 px-4 py-2 text-sm font-medium text-neutral-300 hover:border-neutral-600 hover:text-neutral-100"
      >
        Add Photos
      </button>

      {uploadOpen ? (
        <PhotoUploadModal
          action={uploadAction}
          onClose={() => setUploadOpen(false)}
        />
      ) : null}

      {selectedPhoto ? (
        <PhotoEditorModal
          feedId={feedId}
          photo={selectedPhoto}
          places={places}
          onClose={() => setSelectedPhotoId(null)}
        />
      ) : null}
    </section>
  );
}

function PhotoUploadModal({
  action,
  onClose,
}: {
  action: (
    state: { error?: string | null; errorId?: string | null },
    formData: FormData
  ) => Promise<{ error?: string | null; errorId?: string | null }>;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end bg-neutral-950/85 px-3 py-4 backdrop-blur-sm sm:items-center sm:justify-center">
      <div className="max-h-full w-full max-w-lg overflow-y-auto rounded-lg border border-neutral-800 bg-neutral-950 p-4 shadow-2xl">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h3 className="font-semibold text-neutral-100">
            Add Photos
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-neutral-800 px-3 py-2 text-sm text-neutral-300 hover:border-neutral-600"
          >
            Close
          </button>
        </div>

        <AdminActionForm
          action={action}
          className="space-y-4"
          maxFileBytes={ADMIN_UPLOAD_MAX_BYTES}
          maxFileBytesMessage="Selected photos are too large for this upload. Please upload smaller or compressed photos, or upload one photo at a time."
        >
          <AdminFormProgress />

          <Field label="Photos">
            <input
              name="photos"
              type="file"
              multiple
              accept="image/*"
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
      </div>
    </div>
  );
}

function PhotoEditorModal({
  feedId,
  photo,
  places,
  onClose,
}: {
  feedId: string;
  photo: Photo;
  places: Place[];
  onClose: () => void;
}) {
  const action = updateFeedPhotoAction.bind(
    null,
    feedId,
    photo.photo_id
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950/85 px-4 py-6 backdrop-blur-sm">
      <div className="max-h-full w-full max-w-3xl overflow-y-auto rounded-lg border border-neutral-800 bg-neutral-950 shadow-2xl">
        <div className="flex items-center justify-between border-b border-neutral-900 px-4 py-3">
          <div>
            <h3 className="font-semibold text-neutral-100">
              Edit photo
            </h3>
            <p className="text-sm text-neutral-500">
              Update details for this photo only.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-neutral-800 px-3 py-2 text-sm text-neutral-300 hover:border-neutral-600"
          >
            Close
          </button>
        </div>

        <div className="grid gap-5 p-4 md:grid-cols-[240px_1fr]">
          <div className="relative aspect-square overflow-hidden rounded-md bg-neutral-900 md:aspect-[4/5]">
            <Image
              src={photo.photo_url}
              alt={photo.title ?? "Feed photo"}
              fill
              sizes="(min-width: 768px) 240px, 100vw"
              className="object-cover"
              unoptimized
            />
          </div>

          <AdminActionForm action={action} className="space-y-4">
            <AdminFormProgress />

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
          </AdminActionForm>
        </div>
      </div>
    </div>
  );
}
