import AdminActionForm, {
  AdminActionState,
} from "./AdminActionForm";
import {
  Field,
  inputClassName,
  textareaClassName,
} from "./AdminForm";
import { AdminSubmitButton } from "./AdminSubmitButton";
import { SourceChecklist } from "@/types/database";

type Props = {
  source?: SourceChecklist | null;
  action: (
    state: AdminActionState,
    formData: FormData
  ) => Promise<AdminActionState>;
  submitLabel: string;
  pendingLabel?: string;
};

export default function SourceForm({
  source,
  action,
  submitLabel,
  pendingLabel = "Saving...",
}: Props) {
  return (
    <AdminActionForm action={action} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Name">
          <input
            name="name"
            required
            defaultValue={source?.name ?? ""}
            className={inputClassName}
          />
        </Field>

        <Field label="URL">
          <input
            name="url"
            type="url"
            required
            defaultValue={source?.url ?? ""}
            className={inputClassName}
          />
        </Field>
      </div>

      <Field label="Notes">
        <textarea
          name="notes"
          defaultValue={source?.notes ?? ""}
          className={textareaClassName}
        />
      </Field>

      <AdminSubmitButton pendingLabel={pendingLabel}>
        {submitLabel}
      </AdminSubmitButton>
    </AdminActionForm>
  );
}
