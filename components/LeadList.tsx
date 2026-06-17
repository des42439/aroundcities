"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  inputClassName,
  secondaryButtonClassName,
} from "./AdminForm";
import type { Lead } from "@/types/database";

type Props = {
  leads: Lead[];
  emptyText: string;
};

export default function LeadList({ leads, emptyText }: Props) {
  const [search, setSearch] = useState("");
  const normalizedSearch = search.trim().toLowerCase();
  const visibleLeads = useMemo(
    () =>
      leads.filter((lead) => {
        if (!normalizedSearch) {
          return true;
        }

        return [
          lead.title,
          lead.source_name,
          lead.source_type,
          lead.source_page,
          lead.source_section,
          lead.lead_content,
          lead.why_interesting,
          lead.lead_type,
          lead.place_name,
          ...(lead.tags ?? []),
        ]
          .filter(Boolean)
          .some((value) =>
            String(value).toLowerCase().includes(normalizedSearch)
          );
      }),
    [normalizedSearch, leads]
  );

  return (
    <div className="space-y-5">
      <label className="block max-w-xl">
        <span className="text-sm text-neutral-400">Search</span>
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search leads"
          className={`${inputClassName} mt-2`}
        />
      </label>

      {visibleLeads.length === 0 ? (
        <p className="text-neutral-500">{emptyText}</p>
      ) : (
        <div className="space-y-3">
          {visibleLeads.map((lead) => (
            <article
              key={lead.lead_id}
              className="rounded-lg border border-neutral-900 p-4"
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="min-w-0">
                  <h2 className="text-lg font-semibold">
                    {lead.title}
                  </h2>
                  <p className="mt-1 text-sm text-neutral-500">
                    {lead.source_name || "No source"} ·{" "}
                    {formatDate(lead.updated_at)} ·{" "}
                    {lead.status === "archived"
                      ? "Archived"
                      : "Active"}
                  </p>
                </div>

                <Link
                  href={`/admin/leads/${lead.lead_id}`}
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

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-MY", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Kuching",
  }).format(new Date(value));
}
