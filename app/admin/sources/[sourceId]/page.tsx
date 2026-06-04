import Link from "next/link";
import AdminShell from "@/components/AdminShell";
import SourceForm from "@/components/SourceForm";
import { updateSourceAction } from "@/lib/admin-actions";
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

  return (
    <AdminShell title="Edit Source">
      <SourceForm
        source={source}
        action={action}
        submitLabel="Save source"
      />
    </AdminShell>
  );
}
