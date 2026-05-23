"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function HomePage() {
  const [language, setLanguage] = useState("en");
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEvents();
  }, []);

  async function loadEvents() {
    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from("events")
      .select(`
        *,
        event_translations (
          language_code,
          title,
          description
        ),
        event_sessions (
          id,
          title,
          start_time,
          end_time,
          status
        )
      `)
      .eq("status", "published")
      .lte("event_sessions.start_time", now)
      .gte("event_sessions.end_time", now)
      .order("start_time", { ascending: true });

    if (!error && data) {
      setEvents(data);
    }

    setLoading(false);
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleString(
      undefined,
      {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      }
    );
  }

  return (
    <main className="max-w-4xl mx-auto p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <h1 className="text-3xl sm:text-5xl font-bold">
          AroundCities
        </h1>

        <div className="flex gap-2">
          <button
            onClick={() => setLanguage("en")}
            className={`border px-4 py-2 rounded-xl transition ${
              language === "en"
                ? "bg-black text-white"
                : "bg-white"
            }`}
          >
            EN
          </button>

          <button
            onClick={() => setLanguage("zh")}
            className={`border px-4 py-2 rounded-xl transition ${
              language === "zh"
                ? "bg-black text-white"
                : "bg-white"
            }`}
          >
            中文
          </button>

          <button
            onClick={() => setLanguage("bm")}
            className={`border px-4 py-2 rounded-xl transition ${
              language === "bm"
                ? "bg-black text-white"
                : "bg-white"
            }`}
          >
            BM
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-gray-500">
          Loading events...
        </div>
      ) : events.length === 0 ? (
        <div className="text-gray-500">
          No events happening right now.
        </div>
      ) : (
        <div className="space-y-8">
          {events.map((event: any) => {
            const translation =
              event.event_translations.find(
                (t: any) =>
                  t.language_code === language
              ) ||
              event.event_translations.find(
                (t: any) =>
                  t.language_code === "en"
              );

            const activeSession =
              event.event_sessions?.[0];

            return (
              <div
                key={event.id}
                className="border rounded-3xl overflow-hidden shadow-sm bg-white"
              >
                {event.image_url && (
                  <img
                    src={event.image_url}
                    alt={translation?.title}
                    className="w-full h-56 object-cover"
                  />
                )}

                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="inline-block bg-gray-100 px-3 py-1 rounded-full text-sm text-gray-600">
                      {event.category || "General"}
                    </span>

                    <span className="text-sm text-gray-400">
                      {event.city_code?.toUpperCase()}
                    </span>
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-bold mb-4">
                    {translation?.title ||
                      "Untitled Event"}
                  </h2>

                  <p className="text-gray-700 whitespace-pre-line mb-6 leading-relaxed">
                    {translation?.description ||
                      "No description"}
                  </p>

                  <div className="text-sm text-gray-500 space-y-2">
                    <div>
                      📍{" "}
                      {event.venue ||
                        "Unknown venue"}
                    </div>

                    {activeSession && (
                      <>
                        <div>
                          🕒{" "}
                          {formatDate(
                            activeSession.start_time
                          )}
                        </div>

                        <div>
                          Ends:{" "}
                          {formatDate(
                            activeSession.end_time
                          )}
                        </div>
                      </>
                    )}
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