import Link from "next/link";
import {
  primaryButtonClassName,
} from "@/components/AdminForm";
import AdminShell from "@/components/AdminShell";
import SourceList from "@/components/SourceList";
import SourceViewFilter from "@/components/SourceViewFilter";
import { requireAdmin } from "@/lib/admin-auth";
import { getSources, type SourceListView } from "@/lib/sources";

export const dynamic = "force-dynamic";

type AdminSourcesPageProps = {
  searchParams?: Promise<{
    view?: string | string[];
  }>;
};

function getViewParam(value?: string | string[]): SourceListView {
  const view = Array.isArray(value) ? value[0] : value;

  return view === "all" ? "all" : "pending";
}

export default async function AdminSourcesPage({
  searchParams,
}: AdminSourcesPageProps) {
  await requireAdmin();
  const params = await searchParams;
  const view = getViewParam(params?.view);
  const sources = await getSources(view);

  return (
    <AdminShell title="Sources">
      <div className="space-y-6">
        <div className="flex flex-col gap-4 border-b border-neutral-900 pb-5">
          <Link
            href="/admin/sources/new"
            className={`${primaryButtonClassName} w-fit`}
          >
            Create New Source
          </Link>

          <SourceViewFilter view={view} />
        </div>

        <SourceList
          sources={sources}
          view={view}
          emptyText={
            view === "pending"
              ? "No pending sources. Everything has been checked in the past 3 days."
              : "No sources yet."
          }
        />
      </div>
    </AdminShell>
  );
}
