"use client";

import { useState } from "react";

export default function DraftEventImportPage() {
  const [jsonText, setJsonText] = useState("");
  const [previewEvents, setPreviewEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  function handlePreview() {
    try {
      setMessage("");

      const parsed = JSON.parse(jsonText);

      if (!Array.isArray(parsed)) {
        setMessage("JSON must be an array");
        return;
      }

      setPreviewEvents(parsed);
    } catch (err: any) {
      setMessage(err.message);
    }
  }

  async function handleSave() {
    try {
      setLoading(true);
      setMessage("");

      const res = await fetch("/api/admin/draft-events/import", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          events: previewEvents,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        setMessage(result.error || "Failed to import");
        return;
      }

      setMessage(
        `Successfully imported ${result.inserted} draft events`
      );

      setJsonText("");
      setPreviewEvents([]);
    } catch (err: any) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">
          Draft Event JSON Import
        </h1>

        <textarea
          value={jsonText}
          onChange={(e) => setJsonText(e.target.value)}
          placeholder="Paste AI-generated JSON here..."
          className="w-full h-80 bg-zinc-900 border border-zinc-700 rounded-xl p-4 text-sm font-mono"
        />

        <div className="flex gap-4 mt-4">
          <button
            onClick={handlePreview}
            className="bg-blue-600 hover:bg-blue-700 px-5 py-3 rounded-xl font-medium"
          >
            Preview Import
          </button>

          {previewEvents.length > 0 && (
            <button
              onClick={handleSave}
              disabled={loading}
              className="bg-green-600 hover:bg-green-700 px-5 py-3 rounded-xl font-medium disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save Draft Events"}
            </button>
          )}
        </div>

        {message && (
          <div className="mt-4 p-4 rounded-xl bg-zinc-900 border border-zinc-700">
            {message}
          </div>
        )}

        {previewEvents.length > 0 && (
          <div className="mt-10">
            <h2 className="text-2xl font-semibold mb-4">
              Preview ({previewEvents.length} events)
            </h2>

            <div className="grid gap-4">
              {previewEvents.map((event, index) => (
                <div
                  key={index}
                  className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold">
                      {event.title || "Untitled Event"}
                    </h3>

                    <span className="text-xs px-3 py-1 rounded-full bg-zinc-800">
                      {event.confidence || "medium"}
                    </span>
                  </div>

                  <div className="mt-3 text-sm text-zinc-400 space-y-1">
                    <div>
                      Category: {event.category || "-"}
                    </div>

                    <div>
                      City: {event.city || "Kuching"}
                    </div>

                    <div>
                      Venue: {event.venue || "-"}
                    </div>

                    <div>
                      Organizer: {event.organizer || "-"}
                    </div>

                    <div>
                      Start Time: {event.start_time || "-"}
                    </div>
                  </div>

                  {event.description && (
                    <p className="mt-4 text-zinc-300 text-sm line-clamp-4">
                      {event.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}