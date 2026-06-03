import AutoSlugFields from "./AutoSlugFields";
import {
  Field,
  inputClassName,
  primaryButtonClassName,
  textareaClassName,
} from "./AdminForm";
import { Place } from "@/types/database";

type Props = {
  place?: Place | null;
  action: (formData: FormData) => void | Promise<void>;
  submitLabel: string;
};

export default function PlaceForm({
  place,
  action,
  submitLabel,
}: Props) {
  return (
    <form action={action} className="space-y-6">
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

      <button
        type="submit"
        className={primaryButtonClassName}
      >
        {submitLabel}
      </button>
    </form>
  );
}
