import AdminShell from "@/components/AdminShell";
import NewFeedDraftForm from "@/components/NewFeedDraftForm";
import { requireAdmin } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export default async function NewFeedPage() {
  await requireAdmin();

  return (
    <AdminShell title="New Feed">
      <NewFeedDraftForm />
    </AdminShell>
  );
}
