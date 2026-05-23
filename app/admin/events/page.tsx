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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <h1 className="text-3xl sm:text-5xl font-bold">
          Event Management
        </h1>

        <Link
          href="/admin/events/new"
          className="bg-black text-white px-5 py-3 rounded-2xl"
        >
          + Create Event
        </Link>
      </div>

      {loading ? (
        <div className="text-gray-500">
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
                className="border rounded-3xl p-6 bg-white"
              >
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold mb-4">
                      {english?.title ||
                        "Untitled Event"}
                    </h2>

                    <div className="text-gray-600 space-y-2">
                      <div>
                        <strong>Status:</strong>{" "}
                        {event.status}
                      </div>

                      <div>
                        <strong>City:</strong>{" "}
                        {event.city_code}
                      </div>

                      <div>
                        <strong>Venue:</strong>{" "}
                        {event.venue}
                      </div>

                      <div>
                        <strong>Start:</strong>{" "}
                        {event.start_time
                          ? new Date(
                              event.start_time
                            ).toLocaleString()
                          : "-"}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Link
                      href={`/admin/events/${event.id}`}
                      className="border px-4 py-2 rounded-xl"
                    >
                      Edit
                    </Link>

                    <button
                      onClick={() =>
                        softDelete(event.id)
                      }
                      className="border border-red-500 text-red-500 px-4 py-2 rounded-xl"
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