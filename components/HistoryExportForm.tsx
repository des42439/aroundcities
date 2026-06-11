"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Field,
  inputClassName,
  primaryButtonClassName,
  secondaryButtonClassName,
  textareaClassName,
} from "./AdminForm";
import {
  generateHistoryResearchExportAction,
  HistoryResearchExportResult,
} from "@/lib/admin-actions";

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

export default function HistoryExportForm() {
  const [excludeTag, setExcludeTag] = useState("research:done");
  const [itemCount, setItemCount] = useState("10");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copyMessage, setCopyMessage] = useState<string | null>(null);
  const [exportResult, setExportResult] =
    useState<HistoryResearchExportResult | null>(null);

  async function handleGenerate() {
    setPending(true);
    setError(null);
    setCopyMessage(null);
    setExportResult(null);

    try {
      const result = await generateHistoryResearchExportAction({
        excludeTag,
        itemCount: Number(itemCount),
      });
      const actionError = serverError(result);

      if (actionError) {
        setError(actionError);
        return;
      }

      setExportResult(result as HistoryResearchExportResult);
    } catch (generateError) {
      setError(
        generateError instanceof Error
          ? generateError.message
          : "History export could not be generated."
      );
    } finally {
      setPending(false);
    }
  }

  async function handleCopy() {
    if (!exportResult) {
      return;
    }

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(exportResult.jsonText);
      } else {
        fallbackCopy(exportResult.jsonText);
      }

      setCopyMessage("Copied JSON.");
      setError(null);
    } catch {
      try {
        fallbackCopy(exportResult.jsonText);
        setCopyMessage("Copied JSON.");
        setError(null);
      } catch {
        setCopyMessage(null);
        setError("JSON could not be copied by this browser.");
      }
    }
  }

  function handleDownload() {
    if (!exportResult) {
      return;
    }

    const blob = new Blob([exportResult.jsonText], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = exportResult.filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-sm text-neutral-400">
        <p>
          Export draft history records as JSON for ChatGPT research or
          history library analysis.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Exclude Tag">
          <input
            value={excludeTag}
            onChange={(event) => setExcludeTag(event.target.value)}
            className={inputClassName}
          />
        </Field>
        <Field label="Item Count">
          <input
            type="number"
            min="1"
            max="10000"
            value={itemCount}
            onChange={(event) => setItemCount(event.target.value)}
            className={inputClassName}
          />
        </Field>
      </div>

      {error ? (
        <div className="rounded-md border border-red-950 bg-red-950/30 px-3 py-2 text-sm text-red-100">
          {error}
        </div>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={handleGenerate}
          disabled={pending}
          className={primaryButtonClassName}
        >
          {pending ? "Generating..." : "Generate Export"}
        </button>
        <Link href="/admin/history" className={secondaryButtonClassName}>
          Back To History
        </Link>
      </div>

      {exportResult ? (
        <div className="space-y-4">
          <p className="text-sm text-neutral-300">
            Matching record count: {exportResult.count}
          </p>
          <textarea
            readOnly
            value={exportResult.jsonText}
            className={`${textareaClassName} min-h-96 font-mono text-sm`}
          />
          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={handleCopy}
              className={secondaryButtonClassName}
            >
              Copy JSON
            </button>
            <button
              type="button"
              onClick={handleDownload}
              className={secondaryButtonClassName}
            >
              Download JSON
            </button>
          </div>
          {copyMessage ? (
            <p className="text-sm text-emerald-300">{copyMessage}</p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function fallbackCopy(text: string) {
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "true");
  textarea.style.position = "fixed";
  textarea.style.left = "-9999px";
  document.body.appendChild(textarea);
  textarea.select();

  const copied = document.execCommand("copy");
  textarea.remove();

  if (!copied) {
    throw new Error("Copy command failed.");
  }
}
