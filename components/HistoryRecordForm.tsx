"use client";

import { ChangeEvent, useRef, useState } from "react";
import { createHistorySourceScreenshotUploadTargetAction } from "@/lib/admin-actions";
import { compressAdminImage } from "@/lib/client-image-compression";
import { supabase } from "@/lib/supabase";
import AdminActionForm, {
  AdminActionState,
} from "./AdminActionForm";
import {
  Field,
  inputClassName,
  secondaryButtonClassName,
  selectClassName,
  textareaClassName,
} from "./AdminForm";
import {
  AdminFormProgress,
  AdminSubmitButton,
} from "./AdminSubmitButton";
import { HistoryRecord } from "@/types/database";

type Props = {
  record?: HistoryRecord;
  action: (
    state: AdminActionState,
    formData: FormData
  ) => Promise<AdminActionState>;
};

export default function HistoryRecordForm({
  record,
  action,
}: Props) {
  const screenshotInputRef = useRef<HTMLInputElement>(null);
  const [sourceUrl, setSourceUrl] = useState(
    record?.source_url ?? ""
  );
  const [sourceScreenshotUrl, setSourceScreenshotUrl] =
    useState(record?.source_screenshot_url ?? "");
  const [screenshotUploadPending, setScreenshotUploadPending] =
    useState(false);
  const [screenshotStatus, setScreenshotStatus] = useState("");
  const [screenshotError, setScreenshotError] = useState<
    string | null
  >(null);
  const trimmedSourceUrl = sourceUrl.trim();

  async function handleScreenshotChange(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file || !record) {
      return;
    }

    setScreenshotUploadPending(true);
    setScreenshotStatus("Uploading screenshot...");
    setScreenshotError(null);

    try {
      const compressedFile = await compressAdminImage(file);
      const target =
        await createHistorySourceScreenshotUploadTargetAction({
          historyId: record.history_id,
          fileName: compressedFile.name,
        });

      if ("error" in target && target.error) {
        throw new Error(target.error);
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

      setSourceScreenshotUrl(target.publicUrl);
      setScreenshotStatus("");
    } catch (uploadError) {
      setScreenshotError(
        uploadError instanceof Error
          ? uploadError.message
          : "Screenshot upload failed."
      );
      setScreenshotStatus("");
    } finally {
      setScreenshotUploadPending(false);
      event.target.value = "";
    }
  }

  return (
    <AdminActionForm action={action} className="space-y-5">
      <AdminFormProgress />

      <Field label="Title">
        <input
          name="title"
          defaultValue={record?.title ?? ""}
          required
          className={inputClassName}
        />
      </Field>

      <Field label="Description">
        <textarea
          name="description"
          defaultValue={record?.description ?? ""}
          className={textareaClassName}
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Event year">
          <input
            name="event_year"
            type="number"
            required
            defaultValue={record?.event_year ?? ""}
            className={inputClassName}
          />
        </Field>
        <Field label="Event month">
          <input
            name="event_month"
            type="number"
            min={1}
            max={12}
            required
            defaultValue={record?.event_month ?? ""}
            className={inputClassName}
          />
        </Field>
        <Field label="Event day">
          <input
            name="event_day"
            type="number"
            min={1}
            max={31}
            required
            defaultValue={record?.event_day ?? ""}
            className={inputClassName}
          />
        </Field>
      </div>

      {record ? (
        <Field label="Status">
          <select
            name="status"
            defaultValue={record.status}
            className={selectClassName}
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>
        </Field>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Place name">
          <input
            name="place_name"
            defaultValue={record?.place_name ?? ""}
            className={inputClassName}
          />
        </Field>
        <Field label="Location note">
          <input
            name="location_note"
            defaultValue={record?.location_note ?? ""}
            className={inputClassName}
          />
        </Field>
      </div>

      <Field label="Tags">
        <input
          name="tags"
          defaultValue={record?.tags.join(", ") ?? ""}
          className={inputClassName}
        />
      </Field>

      <Field label="Source URL">
        <div className="space-y-3">
          <input
            name="source_url"
            type="url"
            value={sourceUrl}
            onChange={(event) => setSourceUrl(event.target.value)}
            className={inputClassName}
          />
          {trimmedSourceUrl ? (
            <a
              href={trimmedSourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`${secondaryButtonClassName} inline-flex w-full justify-center sm:w-auto`}
            >
              Go To Link
            </a>
          ) : (
            <button
              type="button"
              disabled
              className={`${secondaryButtonClassName} w-full sm:w-auto`}
            >
              Go To Link
            </button>
          )}
        </div>
      </Field>

      <Field label="Source note">
        <textarea
          name="source_note"
          defaultValue={record?.source_note ?? ""}
          className={textareaClassName}
        />
      </Field>

      <Field label="Source Screenshot">
        <div className="space-y-3">
          <input
            ref={screenshotInputRef}
            type="file"
            accept="image/*"
            onChange={handleScreenshotChange}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => screenshotInputRef.current?.click()}
            disabled={!record || screenshotUploadPending}
            className={`${secondaryButtonClassName} w-full sm:w-auto`}
          >
            Add Screenshot
          </button>

          {screenshotStatus ? (
            <p className="text-sm text-neutral-400">
              {screenshotStatus}
            </p>
          ) : null}

          {sourceScreenshotUrl ? (
            <img
              src={sourceScreenshotUrl}
              alt="Source screenshot preview"
              className="max-h-72 w-full rounded-md border border-neutral-800 object-contain"
            />
          ) : null}

          {screenshotError ? (
            <div className="rounded-md border border-red-950 bg-red-950/30 px-3 py-2 text-sm text-red-100">
              {screenshotError}
            </div>
          ) : null}
        </div>
      </Field>

      <Field label="Source Screenshot URL">
        <input
          name="source_screenshot_url"
          type="url"
          value={sourceScreenshotUrl}
          onChange={(event) =>
            setSourceScreenshotUrl(event.target.value)
          }
          className={inputClassName}
        />
      </Field>

      <Field label="Confidence">
        <select
          name="confidence"
          defaultValue={record?.confidence ?? "medium"}
          className={selectClassName}
        >
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </Field>

      <div className="flex flex-col gap-3 sm:flex-row">
        {record ? (
          <>
            <AdminSubmitButton
              name="status"
              value={record.status === "published" ? "published" : "draft"}
              variant="secondary"
              pendingLabel="Saving..."
            >
              {record.status === "published" ? "Save" : "Save Draft"}
            </AdminSubmitButton>
            {record.status !== "published" ? (
              <AdminSubmitButton
                name="status"
                value="published"
                pendingLabel="Publishing..."
              >
                Publish
              </AdminSubmitButton>
            ) : null}
            {record.status !== "archived" ? (
              <AdminSubmitButton
                name="status"
                value="archived"
                variant="secondary"
                pendingLabel="Archiving..."
                confirmMessage="Archive this history record?"
              >
                Archive
              </AdminSubmitButton>
            ) : null}
          </>
        ) : (
          <AdminSubmitButton pendingLabel="Creating...">
            Create Draft
          </AdminSubmitButton>
        )}
      </div>
    </AdminActionForm>
  );
}
