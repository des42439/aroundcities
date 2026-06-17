"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { ChangeEvent, useRef, useState } from "react";
import AdminActionForm from "./AdminActionForm";
import {
  Field,
  inputClassName,
  secondaryButtonClassName,
  textareaClassName,
} from "./AdminForm";
import {
  AdminFormProgress,
  AdminSubmitButton,
} from "./AdminSubmitButton";
import { useGlobalLoading } from "./GlobalLoading";
import {
  createHistoryPhotoUploadTargetAction,
  createUploadedHistoryPhotoAction,
  linkExistingHistoryPhotosAction,
  removeHistoryPhotoAction,
  updateHistoryPhotoAction,
} from "@/lib/admin-actions";
import { compressAdminImage } from "@/lib/client-image-compression";
import { formatDate, getFeaturedPhoto } from "@/lib/format";
import { supabase } from "@/lib/supabase";
import {
  FeedWithPlaceAndPhotos,
  HistoryPhotoWithPhoto,
} from "@/types/database";

type Props = {
  historyId: string;
  historyPhotos: HistoryPhotoWithPhoto[];
  feeds: FeedWithPlaceAndPhotos[];
};

function actionError(result: unknown) {
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

export default function HistoryPhotoManager({
  historyId,
  historyPhotos,
  feeds,
}: Props) {
  const [existingPickerOpen, setExistingPickerOpen] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [selectedHistoryPhotoId, setSelectedHistoryPhotoId] = useState<
    string | null
  >(null);
  const selectedHistoryPhoto =
    historyPhotos.find(
      (historyPhoto) =>
        historyPhoto.history_photo_id === selectedHistoryPhotoId
    ) ?? null;

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => setExistingPickerOpen(true)}
          className={secondaryButtonClassName}
        >
          Add Existing Photo
        </button>
        <button
          type="button"
          onClick={() => setUploadOpen(true)}
          className={secondaryButtonClassName}
        >
          Upload History Photo
        </button>
      </div>

      {historyPhotos.length === 0 ? (
        <p className="rounded-lg border border-neutral-900 p-4 text-sm text-neutral-500">
          No photos linked yet.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {historyPhotos.map((historyPhoto, index) => (
            <button
              key={historyPhoto.history_photo_id}
              type="button"
              onClick={() =>
                setSelectedHistoryPhotoId(
                  historyPhoto.history_photo_id
                )
              }
              className="overflow-hidden rounded-md border border-neutral-900 text-left hover:border-neutral-700"
            >
              <div className="relative aspect-square">
                <Image
                  src={historyPhoto.photo.photo_url}
                  alt={
                    historyPhoto.photo.title ??
                    `History photo ${index + 1}`
                  }
                  fill
                  unoptimized
                  sizes="(min-width: 640px) 25vw, 50vw"
                  className="object-cover"
                />
              </div>
              <div className="p-2 text-xs">
                <p className="truncate text-neutral-300">
                  {historyPhoto.photo.title || `Photo ${index + 1}`}
                </p>
                <p className="mt-1 text-neutral-500">
                  Order{" "}
                  {historyPhoto.sequence > 0
                    ? historyPhoto.sequence
                    : index + 1}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}

      {existingPickerOpen ? (
        <ExistingPhotoPicker
          historyId={historyId}
          feeds={feeds}
          linkedPhotoIds={new Set(historyPhotos.map((item) => item.photo_id))}
          onClose={() => setExistingPickerOpen(false)}
        />
      ) : null}

      {uploadOpen ? (
        <HistoryPhotoUploadModal
          historyId={historyId}
          onClose={() => setUploadOpen(false)}
        />
      ) : null}

      {selectedHistoryPhoto ? (
        <HistoryPhotoEditorModal
          historyId={historyId}
          historyPhoto={selectedHistoryPhoto}
          onClose={() => setSelectedHistoryPhotoId(null)}
        />
      ) : null}
    </section>
  );
}

function ExistingPhotoPicker({
  historyId,
  feeds,
  linkedPhotoIds,
  onClose,
}: {
  historyId: string;
  feeds: FeedWithPlaceAndPhotos[];
  linkedPhotoIds: Set<string>;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const [selectedFeedId, setSelectedFeedId] = useState("");
  const normalizedQuery = query.trim().toLowerCase();
  const filteredFeeds = feeds.filter(
    (feed) =>
      !normalizedQuery ||
      feed.title.toLowerCase().includes(normalizedQuery)
  );
  const selectedFeed =
    feeds.find((feed) => feed.feed_id === selectedFeedId) ?? null;
  const action = linkExistingHistoryPhotosAction.bind(null, historyId);

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-neutral-950/85 px-3 py-4 backdrop-blur-sm sm:items-center sm:justify-center">
      <div className="max-h-full w-full max-w-3xl overflow-y-auto rounded-lg border border-neutral-800 bg-neutral-950 p-4 shadow-2xl">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h3 className="font-semibold">Add Existing Photo</h3>
          <button
            type="button"
            onClick={onClose}
            className={secondaryButtonClassName}
          >
            Close
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
          <div className="space-y-3">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search feed titles"
              className={inputClassName}
            />

            <div className="max-h-96 space-y-2 overflow-y-auto pr-1">
              {filteredFeeds.map((feed) => {
                const thumbnail = getFeaturedPhoto(feed.photos);

                return (
                  <button
                    key={feed.feed_id}
                    type="button"
                    onClick={() => setSelectedFeedId(feed.feed_id)}
                    className="flex w-full gap-3 rounded-md border border-neutral-900 p-2 text-left hover:border-neutral-700"
                  >
                    {thumbnail ? (
                      <Image
                        src={thumbnail.photo_url}
                        alt={feed.title}
                        width={48}
                        height={48}
                        unoptimized
                        className="h-12 w-12 rounded-md object-cover"
                      />
                    ) : (
                      <div className="flex h-12 w-12 items-center justify-center rounded-md border border-neutral-900 text-xs text-neutral-600">
                        None
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="line-clamp-2 text-sm text-neutral-200">
                        {feed.title}
                      </p>
                      <p className="mt-1 text-xs text-neutral-500">
                        {feed.status} · {formatDate(feed.updated_at)} ·{" "}
                        {feed.photos.length} photos
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <AdminActionForm action={action} className="space-y-4">
            <AdminFormProgress />
            {selectedFeed ? (
              <>
                <h4 className="font-medium">{selectedFeed.title}</h4>
                <div className="grid grid-cols-2 gap-3">
                  {selectedFeed.photos.map((photo) => (
                    <label
                      key={photo.photo_id}
                      className="overflow-hidden rounded-md border border-neutral-900"
                    >
                      <div className="relative aspect-square">
                        <Image
                          src={photo.photo_url}
                          alt={photo.title ?? selectedFeed.title}
                          fill
                          unoptimized
                          sizes="160px"
                          className="object-cover"
                        />
                      </div>
                      <div className="flex items-center gap-2 p-2 text-sm text-neutral-300">
                        <input
                          type="checkbox"
                          name="photo_ids"
                          value={photo.photo_id}
                          disabled={linkedPhotoIds.has(photo.photo_id)}
                        />
                        <span className="min-w-0 truncate">
                          {linkedPhotoIds.has(photo.photo_id)
                            ? "Already linked"
                            : photo.title || "Select photo"}
                        </span>
                      </div>
                    </label>
                  ))}
                </div>
                <AdminSubmitButton
                  variant="secondary"
                  pendingLabel="Linking..."
                >
                  Link Selected Photos
                </AdminSubmitButton>
              </>
            ) : (
              <p className="rounded-md border border-neutral-900 p-4 text-sm text-neutral-500">
                Select a feed to view photos.
              </p>
            )}
          </AdminActionForm>
        </div>
      </div>
    </div>
  );
}

function HistoryPhotoUploadModal({
  historyId,
  onClose,
}: {
  historyId: string;
  onClose: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { startLoading, stopLoading } = useGlobalLoading();
  const [pending, setPending] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  async function handleFiles(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);

    if (!files.length) {
      return;
    }

    setPending(true);
    startLoading();
    setError(null);

    try {
      for (const [index, file] of files.entries()) {
        setStatus(`Compressing ${index + 1} of ${files.length}...`);
        const compressedFile = await compressAdminImage(file);

        setStatus(`Uploading ${index + 1} of ${files.length}...`);
        const target = await createHistoryPhotoUploadTargetAction({
          historyId,
          fileName: compressedFile.name,
        });
        const targetError = actionError(target);

        if (targetError) {
          throw new Error(targetError);
        }

        if (!("path" in target)) {
          throw new Error("Upload target was not created.");
        }

        const { error: uploadError } = await supabase.storage
          .from("photos")
          .uploadToSignedUrl(
            target.path,
            target.token,
            compressedFile
          );

        if (uploadError) {
          throw new Error(
            `Photo upload failed: ${uploadError.message}`
          );
        }

        const result = await createUploadedHistoryPhotoAction({
          historyId,
          photoUrl: target.publicUrl,
          title: title.trim() || null,
          description: description.trim() || null,
        });
        const saveError = actionError(result);

        if (saveError) {
          throw new Error(saveError);
        }
      }

      setStatus("Upload complete.");
      router.refresh();
      onClose();
    } catch (uploadError) {
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "Photo upload failed."
      );
      setStatus("");
    } finally {
      setPending(false);
      stopLoading();
      event.target.value = "";
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-neutral-950/85 px-3 py-4 backdrop-blur-sm sm:items-center sm:justify-center">
      <div className="max-h-full w-full max-w-lg overflow-y-auto rounded-lg border border-neutral-800 bg-neutral-950 p-4 shadow-2xl">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h3 className="font-semibold">Upload History Photo</h3>
          <button
            type="button"
            onClick={onClose}
            className={secondaryButtonClassName}
            disabled={pending}
          >
            Close
          </button>
        </div>

        <div className="space-y-4">
          <Field label="Photo title">
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className={inputClassName}
            />
          </Field>
          <Field label="Photo description">
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              className={textareaClassName}
            />
          </Field>
          <input
            ref={inputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={handleFiles}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={pending}
            className={secondaryButtonClassName}
          >
            Pick Photos
          </button>
          {status ? (
            <p className="text-sm text-neutral-500">{status}</p>
          ) : null}
          {error ? (
            <div className="rounded-md border border-red-950 bg-red-950/30 px-3 py-2 text-sm text-red-100">
              {error}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function HistoryPhotoEditorModal({
  historyId,
  historyPhoto,
  onClose,
}: {
  historyId: string;
  historyPhoto: HistoryPhotoWithPhoto;
  onClose: () => void;
}) {
  const action = updateHistoryPhotoAction.bind(
    null,
    historyId,
    historyPhoto.history_photo_id
  );
  const removeAction = removeHistoryPhotoAction.bind(
    null,
    historyId,
    historyPhoto.history_photo_id
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950/85 px-4 py-6 backdrop-blur-sm">
      <div className="max-h-full w-full max-w-2xl overflow-y-auto rounded-lg border border-neutral-800 bg-neutral-950 shadow-2xl">
        <div className="flex items-center justify-between border-b border-neutral-900 px-4 py-3">
          <h3 className="font-semibold">Edit history photo</h3>
          <button
            type="button"
            onClick={onClose}
            className={secondaryButtonClassName}
          >
            Close
          </button>
        </div>

        <div className="grid gap-5 p-4 md:grid-cols-[220px_1fr]">
          <a
            href={historyPhoto.photo.photo_url}
            target="_blank"
            rel="noreferrer"
            className="relative block aspect-square overflow-hidden rounded-md bg-neutral-900"
          >
            <Image
              src={historyPhoto.photo.photo_url}
              alt={historyPhoto.photo.title ?? "History photo"}
              fill
              unoptimized
              sizes="220px"
              className="object-cover"
            />
          </a>

          <div className="space-y-5">
            <AdminActionForm action={action} className="space-y-4">
              <AdminFormProgress />
              <Field label="Photo order">
                <input
                  name="sequence"
                  type="number"
                  min={1}
                  step={1}
                  defaultValue={historyPhoto.sequence || 1}
                  className={inputClassName}
                />
              </Field>
              <Field label="History photo note">
                <textarea
                  name="note"
                  defaultValue={historyPhoto.note ?? ""}
                  className={textareaClassName}
                />
              </Field>
              <AdminSubmitButton
                variant="secondary"
                pendingLabel="Saving..."
              >
                Save photo link
              </AdminSubmitButton>
            </AdminActionForm>

            <AdminActionForm action={removeAction}>
              <AdminSubmitButton
                variant="danger"
                pendingLabel="Removing..."
                confirmMessage="Remove this photo from the history record?"
              >
                Remove photo link
              </AdminSubmitButton>
            </AdminActionForm>
          </div>
        </div>
      </div>
    </div>
  );
}
