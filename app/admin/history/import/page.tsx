import Link from "next/link";
import AdminShell from "@/components/AdminShell";
import { secondaryButtonClassName } from "@/components/AdminForm";
import HistoryImportForm from "@/components/HistoryImportForm";
import { requireAdmin } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export default async function ImportHistoryPage() {
  await requireAdmin();

  return (
    <AdminShell title="Import History">
      <div className="mb-5">
        <Link href="/admin/history" className={secondaryButtonClassName}>
          Back to History
        </Link>
      </div>
      <HistoryImportForm />
    </AdminShell>
  );
}
