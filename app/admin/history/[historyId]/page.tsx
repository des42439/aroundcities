import Link from "next/link";
import AdminActionForm from "@/components/AdminActionForm";
import AdminShell from "@/components/AdminShell";
import {
  secondaryButtonClassName,
} from "@/components/AdminForm";
import {
  AdminFormProgress,
  AdminSubmitButton,
} from "@/components/AdminSubmitButton";
import HistoryPhotoManager from "@/components/HistoryPhotoManager";
import HistoryRecordForm from "@/components/HistoryRecordForm";
import HistorySourcesManager from "@/components/HistorySourcesManager";
import {
  deleteHistoryRecordAction,
  updateHistoryRecordAction,
} from "@/lib/admin-actions";
import { requireAdmin } from "@/lib/admin-auth";
import {
  getFeedsForHistoryPhotoPicker,
  getHistoryRecordById,
} from "@/lib/history";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{
    historyId: string;
  }>;
};

export default async function EditHistoryRecordPage({
  params,
}: Props) {
  await requireAdmin();
  const { historyId } = await params;
  const [record, feeds] = await Promise.all([
    getHistoryRecordById(historyId),
    getFeedsForHistoryPhotoPicker(),
  ]);

  if (!record) {
    return (
      <AdminShell title="History Record Not Found">
        <p className="text-neutral-500">
          This history record does not exist.
        </p>
        <Link
          href="/admin/history"
          className="mt-6 inline-flex text-sm text-neutral-300 hover:text-white"
        >
          Back to History
        </Link>
      </AdminShell>
    );
  }

  return (
    <AdminShell title="Edit History Record">
      <div className="space-y-8">
        <Link href="/admin/history" className={secondaryButtonClassName}>
          Back to History
        </Link>

        <HistoryRecordForm
          record={record}
          action={updateHistoryRecordAction.bind(
            null,
            record.history_id
          )}
        />

        <section className="space-y-4 border-t border-neutral-900 pt-8">
          <h2 className="text-xl font-semibold">Sources</h2>
          <HistorySourcesManager
            historyId={record.history_id}
            sources={record.history_sources}
          />
        </section>

        <section className="space-y-4 border-t border-neutral-900 pt-8">
          <h2 className="text-xl font-semibold">Photos</h2>
          <HistoryPhotoManager
            historyId={record.history_id}
            historyPhotos={record.history_photos}
            feeds={feeds}
          />
        </section>

        <section className="border-t border-neutral-900 pt-8">
          <AdminActionForm
            action={deleteHistoryRecordAction.bind(
              null,
              record.history_id
            )}
          >
            <AdminFormProgress />
            <AdminSubmitButton
              variant="danger"
              pendingLabel="Deleting..."
              confirmMessage="Delete this history record?"
            >
              Delete History Record
            </AdminSubmitButton>
          </AdminActionForm>
        </section>
      </div>
    </AdminShell>
  );
}
