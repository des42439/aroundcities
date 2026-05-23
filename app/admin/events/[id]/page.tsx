"use client";

import Link from "next/link";
import imageCompression from "browser-image-compression";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function EditEventPage() {
  const params = useParams();
  const id = params.id as string;

  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadEvent();
  }, []);

  async function loadEvent() {
    const { data } = await supabase
      .from("events")
      .select(`
        *,
        event_translations (
          *
        )
      `)
      .eq("id", id)
      .single();

    if (data) {
      setEvent(data);
    }

    setLoading(false);
  }

  async function uploadImage(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    try {
      const file = e.target.files?.[0];

      if (!file) return;

      setUploading(true);

      const compressedFile =
        await imageCompression(file, {
          maxSizeMB: 0.3,
          maxWidthOrHeight: 1400,
          useWebWorker: true,
        });

      const fileName = `${Date.now()}-${file.name}`;

      const { error } = await supabase.storage
        .from("event-images")
        .upload(fileName, compressedFile);

      if (error) {
        alert(error.message);
        setUploading(false);
        return;
      }

      const { data } = supabase.storage
        .from("event-images")
        .getPublicUrl(fileName);

      setEvent({
        ...event,
        image_url: data.publicUrl,
      });

      setUploading(false);
    } catch (err) {
      console.error(err);
      alert("Image upload failed");
      setUploading(false);
    }
  }

  async function saveEvent() {
    if (!event) return;

    await supabase
      .from("events")
      .update({
        category: event.category,
        venue: event.venue,
        status: event.status,
        image_url: event.image_url,
      })
      .eq("id", id);

    for (const translation of event.event_translations) {
      await supabase
        .from("event_translations")
        .update({
          title: translation.title,
          description: translation.description,
        })
        .eq("id", translation.id);
    }

    alert("Event updated");
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-black text-white p-6">
        Loading...
      </main>
    );
  }

  if (!event) {
    return (
      <main className="min-h-screen bg-black text-white p-6">
        Event not found
      </main>
    );
  }

  return (
    <main className="max-w-4xl mx-auto p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10">
        <h1 className="text-4xl sm:text-6xl font-bold">
          Edit Event
        </h1>

        <Link
          href="/admin/events"
          className="border border-zinc-700 bg-zinc-900 px-5 py-3 rounded-2xl"
        >
          ← Back
        </Link>
      </div>

      <div className="space-y-8">
        <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 space-y-6">
          <div>
            <label className="block mb-2 font-semibold text-zinc-300">
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
              className="bg-zinc-900 border border-zinc-700 rounded-2xl px-4 py-3 w-full text-white"
            />
          </div>

          <div>
            <label className="block mb-2 font-semibold text-zinc-300">
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
              className="bg-zinc-900 border border-zinc-700 rounded-2xl px-4 py-3 w-full text-white"
            />
          </div>

          <div>
            <label className="block mb-2 font-semibold text-zinc-300">
              Event Image
            </label>

            <input
              type="file"
              accept="image/*"
              onChange={uploadImage}
              className="mb-4 text-zinc-400"
            />

            {uploading && (
              <div className="text-sm text-zinc-500 mb-4">
                Compressing and uploading image...
              </div>
            )}

            {event.image_url && (
              <img
                src={event.image_url}
                alt="Event"
                className="w-full max-w-md rounded-3xl border border-zinc-700"
              />
            )}
          </div>

          <div>
            <label className="block mb-2 font-semibold text-zinc-300">
              Status
            </label>

            <select
              value={event.status}
              onChange={(e) =>
                setEvent({
                  ...event,
                  status: e.target.value,
                })
              }
              className="bg-zinc-900 border border-zinc-700 rounded-2xl px-4 py-3 w-full text-white"
            >
              <option value="published">
                Published
              </option>

              <option value="draft">
                Draft
              </option>

              <option value="finished">
                Finished
              </option>

              <option value="cancelled">
                Cancelled
              </option>

              <option value="deleted">
                Deleted
              </option>
            </select>
          </div>
        </div>

        {event.event_translations.map(
          (translation: any, index: number) => (
            <div
              key={translation.id}
              className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6"
            >
              <h2 className="text-2xl font-bold mb-6">
                {translation.language_code.toUpperCase()}
              </h2>

              <div className="space-y-4">
                <input
                  value={translation.title}
                  onChange={(e) => {
                    const updated = [
                      ...event.event_translations,
                    ];

                    updated[index].title =
                      e.target.value;

                    setEvent({
                      ...event,
                      event_translations:
                        updated,
                    });
                  }}
                  placeholder="Title"
                  className="bg-zinc-900 border border-zinc-700 rounded-2xl px-4 py-3 w-full text-white"
                />

                <textarea
                  value={
                    translation.description || ""
                  }
                  onChange={(e) => {
                    const updated = [
                      ...event.event_translations,
                    ];

                    updated[index].description =
                      e.target.value;

                    setEvent({
                      ...event,
                      event_translations:
                        updated,
                    });
                  }}
                  placeholder="Description"
                  className="bg-zinc-900 border border-zinc-700 rounded-2xl px-4 py-3 w-full h-40 text-white"
                />
              </div>
            </div>
          )
        )}

        <button
          onClick={saveEvent}
          className="bg-white text-black px-6 py-4 rounded-2xl font-semibold"
        >
          Save Changes
        </button>
      </div>
    </main>
  );
}