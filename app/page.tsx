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
    <main className="min-h-screen bg-black text-white">
      <div className="max-w-5xl mx-auto p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight">
            AroundCities
          </h1>

          <div className="flex gap-3">
            <button
              onClick={() => setLanguage("en")}
              className={`border px-5 py-3 rounded-2xl transition ${
                language === "en"
                  ? "bg-white text-black border-white"
                  : "border-zinc-700 text-white bg-zinc-900"
              }`}
            >
              EN
            </button>

            <button
              onClick={() => setLanguage("zh")}
              className={`border px-5 py-3 rounded-2xl transition ${
                language === "zh"
                  ? "bg-white text-black border-white"
                  : "border-zinc-700 text-white bg-zinc-900"
              }`}
            >
              中文
            </button>

            <button
              onClick={() => setLanguage("bm")}
              className={`border px-5 py-3 rounded-2xl transition ${
                language === "bm"
                  ? "bg-white text-black border-white"
                  : "border-zinc-700 text-white bg-zinc-900"
              }`}
            >
              BM
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-zinc-400">
            Loading events...
          </div>
        ) : events.length === 0 ? (
          <div className="text-zinc-400">
            No events happening right now.
          </div>
        ) : (
          <div className="space-y-10">
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
                  className="bg-zinc-950 border border-zinc-800 rounded-[32px] overflow-hidden shadow-2xl"
                >
                  {event.image_url && (
                    <img
                      src={event.image_url}
                      alt={translation?.title}
                      className="w-full h-64 sm:h-80 object-cover"
                    />
                  )}

                  <div className="p-6 sm:p-8">
                    <div className="flex items-center justify-between mb-5">
                      <span className="inline-flex items-center px-4 py-2 rounded-full bg-zinc-800 text-zinc-300 text-sm">
                        {event.category || "General"}
                      </span>

                      <span className="text-sm text-zinc-500 tracking-wide">
                        {event.city_code?.toUpperCase()}
                      </span>
                    </div>

                    <h2 className="text-3xl sm:text-5xl font-bold mb-6 leading-tight">
                      {translation?.title ||
                        "Untitled Event"}
                    </h2>

                    <p className="text-zinc-300 text-lg leading-relaxed whitespace-pre-line mb-8">
                      {translation?.description ||
                        "No description"}
                    </p>

                    <div className="space-y-3 text-zinc-400">
                      <div className="flex items-start gap-3">
                        <span>📍</span>

                        <span>
                          {event.venue ||
                            "Unknown venue"}
                        </span>
                      </div>

                      {activeSession && (
                        <>
                          <div className="flex items-start gap-3">
                            <span>🕒</span>

                            <span>
                              {formatDate(
                                activeSession.start_time
                              )}
                            </span>
                          </div>

                          <div className="flex items-start gap-3">
                            <span>⌛</span>

                            <span>
                              Ends{" "}
                              {formatDate(
                                activeSession.end_time
                              )}
                            </span>
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
      <div className="mt-16 flex flex-wrap gap-6 text-sm text-zinc-500">
  <a
    href="/disclaimer"
    className="hover:text-zinc-300 transition"
  >
    Disclaimer
  </a>

  <a
    href="/contact"
    className="hover:text-zinc-300 transition"
  >
    Contact
  </a>
</div>

</div>
</main>
  );
}