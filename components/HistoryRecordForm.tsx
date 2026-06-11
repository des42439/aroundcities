"use client";

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
        <input
          name="source_url"
          type="url"
          defaultValue={record?.source_url ?? ""}
          className={inputClassName}
        />
      </Field>

      <Field label="Source note">
        <textarea
          name="source_note"
          defaultValue={record?.source_note ?? ""}
          className={textareaClassName}
        />
      </Field>

      <Field label="Source screenshot URL">
        <input
          name="source_screenshot_url"
          type="url"
          defaultValue={record?.source_screenshot_url ?? ""}
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
