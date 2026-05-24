import { createClient } from "@supabase/supabase-js";
import Link from "next/link";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { data: event, error } = await supabase
    .from("events")
    .select(`
      *,
      event_translations!event_translations_event_id_fkey(*),
      event_sessions!event_sessions_event_id_fkey(*),
      event_sources!event_sources_event_id_fkey(*)
    `)
    .eq("id", id)
    .single();

  console.log("EVENT ERROR:", error);

  if (!event) {
    return (
      <main
        style={{
          background: "#000",
          color: "#fff",
          minHeight: "100vh",
          padding: "40px",
        }}
      >
        Event not found.
      </main>
    );
  }

  const en =
    event.event_translations?.find(
      (t: any) => t.language_code === "en"
    ) || event.event_translations?.[0];

  return (
    <main
      style={{
        background: "#000",
        color: "#fff",
        minHeight: "100vh",
        padding: "24px",
      }}
    >
      <div
        style={{
          maxWidth: "900px",
          margin: "0 auto",
        }}
      >
        {/* BACK */}
        <Link
          href="/admin/events"
          style={{
            color: "#fff",
            textDecoration: "none",
            marginBottom: "24px",
            display: "inline-block",
          }}
        >
          ← Back to Admin Events
        </Link>

        {/* CARD */}
        <div
          style={{
            border: "1px solid #222",
            borderRadius: "28px",
            overflow: "hidden",
            background: "#050505",
          }}
        >
          {/* IMAGE */}
          {event.image_url && (
            <img
              src={event.image_url}
              alt=""
              style={{
                width: "100%",
                maxHeight: "420px",
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
                justifyContent:
                  "space-between",
                marginBottom: "24px",
                flexWrap: "wrap",
                gap: "12px",
              }}
            >
              <span
                style={{
                  background: "#111",
                  padding: "10px 18px",
                  borderRadius: "999px",
                  color: "#ccc",
                  fontSize: "18px",
                }}
              >
                {event.category}
              </span>

              <span
                style={{
                  color: "#888",
                  fontSize: "18px",
                }}
              >
                {event.status || "published"}
              </span>
            </div>

            {/* TITLE */}
            <h1
              style={{
                fontSize: "52px",
                marginBottom: "20px",
                lineHeight: 1.1,
              }}
            >
              {en?.title}
            </h1>

            {/* DESCRIPTION */}
            <p
              style={{
                color: "#d0d0d0",
                fontSize: "22px",
                lineHeight: 1.8,
              }}
            >
              {en?.description}
            </p>

            {/* VENUE */}
            <div
              style={{
                marginTop: "36px",
                color: "#bbb",
                fontSize: "20px",
                lineHeight: 1.8,
              }}
            >
              📍 {event.venue}
            </div>

            {/* SESSIONS */}
            <div
              style={{
                marginTop: "56px",
              }}
            >
              <h2
                style={{
                  fontSize: "32px",
                  marginBottom: "20px",
                }}
              >
                Event Sessions
              </h2>

              {event.event_sessions?.length ===
                0 && (
                <div
                  style={{
                    color: "#777",
                  }}
                >
                  No sessions available.
                </div>
              )}

              {event.event_sessions
                ?.sort(
                  (a: any, b: any) =>
                    new Date(
                      a.start_time
                    ).getTime() -
                    new Date(
                      b.start_time
                    ).getTime()
                )
                .map((session: any) => (
                  <div
                    key={session.id}
                    style={{
                      border:
                        "1px solid #222",
                      borderRadius:
                        "18px",
                      padding: "20px",
                      marginBottom:
                        "16px",
                      background: "#111",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "22px",
                        marginBottom:
                          "10px",
                      }}
                    >
                      {session.title ||
                        "Session"}
                    </div>

                    <div
                      style={{
                        color: "#aaa",
                        marginBottom:
                          "6px",
                      }}
                    >
                      Starts:{" "}
                      {new Date(
                        session.start_time
                      ).toLocaleString()}
                    </div>

                    <div
                      style={{
                        color: "#aaa",
                      }}
                    >
                      Ends:{" "}
                      {new Date(
                        session.end_time
                      ).toLocaleString()}
                    </div>
                  </div>
                ))}
            </div>

            {/* SOURCES */}
            <div
              style={{
                marginTop: "64px",
              }}
            >
              <h2
                style={{
                  fontSize: "32px",
                  marginBottom: "20px",
                }}
              >
                Sources
              </h2>

              {event.event_sources?.length ===
                0 && (
                <div
                  style={{
                    color: "#777",
                  }}
                >
                  No sources available.
                </div>
              )}

              {event.event_sources.map(
                (source: any) => (
                  <div
                    key={source.id}
                    style={{
                      border:
                        "1px solid #222",
                      borderRadius:
                        "18px",
                      padding: "20px",
                      marginBottom:
                        "16px",
                      background: "#111",
                    }}
                  >
                    {/* TITLE */}
                    <div
                      style={{
                        fontSize: "20px",
                        marginBottom:
                          "10px",
                      }}
                    >
                      {source.source_title}
                    </div>

                    {/* TYPE */}
                    <div
                      style={{
                        color: "#999",
                        marginBottom:
                          "12px",
                      }}
                    >
                      {source.source_type}
                    </div>

                    {/* URL */}
                    {source.source_url && (
                      <a
                        href={
                          source.source_url
                        }
                        target="_blank"
                        style={{
                          color: "#fff",
                          textDecoration:
                            "underline",
                        }}
                      >
                        Open Source
                      </a>
                    )}

                    {/* VERIFIED */}
                    {source.verified && (
                      <div
                        style={{
                          marginTop:
                            "12px",
                          color: "#4ade80",
                        }}
                      >
                        ✓ Verified Source
                      </div>
                    )}
                  </div>
                )
              )}
            </div>

            {/* ACTIONS */}
            <div
              style={{
                marginTop: "48px",
                display: "flex",
                gap: "16px",
                flexWrap: "wrap",
              }}
            >
              <Link
                href={`/kch/event/${event.id}`}
                target="_blank"
                style={{
                  background: "#fff",
                  color: "#000",
                  padding: "14px 22px",
                  borderRadius: "14px",
                  textDecoration: "none",
                  fontWeight: 700,
                }}
              >
                View Public Page
              </Link>

              <Link
                href="/admin/events"
                style={{
                  background: "#111",
                  border: "1px solid #333",
                  color: "#fff",
                  padding: "14px 22px",
                  borderRadius: "14px",
                  textDecoration: "none",
                }}
              >
                Back to Events
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}