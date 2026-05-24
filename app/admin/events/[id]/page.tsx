import { createClient } from "@supabase/supabase-js";
import Link from "next/link";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default async function EventDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { data: event } = await supabase
    .from("events")
    .select(`
      *,
      event_translations(*),
      event_sessions(*),
      event_sources(*)
    `)
    .eq("id", params.id)
    .single();

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
        <Link
          href="/kch"
          style={{
            color: "#fff",
            textDecoration: "none",
            marginBottom: "24px",
            display: "inline-block",
          }}
        >
          ← Back
        </Link>

        <div
          style={{
            border: "1px solid #222",
            borderRadius: "28px",
            overflow: "hidden",
            background: "#050505",
          }}
        >
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

          <div
            style={{
              padding: "32px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "24px",
              }}
            >
              <span
                style={{
                  background: "#111",
                  padding: "10px 18px",
                  borderRadius: "999px",
                  color: "#ccc",
                }}
              >
                {event.category}
              </span>

              <span
                style={{
                  color: "#888",
                }}
              >
                KCH
              </span>
            </div>

            <h1
              style={{
                fontSize: "52px",
                marginBottom: "20px",
              }}
            >
              {en?.title}
            </h1>

            <p
              style={{
                color: "#d0d0d0",
                fontSize: "22px",
                lineHeight: 1.8,
              }}
            >
              {en?.description}
            </p>

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

            {/* Sessions */}
            <div
              style={{
                marginTop: "48px",
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

              {event.event_sessions?.length === 0 && (
                <div style={{ color: "#777" }}>
                  No sessions available.
                </div>
              )}

              {event.event_sessions?.map((session: any) => (
                <div
                  key={session.id}
                  style={{
                    border: "1px solid #222",
                    borderRadius: "18px",
                    padding: "20px",
                    marginBottom: "16px",
                    background: "#111",
                  }}
                >
                  <div
                    style={{
                      fontSize: "22px",
                      marginBottom: "10px",
                    }}
                  >
                    {session.title || "Session"}
                  </div>

                  <div style={{ color: "#aaa" }}>
                    {new Date(
                      session.start_time
                    ).toLocaleString()}
                  </div>

                  <div style={{ color: "#aaa" }}>
                    Ends:{" "}
                    {new Date(
                      session.end_time
                    ).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>

            {/* Sources */}
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
                Sources
              </h2>

              {event.event_sources?.length === 0 && (
                <div style={{ color: "#777" }}>
                  No sources available.
                </div>
              )}

              {event.event_sources?.map((source: any) => (
                <div
                  key={source.id}
                  style={{
                    border: "1px solid #222",
                    borderRadius: "18px",
                    padding: "20px",
                    marginBottom: "16px",
                    background: "#111",
                  }}
                >
                  <div
                    style={{
                      fontSize: "20px",
                      marginBottom: "10px",
                    }}
                  >
                    {source.source_title}
                  </div>

                  <div
                    style={{
                      color: "#999",
                      marginBottom: "10px",
                    }}
                  >
                    {source.source_type}
                  </div>

                  {source.source_url && (
                    <a
                      href={source.source_url}
                      target="_blank"
                      style={{
                        color: "#fff",
                        textDecoration: "underline",
                      }}
                    >
                      Open Source
                    </a>
                  )}

                  {source.notes && (
                    <div
                      style={{
                        marginTop: "12px",
                        color: "#aaa",
                      }}
                    >
                      {source.notes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}