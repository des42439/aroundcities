import AdminShell from "@/components/AdminShell";
import SourceForm from "@/components/SourceForm";
import { createSourceAction } from "@/lib/admin-actions";
import { requireAdmin } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export default async function NewSourcePage() {
  await requireAdmin();

  return (
    <AdminShell title="New Source">
      <SourceForm
        action={createSourceAction}
        submitLabel="Add source"
        pendingLabel="Adding..."
      />
    </AdminShell>
  );
}
