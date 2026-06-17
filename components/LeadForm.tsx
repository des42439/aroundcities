import AdminActionForm from "./AdminActionForm";
import {
  Field,
  inputClassName,
  selectClassName,
  textareaClassName,
} from "./AdminForm";
import { AdminSubmitButton } from "./AdminSubmitButton";
import type { Lead } from "@/types/database";
import type { LeadActionState } from "@/lib/leads-actions";

type Props = {
  lead?: Lead | null;
  action: (
    state: LeadActionState,
    formData: FormData
  ) => Promise<LeadActionState>;
  submitLabel: string;
  pendingLabel?: string;
  showStatus?: boolean;
};

export default function LeadForm({
  lead,
  action,
  submitLabel,
  pendingLabel = "Saving...",
  showStatus = false,
}: Props) {
  return (
    <AdminActionForm action={action} className="space-y-6">
      <section className="space-y-4">
        <Field label="Title">
          <input
            name="title"
            required
            defaultValue={lead?.title ?? ""}
            className={inputClassName}
          />
        </Field>

        <Field label="Lead Content">
          <textarea
            name="lead_content"
            defaultValue={lead?.lead_content ?? ""}
            className={textareaClassName}
          />
        </Field>

        <Field label="Why Interesting">
          <textarea
            name="why_interesting"
            defaultValue={lead?.why_interesting ?? ""}
            className={textareaClassName}
          />
        </Field>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <Field label="Source Name">
          <input
            name="source_name"
            defaultValue={lead?.source_name ?? ""}
            className={inputClassName}
          />
        </Field>

        <Field label="Source Type">
          <input
            name="source_type"
            defaultValue={lead?.source_type ?? ""}
            className={inputClassName}
          />
        </Field>

        <Field label="Source URL">
          <input
            name="source_url"
            type="url"
            defaultValue={lead?.source_url ?? ""}
            className={inputClassName}
          />
        </Field>

        <Field label="Source Page">
          <input
            name="source_page"
            defaultValue={lead?.source_page ?? ""}
            className={inputClassName}
          />
        </Field>

        <Field label="Source Section">
          <input
            name="source_section"
            defaultValue={lead?.source_section ?? ""}
            className={inputClassName}
          />
        </Field>

        <Field label="Source Note">
          <textarea
            name="source_note"
            defaultValue={lead?.source_note ?? ""}
            className={`${textareaClassName} min-h-28`}
          />
        </Field>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <Field label="Lead Type">
          <input
            name="lead_type"
            defaultValue={lead?.lead_type ?? ""}
            className={inputClassName}
          />
        </Field>

        <Field label="Place Name">
          <input
            name="place_name"
            defaultValue={lead?.place_name ?? ""}
            className={inputClassName}
          />
        </Field>

        <Field label="Relevant Date">
          <input
            name="relevant_date"
            type="date"
            defaultValue={lead?.relevant_date ?? ""}
            className={inputClassName}
          />
        </Field>

        <Field label="Tags">
          <input
            name="tags"
            defaultValue={(lead?.tags ?? []).join(", ")}
            className={inputClassName}
          />
        </Field>

        {showStatus ? (
          <Field label="Status">
            <select
              name="status"
              defaultValue={lead?.status ?? "active"}
              className={selectClassName}
            >
              <option value="active">Active</option>
              <option value="archived">Archived</option>
            </select>
          </Field>
        ) : null}
      </section>

      <AdminSubmitButton pendingLabel={pendingLabel}>
        {submitLabel}
      </AdminSubmitButton>
    </AdminActionForm>
  );
}
