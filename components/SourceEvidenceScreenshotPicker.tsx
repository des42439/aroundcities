"use client";

import { ChangeEvent, useRef, useState } from "react";
import {
  createSourceScreenshotUploadTargetAction,
} from "@/lib/admin-actions";
import { compressAdminImage } from "@/lib/client-image-compression";
import { supabase } from "@/lib/supabase";
import {
  inputClassName,
  secondaryButtonClassName,
} from "./AdminForm";

type Props = {
  feedId: string;
  onPendingChange: (pending: boolean) => void;
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

export default function SourceEvidenceScreenshotPicker({
  feedId,
  onPendingChange,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [screenshotUrl, setScreenshotUrl] = useState("");
  const [fileName, setFileName] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleFileChange(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    setError(null);
    setScreenshotUrl("");
    setFileName("");

    if (!file) {
      return;
    }

    onPendingChange(true);

    try {
      setStatus("Compressing screenshot...");
      const compressedFile = await compressAdminImage(file);

      setStatus("Uploading screenshot...");
      const target =
        await createSourceScreenshotUploadTargetAction({
          feedId,
          fileName: compressedFile.name,
        });
      const targetError = errorMessage(target);

      if (targetError) {
        throw new Error(targetError);
      }

      if (!("path" in target)) {
        throw new Error("Screenshot upload target was not created.");
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
          `Screenshot upload failed: ${uploadError.message}`
        );
      }

      setScreenshotUrl(target.publicUrl);
      setFileName(compressedFile.name);
      setStatus("Screenshot ready.");
    } catch (uploadError) {
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "Screenshot upload failed."
      );
      setStatus("");
    } finally {
      onPendingChange(false);
      event.target.value = "";
    }
  }

  return (
    <div className="space-y-3">
      <input
        name="screenshot_url"
        type="hidden"
        value={screenshotUrl}
      />
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className={secondaryButtonClassName}
        >
          Pick Screenshot
        </button>

        {screenshotUrl ? (
          <a
            href={screenshotUrl}
            target="_blank"
            rel="noreferrer"
            className="break-all text-sm text-neutral-300 underline underline-offset-4"
          >
            {fileName || "Uploaded screenshot"}
          </a>
        ) : (
          <input
            value={status}
            readOnly
            placeholder="No screenshot selected"
            className={inputClassName}
          />
        )}
      </div>

      {error ? (
        <div className="rounded-md border border-red-950 bg-red-950/30 px-3 py-2 text-sm text-red-100">
          {error}
        </div>
      ) : null}
    </div>
  );
}
