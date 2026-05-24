"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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
    setLoading(true);

    const { data, error } = await supabase
      .from("events")
      .select(`
        *,
        event_translations!event_translations_event_id_fkey(*),
        event_sessions!event_sessions_event_id_fkey(*)
      `)
      .order("created_at", {
        ascending: false,
      });

    console.log("EVENTS:", data);
    console.log("EVENT ERROR:", error);

    if (data) {
      setEvents(data);
    }

    setLoading(false);
  }

  return (
    <main
      style={{
        background: "#000",
        minHeight: "100vh",
        color: "#fff",
        padding: "40px 24px 80px",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
        }}
      >
        {/* HEADER */}
        <div
          style={{
            display: "flex",
            justifyContent:
              "space-between",
            alignItems: "center",
            marginBottom: "40px",
            flexWrap: "wrap",
            gap: "20px",
          }}
        >
          <h1
            style={{
              fontSize: "64px",
              margin: 0,
            }}
          >
            Admin Events
          </h1>

          <Link
            href="/admin/events/create"
            style={{
              background: "#fff",
              color: "#000",
              padding: "16px 24px",
              borderRadius: "16px",
              textDecoration: "none",
              fontWeight: 700,
            }}
          >
            + Create Event
          </Link>
        </div>

        {/* LOADING */}
        {loading && (
          <div
            style={{
              color: "#888",
              fontSize: "24px",
            }}
          >
            Loading events...
          </div>
        )}

        {/* EMPTY */}
        {!loading &&
          events.length === 0 && (
            <div
              style={{
                color: "#888",
                fontSize: "24px",
              }}
            >
              No events found.
            </div>
          )}

        {/* EVENTS */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "28px",
          }}
        >
          {events.map((event) => {
            const translation =
              event.event_translations?.find(
                (t: any) =>
                  t.language_code ===
                  "en"
              ) ||
              event
                .event_translations?.[0];

            const nextSession =
              event.event_sessions
                ?.filter(
                  (s: any) =>
                    new Date(
                      s.end_time
                    ) > new Date()
                )
                ?.sort(
                  (
                    a: any,
                    b: any
                  ) =>
                    new Date(
                      a.start_time
                    ).getTime() -
                    new Date(
                      b.start_time
                    ).getTime()
                )?.[0];

            return (
              <div
                key={event.id}
                style={{
                  border:
                    "1px solid #222",
                  borderRadius:
                    "28px",
                  overflow: "hidden",
                  background:
                    "#050505",
                }}
              >
                {/* IMAGE */}
                {event.image_url && (
                  <img
                    src={
                      event.image_url
                    }
                    alt=""
                    style={{
                      width: "100%",
                      height: "280px",
                      objectFit:
                        "cover",
                    }}
                  />
                )}

                {/* CONTENT */}
                <div
                  style={{
                    padding: "28px",
                  }}
                >
                  {/* TOP */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent:
                        "space-between",
                      alignItems:
                        "center",
                      marginBottom:
                        "20px",
                      flexWrap:
                        "wrap",
                      gap: "12px",
                    }}
                  >
                    <div
                      style={{
                        background:
                          "#111",
                        border:
                          "1px solid #222",
                        color: "#bbb",
                        padding:
                          "10px 18px",
                        borderRadius:
                          "999px",
                      }}
                    >
                      {
                        event.category
                      }
                    </div>

                    <div
                      style={{
                        color: "#666",
                      }}
                    >
                      {event.status ||
                        "published"}
                    </div>
                  </div>

                  {/* TITLE */}
                  <h2
                    style={{
                      fontSize:
                        "42px",
                      margin:
                        "0 0 18px",
                    }}
                  >
                    {translation?.title ||
                      "Untitled Event"}
                  </h2>

                  {/* DESCRIPTION */}
                  <p
                    style={{
                      color: "#bbb",
                      lineHeight: 1.7,
                      fontSize:
                        "20px",
                      marginBottom:
                        "26px",
                    }}
                  >
                    {
                      translation?.description
                    }
                  </p>

                  {/* VENUE */}
                  <div
                    style={{
                      color: "#999",
                      marginBottom:
                        "14px",
                    }}
                  >
                    📍 {event.venue}
                  </div>

                  {/* SESSION */}
                  {nextSession && (
                    <div
                      style={{
                        color:
                          "#777",
                        marginBottom:
                          "26px",
                      }}
                    >
                      🕒{" "}
                      {new Date(
                        nextSession.start_time
                      ).toLocaleString()}
                    </div>
                  )}

                  {/* ACTIONS */}
                  <div
                    style={{
                      display:
                        "flex",
                      gap: "16px",
                      flexWrap:
                        "wrap",
                    }}
                  >
                    <Link
                      href={`/admin/events/${event.id}`}
                      style={{
                        background:
                          "#fff",
                        color:
                          "#000",
                        padding:
                          "12px 20px",
                        borderRadius:
                          "14px",
                        textDecoration:
                          "none",
                        fontWeight: 700,
                      }}
                    >
                      Edit Event
                    </Link>

                    <Link
                      href={`/kch/event/${event.id}`}
                      target="_blank"
                      style={{
                        background:
                          "#111",
                        border:
                          "1px solid #333",
                        color:
                          "#fff",
                        padding:
                          "12px 20px",
                        borderRadius:
                          "14px",
                        textDecoration:
                          "none",
                      }}
                    >
                      View Public Page
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}