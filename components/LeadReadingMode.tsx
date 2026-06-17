"use client";

import { useState } from "react";
import {
  secondaryButtonClassName,
} from "./AdminForm";
import { useGlobalLoading } from "./GlobalLoading";
import { archiveLeadAction } from "@/lib/leads-actions";
import type { Lead } from "@/types/database";

type Props = {
  leads: Lead[];
};

export default function LeadReadingMode({ leads }: Props) {
  const [visibleLeads, setVisibleLeads] = useState(leads);
  const [error, setError] = useState<string | null>(null);
  const [pendingLeadId, setPendingLeadId] = useState<string | null>(null);
  const { startLoading, stopLoading } = useGlobalLoading();

  async function handleArchive(leadId: string) {
    setPendingLeadId(leadId);
    setError(null);
    startLoading();

    try {
      const result = await archiveLeadAction(leadId);

      if (result?.error) {
        setError(result.error);
        return;
      }

      setVisibleLeads((current) =>
        current.filter((lead) => lead.lead_id !== leadId)
      );
    } catch (archiveError) {
      setError(
        archiveError instanceof Error
          ? archiveError.message
          : "Lead could not be archived."
      );
    } finally {
      setPendingLeadId(null);
      stopLoading();
    }
  }

  if (visibleLeads.length === 0) {
    return (
      <p className="text-neutral-500">
        No active leads in Reading Mode.
      </p>
    );
  }

  return (
    <div className="space-y-5">
      {error ? (
        <div className="rounded-md border border-red-950 bg-red-950/30 px-3 py-2 text-sm text-red-100">
          {error}
        </div>
      ) : null}

      {visibleLeads.map((lead) => (
        <article
          key={lead.lead_id}
          className="space-y-5 rounded-lg border border-neutral-900 p-5"
        >
          <h2 className="text-xl font-semibold">{lead.title}</h2>

          <div className="grid gap-4 text-sm sm:grid-cols-2">
            <ReadingField label="Source Name" value={lead.source_name} />
            <ReadingField label="Source Type" value={lead.source_type} />
            <ReadingField label="Source Page" value={lead.source_page} />
            <ReadingField
              label="Source Section"
              value={lead.source_section}
            />
          </div>

          <ReadingField label="Source Note" value={lead.source_note} />
          <ReadingField label="Lead Content" value={lead.lead_content} />
          <ReadingField
            label="Why Interesting"
            value={lead.why_interesting}
          />

          <div className="border-t border-neutral-900 pt-5">
            <button
              type="button"
              onClick={() => handleArchive(lead.lead_id)}
              disabled={pendingLeadId !== null}
              className={secondaryButtonClassName}
            >
              {pendingLeadId === lead.lead_id
                ? "Archiving..."
                : "Archive"}
            </button>
          </div>
        </article>
      ))}
    </div>
  );
}

function ReadingField({
  label,
  value,
}: {
  label: string;
  value?: string | null;
}) {
  return (
    <div>
      <div className="text-xs text-neutral-500">{label}</div>
      <div className="mt-1 whitespace-pre-wrap text-neutral-200">
        {value || "Not provided"}
      </div>
    </div>
  );
}
