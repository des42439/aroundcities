import Link from "next/link";
import AdminActionForm from "@/components/AdminActionForm";
import AdminShell from "@/components/AdminShell";
import {
  secondaryButtonClassName,
} from "@/components/AdminForm";
import { AdminSubmitButton } from "@/components/AdminSubmitButton";
import SourceForm from "@/components/SourceForm";
import {
  deleteSourceAction,
  markSourceCheckedAction,
  updateSourceAction,
} from "@/lib/admin-actions";
import { requireAdmin } from "@/lib/admin-auth";
import { getSourceById } from "@/lib/sources";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{
    sourceId: string;
  }>;
};

export default async function EditSourcePage({
  params,
}: Props) {
  await requireAdmin();
  const { sourceId } = await params;
  const source = await getSourceById(sourceId);

  if (!source) {
    return (
      <AdminShell title="Source Not Found">
        <p className="text-neutral-500">
          This source does not exist.
        </p>
        <Link
          href="/admin/sources"
          className="mt-6 inline-flex text-sm text-neutral-300 hover:text-white"
        >
          Back to sources
        </Link>
      </AdminShell>
    );
  }

  const action = updateSourceAction.bind(
    null,
    source.source_id
  );
  const markCheckedAction = markSourceCheckedAction.bind(
    null,
    source.source_id
  );
  const deleteAction = deleteSourceAction.bind(
    null,
    source.source_id
  );

  return (
    <AdminShell title="Edit Source">
      <div className="space-y-8">
        <div className="flex flex-wrap gap-3">
          <a
            href={source.url}
            target="_blank"
            rel="noopener noreferrer"
            className={secondaryButtonClassName}
          >
            Open Source
          </a>
          <AdminActionForm action={markCheckedAction}>
            <AdminSubmitButton
              pendingLabel="Marking..."
              variant="secondary"
            >
              Mark Checked
            </AdminSubmitButton>
          </AdminActionForm>
        </div>

        <SourceForm
          source={source}
          action={action}
          submitLabel="Save"
        />

        <section className="border-t border-neutral-900 pt-8">
          <AdminActionForm action={deleteAction}>
            <AdminSubmitButton
              pendingLabel="Deleting..."
              variant="danger"
              confirmMessage={`Delete ${source.name}?`}
            >
              Delete Source
            </AdminSubmitButton>
          </AdminActionForm>
        </section>
      </div>
    </AdminShell>
  );
}
