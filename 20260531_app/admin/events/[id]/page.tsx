"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function AdminEventDetailPage() {
  const params = useParams();
  const router = useRouter();

  const [event, setEvent] = useState<any>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchEvent();
  }, []);

  async function fetchEvent() {
    try {
      const res = await fetch(
        `/api/admin/events/${params.id}`
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

  async function handleSave() {
    try {
      setSaving(true);
      setMessage("");

      const res = await fetch(
        `/api/admin/events/${params.id}`,
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

      setMessage("Event updated successfully");

      setEvent(result.data);
    } catch (err: any) {
      setMessage(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    const confirmed = confirm(
      "Are you sure you want to delete this public event?"
    );

    if (!confirmed) return;

    try {
      const res = await fetch(
        `/api/admin/events/${params.id}/delete`,
        {
          method: "DELETE",
        }
      );

      const result = await res.json();

      if (!res.ok) {
        setMessage(result.error || "Delete failed");
        return;
      }

      router.push("/admin/events");
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
              Public Event Editor
            </h1>

            <p className="text-zinc-400 mt-2">
              Edit published event information
            </p>
          </div>

          <a
            href={`/events/${event.id}`}
            target="_blank"
            className="bg-zinc-800 hover:bg-zinc-700 px-5 py-3 rounded-xl font-medium"
          >
            View Public Page
          </a>
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
          </div>

          <div className="flex gap-4">
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700 px-5 py-3 rounded-xl font-medium disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>

            <button
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 px-5 py-3 rounded-xl font-medium"
            >
              Delete Event
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