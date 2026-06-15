"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import {
  createAlbumPhotoUploadTargetAction,
  createPhotoAlbumAction,
  createUploadedAlbumPhotoAction,
} from "@/lib/admin-actions";
import { compressAdminImage } from "@/lib/client-image-compression";
import { extractPhotoMetadata } from "@/lib/photo-metadata";
import { supabase } from "@/lib/supabase";
import {
  Field,
  inputClassName,
  primaryButtonClassName,
  textareaClassName,
} from "./AdminForm";

type SaveState = {
  error: string | null;
  pending: boolean;
  message: string;
};

export default function NewPhotoAlbumForm() {
  const router = useRouter();
  const [state, setState] = useState<SaveState>({
    error: null,
    pending: false,
    message: "",
  });

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);
    const title = formData.get("title")?.toString().trim() ?? "";
    const description =
      formData.get("description")?.toString().trim() ?? "";
    const files = formData
      .getAll("photos")
      .filter(
        (item): item is File =>
          item instanceof File && item.size > 0
      );

    setState({
      error: null,
      pending: true,
      message: "Creating album...",
    });

    try {
      const album = await createPhotoAlbumAction({
        title,
        description,
      });
      const albumError = errorMessage(album);

      if (albumError) {
        throw new Error(albumError);
      }

      if (!("albumId" in album)) {
        throw new Error("Album was not created.");
      }

      for (const [index, file] of files.entries()) {
        setState({
          error: null,
          pending: true,
          message: `Reading photo metadata ${index + 1} of ${files.length}...`,
        });
        const metadata = await extractPhotoMetadata(file);

        setState({
          error: null,
          pending: true,
          message: `Compressing photo ${index + 1} of ${files.length}...`,
        });
        const compressedFile = await compressAdminImage(file);

        setState({
          error: null,
          pending: true,
          message: `Uploading photo ${index + 1} of ${files.length}...`,
        });
        const target = await createAlbumPhotoUploadTargetAction({
          albumId: album.albumId,
          fileName: compressedFile.name,
        });
        const targetError = errorMessage(target);

        if (targetError) {
          throw new Error(targetError);
        }

        if (!("path" in target)) {
          throw new Error("Album photo upload target was not created.");
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

        const photoRecord = await createUploadedAlbumPhotoAction({
          albumId: album.albumId,
          photoUrl: target.publicUrl,
          sequence: index + 1,
          capturedAt: metadata.capturedAt,
          latitude: metadata.latitude,
          longitude: metadata.longitude,
        });
        const photoError = errorMessage(photoRecord);

        if (photoError) {
          throw new Error(photoError);
        }
      }

      setState({
        error: null,
        pending: true,
        message: "Opening album...",
      });
      router.push(`/admin/photos/${album.albumId}`);
      router.refresh();
    } catch (error) {
      setState({
        error:
          error instanceof Error
            ? error.message
            : "Album could not be created.",
        pending: false,
        message: "",
      });
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {state.pending ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950/80 px-4 backdrop-blur-sm">
          <div
            role="status"
            aria-live="polite"
            className="w-full max-w-sm rounded-lg border border-neutral-800 bg-neutral-950 p-6 text-center shadow-2xl"
          >
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-neutral-700 border-t-neutral-100" />
            <p className="mt-4 font-medium text-neutral-100">
              {state.message}
            </p>
          </div>
        </div>
      ) : null}

      {state.error ? (
        <div className="rounded-md border border-red-950 bg-red-950/30 px-3 py-2 text-sm text-red-100">
          {state.error}
        </div>
      ) : null}

      <Field label="Title">
        <input
          name="title"
          required
          disabled={state.pending}
          className={inputClassName}
        />
      </Field>

      <Field label="Description">
        <textarea
          name="description"
          disabled={state.pending}
          className={textareaClassName}
        />
      </Field>

      <Field label="Photos">
        <input
          name="photos"
          type="file"
          multiple
          accept="image/*"
          disabled={state.pending}
          className={inputClassName}
        />
      </Field>

      <button
        type="submit"
        disabled={state.pending}
        className={primaryButtonClassName}
      >
        Create Album
      </button>
    </form>
  );
}

function errorMessage(result: unknown) {
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
