import Link from "next/link";
import AdminShell from "@/components/AdminShell";
import {
  primaryButtonClassName,
  secondaryButtonClassName,
} from "@/components/AdminForm";
import HistoryRecordFilterSelect from "@/components/HistoryRecordFilterSelect";
import { requireAdmin } from "@/lib/admin-auth";
import { formatDate } from "@/lib/format";
import {
  ensureDailyHistoryTasks,
  getDailyHistoryTaskTag,
  getHistoryRecords,
  getHistoryStatusCounts,
  type HistoryRecordFilter,
} from "@/lib/history";
import type { HistoryStatus } from "@/types/database";

export const dynamic = "force-dynamic";

type HistoryPageProps = {
  searchParams?: Promise<{
    view?: string | string[];
  }>;
};

function getHistoryFilterParam(value?: string | string[]): HistoryRecordFilter {
  const view = Array.isArray(value) ? value[0] : value;

  if (
    view === "all" ||
    view === "drafted" ||
    view === "researched" ||
    view === "pending_review" ||
    view === "published" ||
    view === "archived"
  ) {
    return view;
  }

  return "daily";
}

export default async function HistoryPage({
  searchParams,
}: HistoryPageProps) {
  await requireAdmin();
  const params = await searchParams;
  const filter = getHistoryFilterParam(params?.view);
  const todayTag = getDailyHistoryTaskTag();

  await ensureDailyHistoryTasks(todayTag);

  const [records, statusCounts] = await Promise.all([
    getHistoryRecords(filter, todayTag),
    getHistoryStatusCounts(),
  ]);
  const dailyTaskCount =
    filter === "daily"
      ? records.length
      : (await getHistoryRecords("daily", todayTag)).length;

  return (
    <AdminShell title="History">
      <div className="mb-5 space-y-4">
        <div className="flex flex-wrap gap-3">
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
          <Link
            href="/admin/history/export"
            className={secondaryButtonClassName}
          >
            Export History
          </Link>
        </div>

        <div className="flex flex-col gap-3 border-b border-neutral-900 pb-5">
          <div className="grid gap-2 sm:grid-cols-5">
            {statusCounts.map((item) => (
              <div
                key={item.status}
                className="rounded-md border border-neutral-900 px-3 py-2"
              >
                <div className="text-xs text-neutral-500">
                  {historyStatusLabel(item.status)}
                </div>
                <div className="mt-1 text-lg font-semibold text-neutral-100">
                  {item.count}
                </div>
              </div>
            ))}
          </div>
          <HistoryRecordFilterSelect
            filter={filter}
            basePath="/admin/history"
          />
          {filter === "daily" ? (
            <div>
              <h2 className="text-lg font-semibold text-neutral-100">
                Today&apos;s History Research Tasks
              </h2>
              <p className="mt-1 text-sm text-neutral-500">
                {dailyTaskCount} tasks remaining today
              </p>
            </div>
          ) : null}
        </div>
      </div>

      {records.length === 0 ? (
        <p className="rounded-lg border border-neutral-900 p-4 text-sm text-neutral-500">
          {filter === "daily"
            ? "No daily history tasks remaining today."
            : "No history records found for this view."}
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
                <span className={historyStatusBadgeClassName(record.status)}>
                  {historyStatusLabel(record.status)}
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

function historyStatusLabel(status: HistoryStatus) {
  const labels: Record<HistoryStatus, string> = {
    drafted: "Drafted",
    researched: "Researched",
    pending_review: "Pending Review",
    published: "Published",
    archived: "Archived",
  };

  return labels[status];
}

function historyStatusBadgeClassName(status: HistoryStatus) {
  const base = "rounded-full border px-2 py-1";
  const colors: Record<HistoryStatus, string> = {
    drafted: "border-neutral-800 text-neutral-300",
    researched: "border-sky-950 bg-sky-950/30 text-sky-100",
    pending_review:
      "border-amber-950 bg-amber-950/30 text-amber-100",
    published:
      "border-emerald-950 bg-emerald-950/30 text-emerald-100",
    archived: "border-neutral-800 bg-neutral-900 text-neutral-400",
  };

  return `${base} ${colors[status]}`;
}
