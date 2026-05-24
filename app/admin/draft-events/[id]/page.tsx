"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function DraftEventDetailPage() {
  const params = useParams();
  const router = useRouter();

  const [event, setEvent] = useState<any>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [converting, setConverting] = useState(false);

  const [message, setMessage] = useState("");

  const [sources, setSources] = useState<any[]>([]);

  const [newSource, setNewSource] = useState({
    source_type: "newspaper",
    source_reference: "",
    source_page: "",
    source_notes: "",
    source_image_url: "",
    source_date: "",
  });

  useEffect(() => {
    fetchDraftEvent();
    fetchSources();
  }, []);

  async function fetchDraftEvent() {
    try {
      const res = await fetch(
        `/api/admin/draft-events/${params.id}`
      );

      const result = await res.json();

      if (!res.ok) {
        setMessage(result.error || "Failed to load event");
        return;
      }

      setEvent(result.data);
    } catch (err: any) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function fetchSources() {
    try {
      const res = await fetch(
        `/api/admin/draft-events/${params.id}/sources`
      );

      const result = await res.json();

      if (!res.ok) {
        return;
      }

      setSources(result.data || []);
    } catch (err) {
      console.error(err);
    }
  }

  async function handleSave() {
    try {
      setSaving(true);
      setMessage("");

      const res = await fetch(
        `/api/admin/draft-events/${params.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(event),
        }
      );

      const result = await res.json();

      if (!res.ok) {
        setMessage(result.error || "Failed to save");
        return;
      }

      setMessage("Draft event updated successfully");

      setEvent(result.data);
    } catch (err: any) {
      setMessage(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleConvert() {
    try {
      setConverting(true);
      setMessage("");

      const res = await fetch(
        `/api/admin/draft-events/${params.id}/convert`,
        {
          method: "POST",
        }
      );

      const result = await res.json();

      if (!res.ok) {
        setMessage(result.error || "Conversion failed");
        return;
      }

      setMessage("Draft converted into actual event");

      await fetchDraftEvent();
    } catch (err: any) {
      setMessage(err.message);
    } finally {
      setConverting(false);
    }
  }

  async function handleAddSource() {
    try {
      setMessage("");

      const res = await fetch(
        `/api/admin/draft-events/${params.id}/sources`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newSource),
        }
      );

      const result = await res.json();

      if (!res.ok) {
        setMessage(result.error || "Failed to add source");
        return;
      }

      setNewSource({
        source_type: "newspaper",
        source_reference: "",
        source_page: "",
        source_notes: "",
        source_image_url: "",
        source_date: "",
      });

      await fetchSources();

      setMessage("Source evidence added");
    } catch (err: any) {
      setMessage(err.message);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-black text-red-500 flex items-center justify-center">
        Event not found
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-5xl mx-auto">
        <button
          onClick={() => router.back()}
          className="mb-6 text-zinc-400 hover:text-white"
        >
          ← Back
        </button>

        <div className="flex items-start justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">
              Draft Event Review
            </h1>

            <p className="text-zinc-400 mt-2">
              Review and verify AI-detected event
            </p>
          </div>

          <button
            onClick={handleConvert}
            disabled={converting}
            className="bg-green-600 hover:bg-green-700 px-5 py-3 rounded-xl font-medium disabled:opacity-50"
          >
            {converting
              ? "Converting..."
              : "Convert To Actual Event"}
          </button>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-6">
          <div>
            <label className="block mb-2 text-sm text-zinc-400">
              Title
            </label>

            <input
              value={event.title || ""}
              onChange={(e) =>
                setEvent({
                  ...event,
                  title: e.target.value,
                })
              }
              className="w-full bg-black border border-zinc-700 rounded-xl p-3"
            />
          </div>

          <div>
            <label className="block mb-2 text-sm text-zinc-400">
              Description
            </label>

            <textarea
              value={event.description || ""}
              onChange={(e) =>
                setEvent({
                  ...event,
                  description: e.target.value,
                })
              }
              className="w-full h-40 bg-black border border-zinc-700 rounded-xl p-3"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block mb-2 text-sm text-zinc-400">
                Category
              </label>

              <input
                value={event.category || ""}
                onChange={(e) =>
                  setEvent({
                    ...event,
                    category: e.target.value,
                  })
                }
                className="w-full bg-black border border-zinc-700 rounded-xl p-3"
              />
            </div>

            <div>
              <label className="block mb-2 text-sm text-zinc-400">
                City
              </label>

              <input
                value={event.city || ""}
                onChange={(e) =>
                  setEvent({
                    ...event,
                    city: e.target.value,
                  })
                }
                className="w-full bg-black border border-zinc-700 rounded-xl p-3"
              />
            </div>

            <div>
              <label className="block mb-2 text-sm text-zinc-400">
                Venue
              </label>

              <input
                value={event.venue || ""}
                onChange={(e) =>
                  setEvent({
                    ...event,
                    venue: e.target.value,
                  })
                }
                className="w-full bg-black border border-zinc-700 rounded-xl p-3"
              />
            </div>

            <div>
              <label className="block mb-2 text-sm text-zinc-400">
                Organizer
              </label>

              <input
                value={event.organizer || ""}
                onChange={(e) =>
                  setEvent({
                    ...event,
                    organizer: e.target.value,
                  })
                }
                className="w-full bg-black border border-zinc-700 rounded-xl p-3"
              />
            </div>

            <div>
              <label className="block mb-2 text-sm text-zinc-400">
                Confidence
              </label>

              <select
                value={event.confidence || "medium"}
                onChange={(e) =>
                  setEvent({
                    ...event,
                    confidence: e.target.value,
                  })
                }
                className="w-full bg-black border border-zinc-700 rounded-xl p-3"
              >
                <option value="low">low</option>
                <option value="medium">medium</option>
                <option value="high">high</option>
              </select>
            </div>

            <div>
              <label className="block mb-2 text-sm text-zinc-400">
                Status
              </label>

              <select
                value={event.status || "pending_verification"}
                onChange={(e) =>
                  setEvent({
                    ...event,
                    status: e.target.value,
                  })
                }
                className="w-full bg-black border border-zinc-700 rounded-xl p-3"
              >
                <option value="pending_verification">
                  pending_verification
                </option>

                <option value="needs_more_info">
                  needs_more_info
                </option>

                <option value="verified">
                  verified
                </option>

                <option value="rejected">
                  rejected
                </option>

                <option value="duplicate">
                  duplicate
                </option>

                <option value="converted">
                  converted
                </option>
              </select>
            </div>
          </div>

          <div>
            <label className="block mb-2 text-sm text-zinc-400">
              Review Notes
            </label>

            <textarea
              value={event.review_notes || ""}
              onChange={(e) =>
                setEvent({
                  ...event,
                  review_notes: e.target.value,
                })
              }
              className="w-full h-32 bg-black border border-zinc-700 rounded-xl p-3"
            />
          </div>

          <div className="bg-black border border-zinc-800 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-semibold">
                Source Evidence
              </h2>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <input
                placeholder="Source Reference"
                value={newSource.source_reference}
                onChange={(e) =>
                  setNewSource({
                    ...newSource,
                    source_reference: e.target.value,
                  })
                }
                className="bg-zinc-900 border border-zinc-700 rounded-xl p-3"
              />

              <input
                placeholder="Page Number"
                value={newSource.source_page}
                onChange={(e) =>
                  setNewSource({
                    ...newSource,
                    source_page: e.target.value,
                  })
                }
                className="bg-zinc-900 border border-zinc-700 rounded-xl p-3"
              />

              <input
                type="date"
                value={newSource.source_date}
                onChange={(e) =>
                  setNewSource({
                    ...newSource,
                    source_date: e.target.value,
                  })
                }
                className="bg-zinc-900 border border-zinc-700 rounded-xl p-3"
              />

              <input
                placeholder="Image URL (optional)"
                value={newSource.source_image_url}
                onChange={(e) =>
                  setNewSource({
                    ...newSource,
                    source_image_url: e.target.value,
                  })
                }
                className="bg-zinc-900 border border-zinc-700 rounded-xl p-3"
              />
            </div>

            <textarea
              placeholder="Source Notes"
              value={newSource.source_notes}
              onChange={(e) =>
                setNewSource({
                  ...newSource,
                  source_notes: e.target.value,
                })
              }
              className="w-full h-28 bg-zinc-900 border border-zinc-700 rounded-xl p-3 mb-4"
            />

            <button
              onClick={handleAddSource}
              className="bg-blue-600 hover:bg-blue-700 px-5 py-3 rounded-xl font-medium"
            >
              Add Source Evidence
            </button>

            <div className="mt-8 space-y-4">
              {sources.map((source) => (
                <div
                  key={source.id}
                  className="border border-zinc-800 rounded-xl p-4 bg-zinc-950"
                >
                  <div className="flex items-center justify-between">
                    <div className="font-semibold">
                      {source.source_reference || "Unknown Source"}
                    </div>

                    <div className="text-xs text-zinc-500">
                      {source.source_page
                        ? `Page ${source.source_page}`
                        : "-"}
                    </div>
                  </div>

                  <div className="mt-2 text-sm text-zinc-400">
                    {source.source_notes || "-"}
                  </div>

                  {source.source_date && (
                    <div className="mt-2 text-xs text-zinc-500">
                      {source.source_date}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="border border-zinc-800 rounded-2xl p-5 bg-black">
            <h2 className="text-lg font-semibold mb-4">
              Raw AI JSON
            </h2>

            <pre className="text-xs overflow-auto text-zinc-400">
              {JSON.stringify(event.raw_json, null, 2)}
            </pre>
          </div>

          <div className="flex gap-4">
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700 px-5 py-3 rounded-xl font-medium disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>

          {message && (
            <div className="bg-zinc-800 border border-zinc-700 rounded-xl p-4">
              {message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}