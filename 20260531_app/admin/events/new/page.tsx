"use client";

import Link from "next/link";
import { useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function NewEventPage() {
  const [jsonInput, setJsonInput] = useState("");
  const [preview, setPreview] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  function generatePreview() {
    try {
      const parsed = JSON.parse(jsonInput);
      setPreview(parsed);
    } catch {
      alert("Invalid JSON");
    }
  }

  async function createEvent() {
    if (!preview) return;

    setLoading(true);

    const { data: eventData, error } =
      await supabase
        .from("events")
        .insert(preview.event)
        .select()
        .single();

    if (error) {
      alert(error.message);
      setLoading(false);
      return;
    }

    const translations =
      preview.translations.map((t: any) => ({
        ...t,
        event_id: eventData.id,
      }));

    await supabase
      .from("event_translations")
      .insert(translations);

    if (preview.sessions?.length > 0) {
      const sessions =
        preview.sessions.map((s: any) => ({
          ...s,
          event_id: eventData.id,
        }));

      await supabase
        .from("event_sessions")
        .insert(sessions);
    }

    alert("Event created successfully");

    setJsonInput("");
    setPreview(null);

    setLoading(false);
  }

  return (
    <main className="max-w-5xl mx-auto p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10">
        <h1 className="text-4xl sm:text-6xl font-bold">
          Create Event
        </h1>

        <Link
          href="/admin/events"
          className="border border-zinc-700 bg-zinc-900 px-5 py-3 rounded-2xl"
        >
          ← Back
        </Link>
      </div>

      <textarea
        value={jsonInput}
        onChange={(e) =>
          setJsonInput(e.target.value)
        }
        placeholder="Paste AI-generated JSON here..."
        className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 w-full h-80 font-mono mb-6 text-zinc-200"
      />

      <div className="flex gap-4 mb-8">
        <button
          onClick={generatePreview}
          className="bg-white text-black px-5 py-3 rounded-2xl font-semibold"
        >
          Preview
        </button>

        {preview && (
          <button
            onClick={createEvent}
            disabled={loading}
            className="bg-green-500 text-black px-5 py-3 rounded-2xl font-semibold"
          >
            {loading
              ? "Creating..."
              : "Create Event"}
          </button>
        )}
      </div>

      {preview && (
        <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6">
          <h2 className="text-2xl font-bold mb-6">
            Preview
          </h2>

          <pre className="whitespace-pre-wrap text-sm overflow-auto text-zinc-300">
            {JSON.stringify(preview, null, 2)}
          </pre>
        </div>
      )}
    </main>
  );
}