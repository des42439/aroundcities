"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  inputClassName,
  secondaryButtonClassName,
} from "./AdminForm";
import { useGlobalLoading } from "./GlobalLoading";
import { markSourceCheckedAction } from "@/lib/admin-actions";
import type { SourceChecklist } from "@/types/database";

export default function SourceList({
  sources,
  emptyText,
  view,
}: {
  sources: SourceChecklist[];
  emptyText: string;
  view: "pending" | "all";
}) {
  const [visibleSourceItems, setVisibleSourceItems] = useState(sources);
  const [search, setSearch] = useState("");
  const [pendingSourceId, setPendingSourceId] = useState<string | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const { startLoading, stopLoading } = useGlobalLoading();
  const normalizedSearch = search.trim().toLowerCase();
  const visibleSources = useMemo(
    () =>
      visibleSourceItems.filter((source) => {
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
    [normalizedSearch, visibleSourceItems]
  );

  async function handleMarkChecked(sourceId: string) {
    setPendingSourceId(sourceId);
    setError(null);
    startLoading();

    try {
      const result = await markSourceCheckedAction(sourceId, {
        error: null,
      });

      if (result?.error) {
        setError(result.error);
        return;
      }

      if (view === "pending") {
        setVisibleSourceItems((current) =>
          current.filter((source) => source.source_id !== sourceId)
        );
      } else {
        const checkedAt = new Date().toISOString();
        setVisibleSourceItems((current) =>
          current.map((source) =>
            source.source_id === sourceId
              ? { ...source, last_checked_at: checkedAt }
              : source
          )
        );
      }
    } catch (markError) {
      setError(
        markError instanceof Error
          ? markError.message
          : "Source could not be marked checked."
      );
    } finally {
      setPendingSourceId(null);
      stopLoading();
    }
  }

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

      {error ? (
        <div className="rounded-md border border-red-950 bg-red-950/30 px-3 py-2 text-sm text-red-100">
          {error}
        </div>
      ) : null}

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

                <div className="flex shrink-0 flex-wrap gap-2">
                  <Link
                    href={`/admin/sources/${source.source_id}`}
                    className={`${secondaryButtonClassName} justify-center`}
                  >
                    Edit
                  </Link>
                  <button
                    type="button"
                    onClick={() =>
                      handleMarkChecked(source.source_id)
                    }
                    disabled={pendingSourceId !== null}
                    className={secondaryButtonClassName}
                  >
                    {pendingSourceId === source.source_id
                      ? "Marking..."
                      : "Mark Checked"}
                  </button>
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${secondaryButtonClassName} justify-center`}
                  >
                    Open Source
                  </a>
                </div>
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
