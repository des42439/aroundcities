"use client";

import Image from "next/image";
import { useState } from "react";
import AdminActionForm from "./AdminActionForm";
import {
  Field,
  inputClassName,
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
import { Photo } from "@/types/database";

type Props = {
  feedId: string;
  photos: Photo[];
};

export default function PhotoManager({
  feedId,
  photos,
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
  const selectedPhotoIndex = selectedPhoto
    ? photos.findIndex(
        (photo) => photo.photo_id === selectedPhoto.photo_id
      )
    : -1;

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
                    Photo feed
                  </p>
                ) : null}
                <p className="mt-1 text-xs text-neutral-500">
                  Order {photo.sequence > 0 ? photo.sequence : index + 1}
                </p>
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
          fallbackSequence={selectedPhotoIndex + 1}
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
  fallbackSequence,
  onClose,
}: {
  feedId: string;
  photo: Photo;
  fallbackSequence: number;
  onClose: () => void;
}) {
  const action = updateFeedPhotoAction.bind(
    null,
    feedId,
    photo.photo_id
  );
  const hasCoordinates =
    photo.latitude !== null && photo.longitude !== null;
  const mapUrl = hasCoordinates
    ? `https://www.google.com/maps/search/?api=1&query=${photo.latitude},${photo.longitude}`
    : null;

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

            <Field label="Title">
              <input
                name="title"
                defaultValue={photo.title ?? ""}
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

            <Field label="Capture datetime">
              <input
                name="captured_at"
                type="datetime-local"
                defaultValue={toDateTimeInputValue(
                  photo.captured_at
                )}
                className={inputClassName}
              />
            </Field>

            <Field label="Photo order">
              <input
                name="sequence"
                type="number"
                min={1}
                step={1}
                inputMode="numeric"
                pattern="[0-9]*"
                defaultValue={
                  photo.sequence > 0
                    ? photo.sequence
                    : fallbackSequence
                }
                className={inputClassName}
              />
            </Field>

            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Longitude">
                <input
                  value={photo.longitude ?? ""}
                  readOnly
                  className={inputClassName}
                />
              </Field>

              <Field label="Latitude">
                <input
                  value={photo.latitude ?? ""}
                  readOnly
                  className={inputClassName}
                />
              </Field>
            </div>

            <label className="flex items-center gap-3 text-sm text-neutral-300">
              <input
                type="checkbox"
                name="featured"
                defaultChecked={photo.featured}
                className="h-4 w-4"
              />
              Show as photo feed
            </label>

            <div className="flex flex-wrap items-center gap-3">
              <AdminSubmitButton
                variant="secondary"
                pendingLabel="Saving..."
              >
                Save photo
              </AdminSubmitButton>

              {mapUrl ? (
                <a
                  href={mapUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-h-11 items-center rounded-md border border-neutral-800 px-4 py-2 text-sm font-medium text-neutral-300 hover:border-neutral-600 hover:text-neutral-100"
                >
                  Open Map
                </a>
              ) : (
                <button
                  type="button"
                  disabled
                  className="inline-flex min-h-11 cursor-not-allowed items-center rounded-md border border-neutral-900 px-4 py-2 text-sm font-medium text-neutral-600"
                >
                  Open Map
                </button>
              )}
            </div>
          </AdminActionForm>
        </div>
      </div>
    </div>
  );
}
