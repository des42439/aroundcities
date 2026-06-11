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
  title: string;
  description: string;
  eventDate: string;
  placeName: string;
  sourceNote: string;
  confidence: string;
};

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function object(value: unknown) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function parsePreview(jsonText: string): PreviewRecord[] {
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

  if (importObject.version !== "aroundcities_history_import_v1") {
    throw new Error(
      "Import version must be aroundcities_history_import_v1."
    );
  }

  if (!Array.isArray(importObject.records)) {
    throw new Error("JSON must include a records array.");
  }

  return importObject.records.map((item, index) => {
    const record = object(item);
    const title = text(record?.title);
    const eventYear = Number(record?.event_year);
    const eventMonth = Number(record?.event_month);
    const eventDay = Number(record?.event_day);
    const confidence = text(record?.confidence) || "medium";

    if (!title) {
      throw new Error(`Record ${index + 1} is missing title.`);
    }

    if (eventMonth < 1 || eventMonth > 12) {
      throw new Error(
        `Record ${index + 1} event_month must be between 1 and 12.`
      );
    }

    if (eventDay < 1 || eventDay > 31) {
      throw new Error(
        `Record ${index + 1} event_day must be between 1 and 31.`
      );
    }

    if (!["high", "medium", "low"].includes(confidence)) {
      throw new Error(
        `Record ${index + 1} confidence must be high, medium, or low.`
      );
    }

    return {
      title,
      description: text(record?.description),
      eventDate: `${eventYear}-${String(eventMonth).padStart(
        2,
        "0"
      )}-${String(eventDay).padStart(2, "0")}`,
      placeName: text(record?.place_name),
      sourceNote: text(record?.source_note),
      confidence,
    };
  });
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
  const [preview, setPreview] = useState<PreviewRecord[] | null>(null);
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
            Successfully imported {saveResult.createdCount} history
            record{saveResult.createdCount === 1 ? "" : "s"}.
          </p>
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
          <h2 className="text-lg font-semibold">
            Preview ({preview.length})
          </h2>
          {preview.map((record, index) => (
            <article
              key={`${record.title}-${index}`}
              className="space-y-3 rounded-md border border-neutral-800 bg-neutral-950 p-4"
            >
              <div className="text-xs text-neutral-500">
                Record {index + 1}
              </div>
              <h3 className="text-lg font-semibold">
                {record.title}
              </h3>
              <dl className="space-y-2 text-sm">
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
