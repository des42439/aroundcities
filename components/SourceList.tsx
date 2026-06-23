"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  inputClassName,
  secondaryButtonClassName,
} from "./AdminForm";
import type { SourceChecklist } from "@/types/database";

export default function SourceList({
  sources,
  emptyText,
}: {
  sources: SourceChecklist[];
  emptyText: string;
}) {
  const [search, setSearch] = useState("");
  const normalizedSearch = search.trim().toLowerCase();
  const visibleSources = useMemo(
    () =>
      sources.filter((source) => {
        if (!normalizedSearch) {
          return true;
        }

        return (
          source.name.toLowerCase().includes(normalizedSearch) ||
          source.url.toLowerCase().includes(normalizedSearch) ||
          (source.notes ?? "")
            .toLowerCase()
            .includes(normalizedSearch)
        );
      }),
    [normalizedSearch, sources]
  );

  return (
    <div className="space-y-5">
      <label className="block max-w-xl">
        <span className="text-sm text-neutral-400">Search</span>
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search sources"
          className={`${inputClassName} mt-2`}
        />
      </label>

      {visibleSources.length === 0 ? (
        <p className="text-neutral-500">{emptyText}</p>
      ) : (
        <div className="space-y-3">
          {visibleSources.map((source) => (
            <article
              key={source.source_id}
              className="rounded-lg border border-neutral-900 p-4"
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="min-w-0">
                  <h2 className="text-lg font-semibold">
                    {source.name}
                  </h2>
                  <p className="mt-1 break-all text-sm text-sky-300">
                    {source.url}
                  </p>
                  {source.notes ? (
                    <p className="mt-3 whitespace-pre-wrap text-sm text-neutral-300">
                      {source.notes}
                    </p>
                  ) : null}
                  <p className="mt-3 text-sm text-neutral-500">
                    {formatLastChecked(source.last_checked_at)}
                  </p>
                </div>

                <Link
                  href={`/admin/sources/${source.source_id}`}
                  className={`${secondaryButtonClassName} shrink-0 justify-center`}
                >
                  Edit
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

function formatLastChecked(value?: string | null) {
  if (!value) {
    return "Never checked";
  }

  return new Intl.DateTimeFormat("en-MY", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "Asia/Kuching",
  }).format(new Date(value));
}
