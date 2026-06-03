import {
  Field,
  inputClassName,
  textareaClassName,
} from "./AdminForm";
import {
  AdminFormProgress,
  AdminSubmitButton,
} from "./AdminSubmitButton";
import { createPlaceForFeedAction } from "@/lib/admin-actions";

type Props = {
  feedId: string;
};

export default function InlinePlaceCreateForm({
  feedId,
}: Props) {
  const action = createPlaceForFeedAction.bind(
    null,
    feedId
  );

  return (
    <details className="rounded-lg border border-neutral-900 p-4">
      <summary className="cursor-pointer text-sm font-medium text-neutral-300">
        Add a new place
      </summary>

      <form action={action} className="mt-5 space-y-4">
        <AdminFormProgress />

        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Place name">
            <input
              name="name"
              required
              className={inputClassName}
            />
          </Field>

          <Field label="Slug">
            <input
              name="slug"
              placeholder="auto-generated if blank"
              className={inputClassName}
            />
          </Field>
        </div>

        <Field label="Description">
          <textarea
            name="description"
            className={textareaClassName}
          />
        </Field>

        <AdminSubmitButton pendingLabel="Saving...">
          Save place
        </AdminSubmitButton>
      </form>
    </details>
  );
}
