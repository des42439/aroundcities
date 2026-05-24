"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function AdminEditEventPage() {
  const params = useParams();
  const router = useRouter();

  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [eventData, setEventData] = useState<any>({
    venue: "",
    category: "",
    image_url: "",
    featured: false,
    status: "published",
  });

  const [translations, setTranslations] = useState<any[]>([]);

  const [sessions, setSessions] = useState<any[]>([]);

  const [sources, setSources] = useState<any[]>([]);

  useEffect(() => {
    if (id) {
      loadEvent();
    }
  }, [id]);

  async function loadEvent() {
    setLoading(true);

    const { data: event } = await supabase
      .from("events")
      .select("*")
      .eq("id", id)
      .single();

    const { data: translationData } = await supabase
      .from("event_translations")
      .select("*")
      .eq("event_id", id);

    const { data: sessionData } = await supabase
      .from("event_sessions")
      .select("*")
      .eq("event_id", id)
      .order("start_time");

    const { data: sourceData } = await supabase
      .from("event_sources")
      .select("*")
      .eq("event_id", id)
      .order("display_order");

    if (event) {
      setEventData(event);
    }

    setTranslations(translationData || []);
    setSessions(sessionData || []);
    setSources(sourceData || []);

    setLoading(false);
  }

  async function saveEvent() {
    setSaving(true);

    try {
      await supabase
        .from("events")
        .update({
          venue: eventData.venue,
          category: eventData.category,
          image_url: eventData.image_url,
          featured: eventData.featured,
          status: eventData.status,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);

      // TRANSLATIONS
      await supabase
        .from("event_translations")
        .delete()
        .eq("event_id", id);

      if (translations.length > 0) {
        await supabase
          .from("event_translations")
          .insert(
            translations.map((t) => ({
              event_id: id,
              language_code: t.language_code,
              title: t.title,
              description: t.description,
            }))
          );
      }

      // SESSIONS
      await supabase
        .from("event_sessions")
        .delete()
        .eq("event_id", id);

      if (sessions.length > 0) {
        await supabase
          .from("event_sessions")
          .insert(
            sessions.map((s) => ({
              event_id: id,
              title: s.title,
              start_time: s.start_time,
              end_time: s.end_time,
              status: s.status || "active",
            }))
          );
      }

      // SOURCES
      await supabase
        .from("event_sources")
        .delete()
        .eq("event_id", id);

      if (sources.length > 0) {
        await supabase
          .from("event_sources")
          .insert(
            sources.map((s, index) => ({
              event_id: id,
              source_title: s.source_title,
              source_type: s.source_type,
              source_url: s.source_url,
              notes: s.notes,
              display_order: index,
              status: "active",
            }))
          );
      }

      alert("Event updated successfully.");
    } catch (err) {
      console.error(err);
      alert("Failed to save event.");
    }

    setSaving(false);
  }

  if (loading) {
    return (
      <main
        style={{
          background: "#000",
          minHeight: "100vh",
          color: "#fff",
          padding: "40px",
        }}
      >
        Loading...
      </main>
    );
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
          maxWidth: "1000px",
          margin: "0 auto",
        }}
      >
        {/* HEADER */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
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
            Edit Event
          </h1>

          <Link
            href="/admin/events"
            style={{
              padding: "14px 22px",
              border: "1px solid #444",
              borderRadius: "14px",
              color: "#fff",
              textDecoration: "none",
              background: "#111",
            }}
          >
            ← Back
          </Link>
        </div>

        {/* BASIC INFO */}
        <div style={cardStyle}>
          <SectionTitle>Basic Information</SectionTitle>

          <label style={labelStyle}>Category</label>

          <input
            value={eventData.category || ""}
            onChange={(e) =>
              setEventData({
                ...eventData,
                category: e.target.value,
              })
            }
            style={inputStyle}
          />

          <label style={labelStyle}>Venue</label>

          <input
            value={eventData.venue || ""}
            onChange={(e) =>
              setEventData({
                ...eventData,
                venue: e.target.value,
              })
            }
            style={inputStyle}
          />

          <label style={labelStyle}>Image URL</label>

          <input
            value={eventData.image_url || ""}
            onChange={(e) =>
              setEventData({
                ...eventData,
                image_url: e.target.value,
              })
            }
            style={inputStyle}
          />

          {eventData.image_url && (
            <img
              src={eventData.image_url}
              alt=""
              style={{
                width: "100%",
                maxHeight: "320px",
                objectFit: "cover",
                borderRadius: "18px",
                marginTop: "20px",
              }}
            />
          )}

          <label style={labelStyle}>Status</label>

          <select
            value={eventData.status}
            onChange={(e) =>
              setEventData({
                ...eventData,
                status: e.target.value,
              })
            }
            style={inputStyle}
          >
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="deleted">Deleted</option>
          </select>
        </div>

        {/* TRANSLATIONS */}
        <div style={cardStyle}>
          <SectionTitle>Translations</SectionTitle>

          {translations.map((translation, index) => (
            <div
              key={index}
              style={{
                border: "1px solid #222",
                borderRadius: "20px",
                padding: "24px",
                marginBottom: "24px",
              }}
            >
              <div
                style={{
                  fontSize: "28px",
                  marginBottom: "20px",
                  textTransform: "uppercase",
                }}
              >
                {translation.language_code}
              </div>

              <input
                value={translation.title || ""}
                onChange={(e) => {
                  const updated = [...translations];
                  updated[index].title =
                    e.target.value;
                  setTranslations(updated);
                }}
                placeholder="Title"
                style={inputStyle}
              />

              <textarea
                value={translation.description || ""}
                onChange={(e) => {
                  const updated = [...translations];
                  updated[index].description =
                    e.target.value;
                  setTranslations(updated);
                }}
                placeholder="Description"
                style={textareaStyle}
              />
            </div>
          ))}
        </div>

        {/* SESSIONS */}
        <div style={cardStyle}>
          <SectionTitle>Event Sessions</SectionTitle>

          {sessions.map((session, index) => (
            <div
              key={index}
              style={{
                border: "1px solid #222",
                borderRadius: "20px",
                padding: "24px",
                marginBottom: "24px",
              }}
            >
              <input
                value={session.title || ""}
                onChange={(e) => {
                  const updated = [...sessions];
                  updated[index].title =
                    e.target.value;
                  setSessions(updated);
                }}
                placeholder="Session Title"
                style={inputStyle}
              />

              <label style={labelStyle}>Start Time</label>

              <input
                type="datetime-local"
                value={formatDateTimeLocal(
                  session.start_time
                )}
                onChange={(e) => {
                  const updated = [...sessions];
                  updated[index].start_time =
                    e.target.value;
                  setSessions(updated);
                }}
                style={inputStyle}
              />

              <label style={labelStyle}>End Time</label>

              <input
                type="datetime-local"
                value={formatDateTimeLocal(
                  session.end_time
                )}
                onChange={(e) => {
                  const updated = [...sessions];
                  updated[index].end_time =
                    e.target.value;
                  setSessions(updated);
                }}
                style={inputStyle}
              />

              <button
                onClick={() => {
                  const updated =
                    sessions.filter(
                      (_, i) => i !== index
                    );

                  setSessions(updated);
                }}
                style={deleteButtonStyle}
              >
                Delete Session
              </button>
            </div>
          ))}

          <button
            onClick={() => {
              setSessions([
                ...sessions,
                {
                  title: "",
                  start_time: "",
                  end_time: "",
                  status: "active",
                },
              ]);
            }}
            style={addButtonStyle}
          >
            + Add Session
          </button>
        </div>

        {/* SOURCES */}
        <div style={cardStyle}>
          <SectionTitle>Event Sources</SectionTitle>

          {sources.map((source, index) => (
            <div
              key={index}
              style={{
                border: "1px solid #222",
                borderRadius: "20px",
                padding: "24px",
                marginBottom: "24px",
              }}
            >
              <input
                value={source.source_title || ""}
                onChange={(e) => {
                  const updated = [...sources];
                  updated[index].source_title =
                    e.target.value;
                  setSources(updated);
                }}
                placeholder="Source Title"
                style={inputStyle}
              />

              <input
                value={source.source_type || ""}
                onChange={(e) => {
                  const updated = [...sources];
                  updated[index].source_type =
                    e.target.value;
                  setSources(updated);
                }}
                placeholder="Source Type"
                style={inputStyle}
              />

              <input
                value={source.source_url || ""}
                onChange={(e) => {
                  const updated = [...sources];
                  updated[index].source_url =
                    e.target.value;
                  setSources(updated);
                }}
                placeholder="Source URL"
                style={inputStyle}
              />

              <textarea
                value={source.notes || ""}
                onChange={(e) => {
                  const updated = [...sources];
                  updated[index].notes =
                    e.target.value;
                  setSources(updated);
                }}
                placeholder="Notes"
                style={textareaStyle}
              />

              <button
                onClick={() => {
                  const updated =
                    sources.filter(
                      (_, i) => i !== index
                    );

                  setSources(updated);
                }}
                style={deleteButtonStyle}
              >
                Delete Source
              </button>
            </div>
          ))}

          <button
            onClick={() => {
              setSources([
                ...sources,
                {
                  source_title: "",
                  source_type: "",
                  source_url: "",
                  notes: "",
                },
              ]);
            }}
            style={addButtonStyle}
          >
            + Add Source
          </button>
        </div>

        {/* SAVE */}
        <div
          style={{
            marginTop: "48px",
          }}
        >
          <button
            onClick={saveEvent}
            disabled={saving}
            style={{
              background: "#fff",
              color: "#000",
              border: "none",
              padding: "18px 30px",
              borderRadius: "18px",
              fontSize: "20px",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            {saving ? "Saving..." : "Save Event"}
          </button>
        </div>
      </div>
    </main>
  );
}

function formatDateTimeLocal(value: string) {
  if (!value) return "";

  const date = new Date(value);

  const offset =
    date.getTimezoneOffset();

  const adjusted = new Date(
    date.getTime() - offset * 60 * 1000
  );

  return adjusted
    .toISOString()
    .slice(0, 16);
}

function SectionTitle({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <h2
      style={{
        fontSize: "36px",
        marginBottom: "28px",
      }}
    >
      {children}
    </h2>
  );
}

const cardStyle: React.CSSProperties = {
  border: "1px solid #222",
  borderRadius: "28px",
  padding: "32px",
  marginBottom: "36px",
  background: "#050505",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  marginBottom: "10px",
  marginTop: "20px",
  color: "#aaa",
  fontSize: "18px",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "18px",
  borderRadius: "14px",
  border: "1px solid #333",
  background: "#111",
  color: "#fff",
  fontSize: "18px",
  marginBottom: "18px",
};

const textareaStyle: React.CSSProperties = {
  width: "100%",
  minHeight: "140px",
  padding: "18px",
  borderRadius: "14px",
  border: "1px solid #333",
  background: "#111",
  color: "#fff",
  fontSize: "18px",
  marginBottom: "18px",
};

const addButtonStyle: React.CSSProperties = {
  background: "#fff",
  color: "#000",
  border: "none",
  padding: "14px 22px",
  borderRadius: "14px",
  cursor: "pointer",
  fontWeight: 700,
};

const deleteButtonStyle: React.CSSProperties = {
  background: "#400",
  color: "#fff",
  border: "none",
  padding: "12px 18px",
  borderRadius: "12px",
  cursor: "pointer",
};