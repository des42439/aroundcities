import AdminShell from "@/components/AdminShell";
import EventImportForm from "@/components/EventImportForm";
import { requireAdmin } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export default async function ImportEventsPage() {
  await requireAdmin();

  return (
    <AdminShell title="Import Events">
      <EventImportForm />
    </AdminShell>
  );
}
