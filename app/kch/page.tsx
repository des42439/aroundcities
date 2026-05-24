"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type EventType = {
  id: string;
  venue: string;
  category: string;
  image_url: string;
  status: string;
  featured: boolean;
  event_translations: {
    language_code: string;
    title: string;
    description: string;
  }[];
  event_sessions: {
    id: number;
    title: string;
    start_time: string;
    end_time: string;
    status: string;
  }[];
};

export default function KchPage() {
  const [events, setEvents] = useState<EventType[]>([]);
  const [language, setLanguage] = useState<"en" | "zh" | "bm">("en");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEvents();
  }, []);

  async function loadEvents() {
    setLoading(true);

    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from("events")
      .select(`
        *,
        event_translations(*),
        event_sessions(*)
      `)
      //.eq("status", "published")
      .order("created_at", { ascending: false });

    if (!error && data) {
      const filtered = data.filter((event: any) => {
        const activeSessions =
          event.event_sessions?.filter(
            (session: any) =>
              session.status === "active" &&
              session.end_time > now
          ) || [];

        return activeSessions.length > 0;
      });

      setEvents(filtered);
    }

    setLoading(false);
  }

  function getTranslation(event: EventType) {
    return (
      event.event_translations.find(
        (t) => t.language_code === language
      ) ||
      event.event_translations.find(
        (t) => t.language_code === "en"
      ) ||
      event.event_translations[0]
    );
  }

  return (
    <main
      style={{
        background: "#000",
        minHeight: "100vh",
        color: "#fff",
        padding: "32px 20px 80px",
      }}
    >
      <div
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
        }}
      >
        {/* HEADER */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "20px",
            marginBottom: "36px",
          }}
        >
          <h1
            style={{
              fontSize: "72px",
              fontWeight: 800,
              margin: 0,
              lineHeight: 1,
            }}
          >
            AroundKuching
          </h1>

          <div
            style={{
              display: "flex",
              gap: "14px",
            }}
          >
            <LanguageButton
              active={language === "en"}
              onClick={() => setLanguage("en")}
            >
              EN
            </LanguageButton>

            <LanguageButton
              active={language === "zh"}
              onClick={() => setLanguage("zh")}
            >
              中文
            </LanguageButton>

            <LanguageButton
              active={language === "bm"}
              onClick={() => setLanguage("bm")}
            >
              BM
            </LanguageButton>
          </div>
        </div>

        {/* LOADING */}
        {loading && (
          <div
            style={{
              color: "#888",
              fontSize: "22px",
              marginTop: "80px",
            }}
          >
            Loading events...
          </div>
        )}

        {/* NO EVENTS */}
        {!loading && events.length === 0 && (
          <div
            style={{
              color: "#888",
              fontSize: "22px",
              marginTop: "80px",
            }}
          >
            No active events right now.
          </div>
        )}

        {/* EVENTS */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "36px",
          }}
        >
          {events.map((event) => {
            const translation = getTranslation(event);

            const nextSession =
              event.event_sessions
                ?.filter(
                  (s) =>
                    s.status === "active" &&
                    new Date(s.end_time) > new Date()
                )
                .sort(
                  (a, b) =>
                    new Date(a.start_time).getTime() -
                    new Date(b.start_time).getTime()
                )[0] || null;

            return (
              <Link
                key={event.id}
                href={`/kch/event/${event.id}`}
                style={{
                  textDecoration: "none",
                  color: "inherit",
                }}
              >
                <div
                  style={{
                    border: "1px solid #222",
                    borderRadius: "34px",
                    overflow: "hidden",
                    background: "#050505",
                    transition: "0.2s",
                    cursor: "pointer",
                  }}
                >
                  {/* IMAGE */}
                  {event.image_url && (
                    <img
                      src={event.image_url}
                      alt=""
                      style={{
                        width: "100%",
                        height: "340px",
                        objectFit: "cover",
                      }}
                    />
                  )}

                  {/* CONTENT */}
                  <div
                    style={{
                      padding: "32px",
                    }}
                  >
                    {/* TOP */}
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "26px",
                      }}
                    >
                      <div
                        style={{
                          background: "#111",
                          color: "#ccc",
                          padding: "12px 22px",
                          borderRadius: "999px",
                          fontSize: "22px",
                        }}
                      >
                        {event.category}
                      </div>

                      <div
                        style={{
                          color: "#888",
                          fontSize: "26px",
                        }}
                      >
                        KCH
                      </div>
                    </div>

                    {/* TITLE */}
                    <h2
                      style={{
                        fontSize: "58px",
                        margin: "0 0 28px",
                        lineHeight: 1.1,
                      }}
                    >
                      {translation?.title}
                    </h2>

                    {/* DESCRIPTION */}
                    <p
                      style={{
                        color: "#d0d0d0",
                        fontSize: "30px",
                        lineHeight: 1.8,
                        marginBottom: "36px",
                      }}
                    >
                      {translation?.description}
                    </p>

                    {/* VENUE */}
                    <div
                      style={{
                        color: "#bbb",
                        fontSize: "28px",
                        marginBottom: "18px",
                      }}
                    >
                      📍 {event.venue}
                    </div>

                    {/* SESSION */}
                    {nextSession && (
                      <div
                        style={{
                          color: "#aaa",
                          fontSize: "24px",
                          lineHeight: 1.8,
                        }}
                      >
                        <div>
                          🕒{" "}
                          {new Date(
                            nextSession.start_time
                          ).toLocaleString()}
                        </div>

                        <div>
                          Ends:{" "}
                          {new Date(
                            nextSession.end_time
                          ).toLocaleString()}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* FOOTER */}
        <footer
          style={{
            marginTop: "80px",
            borderTop: "1px solid #222",
            paddingTop: "28px",
            display: "flex",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "18px",
          }}
        >
          <div
            style={{
              color: "#666",
            }}
          >
            AroundKuching © 2026
          </div>

          <div
            style={{
              display: "flex",
              gap: "20px",
            }}
          >
            <Link
              href="/disclaimer"
              style={{
                color: "#999",
                textDecoration: "none",
              }}
            >
              Disclaimer
            </Link>

            <a
              href="mailto:contactus@aroundcities.my"
              style={{
                color: "#999",
                textDecoration: "none",
              }}
            >
              Contact Us
            </a>
          </div>
        </footer>
      </div>
    </main>
  );
}

function LanguageButton({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "14px 26px",
        borderRadius: "18px",
        border: active
          ? "1px solid #fff"
          : "1px solid #333",
        background: active ? "#fff" : "#111",
        color: active ? "#000" : "#fff",
        fontSize: "24px",
        cursor: "pointer",
        transition: "0.2s",
      }}
    >
      {children}
    </button>
  );
}