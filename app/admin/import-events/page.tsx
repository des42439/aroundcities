"use client";

import { useState } from "react";
import AdminLayout from "@/components/AdminLayout";

export default function ImportEventsPage() {
  const [jsonText, setJsonText] = useState("");
  const [formattedJson, setFormattedJson] = useState("");
  const [error, setError] = useState("");

  function handleValidate() {
    try {
      const parsed = JSON.parse(jsonText);

      setFormattedJson(
        JSON.stringify(parsed, null, 2)
      );

      setError("");
    } catch {
      setError("Invalid JSON");
      setFormattedJson("");
    }
  }

  return (
    <AdminLayout title="Import Events">
      <div className="space-y-6">
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
          <label className="mb-2 block text-sm text-neutral-400">
            Paste Event JSON
          </label>

          <textarea
            value={jsonText}
            onChange={(e) =>
              setJsonText(e.target.value)
            }
            className="h-80 w-full rounded-xl border border-neutral-700 bg-neutral-950 p-4 outline-none"
          />

          <div className="mt-4 flex gap-3">
            <button
              onClick={handleValidate}
              className="rounded-lg bg-blue-600 px-4 py-2 font-medium hover:bg-blue-500"
            >
              Validate JSON
            </button>
          </div>

          {error && (
            <div className="mt-4 rounded-lg border border-red-900 bg-red-950 p-3 text-red-300">
              {error}
            </div>
          )}
        </div>

        {formattedJson && (
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
            <h2 className="mb-4 text-xl font-semibold">
              Preview
            </h2>

            <pre className="overflow-auto rounded-xl bg-neutral-950 p-4 text-sm">
              {formattedJson}
            </pre>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}