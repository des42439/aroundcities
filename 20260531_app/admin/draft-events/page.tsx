import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const dynamic = "force-dynamic";

export default async function DraftEventsPage() {
  const { data: draftEvents, error } = await supabase
    .from("draft_events")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <div className="p-10 text-red-500">
        Failed to load draft events
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">
              Draft Events
            </h1>

            <p className="text-zinc-400 mt-2">
              Pending AI-detected event candidates
            </p>
          </div>

          <Link
            href="/admin/draft-events/import"
            className="bg-blue-600 hover:bg-blue-700 px-5 py-3 rounded-xl font-medium"
          >
            Import JSON
          </Link>
        </div>

        {draftEvents.length === 0 ? (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-10 text-center text-zinc-400">
            No draft events found
          </div>
        ) : (
          <div className="grid gap-5">
            {draftEvents.map((event) => (
              <Link
                key={event.id}
                href={`/admin/draft-events/${event.id}`}
                className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 hover:border-zinc-600 transition"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-semibold">
                      {event.title || "Untitled Event"}
                    </h2>

                    <div className="mt-3 space-y-1 text-sm text-zinc-400">
                      <div>
                        Category: {event.category || "-"}
                      </div>

                      <div>
                        City: {event.city || "-"}
                      </div>

                      <div>
                        Venue: {event.venue || "-"}
                      </div>

                      <div>
                        Organizer: {event.organizer || "-"}
                      </div>

                      <div>
                        Start Time:{" "}
                        {event.start_time
                          ? new Date(event.start_time).toLocaleString()
                          : "-"}
                      </div>
                    </div>

                    {event.description && (
                      <p className="mt-4 text-zinc-300 line-clamp-3">
                        {event.description}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <span className="text-xs px-3 py-1 rounded-full bg-zinc-800">
                      {event.confidence || "medium"}
                    </span>

                    <span className="text-xs px-3 py-1 rounded-full bg-yellow-600/20 text-yellow-300 border border-yellow-700">
                      {event.status}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}