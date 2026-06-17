"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  primaryButtonClassName,
  secondaryButtonClassName,
  textareaClassName,
} from "./AdminForm";
import { useGlobalLoading } from "./GlobalLoading";
import { importLeadsAction } from "@/lib/leads-actions";

type PreviewLead = {
  title: string;
  sourceName: string;
  sourceType: string;
  leadType: string;
  placeName: string;
  relevantDate: string;
  tags: string[];
};

type PreviewResult = {
  items: PreviewLead[];
};

function object(value: unknown) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function parsePreview(jsonText: string): PreviewResult {
  let payload: unknown;

  try {
    payload = JSON.parse(jsonText);
  } catch {
    throw new Error("JSON could not be parsed.");
  }

  const importObject = object(payload);

  if (!importObject) {
    throw new Error("JSON must be an object.");
  }

  if (importObject.version !== "aroundcities_leads_import_v1") {
    throw new Error(
      "Import version must be aroundcities_leads_import_v1."
    );
  }

  if (!Array.isArray(importObject.items)) {
    throw new Error("JSON must include an items array.");
  }

  return {
    items: importObject.items.map((item, index) => {
      const lead = object(item);
      const title = text(lead?.title);

      if (!title) {
        throw new Error(`Lead ${index + 1} is missing title.`);
      }

      const relevantDate = text(lead?.relevant_date);

      if (
        relevantDate &&
        !/^\d{4}-\d{2}-\d{2}$/.test(relevantDate)
      ) {
        throw new Error(
          `Lead ${index + 1} relevant_date must use YYYY-MM-DD.`
        );
      }

      return {
        title,
        sourceName: text(lead?.source_name),
        sourceType: text(lead?.source_type),
        leadType: text(lead?.lead_type),
        placeName: text(lead?.place_name),
        relevantDate,
        tags: Array.isArray(lead?.tags)
          ? lead.tags.filter(
              (tag): tag is string => typeof tag === "string"
            )
          : [],
      };
    }),
  };
}

function serverError(result: unknown) {
  if (
    result &&
    typeof result === "object" &&
    "error" in result &&
    typeof result.error === "string"
  ) {
    return result.error;
  }

  return null;
}

export default function LeadImportForm() {
  const router = useRouter();
  const { startLoading, stopLoading } = useGlobalLoading();
  const [jsonText, setJsonText] = useState("");
  const [preview, setPreview] = useState<PreviewResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  function handlePreview() {
    startLoading();

    try {
      setPreview(parsePreview(jsonText));
      setError(null);
    } catch (previewError) {
      setPreview(null);
      setError(
        previewError instanceof Error
          ? previewError.message
          : "Import JSON is invalid."
      );
    } finally {
      stopLoading();
    }
  }

  async function handleSave() {
    if (!preview) {
      return;
    }

    setPending(true);
    setError(null);
    startLoading();
    let navigated = false;

    try {
      const result = await importLeadsAction({ jsonText });
      const actionError = serverError(result);

      if (actionError) {
        setError(actionError);
        return;
      }

      router.push("/admin/leads");
      router.refresh();
      navigated = true;
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Leads could not be imported."
      );
    } finally {
      setPending(false);
      if (!navigated) {
        stopLoading();
      }
    }
  }

  return (
    <div className="space-y-6">
      <textarea
        value={jsonText}
        onChange={(event) => {
          setJsonText(event.target.value);
          setPreview(null);
          setError(null);
        }}
        placeholder='{"version":"aroundcities_leads_import_v1","items":[]}'
        className={`${textareaClassName} min-h-80 font-mono text-sm`}
      />

      {error ? (
        <div className="rounded-md border border-red-950 bg-red-950/30 px-3 py-2 text-sm text-red-100">
          {error}
        </div>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={handlePreview}
          disabled={pending || !jsonText.trim()}
          className={secondaryButtonClassName}
        >
          Preview
        </button>
        {preview ? (
          <button
            type="button"
            onClick={handleSave}
            disabled={pending}
            className={primaryButtonClassName}
          >
            {pending ? "Importing..." : "Save Leads"}
          </button>
        ) : null}
      </div>

      {preview ? (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">
            Preview ({preview.items.length})
          </h2>

          {preview.items.map((lead, index) => (
            <article
              key={`${lead.title}-${index}`}
              className="space-y-3 rounded-md border border-neutral-800 bg-neutral-950 p-4"
            >
              <div className="text-xs text-neutral-500">
                Lead {index + 1}
              </div>
              <h3 className="text-lg font-semibold">{lead.title}</h3>
              <dl className="grid gap-3 text-sm sm:grid-cols-2">
                <PreviewRow label="Source" value={lead.sourceName} />
                <PreviewRow label="Source Type" value={lead.sourceType} />
                <PreviewRow label="Lead Type" value={lead.leadType} />
                <PreviewRow label="Place" value={lead.placeName} />
                <PreviewRow
                  label="Relevant Date"
                  value={lead.relevantDate}
                />
                <PreviewRow
                  label="Tags"
                  value={lead.tags.join(", ")}
                />
              </dl>
            </article>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function PreviewRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <dt className="text-neutral-500">{label}</dt>
      <dd className="mt-0.5 whitespace-pre-wrap text-neutral-200">
        {value || "Not provided"}
      </dd>
    </div>
  );
}
