import AutoSlugFields from "./AutoSlugFields";
import AdminActionForm, {
  AdminActionState,
} from "./AdminActionForm";
import {
  Field,
  inputClassName,
  textareaClassName,
} from "./AdminForm";
import { AdminSubmitButton } from "./AdminSubmitButton";
import { Place } from "@/types/database";

type Props = {
  place?: Place | null;
  action: (
    state: AdminActionState,
    formData: FormData
  ) => Promise<AdminActionState>;
  submitLabel: string;
};

export default function PlaceForm({
  place,
  action,
  submitLabel,
}: Props) {
  return (
    <AdminActionForm action={action} className="space-y-6">
      <AutoSlugFields
        sourceLabel="Name"
        sourceName="name"
        initialSource={place?.name ?? ""}
        initialSlug={place?.slug ?? ""}
      />

      <Field label="Description">
        <textarea
          name="description"
          defaultValue={place?.description ?? ""}
          className={textareaClassName}
        />
      </Field>

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Latitude">
          <input
            name="latitude"
            type="number"
            step="any"
            defaultValue={place?.latitude ?? ""}
            className={inputClassName}
          />
        </Field>

        <Field label="Longitude">
          <input
            name="longitude"
            type="number"
            step="any"
            defaultValue={place?.longitude ?? ""}
            className={inputClassName}
          />
        </Field>
      </div>

      <AdminSubmitButton pendingLabel="Saving...">
        {submitLabel}
      </AdminSubmitButton>
    </AdminActionForm>
  );
}
