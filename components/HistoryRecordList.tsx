"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  inputClassName,
  secondaryButtonClassName,
} from "./AdminForm";
import { formatDate } from "@/lib/format";
import type { HistoryRecord, HistoryStatus } from "@/types/database";

export default function HistoryRecordList({
  records,
  emptyText,
}: {
  records: HistoryRecord[];
  emptyText: string;
}) {
  const [search, setSearch] = useState("");
  const normalizedSearch = search.trim().toLowerCase();
  const visibleRecords = useMemo(
    () =>
      records.filter((record) => {
        if (!normalizedSearch) {
          return true;
        }

        return (
          record.title.toLowerCase().includes(normalizedSearch) ||
          (record.description ?? "")
            .toLowerCase()
            .includes(normalizedSearch) ||
          (record.place_name ?? "")
            .toLowerCase()
            .includes(normalizedSearch) ||
          record.tags.some((tag) =>
            tag.toLowerCase().includes(normalizedSearch)
          )
        );
      }),
    [normalizedSearch, records]
  );

  return (
    <div className="space-y-5">
      <label className="block max-w-xl">
        <span className="text-sm text-neutral-400">Search</span>
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search history records"
          className={`${inputClassName} mt-2`}
        />
      </label>

      {visibleRecords.length === 0 ? (
        <p className="rounded-lg border border-neutral-900 p-4 text-sm text-neutral-500">
          {emptyText}
        </p>
      ) : (
        <div className="space-y-3">
          {visibleRecords.map((record) => (
            <article
              key={record.history_id}
              className="flex flex-col gap-4 rounded-lg border border-neutral-900 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <h2 className="font-semibold text-neutral-100">
                  {record.title}
                </h2>
                <div className="mt-2 flex flex-wrap gap-2 text-xs text-neutral-500">
                  <span>
                    {record.event_year}-
                    {String(record.event_month).padStart(2, "0")}-
                    {String(record.event_day).padStart(2, "0")}
                  </span>
                  <span className={historyStatusBadgeClassName(record.status)}>
                    {historyStatusLabel(record.status)}
                  </span>
                  <span>Created {formatDate(record.created_at)}</span>
                </div>
              </div>
              <Link
                href={`/admin/history/${record.history_id}`}
                className={`${secondaryButtonClassName} justify-center`}
              >
                Edit
              </Link>
            </article>
          ))}
        </div>
      )}
    </div>
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
