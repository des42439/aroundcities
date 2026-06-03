import AdminActionForm from "./AdminActionForm";
import {
  AdminFormProgress,
  AdminSubmitButton,
} from "./AdminSubmitButton";
import { deleteFeedAction } from "@/lib/admin-actions";

type Props = {
  feedId: string;
};

export default function DeleteFeedForm({ feedId }: Props) {
  const action = deleteFeedAction.bind(null, feedId);

  return (
    <section className="border-t border-red-950/70 pt-8">
      <div className="max-w-xl space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-red-200">
            Delete feed
          </h2>
          <p className="mt-2 text-sm text-neutral-500">
            This removes the feed and its attached photo records. Places
            are not deleted.
          </p>
        </div>

        <AdminActionForm
          action={action}
          className="space-y-4"
        >
          <AdminFormProgress />
          <AdminSubmitButton
            variant="danger"
            pendingLabel="Deleting..."
            confirmMessage="Delete this feed? This cannot be undone."
          >
            Delete feed
          </AdminSubmitButton>
        </AdminActionForm>
      </div>
    </section>
  );
}
