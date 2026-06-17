import Link from "next/link";
import AdminShell from "@/components/AdminShell";
import LeadImportForm from "@/components/LeadImportForm";
import { secondaryButtonClassName } from "@/components/AdminForm";
import { requireAdmin } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export default async function ImportLeadsPage() {
  await requireAdmin();

  return (
    <AdminShell title="Import Leads">
      <div className="mb-5">
        <Link href="/admin/leads" className={secondaryButtonClassName}>
          Back to Leads
        </Link>
      </div>
      <LeadImportForm />
    </AdminShell>
  );
}
