import AdminShell from "@/components/AdminShell";
import HistoryExportForm from "@/components/HistoryExportForm";
import { requireAdmin } from "@/lib/admin-auth";
import type { HistoryRecordFilter } from "@/lib/history";

export const dynamic = "force-dynamic";

type ExportHistoryPageProps = {
  searchParams?: Promise<{
    view?: string | string[];
  }>;
};

function getHistoryFilterParam(value?: string | string[]): HistoryRecordFilter {
  const view = Array.isArray(value) ? value[0] : value;

  if (
    view === "all" ||
    view === "published" ||
    view === "draft" ||
    view === "archived"
  ) {
    return view;
  }

  return "daily";
}

export default async function ExportHistoryPage({
  searchParams,
}: ExportHistoryPageProps) {
  await requireAdmin();
  const params = await searchParams;
  const filter = getHistoryFilterParam(params?.view);

  return (
    <AdminShell title="Export History">
      <HistoryExportForm initialFilter={filter} />
    </AdminShell>
  );
}
