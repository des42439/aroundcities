import Link from "next/link";
import AdminShell from "@/components/AdminShell";
import LeadForm from "@/components/LeadForm";
import { secondaryButtonClassName } from "@/components/AdminForm";
import { requireAdmin } from "@/lib/admin-auth";
import { createLeadAction } from "@/lib/leads-actions";

export const dynamic = "force-dynamic";

export default async function NewLeadPage() {
  await requireAdmin();

  return (
    <AdminShell title="New Lead">
      <div className="mb-5">
        <Link href="/admin/leads" className={secondaryButtonClassName}>
          Back to Leads
        </Link>
      </div>

      <LeadForm
        action={createLeadAction}
        submitLabel="Create Lead"
        pendingLabel="Creating..."
      />
    </AdminShell>
  );
}
