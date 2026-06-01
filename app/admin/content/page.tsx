import Link from "next/link";
import AdminLayout from "@/components/AdminLayout";
import EventCard from "@/components/EventCard";
import { getEvents } from "@/lib/events";

export default async function ContentPage() {
  const events = await getEvents();

  return (
    <AdminLayout title="Manage Content">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-neutral-400">
            Total Events: {events.length}
          </p>
        </div>
      </div>

      {events.length === 0 ? (
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
          <p className="text-neutral-400">
            No events found.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {events.map((event) => (
            <Link
              key={event.event_id}
              href={`/admin/content/${event.event_id}`}
            >
              <EventCard event={event} />
            </Link>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}