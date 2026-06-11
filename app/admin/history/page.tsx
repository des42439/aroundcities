import Link from "next/link";
import AdminShell from "@/components/AdminShell";
import {
  primaryButtonClassName,
  secondaryButtonClassName,
} from "@/components/AdminForm";
import { requireAdmin } from "@/lib/admin-auth";
import { formatDate } from "@/lib/format";
import { getHistoryRecords } from "@/lib/history";

export const dynamic = "force-dynamic";

export default async function HistoryPage() {
  await requireAdmin();
  const records = await getHistoryRecords();

  return (
    <AdminShell title="History">
      <div className="mb-5 flex flex-wrap gap-3">
        <Link
          href="/admin/history/new"
          className={primaryButtonClassName}
        >
          New History Record
        </Link>
        <Link
          href="/admin/history/import"
          className={secondaryButtonClassName}
        >
          Import JSON
        </Link>
      </div>

      {records.length === 0 ? (
        <p className="rounded-lg border border-neutral-900 p-4 text-sm text-neutral-500">
          No history records yet.
        </p>
      ) : (
        <div className="space-y-3">
          {records.map((record) => (
            <Link
              key={record.history_id}
              href={`/admin/history/${record.history_id}`}
              className="block rounded-lg border border-neutral-900 p-4 hover:border-neutral-700"
            >
              <h2 className="font-semibold text-neutral-100">
                {record.title}
              </h2>
              <div className="mt-2 flex flex-wrap gap-2 text-xs text-neutral-500">
                <span>
                  {record.event_year}-{String(record.event_month).padStart(2, "0")}-
                  {String(record.event_day).padStart(2, "0")}
                </span>
                <span className="rounded-full border border-neutral-800 px-2 py-1 text-neutral-300">
                  {record.status}
                </span>
                <span>Created {formatDate(record.created_at)}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </AdminShell>
  );
}
