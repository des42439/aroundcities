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
import { createDraftFeedWithPhotosAction } from "@/lib/admin-actions";
import { ADMIN_UPLOAD_MAX_BYTES } from "@/lib/upload-limits";

export default function NewFeedDraftForm() {
  return (
    <AdminActionForm
      action={createDraftFeedWithPhotosAction}
      className="space-y-6"
      maxFileBytes={ADMIN_UPLOAD_MAX_BYTES}
      maxFileBytesMessage="Selected photos are too large for this upload. Please add smaller or compressed photos, or create the draft first and upload photos one at a time."
    >
      <AdminFormProgress />

      <Field label="Title">
        <input
          name="title"
          required
          className={inputClassName}
        />
      </Field>

      <Field label="Content / description">
        <textarea
          name="content"
          className={textareaClassName}
        />
      </Field>

      <Field label="Photos">
        <input
          name="photos"
          type="file"
          multiple
          accept="image/*"
          className={inputClassName}
        />
      </Field>

      <AdminSubmitButton pendingLabel="Saving...">
        Save draft
      </AdminSubmitButton>
    </AdminActionForm>
  );
}
