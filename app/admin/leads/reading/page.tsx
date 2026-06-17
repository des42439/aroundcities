import Link from "next/link";
import AdminShell from "@/components/AdminShell";
import LeadReadingMode from "@/components/LeadReadingMode";
import { secondaryButtonClassName } from "@/components/AdminForm";
import { requireAdmin } from "@/lib/admin-auth";
import { getLeads } from "@/lib/leads";

export const dynamic = "force-dynamic";

export default async function LeadReadingPage() {
  await requireAdmin();
  const leads = await getLeads("active");

  return (
    <AdminShell title="Lead Reading Mode">
      <div className="mb-5">
        <Link href="/admin/leads" className={secondaryButtonClassName}>
          Back to Leads
        </Link>
      </div>
      <LeadReadingMode leads={leads} />
    </AdminShell>
  );
}
