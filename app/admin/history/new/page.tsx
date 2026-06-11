import Link from "next/link";
import AdminShell from "@/components/AdminShell";
import { secondaryButtonClassName } from "@/components/AdminForm";
import HistoryRecordForm from "@/components/HistoryRecordForm";
import { createHistoryRecordAction } from "@/lib/admin-actions";
import { requireAdmin } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export default async function NewHistoryRecordPage() {
  await requireAdmin();

  return (
    <AdminShell title="New History Record">
      <div className="mb-5">
        <Link href="/admin/history" className={secondaryButtonClassName}>
          Back to History
        </Link>
      </div>
      <HistoryRecordForm action={createHistoryRecordAction} />
    </AdminShell>
  );
}
