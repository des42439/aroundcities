"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Field,
  inputClassName,
  primaryButtonClassName,
  textareaClassName,
} from "./AdminForm";
import {
  createDraftFeedOnlyAction,
  createPhotoUploadTargetAction,
  createUploadedPhotoRecordAction,
} from "@/lib/admin-actions";
import { supabase } from "@/lib/supabase";

type SaveState = {
  error: string | null;
  pending: boolean;
  message: string;
};

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

export default function NewFeedDraftForm() {
  const router = useRouter();
  const [state, setState] = useState<SaveState>({
    error: null,
    pending: false,
    message: "",
  });

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);
    const title = formData.get("title")?.toString().trim() ?? "";
    const content =
      formData.get("content")?.toString().trim() ?? "";
    const files = formData
      .getAll("photos")
      .filter(
        (item): item is File =>
          item instanceof File && item.size > 0
      );

    setState({
      error: null,
      pending: true,
      message: "Creating draft...",
    });

    try {
      const draft = await createDraftFeedOnlyAction({
        title,
        content,
      });
      const draftError = errorMessage(draft);

      if (draftError) {
        throw new Error(draftError);
      }

      if (!("feedId" in draft)) {
        throw new Error("Draft feed was not created.");
      }

      for (const [index, file] of files.entries()) {
        setState({
          error: null,
          pending: true,
          message: `Uploading photo ${index + 1} of ${files.length}...`,
        });

        const target = await createPhotoUploadTargetAction({
          feedId: draft.feedId,
          fileName: file.name,
        });
        const targetError = errorMessage(target);

        if (targetError) {
          throw new Error(targetError);
        }

        if (!("path" in target)) {
          throw new Error("Photo upload target was not created.");
        }

        const { error: uploadError } = await supabase.storage
          .from("photos")
          .uploadToSignedUrl(target.path, target.token, file);

        if (uploadError) {
          throw new Error(
            `Photo upload failed: ${uploadError.message}`
          );
        }

        const photoRecord =
          await createUploadedPhotoRecordAction({
            feedId: draft.feedId,
            photoUrl: target.publicUrl,
            featured: index === 0,
          });
        const photoRecordError = errorMessage(photoRecord);

        if (photoRecordError) {
          throw new Error(photoRecordError);
        }
      }

      setState({
        error: null,
        pending: true,
        message: "Opening draft...",
      });
      router.push(`/admin/feeds/${draft.feedId}`);
      router.refresh();
    } catch (error) {
      setState({
        error:
          error instanceof Error
            ? error.message
            : "Something went wrong. Please try again.",
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

      <Field label="Content / description">
        <textarea
          name="content"
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
        Save draft
      </button>
    </form>
  );
}
