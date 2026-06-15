"use client";

import Link from "next/link";
import { useState } from "react";
import {
  primaryButtonClassName,
  secondaryButtonClassName,
  textareaClassName,
} from "./AdminForm";
import {
  HistoryImportResult,
  importHistoryRecordsAction,
} from "@/lib/admin-actions";

type PreviewRecord = {
  historyId: string;
  title: string;
  description: string;
  eventDate: string;
  placeName: string;
  sourceNote: string;
  sourceCount: number;
  confidence: string;
};

type PreviewResult = {
  version: string;
  records: PreviewRecord[];
};

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function object(value: unknown) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
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

  if (
    importObject.version !== "aroundcities_history_import_v1" &&
    importObject.version !== "aroundcities_history_update_v1" &&
    importObject.version !== "aroundcities_history_research_update_v2"
  ) {
    throw new Error(
      "Import version must be aroundcities_history_import_v1, aroundcities_history_update_v1, or aroundcities_history_research_update_v2."
    );
  }

  if (!Array.isArray(importObject.records)) {
    throw new Error("JSON must include a records array.");
  }

  return {
    version: String(importObject.version),
    records: importObject.records.map((item, index) => {
      const record = object(item);
      const title = text(record?.title);
      const isCreateImport =
        importObject.version === "aroundcities_history_import_v1";
      const isResearchUpdate =
        importObject.version ===
        "aroundcities_history_research_update_v2";
      const eventYear = Number(record?.event_year);
      const eventMonth = Number(record?.event_month);
      const eventDay = Number(record?.event_day);
      const confidence = text(record?.confidence) || "medium";

      if (isCreateImport && !title) {
        throw new Error(`Record ${index + 1} is missing title.`);
      }

      if (isCreateImport && !Number.isInteger(eventYear)) {
        throw new Error(
          `Record ${index + 1} event_year must be a whole number.`
        );
      }

      if (
        isCreateImport &&
        (!Number.isInteger(eventMonth) ||
          eventMonth < 1 ||
          eventMonth > 12)
      ) {
        throw new Error(
          `Record ${index + 1} event_month must be between 1 and 12.`
        );
      }

      if (
        isCreateImport &&
        (!Number.isInteger(eventDay) ||
          eventDay < 1 ||
          eventDay > 31)
      ) {
        throw new Error(
          `Record ${index + 1} event_day must be between 1 and 31.`
        );
      }

      if (
        (isCreateImport || isResearchUpdate) &&
        !["high", "medium", "low"].includes(confidence)
      ) {
        throw new Error(
          `Record ${index + 1} confidence must be high, medium, or low.`
        );
      }

      if (
        isResearchUpdate &&
        (!Array.isArray(record?.sources) ||
          record.sources.some(
            (source) => !text(object(source)?.source_url)
          ))
      ) {
        throw new Error(
          `Record ${index + 1} sources must include source_url.`
        );
      }

      return {
        historyId: text(record?.history_id),
        title,
        description: text(record?.description),
        eventDate:
          Number.isFinite(eventYear) &&
          Number.isFinite(eventMonth) &&
          Number.isFinite(eventDay)
            ? `${eventYear}-${String(eventMonth).padStart(
                2,
                "0"
              )}-${String(eventDay).padStart(2, "0")}`
            : "Invalid date fields",
        placeName: text(record?.place_name),
        sourceNote: text(record?.source_note),
        sourceCount: Array.isArray(record?.sources)
          ? record.sources.length
          : 0,
        confidence,
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

export default function HistoryImportForm() {
  const [jsonText, setJsonText] = useState("");
  const [preview, setPreview] = useState<PreviewResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [saveResult, setSaveResult] =
    useState<HistoryImportResult | null>(null);

  function handlePreview() {
    setSaveResult(null);

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
    }
  }

  async function handleSave() {
    if (!preview) {
      return;
    }

    setPending(true);
    setError(null);
    setSaveResult(null);

    try {
      const result = await importHistoryRecordsAction({ jsonText });
      const actionError = serverError(result);

      if (actionError) {
        setError(actionError);
        return;
      }

      setJsonText("");
      setPreview(null);
      setSaveResult(result as HistoryImportResult);
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "History records could not be saved."
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-6">
      <textarea
        value={jsonText}
        onChange={(event) => {
          setJsonText(event.target.value);
          setPreview(null);
          setSaveResult(null);
          setError(null);
        }}
        placeholder='{"version":"aroundcities_history_import_v1","records":[]}'
        className={`${textareaClassName} min-h-80 font-mono text-sm`}
      />

      {error ? (
        <div className="rounded-md border border-red-950 bg-red-950/30 px-3 py-2 text-sm text-red-100">
          {error}
        </div>
      ) : null}

      {saveResult ? (
        <div className="space-y-3 rounded-md border border-emerald-950 bg-emerald-950/30 px-3 py-3 text-sm text-emerald-100">
          <p>
            {saveResult.mode === "update"
              ? `Successfully updated ${saveResult.updatedCount} history record${
                  saveResult.updatedCount === 1 ? "" : "s"
                }. Skipped ${saveResult.skippedCount} record${
                  saveResult.skippedCount === 1 ? "" : "s"
                }.`
              : saveResult.mode === "research_update"
                ? `Successfully updated ${saveResult.updatedCount} history record${
                    saveResult.updatedCount === 1 ? "" : "s"
                  }, inserted ${saveResult.sourcesInsertedCount} source${
                    saveResult.sourcesInsertedCount === 1 ? "" : "s"
                  }, and updated ${saveResult.sourcesUpdatedCount} source${
                    saveResult.sourcesUpdatedCount === 1 ? "" : "s"
                  }. Skipped ${saveResult.skippedCount} record${
                    saveResult.skippedCount === 1 ? "" : "s"
                  }.`
              : `Successfully imported ${
                  saveResult.createdCount
                } history record${
                  saveResult.createdCount === 1 ? "" : "s"
                }.`}
          </p>
          {saveResult.skipped.length ? (
            <div className="space-y-2 text-red-100">
              <p>Skipped:</p>
              <ul className="list-disc space-y-1 pl-5">
                {saveResult.skipped.map((reason, index) => (
                  <li key={`${reason}-${index}`}>{reason}</li>
                ))}
              </ul>
            </div>
          ) : null}
          <Link
            href="/admin/history"
            className="inline-block underline underline-offset-4"
          >
            Go To History List
          </Link>
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
            {pending ? "Importing..." : "Import Records"}
          </button>
        ) : null}
      </div>

      {preview ? (
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold">
              Preview ({preview.records.length})
            </h2>
            <p className="mt-1 text-sm text-neutral-500">
              Version: {preview.version}
            </p>
          </div>
          {preview.records.map((record, index) => (
            <article
              key={`${record.historyId || record.title}-${index}`}
              className="space-y-3 rounded-md border border-neutral-800 bg-neutral-950 p-4"
            >
              <div className="text-xs text-neutral-500">
                Record {index + 1}
              </div>
              <h3 className="text-lg font-semibold">
                {record.title || "Untitled"}
              </h3>
              <dl className="space-y-2 text-sm">
                {record.historyId ? (
                  <PreviewRow
                    label="History ID"
                    value={record.historyId}
                  />
                ) : null}
                <PreviewRow label="Event date" value={record.eventDate} />
                <PreviewRow
                  label="Description"
                  value={record.description}
                />
                <PreviewRow
                  label="Place"
                  value={record.placeName}
                />
                <PreviewRow
                  label="Source note"
                  value={record.sourceNote}
                />
                {preview.version ===
                "aroundcities_history_research_update_v2" ? (
                  <PreviewRow
                    label="Sources"
                    value={String(record.sourceCount)}
                  />
                ) : null}
                <PreviewRow
                  label="Confidence"
                  value={record.confidence}
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
