"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function AdminEventsPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEvents();
  }, []);

  async function loadEvents() {
    const { data } = await supabase
      .from("events")
      .select(`
        *,
        event_translations (
          language_code,
          title
        )
      `)
      .order("created_at", { ascending: false });

    if (data) {
      setEvents(data);
    }

    setLoading(false);
  }

  async function softDelete(id: string) {
    const confirmed = confirm(
      "Mark this event as deleted?"
    );

    if (!confirmed) return;

    await supabase
      .from("events")
      .update({
        status: "deleted",
      })
      .eq("id", id);

    loadEvents();
  }

  return (
    <main className="max-w-6xl mx-auto p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10">
        <h1 className="text-4xl sm:text-6xl font-bold">
          Event Management
        </h1>

        <Link
          href="/admin/events/new"
          className="bg-white text-black px-5 py-3 rounded-2xl font-semibold"
        >
          + Create Event
        </Link>
      </div>

      {loading ? (
        <div className="text-zinc-400">
          Loading...
        </div>
      ) : (
        <div className="space-y-6">
          {events.map((event) => {
            const english =
              event.event_translations.find(
                (t: any) =>
                  t.language_code === "en"
              );

            return (
              <div
                key={event.id}
                className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6"
              >
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold mb-4">
                      {english?.title ||
                        "Untitled Event"}
                    </h2>

                    <div className="text-zinc-400 space-y-2">
                      <div>
                        <strong className="text-zinc-200">
                          Status:
                        </strong>{" "}
                        {event.status}
                      </div>

                      <div>
                        <strong className="text-zinc-200">
                          City:
                        </strong>{" "}
                        {event.city_code}
                      </div>

                      <div>
                        <strong className="text-zinc-200">
                          Venue:
                        </strong>{" "}
                        {event.venue}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Link
                      href={`/admin/events/${event.id}`}
                      className="border border-zinc-700 bg-zinc-900 px-4 py-2 rounded-2xl"
                    >
                      Edit
                    </Link>

                    <button
                      onClick={() =>
                        softDelete(event.id)
                      }
                      className="border border-red-700 text-red-400 px-4 py-2 rounded-2xl"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}