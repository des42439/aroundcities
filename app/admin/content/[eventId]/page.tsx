import Link from "next/link";
import AdminLayout from "@/components/AdminLayout";
import {
  getEvent,
  getEventPrograms,
  getEventRegistrations,
  getEventSchedules,
} from "@/lib/events";

type Props = {
  params: Promise<{
    eventId: string;
  }>;
};

export default async function EventDetailPage({
  params,
}: Props) {
  const { eventId } = await params;

  const event = await getEvent(eventId);

  if (!event) {
    return (
      <AdminLayout title="Event Not Found">
        <div className="rounded-2xl border border-red-900 bg-red-950 p-6">
          Event not found.
        </div>
      </AdminLayout>
    );
  }

  const schedules = await getEventSchedules(eventId);
  const programs = await getEventPrograms(eventId);
  const registrations = await getEventRegistrations(eventId);

  return (
    <AdminLayout title={event.title}>
      <div className="space-y-8">
        <section className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              General
            </h2>

            <span
              className={`rounded-full px-3 py-1 text-sm ${
                event.status === "active"
                  ? "bg-green-900 text-green-300"
                  : "bg-neutral-800 text-neutral-300"
              }`}
            >
              {event.status}
            </span>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <div className="mb-1 text-sm text-neutral-500">
                Title
              </div>
              <div>{event.title}</div>
            </div>

            <div>
              <div className="mb-1 text-sm text-neutral-500">
                Organiser
              </div>
              <div>{event.organiser || "-"}</div>
            </div>

            <div>
              <div className="mb-1 text-sm text-neutral-500">
                Location
              </div>
              <div>{event.location || "-"}</div>
            </div>

            <div>
              <div className="mb-1 text-sm text-neutral-500">
                Source
              </div>

              {event.source_link ? (
                <a
                  href={event.source_link}
                  target="_blank"
                  className="text-blue-400 hover:underline"
                >
                  Open Source
                </a>
              ) : (
                "-"
              )}
            </div>
          </div>

          {event.description && (
            <div className="mt-6">
              <div className="mb-1 text-sm text-neutral-500">
                Description
              </div>

              <div className="whitespace-pre-wrap">
                {event.description}
              </div>
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
          <h2 className="mb-4 text-xl font-semibold">
            Schedules ({schedules.length})
          </h2>

          {schedules.length === 0 ? (
            <p className="text-neutral-500">
              No schedules found.
            </p>
          ) : (
            <div className="space-y-3">
              {schedules.map((schedule) => (
                <div
                  key={schedule.event_schedule_id}
                  className="rounded-xl border border-neutral-800 p-4"
                >
                  <div>
                    {schedule.event_date}
                  </div>

                  <div className="text-neutral-400">
                    {schedule.start_time || "--"} -{" "}
                    {schedule.end_time || "--"}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
          <h2 className="mb-4 text-xl font-semibold">
            Programs ({programs.length})
          </h2>

          {programs.length === 0 ? (
            <p className="text-neutral-500">
              No programs found.
            </p>
          ) : (
            <div className="space-y-3">
              {programs.map((program) => (
                <div
                  key={program.event_program_id}
                  className="rounded-xl border border-neutral-800 p-4"
                >
                  <div className="font-medium">
                    {program.title}
                  </div>

                  {program.description && (
                    <div className="mt-1 text-neutral-400">
                      {program.description}
                    </div>
                  )}

                  <div className="mt-2 text-sm text-neutral-500">
                    {program.start_time || "--"} -{" "}
                    {program.end_time || "--"}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
          <h2 className="mb-4 text-xl font-semibold">
            Registrations ({registrations.length})
          </h2>

          {registrations.length === 0 ? (
            <p className="text-neutral-500">
              No registrations found.
            </p>
          ) : (
            <div className="space-y-3">
              {registrations.map((registration) => (
                <div
                  key={registration.event_registration_id}
                  className="rounded-xl border border-neutral-800 p-4"
                >
                  <div>
                    {registration.start_date}
                  </div>

                  <div className="text-neutral-400">
                    {registration.end_date}
                  </div>

                  <a
                    href={registration.registration_url}
                    target="_blank"
                    className="mt-2 inline-block text-blue-400 hover:underline"
                  >
                    Open Registration
                  </a>
                </div>
              ))}
            </div>
          )}
        </section>

        <div className="flex gap-3">
          <Link
            href="/admin/content"
            className="rounded-lg border border-neutral-800 px-4 py-2 hover:bg-neutral-900"
          >
            Back
          </Link>
        </div>
      </div>
    </AdminLayout>
  );
}