import AdminShell from "@/components/AdminShell";
import HistoryExportForm from "@/components/HistoryExportForm";
import { requireAdmin } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export default async function ExportHistoryPage() {
  await requireAdmin();

  return (
    <AdminShell title="Export History">
      <HistoryExportForm />
    </AdminShell>
  );
}
