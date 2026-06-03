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

export default function NewFeedDraftForm() {
  return (
    <form
      action={createDraftFeedWithPhotosAction}
      className="space-y-6"
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
    </form>
  );
}
