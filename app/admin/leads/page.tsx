import Link from "next/link";
import AdminShell from "@/components/AdminShell";
import LeadList from "@/components/LeadList";
import LeadViewFilter from "@/components/LeadViewFilter";
import {
  primaryButtonClassName,
  secondaryButtonClassName,
} from "@/components/AdminForm";
import { requireAdmin } from "@/lib/admin-auth";
import { getLeads, type LeadListView } from "@/lib/leads";

export const dynamic = "force-dynamic";

type Props = {
  searchParams?: Promise<{
    view?: string | string[];
  }>;
};

function getViewParam(value?: string | string[]): LeadListView {
  const view = Array.isArray(value) ? value[0] : value;

  if (view === "archived" || view === "all") {
    return view;
  }

  return "active";
}

export default async function AdminLeadsPage({
  searchParams,
}: Props) {
  await requireAdmin();
  const params = await searchParams;
  const view = getViewParam(params?.view);
  const leads = await getLeads(view);

  return (
    <AdminShell title="Leads">
      <div className="space-y-6">
        <div className="flex flex-col gap-4 border-b border-neutral-900 pb-5">
          <div className="flex flex-wrap gap-3">
            <Link
              href="/admin/leads/new"
              className={primaryButtonClassName}
            >
              Create New Lead
            </Link>
            <Link
              href="/admin/leads/import"
              className={secondaryButtonClassName}
            >
              Import
            </Link>
            <Link
              href="/admin/leads/reading"
              className={secondaryButtonClassName}
            >
              Reading Mode
            </Link>
          </div>

          <LeadViewFilter view={view} />
        </div>

        <LeadList
          leads={leads}
          emptyText={
            view === "active"
              ? "No active leads yet."
              : "No leads found for this view."
          }
        />
      </div>
    </AdminShell>
  );
}
